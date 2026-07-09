import { config } from 'dotenv';
config({ path: '.env.local' });

import * as xlsx from 'xlsx';
import { Pool } from 'pg';
import { exec } from 'child_process';
import util from 'util';
import path from 'path';
import { unlink } from 'fs/promises';
import cron from 'node-cron';
import { sendReminderEmail, sendAdminSummaryEmail } from './lib/email';

const execAsync = util.promisify(exec);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
});

async function startWorker() {
  console.log("👷 Native Background Worker Started! Polling Database every 5 seconds...");

  // Start Daily Reminder Cron Job (runs at 8:00 PM every day)
  cron.schedule('0 20 * * *', async () => {
    console.log("⏰ Running daily check for missing Paid Files...");
    try {
      // 1. Get all active users
      const usersRes = await pool.query(`SELECT employee_id, name, email FROM users WHERE role = 'user' AND email IS NOT NULL`);
      const phUsers = usersRes.rows;

      if (phUsers.length === 0) {
        console.log("No PH users with email addresses found.");
        return;
      }

      // 2. Get today's date in YYYY-MM-DD for the query
      // using UTC timezone to avoid local server timezone issues
      const today = new Date().toISOString().split('T')[0];

      // 3. Get all employee_ids who have uploaded a file today
      const uploadsRes = await pool.query(`
        SELECT DISTINCT uploaded_by_employee_id 
        FROM upload_jobs 
        WHERE DATE(created_at) = $1 AND status = 'COMPLETED'
      `, [today]);
      
      const uploadedEmpIds = uploadsRes.rows.map(r => r.uploaded_by_employee_id);

      // 4. Find defaulters and completed users
      const missedUsers = [];
      const uploadedUsers = [];

      for (const user of phUsers) {
        if (!uploadedEmpIds.includes(user.employee_id)) {
          missedUsers.push(user);
          console.log(`⚠️ User ${user.name} (${user.employee_id}) missed today's upload. Sending reminder...`);
          await sendReminderEmail(user.email, user.name || user.employee_id, today);
        } else {
          uploadedUsers.push(user);
        }
      }

      // 5. Send Admin Summary Email
      const adminsRes = await pool.query(`SELECT email FROM users WHERE role = 'admin' AND email IS NOT NULL`);
      const adminEmails = adminsRes.rows.map(r => r.email);

      if (adminEmails.length > 0) {
        console.log(`📊 Sending Daily Upload Summary to Admins: ${adminEmails.join(', ')}`);
        await sendAdminSummaryEmail(adminEmails, today, uploadedUsers, missedUsers);
      }
    } catch (err) {
      console.error("Cron Job Error:", err);
    }
  });


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
    ALTER TABLE upload_jobs ADD COLUMN IF NOT EXISTS job_type VARCHAR(50) DEFAULT 'DPF';
    ALTER TABLE upload_jobs ADD COLUMN IF NOT EXISTS process_id INTEGER;

    CREATE TABLE IF NOT EXISTS dpf_records (
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
      mobile_no         VARCHAR(30),
      job_id           UUID,
      upload_at        DATE,
      uploaded_by_employee_id VARCHAR(100),
      uploaded_by_name VARCHAR(255),
      is_duplicate     BOOLEAN DEFAULT FALSE,
      duplicate_of     INT,
      fraud_flag       VARCHAR(255),
      created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Ensure is_duplicate and fraud_flag columns exist (for existing tables)
  await pool.query(`
    ALTER TABLE dpf_records ADD COLUMN IF NOT EXISTS is_duplicate BOOLEAN DEFAULT FALSE;
    ALTER TABLE dpf_records ADD COLUMN IF NOT EXISTS duplicate_of INT;
    ALTER TABLE dpf_records ADD COLUMN IF NOT EXISTS fraud_flag VARCHAR(255);
    ALTER TABLE dpf_records ADD COLUMN IF NOT EXISTS client_id INTEGER;
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
      const jobType = job.job_type || 'DPF';
      const password = job.password;
      const fileData = job.file_data;
      const fileName = job.file_path || `job_${jobId}.xlsx`;
      const uploadAt = job.upload_at;
      const uploadedByEmpId = job.uploaded_by_employee_id;
      const uploadedByName = job.uploaded_by_name;
      const processId = job.client_id || job.process_id;
      const jobLocationId = job.location_id;
      const productType = job.product_type;

      // Automatically fetch correct client/location from admin-selected client
      let processClientName: string | null = null;
      let processLocationName: string | null = null;
      if (processId) {
        // processId here is actually the client_id from master_client
        const pRes = await pool.query(`
          SELECT 
            c.name as client_name,
            l.name as location_name 
          FROM master_client c
          LEFT JOIN client_location_mapping clm ON c.id = clm.client_id
          LEFT JOIN master_location l ON clm.location_id = l.id
          WHERE c.id = $1
          LIMIT 1
        `, [processId]);
        if (pRes.rows.length > 0) {
          processClientName = pRes.rows[0].client_name;
          processLocationName = pRes.rows[0].location_name;
        }
      }
      // Location_id from upload form takes highest priority
      if (jobLocationId) {
        const lRes = await pool.query(`SELECT name FROM master_location WHERE id = $1`, [jobLocationId]);
        if (lRes.rows.length > 0) {
          processLocationName = lRes.rows[0].name;
        }
      }

      console.log(`\n⏳ Found New Upload! Processing Job: ${jobId} (Type: ${jobType}, Process: ${processId || 'None'})`);
      
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
        
        if (jobType === 'KEKA') {
             const kekaColumnsPath = path.join(process.cwd(), 'data', 'keka_columns.json');
             let kekaColumns = [
                { key: 'location', labels: ['location', 'Location'], display: 'location' },
                { key: 'employee_id', labels: ['employee_id', 'Employee_Code', 'Employee Code', 'EmpCode', 'EMP CODE'], display: 'employee_id' },
                { key: 'name', labels: ['name', 'Name', 'Employee Name', 'EmpName'], display: 'name' },
                { key: 'designation', labels: ['designation', 'Designation', 'Role', 'DESIGNATION'], display: 'designation' },
                { key: 'agent_ohr', labels: ['agent_ohr', 'Agent OHR', 'AgentOHR', 'OHR'], display: 'agent_ohr' },
                { key: 'doj', labels: ['doj', 'DOJ', 'Date of Joining'], display: 'doj' },
                { key: 'doc', labels: ['doc', 'DOC', 'Date of Calling'], display: 'doc' },
                { key: 'salary', labels: ['salary', 'Salary', 'CTC', 'Target'], display: 'salary' },
             ];
             try {
                 if (require('fs').existsSync(kekaColumnsPath)) {
                     const parsedData = JSON.parse(require('fs').readFileSync(kekaColumnsPath, 'utf8'));
                     if (Array.isArray(parsedData)) {
                         kekaColumns = parsedData; // legacy support
                     } else {
                         const locStr = jobLocationId || 'all';
                         const cliStr = processId || 'all';
                         const prodStr = productType || 'all';
                         const configKey = `${locStr}_${cliStr}_${prodStr}`;
                         kekaColumns = parsedData[configKey] || parsedData['default'] || kekaColumns;
                     }
                 }
             } catch(e) { console.error('Failed to read keka_columns.json', e); }

             const sheetName = workbook.SheetNames[0];
             const sheet = workbook.Sheets[sheetName];
             const rawRows = xlsx.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
             
             let headerIndex = 0;
             for (let i = 0; i < Math.min(10, rawRows.length); i++) {
                 if (rawRows[i] && rawRows[i].filter(c => typeof c === 'string').length >= 3) {
                     headerIndex = i;
                     break;
                 }
             }
             const dataRows = xlsx.utils.sheet_to_json(sheet, { range: headerIndex }) as any[];
             const normalize = (s: string) => String(s || "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
             
             const totalRows = dataRows.length;
             await pool.query(`UPDATE upload_jobs SET total_rows = $1 WHERE id = $2`, [totalRows, jobId]);
             
             let processed = 0;
             let failed = 0;
             let duplicatesCount = 0;
             let errorDetails: string[] = [];
             
             await pool.query('BEGIN');
             
             const BATCH_SIZE = 500;
             for (let i = 0; i < dataRows.length; i += BATCH_SIZE) {
                 const batch = dataRows.slice(i, i + BATCH_SIZE);
                 let valueStrings = [];
                 let params: any[] = [];
                 let paramIdx = 1;
                 let batchValidRows = 0;

                 for (let j = 0; j < batch.length; j++) {
                     const row = batch[j];
                     const absoluteIndex = i + j;
                     const get = (keys: string[]) => {
                         for (const k of keys) {
                             const target = normalize(k);
                             const foundKey = Object.keys(row).find(r => normalize(r) === target);
                             if (foundKey !== undefined && row[foundKey] !== undefined) {
                                 const val = row[foundKey];
                                 if (val === '') continue;
                                 const s = String(val).trim().toLowerCase();
                                 if (s === '-' || s === '--' || s === 'na' || s === 'n/a' || s === '#n/a' || s === 'null') return null;
                                 return val;
                             }
                         }
                         return null;
                     };
                     
                     const dynamicData: Record<string, any> = {};
                     kekaColumns.forEach((col: any) => {
                         const val = get(col.labels);
                         if (val !== null) dynamicData[col.key] = val;
                     });

                     const location = dynamicData['location'];
                     const empCode = dynamicData['employee_id'];
                     const name = dynamicData['name'];
                     const designation = dynamicData['designation'];
                     const agentOhr = String(dynamicData['agent_ohr'] || '');
                     const dojRaw = dynamicData['doj'];
                     let dojDate = null;
                     if (dojRaw) {
                         if (typeof dojRaw === 'number') dojDate = new Date(Math.round((dojRaw - 25569) * 86400 * 1000));
                         else dojDate = new Date(dojRaw);
                     }
                     const docRaw = dynamicData['doc'];
                     let docDate = null;
                     if (docRaw) {
                         if (typeof docRaw === 'number') docDate = new Date(Math.round((docRaw - 25569) * 86400 * 1000));
                         else docDate = new Date(docRaw);
                     }
                     const tlName = dynamicData['tl_name'];
                     const amName = dynamicData['am_name'];
                     const salaryStr = String(dynamicData['salary'] || '0').replace(/,/g, '');
                     const salary = parseFloat(salaryStr) || 0;

                     const coreKeys = ['location', 'employee_id', 'name', 'designation', 'agent_ohr', 'doj', 'doc', 'salary', 'tl_name', 'am_name'];
                     const extraData: Record<string, any> = {};
                     Object.keys(dynamicData).forEach(key => {
                         if (!coreKeys.includes(key)) {
                             extraData[key] = dynamicData[key];
                         }
                     });
                     
                     if (!empCode) {
                         failed++;
                         errorDetails.push(`Row ${absoluteIndex + 2}: Missing Employee Code`);
                     } else {
                         valueStrings.push(`($${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, CURRENT_TIMESTAMP)`);
                         params.push(processLocationName || location, empCode, name, designation, agentOhr, dojDate, docDate, salary, tlName, amName, processClientName || null, productType || null, extraData);
                         batchValidRows++;
                     }
                 }

                 if (valueStrings.length > 0) {
                     try {
                         const insertRes = await pool.query(`
                             INSERT INTO employee_keka_data (location, employee_id, name, designation, agent_ohr, doj, doc, salary, tl_name, am_name, client, product, extra_data, updated_at)
                             VALUES ${valueStrings.join(', ')}
                             ON CONFLICT (employee_id) DO UPDATE SET
                               location = EXCLUDED.location,
                               name = EXCLUDED.name,
                               designation = EXCLUDED.designation,
                               agent_ohr = EXCLUDED.agent_ohr,
                               doj = EXCLUDED.doj,
                               doc = EXCLUDED.doc,
                               salary = EXCLUDED.salary,
                               tl_name = EXCLUDED.tl_name,
                               am_name = EXCLUDED.am_name,
                               client = EXCLUDED.client,
                               product = EXCLUDED.product,
                               extra_data = employee_keka_data.extra_data || EXCLUDED.extra_data,
                               updated_at = CURRENT_TIMESTAMP
                             RETURNING employee_id
                         `, params);
                         
                         const inserted = insertRes.rowCount || 0;
                         processed += inserted;
                         duplicatesCount += (batchValidRows - inserted);
                     } catch (err: any) {
                         failed += batchValidRows;
                         errorDetails.push(`Batch Database error: ${err.message}`);
                     }
                 }
                 
                 await pool.query(`UPDATE upload_jobs SET processed_rows = $1 WHERE id = $2`, [processed + duplicatesCount + failed, jobId]);
             }
             
             if (failed > 0) {
                 await pool.query('ROLLBACK');
                 const finalStatus = 'FAILED';
                 await pool.query(`UPDATE upload_jobs SET processed_rows = $1, status = $4, error_log = $2 WHERE id = $3`, [processed + duplicatesCount + failed, JSON.stringify({ failed_count: failed, duplicate_count: duplicatesCount, status: 'Failed', details: errorDetails }), jobId, finalStatus]);
                 console.log(`❌ KEKA Job ${jobId} Failed! Rolled back. Errors: ${failed}`);
             } else {
                 await pool.query('COMMIT');
                 const finalStatus = 'COMPLETED';
                 await pool.query(`UPDATE upload_jobs SET processed_rows = $1, status = $4, error_log = $2 WHERE id = $3`, [processed + duplicatesCount + failed, JSON.stringify({ failed_count: 0, duplicate_count: duplicatesCount, status: 'Success' }), jobId, finalStatus]);
                 console.log(`🎉 KEKA Job ${jobId} Finished Successfully! Processed: ${processed}, Duplicates: ${duplicatesCount}`);
             }
             
        } else {
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

        // ─── PRE-VALIDATION: FILTER DUPLICATES BEFORE INSERT ─────────────────
        const allAccountNos = bestSheetData.map(row => {
          const get = (keys: string[]) => {
            for (const k of keys) {
              const target = normalize(k);
              const foundKey = Object.keys(row).find(r => normalize(r) === target);
              if (foundKey !== undefined && row[foundKey] !== undefined && row[foundKey] !== '') return row[foundKey];
            }
            return null;
          };
          return get(['Account_No', 'Account No', 'LAN', 'Loan No']);
        }).filter(Boolean);

        const uniqueAccounts = [...new Set(allAccountNos)];
        
        // Fetch ALL existing records for same accounts in same month/year
        // Duplicate = same account_no already uploaded in same month (regardless of amount/mode)
        const existingAccountSet = new Set<string>();
        if (uniqueAccounts.length > 0) {
          console.log(`🔍 Fetching existing records for ${uniqueAccounts.length} unique accounts to check duplicates...`);
          for (let i = 0; i < uniqueAccounts.length; i += 1000) {
             const chunk = uniqueAccounts.slice(i, i + 1000);
             const res = await pool.query(`
               SELECT DISTINCT account_no
               FROM dpf_records 
               WHERE account_no = ANY($1) 
                 AND EXTRACT(MONTH FROM upload_at) = EXTRACT(MONTH FROM $2::date)
                 AND EXTRACT(YEAR FROM upload_at) = EXTRACT(YEAR FROM $2::date)
             `, [chunk, uploadAt]);
             res.rows.forEach((r: any) => existingAccountSet.add(String(r.account_no)));
          }
        }

        const validData = [];
        let totalDups = 0;
        
        const intraFileSet = new Set<string>(); // detect same account_no within the same file

        for (const row of bestSheetData) {
            const get = (keys: string[]) => {
              for (const k of keys) {
                const target = normalize(k);
                const foundKey = Object.keys(row).find(r => normalize(r) === target);
                if (foundKey !== undefined && row[foundKey] !== undefined && row[foundKey] !== '') return row[foundKey];
              }
              return null;
            };
            
            const accNo = String(get(['Account_No', 'Account No', 'LAN', 'Loan No']) || '');

            // 1. Intra-file duplicate: same account_no seen again in this file
            if (intraFileSet.has(accNo)) {
                totalDups++;
                row._isDuplicate = true;
                row._duplicateReason = 'INTRA_FILE_DUPLICATE';
            }
            
            // 2. DB duplicate: same account_no already exists in same month/year
            if (!row._isDuplicate && accNo && existingAccountSet.has(accNo)) {
                totalDups++;
                row._isDuplicate = true;
                row._duplicateReason = 'ALREADY_UPLOADED_THIS_MONTH';
            }
            
            intraFileSet.add(accNo);
            validData.push(row);
        }
        
        // We skip the throw Error to allow partial uploads (ignoring duplicates)

        const totalRows = validData.length;
        await pool.query(`UPDATE upload_jobs SET total_rows = $1 WHERE id = $2`, [totalRows, jobId]);

        const BATCH_SIZE = 500;
        let processed = 0;
        let failed = 0;
        let errorDetails: string[] = [];

        const client = await pool.connect();
        try {
          await client.query('BEGIN');

          for (let i = 0; i < totalRows; i += BATCH_SIZE) {
            const batch = validData.slice(i, i + BATCH_SIZE);
            
            try {
              const values: any[] = [];
              const placeholders: string[] = [];
              let paramIndex = 1;
              
              for (const row of batch) {
                const get = (keys: string[]) => {
                  for (const k of keys) {
                    const target = normalize(k);
                    const foundKey = Object.keys(row).find(r => normalize(r) === target);
                    if (foundKey !== undefined && row[foundKey] !== undefined) {
                        const val = row[foundKey];
                        if (val === '') continue;
                        const s = String(val).trim().toLowerCase();
                        if (s === '-' || s === '--' || s === 'na' || s === 'n/a' || s === '#n/a' || s === 'null') return null;
                        return val;
                    }
                  }
                  return null;
                };
                
                placeholders.push(`($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++})`);
                values.push(
                  get(['Account_No', 'Account No', 'LAN', 'Loan No']),
                  get(['Employee_Code', 'Employee Code', 'EmpCode']),
                  get(['Employee_Name', 'Employee Name', 'EmpName']),
                   // Use admin-set client name (never from Excel)
                  processClientName || get(['Client', 'client', 'Customer']),
                  // Use admin-set product type (never from Excel)
                  productType || get(['Product', 'product', 'Scheme']),
                  get(['Bucket', 'bucket', 'Delinquency']),
                  // Use admin-set location (never from Excel)
                  processLocationName || get(['Location', 'location', 'City']),
                  parseFloat(String(get(['Money_Collected', 'Money Collected', 'Money Collect', 'Amount']) || '0').replace(/,/g, '')) || 0,
                  get(['Payment_Mode', 'Payment Mode', 'Mode of Payment']),
                  get(['TL_Name', 'TL Name', 'Team Leader', 'TL', 'tl']),
                  get(['AM', 'am', 'Area Manager', 'AM Name', 'AM_Name']),
                  get(['CM', 'cm', 'Collection Manager']),
                  get(['APH', 'aph']),
                  get(['PH', 'ph']),
                  String(get(['Phone_No', 'Phone No', 'Mobile No', 'Mobile', 'Contact', 'Phone Number', 'Phone_Number']) || '').replace(/\D/g, '').slice(-10) || null,
                  jobId,
                  uploadAt,
                  uploadedByEmpId,
                  uploadedByName,
                  row._isDuplicate ? true : false,
                  row._duplicateReason || null,
                  processId || null,
                  get(['recovery_or_upgrade', 'RECOVERY/UPGRADE', 'Recovery_or_Upgrade', 'Recovery_Upgrade', 'RECOVERY', 'UPGRADE']) || null
                );
              }

              await client.query(`
                INSERT INTO dpf_records 
                  (account_no, employee_code, employee_name, client, product, bucket, location, money_collected, payment_mode, tl_name, am, cm, aph, ph, mobile_no, job_id, upload_at, uploaded_by_employee_id, uploaded_by_name, is_duplicate, fraud_flag, client_id, recovery_or_upgrade)
                VALUES ${placeholders.join(', ')}
              `, values);
              processed += batch.length;
            } catch (batchErr: any) {
              failed += batch.length;
              errorDetails.push(`Batch ${i/BATCH_SIZE + 1} failed: ${batchErr.message}`);
              console.error("Batch insert failed:", batchErr.message);
            }
            
            await client.query(`UPDATE upload_jobs SET processed_rows = $1 WHERE id = $2`, [processed + failed, jobId]);
            console.log(`✅ Progress: ${processed + failed}/${totalRows} (Failed: ${failed})`);
          }

          if (failed > 0) {
              await client.query('ROLLBACK');
              const finalStatus = 'FAILED';
              await pool.query(`UPDATE upload_jobs SET status = $3, error_log = $2 WHERE id = $1`, [
                jobId,
                JSON.stringify({ duplicates_found: totalDups, failed_count: failed, status: 'Failed', details: errorDetails }),
                finalStatus
              ]);
              console.log(`❌ Job ${jobId} Failed! Rolled back ${processed} inserts.`);
          } else {
              await client.query('COMMIT');
              const finalStatus = 'COMPLETED';
              await pool.query(`UPDATE upload_jobs SET status = $3, error_log = $2 WHERE id = $1`, [
                jobId,
                JSON.stringify({ duplicates_found: totalDups, failed_count: 0, status: 'Success' }),
                finalStatus
              ]);
              console.log(`🎉 Job ${jobId} Finished Successfully! Processed: ${processed}`);
          }
        } finally {
          client.release();
        }
        console.log(`🎉 Job ${jobId} Finished! Inserted: ${processed}, Blocked: ${totalDups}`);
        }

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
