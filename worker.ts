import { config } from 'dotenv';
config({ path: '.env.local' });

import * as xlsx from 'xlsx';
import { Pool } from 'pg';
import { exec } from 'child_process';
import util from 'util';
import path from 'path';
import fs from 'fs';
import { unlink } from 'fs/promises';
import cron from 'node-cron';
import { sendReminderEmail, sendAdminSummaryEmail } from './lib/email';

const execAsync = util.promisify(exec);

// Production AWS & Local resilient connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
});

pool.on('error', (err) => {
  console.error('⚠️ Unexpected idle database error:', err);
});

// Helper: Smart Date Parser (Excel Serials, Indian DD-MM-YYYY, ISO)
function parseDateSmart(val: any): Date | null {
  if (!val) return null;
  if (val instanceof Date && !isNaN(val.getTime())) return val;
  if (typeof val === 'number') {
    const d = new Date(Math.round((val - 25569) * 86400 * 1000));
    return isNaN(d.getTime()) ? null : d;
  }
  const s = String(val).trim();
  if (!s || s === '-' || s === '--' || s === 'na' || s === 'n/a' || s === '#n/a' || s === 'null') return null;

  const parts = s.split(/[\/\-\.]/);
  if (parts.length === 3) {
    const p0 = parseInt(parts[0], 10);
    const p1 = parseInt(parts[1], 10);
    const p2 = parseInt(parts[2], 10);
    if (p0 > 1000) {
      const d = new Date(p0, p1 - 1, p2);
      if (!isNaN(d.getTime())) return d;
    } else if (p2 > 1000) {
      const d = new Date(p2, p1 - 1, p0);
      if (!isNaN(d.getTime())) return d;
    }
  }
  const parsed = new Date(s);
  return isNaN(parsed.getTime()) ? null : parsed;
}

// Helper: Smart Currency / Number Sanitizer
function parseNumericSmart(val: any): number {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  const clean = String(val).replace(/[^0-9.-]+/g, '');
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
}

