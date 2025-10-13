'use server';

import {
  addAttendanceRecords,
  addEmployees,
  addPunchLogs,
  auditRecords,
  logEmail,
} from '@/lib/data';
import { z } from 'zod';
import { getDb } from '@/firebase/server';

const AttendanceRecordSchema = z.object({
  employee_name: z.string(),
  email: z.string().email(),
  department: z.string(),
  shift_start: z.string(),
  shift_end: z.string(),
  entry_time: z.string(),
  exit_time: z.string(),
  date: z.string(),
  property_code: z.string().optional(),
});

const PunchLogSchema = z.object({
  device_id: z.string(),
  employee_id: z.string(),
  punch_time: z.string(),
  property_code: z.string().optional(),
});

const EmployeeSchema = z.object({
  employee_id: z.string(),
  employee_name: z.string(),
  email: z.string().email(),
  department: z.string(),
  role: z.string(),
  property_code: z.string().optional(),
});

async function parseCsv(file: File): Promise<any[]> {
  const text = await file.text();
  const lines = text.split('\n').filter((line) => line.trim() !== '');
  if (lines.length < 2) return [];

  const header = lines[0].split(',').map((h) => h.trim());
  const records = lines.slice(1).map((line) => {
    const values = line.split(',').map((v) => v.trim());
    const record: { [key: string]: any } = {};
    header.forEach((h, i) => {
      const key = h.replace(/\s+/g, '_').toLowerCase();
      record[key] = values[i];
    });
    return record;
  });
  return records;
}

export async function uploadData(formData: FormData) {
  const file = formData.get('file') as File;
  const uploadType = formData.get('uploadType') as string;
  const defaultPropertyCode = formData.get('propertyCode') as string;
  const db = getDb();

  if (!file || file.size === 0) {
    return { success: false, message: 'No file provided.' };
  }

  try {
    const recordsToCreate = await parseCsv(file);
    if (recordsToCreate.length === 0) {
      return { success: false, message: 'CSV file is empty or invalid.' };
    }

    const processedRecords = recordsToCreate.map((rec) => ({
      ...rec,
      property_code: rec.property_code || defaultPropertyCode,
    }));

    switch (uploadType) {
      case 'attendance':
        const validAttendance = z.array(AttendanceRecordSchema).parse(processedRecords);
        await addAttendanceRecords(db, validAttendance);
        break;
      case 'employees':
        const validEmployees = z.array(EmployeeSchema).parse(processedRecords);
        await addEmployees(db, validEmployees);
        break;
      case 'punch_logs':
        const validPunchLogs = z.array(PunchLogSchema).parse(processedRecords);
        await addPunchLogs(db, validPunchLogs);
        break;
      default:
        return { success: false, message: 'Invalid upload type.' };
    }

    return {
      success: true,
      message: `Successfully processed ${recordsToCreate.length} records from ${file.name}.`,
    };
  } catch (error: any) {
    console.error(`Error processing file for ${uploadType}:`, error);
    if (error instanceof z.ZodError) {
        return { success: false, message: `CSV validation failed: ${error.errors.map(e => `${e.path.join('.')} - ${e.message}`).join(', ')}` };
    }
    return {
      success: false,
      message: error.message || `Failed to process ${file.name}.`,
    };
  }
}

export async function runAudit(recordIds: string[], auditNotes: string) {
  const db = getDb();
  try {
    console.log('Running audit:', { recordIds, auditNotes });

    await auditRecords(db, recordIds, auditNotes);

    const adminEmail = 'admin@staffwise.com';
    const subject = `Audit Completed: ${new Date().toLocaleString()}`;

    const body = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; padding: 20px;">
                <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">Audit Summary</h2>
                <p>An audit was finalized on <strong>${new Date().toLocaleDateString()}</strong> with the following details:</p>
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h3 style="margin-top: 0;">Audit Notes:</h3>
                    <p style="font-style: italic;">${
                      auditNotes || 'No notes provided.'
                    }</p>
                </div>
                <p>A total of <strong style="font-size: 1.2em;">${
                  recordIds.length
                } record(s)</strong> were reviewed and marked as audited.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 0.9em; color: #7f8c8d;">This is an automated notification from the StaffWise system. No action is required.</p>
            </div>
        </div>
    `;

    await logEmail({
      to: adminEmail,
      subject,
      body,
      emailType: 'admin_report',
    });

    return {
      success: true,
      message: `${recordIds.length} records audited successfully. A summary email has been logged.`,
    };
  } catch (error: any) {
    console.error('Error running audit:', error);
    return {
      success: false,
      message: error.message || 'Failed to audit records. Please try again.',
    };
  }
}
