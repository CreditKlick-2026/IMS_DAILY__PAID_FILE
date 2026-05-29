import { config } from 'dotenv';
config({ path: '.env.local' });

import * as xlsx from 'xlsx';
import { Pool } from 'pg';
import { exec } from 'child_process';
import util from 'util';
import path from 'path';
import { unlink } from 'fs/promises';

const execAsync = util.promisify(exec);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function startWorker() {
  console.log("👷 Native Background Worker Started! Polling Database every 5 seconds...");

  // Initialize Tables with actual DPF columns
  await pool.query(`
    CREATE TABLE IF NOT EXISTS upload_jobs (
      id UUID PRIMARY KEY,
      file_path TEXT,
      status VARCHAR(50) DEFAULT 'PENDING',
      total_rows INT DEFAULT 0,
      processed_rows INT DEFAULT 0,
      error_log JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      uploaded_by_employee_id VARCHAR(100),
      uploaded_by_name VARCHAR(255)
    );

    ALTER TABLE upload_jobs ADD COLUMN IF NOT EXISTS password VARCHAR(255);
    ALTER TABLE upload_jobs ADD COLUMN IF NOT EXISTS uploaded_by_employee_id VARCHAR(100);
    ALTER TABLE upload_jobs ADD COLUMN IF NOT EXISTS uploaded_by_name VARCHAR(255);

    DROP TABLE IF EXISTS dpf_records;
    CREATE TABLE dpf_records (
      id SERIAL PRIMARY KEY,
      account_no       VARCHAR(100),
      employee_code    VARCHAR(100),
      employee_name    VARCHAR(255),
      client           VARCHAR(255),
      product          VARCHAR(255),
      bucket           VARCHAR(100),
      location         VARCHAR(255),
      money_collected  DECIMAL(14,2),
      payment_mode     VARCHAR(100),
      tl_name          VARCHAR(255),
      am               VARCHAR(255),
      aph              VARCHAR(255),
      ph               VARCHAR(255),
      phone_no         VARCHAR(30),
      job_id           UUID,
      upload_at        DATE,
      uploaded_by_employee_id VARCHAR(100),
      uploaded_by_name VARCHAR(255),
      created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  let isProcessing = false;

  // Start the Poller
  setInterval(async () => {
    if (isProcessing) return;
    
    try {
      isProcessing = true;
      const res = await pool.query(`
        UPDATE upload_jobs 
        SET status = 'PROCESSING' 
        WHERE id = (
          SELECT id FROM upload_jobs WHERE status = 'PENDING' ORDER BY created_at ASC LIMIT 1 FOR UPDATE SKIP LOCKED
        ) 
        RETURNING *;
      `);

      if (res.rows.length === 0) {
        isProcessing = false;
        return;
      }

      const job = res.rows[0];
      const jobId = job.id;
      const password = job.password;
      const fileData = job.file_data;
      const fileName = job.file_path || `job_${jobId}.xlsx`;
      const uploadAt = job.upload_at;
      const uploadedByEmpId = job.uploaded_by_employee_id;
      const uploadedByName = job.uploaded_by_name;

      console.log(`\n⏳ Found New Upload! Processing Job: ${jobId}`);
      
      let currentFilePath = '';
      let decFilePath = '';
      let originalFilePath = '';

      try {
        const os = require('os');
        const { writeFile } = require('fs/promises');
        
        originalFilePath = path.join(os.tmpdir(), fileName);
        currentFilePath = originalFilePath;
        
        // Restore physical file from DB base64
        if (fileData) {
          const buffer = Buffer.from(fileData, 'base64');
          await writeFile(originalFilePath, buffer);
        } else {
           // fallback for legacy
           originalFilePath = job.file_path;
           currentFilePath = job.file_path;
        }

        if (password) {
          decFilePath = originalFilePath + '_dec.xlsx';
          console.log(`\n🔑 Decrypting Job: ${jobId} with python msoffcrypto-tool...`);
          await execAsync(`msoffcrypto-tool -p "${password.replace(/"/g, '\\"')}" "${originalFilePath}" "${decFilePath}"`);
          currentFilePath = decFilePath;
        }

        const workbook = xlsx.readFile(currentFilePath);
        let bestSheetData: any[] = [];
        let bestHeaderIndex = 0;
        let maxTotalMatches = -1;
        let bestSheetName = "";

        const targetFields = ['Account_No', 'Employee_Code', 'Employee_Name', 'Client', 'Product', 'Bucket', 'Location', 'Money_Collected', 'Payment_Mode', 'TL_Name', 'AM', 'APH', 'PH', 'Phone_No'];
        const normalize = (s: string) => String(s || "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();

        for (const sheetName of workbook.SheetNames) {
          const sheet = workbook.Sheets[sheetName];
          const rawRows = xlsx.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
          if (!rawRows || rawRows.length === 0) continue;

          let currentSheetMaxMatches = 0;
          let currentSheetHeaderIndex = 0;

          for (let i = 0; i < Math.min(50, rawRows.length); i++) {
            const row = rawRows[i];
            if (!Array.isArray(row)) continue;
            const rowKeys = row.map(k => normalize(String(k)));
            let matches = 0;
            targetFields.forEach(f => {
              if (rowKeys.includes(normalize(f))) matches++;
            });
            if (matches > currentSheetMaxMatches) {
              currentSheetMaxMatches = matches;
              currentSheetHeaderIndex = i;
            }
          }

          if (currentSheetMaxMatches > maxTotalMatches) {
            maxTotalMatches = currentSheetMaxMatches;
            bestHeaderIndex = currentSheetHeaderIndex;
            bestSheetName = sheetName;
            bestSheetData = xlsx.utils.sheet_to_json(sheet, { range: bestHeaderIndex }) as any[];
          }
        }

        if (maxTotalMatches === 0) {
          throw new Error("No matching headers found in any sheet.");
        }

        const totalRows = bestSheetData.length;
        await pool.query(`UPDATE upload_jobs SET total_rows = $1 WHERE id = $2`, [totalRows, jobId]);
        console.log(`📊 Processing Sheet: "${bestSheetName}" | Rows: ${totalRows} | Headers at Row: ${bestHeaderIndex + 1}`);

        const BATCH_SIZE = 500;
        let processed = 0;
        let failed = 0;
        let lastError = null;

          for (let i = 0; i < totalRows; i += BATCH_SIZE) {
          const batch = bestSheetData.slice(i, i + BATCH_SIZE);
          
          try {
            const values: any[] = [];
            const placeholders: string[] = [];
            let paramIndex = 1;
            
            for (const row of batch) {
              const get = (keys: string[]) => {
                for (const k of keys) {
                  const target = normalize(k);
                  const foundKey = Object.keys(row).find(r => normalize(r) === target);
                  if (foundKey !== undefined && row[foundKey] !== undefined && row[foundKey] !== '') return row[foundKey];
                }
                return null;
              };
              
              placeholders.push(`($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++})`);
              values.push(
                get(['Account_No', 'Account No', 'LAN', 'Loan No']),
                get(['Employee_Code', 'Employee Code', 'EmpCode']),
                get(['Employee_Name', 'Employee Name', 'EmpName']),
                get(['Client', 'client', 'Customer']),
                get(['Product', 'product', 'Scheme']),
                get(['Bucket', 'bucket', 'Delinquency']),
                get(['Location', 'location', 'City']),
                parseFloat(String(get(['Money_Collected', 'Money Collected', 'Amount']) || '0').replace(/,/g, '')) || 0,
                get(['Payment_Mode', 'Payment Mode', 'Mode of Payment']),
                get(['TL_Name', 'TL Name', 'Team Leader']),
                get(['AM', 'am', 'Area Manager']),
                get(['APH', 'aph']),
                get(['PH', 'ph']),
                String(get(['Phone_No', 'Phone No', 'Mobile', 'Contact']) || '').replace(/\D/g, '').slice(-10) || null,
                jobId,
                uploadAt,
                uploadedByEmpId,
                uploadedByName
              );
            }

            await pool.query(`
              INSERT INTO dpf_records 
                (account_no, employee_code, employee_name, client, product, bucket, location, money_collected, payment_mode, tl_name, am, aph, ph, phone_no, job_id, upload_at, uploaded_by_employee_id, uploaded_by_name)
              VALUES ${placeholders.join(', ')}
            `, values);
            processed += batch.length;
          } catch (batchErr: any) {
            failed += batch.length;
            lastError = batchErr.message;
            console.error("Batch insert failed:", batchErr.message);
          }
          
          await pool.query(`UPDATE upload_jobs SET processed_rows = $1, error_log = $2 WHERE id = $3`, [processed, lastError ? JSON.stringify({ last_error: lastError, failed_count: failed }) : null, jobId]);
          console.log(`✅ Progress: ${processed}/${totalRows} (Failed: ${failed})`);
        }

        await pool.query(`UPDATE upload_jobs SET status = 'COMPLETED' WHERE id = $1`, [jobId]);
        console.log(`🎉 Job ${jobId} Finished! Total: ${processed} inserted.`);

      } catch (fileError: any) {
        console.error(`❌ Processing Failed:`, fileError);
        await pool.query(
          `UPDATE upload_jobs SET status = 'FAILED', error_log = $1 WHERE id = $2`,
          [JSON.stringify(fileError.message), jobId]
        );
      } finally {
        if (decFilePath) {
          await unlink(decFilePath).catch(() => {});
        }
        if (originalFilePath && fileData) {
          await unlink(originalFilePath).catch(() => {});
        }
        isProcessing = false;
      }
    } catch (err) {
      console.error('Fatal Poller Error:', err);
      isProcessing = false;
    }
  }, 5000);
}

startWorker().catch(console.error);