const normalize = (s: string) => String(s || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

async function startWorker() {
  console.log("🚀 Enterprise High-Throughput Background Worker Active! (AWS-Ready)");

  // 1. Daily Cron Job (8:00 PM)
  cron.schedule('0 20 * * *', async () => {
    console.log("⏰ Running daily upload compliance check...");
    try {
      const usersRes = await pool.query(`SELECT employee_id, name, email FROM users WHERE role = 'user' AND email IS NOT NULL`);
      const phUsers = usersRes.rows;
      if (phUsers.length === 0) return;

      const today = new Date().toISOString().split('T')[0];
      const uploadsRes = await pool.query(`
        SELECT DISTINCT uploaded_by_employee_id 
        FROM upload_jobs 
        WHERE DATE(created_at) = $1 AND status = 'COMPLETED'
      `, [today]);
      
      const uploadedEmpIds = uploadsRes.rows.map(r => r.uploaded_by_employee_id);
      const missedUsers = [];
      const uploadedUsers = [];

      for (const user of phUsers) {
        if (!uploadedEmpIds.includes(user.employee_id)) {
          missedUsers.push(user);
          await sendReminderEmail(user.email, user.name || user.employee_id, today);
        } else {
          uploadedUsers.push(user);
        }
      }

      const adminsRes = await pool.query(`SELECT email FROM users WHERE role = 'admin' AND email IS NOT NULL`);
      const adminEmails = adminsRes.rows.map(r => r.email);
      if (adminEmails.length > 0) {
        await sendAdminSummaryEmail(adminEmails, today, uploadedUsers, missedUsers);
      }
    } catch (err) {
      console.error("Cron Job Error:", err);
    }
  });

  // 2. Ensure Database Schema & Required Indices
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
      uploaded_by_name VARCHAR(255),
      password VARCHAR(255),
      job_type VARCHAR(50) DEFAULT 'DPF',
      process_id INTEGER,
      location_id INTEGER,
      target_date DATE,
      file_data TEXT,
      file_name VARCHAR(255)
    );

    ALTER TABLE upload_jobs ADD COLUMN IF NOT EXISTS target_date DATE;
    ALTER TABLE upload_jobs ADD COLUMN IF NOT EXISTS file_data TEXT;
    ALTER TABLE upload_jobs ADD COLUMN IF NOT EXISTS file_name VARCHAR(255);
    ALTER TABLE upload_jobs ADD COLUMN IF NOT EXISTS process_id INTEGER;
    ALTER TABLE upload_jobs ADD COLUMN IF NOT EXISTS location_id INTEGER;
    ALTER TABLE upload_jobs ADD COLUMN IF NOT EXISTS password VARCHAR(255);
    ALTER TABLE upload_jobs ADD COLUMN IF NOT EXISTS uploaded_by_employee_id VARCHAR(100);
    ALTER TABLE upload_jobs ADD COLUMN IF NOT EXISTS uploaded_by_name VARCHAR(255);
    ALTER TABLE upload_jobs ADD COLUMN IF NOT EXISTS job_type VARCHAR(50) DEFAULT 'DPF';

    CREATE TABLE IF NOT EXISTS employee_keka_data (
      employee_id VARCHAR(100) PRIMARY KEY,
      name VARCHAR(255),
      location VARCHAR(255),
      client VARCHAR(255),
      product VARCHAR(255),
      designation VARCHAR(255),
      agent_ohr VARCHAR(255),
      doj DATE,
      doc DATE,
      salary NUMERIC DEFAULT 0,
      tl_name VARCHAR(255),
      am_name VARCHAR(255),
      extra_data JSONB DEFAULT '{}'::jsonb,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS dpf_records (
      id SERIAL PRIMARY KEY,
      account_no VARCHAR(255),
      employee_code VARCHAR(255),
      employee_name VARCHAR(255),
      client VARCHAR(255),
      product VARCHAR(255),
      bucket VARCHAR(100),
      location VARCHAR(255),
      money_collected NUMERIC DEFAULT 0,
      payment_mode VARCHAR(100),
      tl_name VARCHAR(255),
      am VARCHAR(255),
      cm VARCHAR(255),
      aph VARCHAR(255),
      ph VARCHAR(255),
      mobile_no VARCHAR(50),
      job_id UUID,
      upload_at DATE,
      uploaded_by_employee_id VARCHAR(100),
      uploaded_by_name VARCHAR(255),
      is_duplicate BOOLEAN DEFAULT FALSE,
      fraud_flag VARCHAR(255),
      client_id INTEGER,
      recovery_or_upgrade VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_dpf_records_upload_at ON dpf_records(upload_at);
    CREATE INDEX IF NOT EXISTS idx_dpf_records_emp_code ON dpf_records(employee_code);
    CREATE INDEX IF NOT EXISTS idx_employee_keka_loc ON employee_keka_data(location);
  `);

  // 3. Fast Adaptive Ingestion Engine
  let isRunning = true;

  const processNextJob = async () => {
    let decFilePath: string | null = null;
    let originalFilePath: string | null = null;
    let fileData: string | null = null;

    try {
      // Row lock concurrency for Multi-Worker AWS Autoscaling
      const res = await pool.query(`
        SELECT id, file_path, password, uploaded_by_employee_id, uploaded_by_name, job_type, process_id, location_id, target_date, file_data, file_name 
        FROM upload_jobs 
        WHERE status = 'PENDING' 
        ORDER BY created_at ASC 
        LIMIT 1 
        FOR UPDATE SKIP LOCKED
      `);

      if (res.rows.length === 0) {
        return false; // Queue is empty, sleep standard interval
      }

      const job = res.rows[0];
      const jobId = job.id;
      originalFilePath = job.file_path;
      const filePassword = job.password;
      const uploadedByEmpId = job.uploaded_by_employee_id;
      const uploadedByName = job.uploaded_by_name;
      const jobType = job.job_type || 'DPF';
      const processId = job.process_id;
      const jobLocationId = job.location_id;
      const targetDate = job.target_date;
      fileData = job.file_data;
      const originalFileName = job.file_name;

      console.log(`⚡ [Job ${jobId}] Started processing (${jobType} - ${originalFileName || originalFilePath || 'Base64'})...`);
      await pool.query(`UPDATE upload_jobs SET status = 'PROCESSING' WHERE id = $1`, [jobId]);

      let processLocationName: string | null = null;
      let processClientName: string | null = null;
      let productType: string | null = null;

      if (processId) {
        const pRes = await pool.query(`
          SELECT cl.product_type, c.name as client_name, l.name as location_name 
          FROM client_locations cl
          JOIN clients c ON cl.client_id = c.id
          JOIN locations l ON cl.location_id = l.id
          WHERE cl.id = $1
        `, [processId]);
        if (pRes.rows.length > 0) {
          processLocationName = pRes.rows[0].location_name;
          processClientName = pRes.rows[0].client_name;
          productType = pRes.rows[0].product_type;
        }
      }

      let workbook: xlsx.WorkBook;

      if (fileData) {
        const fileBuffer = Buffer.from(fileData, 'base64');
        workbook = xlsx.read(fileBuffer, { type: 'buffer', cellDates: true, dense: true });
      } else {
        if (!originalFilePath) throw new Error("No file path or file data provided");
        const ext = path.extname(originalFilePath).toLowerCase();
        let targetFileToRead = originalFilePath;

        if (filePassword) {
          decFilePath = path.join(process.cwd(), 'temp', `dec_${path.basename(originalFilePath)}`);
          if (!fs.existsSync(path.dirname(decFilePath))) fs.mkdirSync(path.dirname(decFilePath), { recursive: true });
          if (ext === '.xlsx' || ext === '.xls') {
            await execAsync(`python decrypt.py "${originalFilePath}" "${filePassword}" "${decFilePath}"`);
            targetFileToRead = decFilePath;
          }
        }
        workbook = xlsx.readFile(targetFileToRead, { cellDates: true, dense: true });
      }

      // ==========================================
      // A. KEKA MASTER INGESTION (HIGH-SPEED)
      // ==========================================
      if (jobType === 'KEKA') {
        const kekaColumnsPath = path.join(process.cwd(), 'data', 'keka_columns.json');
        let kekaColumns = [
          { key: 'employee_id', labels: ['employee_id', 'Employee ID', 'EmployeeId', 'EMP ID', 'EMPID', 'EmpCode', 'Emp Code', 'Emp ID'] },
          { key: 'name', labels: ['name', 'Name', 'Employee Name', 'EmployeeName', 'EmpName', 'EMP NAME'] },
          { key: 'location', labels: ['location', 'Location', 'Branch', 'City', 'Hub'] },
          { key: 'client', labels: ['client', 'Client', 'Process', 'Client Name', 'Bank'] },
          { key: 'product', labels: ['product', 'Product', 'Product Type', 'Scheme', 'Segment'] },
          { key: 'designation', labels: ['designation', 'Designation', 'Role', 'Position', 'Job Title'] },
          { key: 'agent_ohr', labels: ['agent_ohr', 'Agent OHR', 'AgentOHR', 'OHR', 'OHR ID', 'AGENT OHR'] },
          { key: 'tl_name', labels: ['tl_name', 'TL Name', 'TLName', 'Team Leader', 'TL', 'tl', 'Reporting Manager'] },
          { key: 'am_name', labels: ['am_name', 'AM Name', 'AMName', 'Area Manager', 'AM', 'am', 'Manager'] },
          { key: 'doj', labels: ['doj', 'DOJ', 'Date of Joining', 'DateOfJoining', 'Joining Date'] },
          { key: 'doc', labels: ['doc', 'DOC', 'Date of Calling', 'DateOfCalling', 'Calling Date'] },
          { key: 'salary', labels: ['salary', 'Salary', 'Base Salary', 'BaseSalary', 'Gross Salary', 'CTC'] },
        ];

        if (fs.existsSync(kekaColumnsPath)) {
          try {
            const parsedData = JSON.parse(fs.readFileSync(kekaColumnsPath, 'utf8'));
            kekaColumns = Array.isArray(parsedData) ? parsedData : (parsedData['default'] || kekaColumns);
          } catch {}
        }

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rawRows = xlsx.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

        let headerIndex = 0;
        for (let i = 0; i < Math.min(15, rawRows.length); i++) {
          if (rawRows[i] && rawRows[i].filter(c => typeof c === 'string').length >= 3) {
            headerIndex = i;
            break;
          }
        }

        const dataRows = xlsx.utils.sheet_to_json(sheet, { range: headerIndex }) as any[];
        const totalRows = dataRows.length;
        await pool.query(`UPDATE upload_jobs SET total_rows = $1 WHERE id = $2`, [totalRows, jobId]);

        // Precompute O(1) Header Resolver Map
        const headerKeyMap: Record<string, string> = {};
        if (dataRows.length > 0) {
          Object.keys(dataRows[0]).forEach(k => {
            headerKeyMap[normalize(k)] = k;
          });
        }

        const resolvedKeyMap: Record<string, string | null> = {};
        kekaColumns.forEach((col: any) => {
          let matched: string | null = null;
          for (const lbl of col.labels || [col.key]) {
            const n = normalize(lbl);
            if (headerKeyMap[n]) {
              matched = headerKeyMap[n];
              break;
            }
          }
          resolvedKeyMap[col.key] = matched;
        });

        let processed = 0;
        let failed = 0;
        const BATCH_SIZE = 1000;

        await pool.query('BEGIN');

        for (let i = 0; i < dataRows.length; i += BATCH_SIZE) {
          const batch = dataRows.slice(i, i + BATCH_SIZE);
          const valueStrings: string[] = [];
          const params: any[] = [];
          let paramIdx = 1;

          for (let j = 0; j < batch.length; j++) {
            const row = batch[j];
            const getVal = (k: string) => {
              const rk = resolvedKeyMap[k];
              return rk && row[rk] !== undefined ? row[rk] : null;
            };

            const empCode = String(getVal('employee_id') || '').trim();
            if (!empCode) {
              failed++;
              continue;
            }

            const name = getVal('name');
            const location = getVal('location');
            const client = getVal('client');
            const product = getVal('product');
            const designation = getVal('designation');
            const agentOhr = String(getVal('agent_ohr') || '');
            const dojDate = parseDateSmart(getVal('doj'));
            const docDate = parseDateSmart(getVal('doc'));
            const salary = parseNumericSmart(getVal('salary'));
            const tlName = getVal('tl_name');
            const amName = getVal('am_name');

            // Collect any dynamic extra fields
            const coreKeys = ['employee_id', 'name', 'location', 'client', 'product', 'designation', 'agent_ohr', 'doj', 'doc', 'salary', 'tl_name', 'am_name'];
            const extraData: Record<string, any> = {};
            kekaColumns.forEach(c => {
              if (!coreKeys.includes(c.key)) {
                const v = getVal(c.key);
                if (v !== null) extraData[c.key] = v;
              }
            });

            valueStrings.push(`($${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, CURRENT_TIMESTAMP)`);
            params.push(processLocationName || location || null, empCode, name, designation, agentOhr, dojDate, docDate, salary, tlName, amName, processClientName || client || null, productType || product || null, extraData);
          }

          if (valueStrings.length > 0) {
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
            `, params);
            processed += insertRes.rowCount || 0;
          }

          await pool.query(`UPDATE upload_jobs SET processed_rows = $1 WHERE id = $2`, [processed + failed, jobId]);
        }

        await pool.query('COMMIT');
        await pool.query(`UPDATE upload_jobs SET status = 'COMPLETED', error_log = $2 WHERE id = $1`, [
          jobId,
          JSON.stringify({ processed_count: processed, failed_count: failed, status: 'Success' })
        ]);
        console.log(`🎉 [Job ${jobId}] Keka Ingestion Finished: ${processed} rows synced!`);
      }

      // ==========================================
      // B. DPF DAILY PAID FILE INGESTION (HIGH-SPEED)
      // ==========================================
      else {
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rawRows = xlsx.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

        let headerIndex = 0;
        for (let i = 0; i < Math.min(15, rawRows.length); i++) {
          if (rawRows[i] && rawRows[i].filter(c => typeof c === 'string').length >= 4) {
            headerIndex = i;
            break;
          }
        }

        const dataRows = xlsx.utils.sheet_to_json(sheet, { range: headerIndex }) as any[];
        const totalRows = dataRows.length;
        await pool.query(`UPDATE upload_jobs SET total_rows = $1 WHERE id = $2`, [totalRows, jobId]);

        const uploadAt = targetDate ? new Date(targetDate) : new Date();
        const y = uploadAt.getFullYear();
        const m = uploadAt.getMonth() + 1;
        const startOfMonth = `${y}-${String(m).padStart(2, '0')}-01`;
        const endOfMonth = `${y}-${String(m).padStart(2, '0')}-31`;

        // Pre-fetch duplicate cache for fast intra-month verification
        const prevDupRes = await pool.query(`
          SELECT account_no, money_collected, upload_at 
          FROM dpf_records 
          WHERE upload_at >= $1 AND upload_at <= $2
        `, [startOfMonth, endOfMonth]);

        const dbDupSet = new Set<string>();
        prevDupRes.rows.forEach(r => {
          const dtStr = r.upload_at ? new Date(r.upload_at).toISOString().split('T')[0] : '';
          dbDupSet.add(`${String(r.account_no).trim()}_${parseNumericSmart(r.money_collected)}_${dtStr}`);
        });

        // Precompute DPF Column Map
        const headerKeyMap: Record<string, string> = {};
        if (dataRows.length > 0) {
          Object.keys(dataRows[0]).forEach(k => {
            headerKeyMap[normalize(k)] = k;
          });
        }

        const dpfLabels: Record<string, string[]> = {
          account_no: ['Account_No', 'Account No', 'LAN', 'Loan No', 'Agreement No', 'Loan_No'],
          employee_code: ['Employee_Code', 'Employee Code', 'EmpCode', 'EMP CODE', 'Emp ID', 'Agent OHR'],
          employee_name: ['Employee_Name', 'Employee Name', 'EmpName', 'EMP NAME', 'Agent Name'],
          bucket: ['Bucket', 'bucket', 'Delinquency', 'MOB'],
          money_collected: ['Money_Collected', 'Money Collected', 'Money Collect', 'Amount', 'Collected Amount'],
          payment_mode: ['Payment_Mode', 'Payment Mode', 'Mode of Payment', 'Mode'],
          tl_name: ['TL_Name', 'TL Name', 'Team Leader', 'TL', 'tl'],
          am: ['AM', 'am', 'Area Manager', 'AM Name', 'AM_Name'],
          cm: ['CM', 'cm', 'Collection Manager'],
          aph: ['APH', 'aph'],
          ph: ['PH', 'ph'],
          mobile_no: ['Phone_No', 'Phone No', 'Mobile No', 'Mobile', 'Contact', 'Phone Number'],
          recovery_or_upgrade: ['recovery_or_upgrade', 'RECOVERY/UPGRADE', 'Recovery_or_Upgrade', 'Recovery_Upgrade', 'RECOVERY', 'UPGRADE']
        };

        const resolvedDpfMap: Record<string, string | null> = {};
        Object.keys(dpfLabels).forEach(col => {
          let matched: string | null = null;
          for (const lbl of dpfLabels[col]) {
            const n = normalize(lbl);
            if (headerKeyMap[n]) {
              matched = headerKeyMap[n];
              break;
            }
          }
          resolvedDpfMap[col] = matched;
        });

        let processed = 0;
        let failed = 0;
        const BATCH_SIZE = 1000;
        const memoryDupSet = new Set<string>();

        const client = await pool.connect();
        try {
          await client.query('BEGIN');

          for (let i = 0; i < dataRows.length; i += BATCH_SIZE) {
            const batch = dataRows.slice(i, i + BATCH_SIZE);
            const placeholders: string[] = [];
            const values: any[] = [];
            let paramIndex = 1;

            for (let j = 0; j < batch.length; j++) {
              const row = batch[j];
              const getVal = (col: string) => {
                const rk = resolvedDpfMap[col];
                return rk && row[rk] !== undefined ? row[rk] : null;
              };

              const accNo = String(getVal('account_no') || '').trim();
              const amt = parseNumericSmart(getVal('money_collected'));
              const dtStr = uploadAt.toISOString().split('T')[0];
              const dupKey = `${accNo}_${amt}_${dtStr}`;

              let isDup = false;
              let dupReason: string | null = null;

              if (dbDupSet.has(dupKey)) {
                isDup = true;
                dupReason = 'ALREADY_UPLOADED_THIS_MONTH';
              } else if (memoryDupSet.has(dupKey)) {
                isDup = true;
                dupReason = 'INTRA_FILE_DUPLICATE';
              } else {
                memoryDupSet.add(dupKey);
              }

              placeholders.push(`($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++})`);
              values.push(
                accNo || null,
                getVal('employee_code'),
                getVal('employee_name'),
                processClientName || null,
                productType || null,
                getVal('bucket'),
                processLocationName || null,
                amt,
                getVal('payment_mode'),
                getVal('tl_name'),
                getVal('am'),
                getVal('cm'),
                getVal('aph'),
                getVal('ph'),
                String(getVal('mobile_no') || '').replace(/\D/g, '').slice(-10) || null,
                jobId,
                uploadAt,
                uploadedByEmpId,
                uploadedByName,
                isDup,
                dupReason,
                processId || null,
                getVal('recovery_or_upgrade')
              );
            }

            if (placeholders.length > 0) {
              await client.query(`
                INSERT INTO dpf_records 
                  (account_no, employee_code, employee_name, client, product, bucket, location, money_collected, payment_mode, tl_name, am, cm, aph, ph, mobile_no, job_id, upload_at, uploaded_by_employee_id, uploaded_by_name, is_duplicate, fraud_flag, client_id, recovery_or_upgrade)
                VALUES ${placeholders.join(', ')}
              `, values);
              processed += batch.length;
            }

            await client.query(`UPDATE upload_jobs SET processed_rows = $1 WHERE id = $2`, [processed + failed, jobId]);
          }

          await client.query('COMMIT');
          await pool.query(`UPDATE upload_jobs SET status = 'COMPLETED', error_log = $2 WHERE id = $1`, [
            jobId,
            JSON.stringify({ processed_count: processed, failed_count: failed, status: 'Success' })
          ]);
          console.log(`🎉 [Job ${jobId}] DPF Ingestion Finished: ${processed} records!`);
        } catch (dbErr: any) {
          await client.query('ROLLBACK');
          throw dbErr;
        } finally {
          client.release();
        }
      }

      return true; // Finished a job, immediately check for next pending job
    } catch (err: any) {
      console.error("❌ Job Processing Failed:", err);
      return false;
    } finally {
      if (decFilePath) await unlink(decFilePath).catch(() => {});
      if (originalFilePath && fileData) await unlink(originalFilePath).catch(() => {});
    }
  };

  // 4. Adaptive Event Loop (0ms on active queue, 1000ms on idle)
  const pollLoop = async () => {
    while (isRunning) {
      try {
        const didWork = await processNextJob();
        if (didWork) {
          continue; // Immediate instant execution for next queued file
        }
      } catch (e) {
        console.error("Poller Error:", e);
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  pollLoop();

  // 5. Graceful shutdown handler on AWS EC2 / ECS / Docker
  const gracefulShutdown = async () => {
    console.log("🛑 Gracefully shutting down worker...");
    isRunning = false;
    await pool.end();
    process.exit(0);
  };

  process.on('SIGINT', gracefulShutdown);
  process.on('SIGTERM', gracefulShutdown);
}

startWorker().catch(console.error);
