'use server';

import { auditRecords, getRecordsByIds, logEmail, addAttendanceRecords } from "@/lib/data";

async function parseCsv(file: File): Promise<any[]> {
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim() !== '');
    if (lines.length < 2) return [];

    const header = lines[0].split(',').map(h => h.trim());
    const records = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const record: { [key: string]: any } = {};
        header.forEach((h, i) => {
            // A simple camelCase conversion
            const key = h.replace(/\s+/g, '_').toLowerCase();
            record[key] = values[i];
        });
        return record;
    });
    return records;
}

export async function uploadAttendance(formData: FormData) {
  const file = formData.get('file') as File;
  const uploadType = formData.get('uploadType') as string;
  const propertyCode = 'PROP-001'; // Fallback property code since auth is removed

  if (!file || file.size === 0) {
    return { success: false, message: 'No file provided.' };
  }

  try {
    const recordsToCreate = await parseCsv(file);
    if (recordsToCreate.length === 0) {
        return { success: false, message: 'CSV file is empty or invalid.' };
    }

    // Add property_code if it's missing from the records
    const processedRecords = recordsToCreate.map(rec => ({
      ...rec,
      property_code: rec.property_code || propertyCode
    }));


    switch(uploadType) {
        case 'attendance':
             await addAttendanceRecords(processedRecords);
            break;
        // In a real app, you would have functions like `addEmployees` or `addPunchLogs`
        case 'employees':
            console.log('Simulating processing of employee details...', processedRecords);
            await new Promise(resolve => setTimeout(resolve, 1000));
            break;
        case 'punch_logs':
             console.log('Simulating processing of punch logs...', processedRecords);
            await new Promise(resolve => setTimeout(resolve, 1000));
            break;
        default:
            return { success: false, message: 'Invalid upload type.' };
    }

    return { success: true, message: `Successfully processed ${recordsToCreate.length} records from ${file.name}.` };
  } catch (error) {
    console.error(`Error processing file for ${uploadType}:`, error);
    return { success: false, message: `Failed to process ${file.name}. Please check the file format.` };
  }
}

export async function runAudit(recordIds: string[], auditNotes: string) {
    try {
        await auditRecords(recordIds, auditNotes);

        // --- Send Audit Summary Email ---
        const auditedRecords = await getRecordsByIds(recordIds);
        const adminEmail = 'adolfsakthi@gmail.com'; // In a real app, this would be a configured admin email
        const subject = `Audit Completed: ${new Date().toLocaleString()}`;
        
        const auditedList = auditedRecords.map(r => 
            `<li>${r.employee_name} (${r.department}) - Date: ${r.date} - Status: ${r.is_late ? `Late by ${r.late_by_minutes} mins` : 'On Time'}</li>`
        ).join('');

        const body = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #2E3192; color: white; padding: 20px; text-align: center;">
                    <h1 style="margin: 0; font-size: 24px;">Audit Summary</h1>
                </div>
                <div style="padding: 20px;">
                    <p>An audit was finalized with the following details:</p>
                    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; border-left: 5px solid #FFA500;">
                        <p style="margin: 0;"><b>Audit Notes:</b> ${auditNotes || 'No notes provided.'}</p>
                    </div>
                    <h2 style="font-size: 18px; margin-top: 20px; border-bottom: 2px solid #eee; padding-bottom: 5px;">${auditedRecords.length} record(s) were audited:</h2>
                    <ul style="padding-left: 20px;">
                        ${auditedList}
                    </ul>
                    <p style="font-size: 12px; color: #777; margin-top: 30px;">
                        This is an automated notification. The audit was triggered manually from the StaffWise dashboard.
                    </p>
                </div>
                <div style="background-color: #f0f2f5; text-align: center; padding: 10px; font-size: 12px; color: #777;">
                    &copy; ${new Date().getFullYear()} StaffWise Inc. All rights reserved.
                </div>
            </div>
        `;

        await logEmail({
            to: adminEmail,
            subject,
            body,
            emailType: 'admin_report',
        });
        // --- End of Email Logic ---


        return { success: true, message: `${recordIds.length} records audited successfully. A summary email has been logged.` };
    } catch (error) {
        console.error("Error running audit:", error);
        return { success: false, message: "Failed to audit records. Please try again." };
    }
}
