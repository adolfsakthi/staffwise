'use server';

import { logEmail } from "@/lib/data";

async function parseCsv(file: File): Promise<any[]> {
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim() !== '');
    if (lines.length < 2) return [];

    const header = lines[0].split(',').map(h => h.trim());
    const records = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const record: { [key: string]: any } = {};
        header.forEach((h, i) => {
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
  const defaultPropertyCode = formData.get('propertyCode') as string;

  if (!file || file.size === 0) {
    return { success: false, message: 'No file provided.' };
  }

  try {
    const recordsToCreate = await parseCsv(file);
    if (recordsToCreate.length === 0) {
        return { success: false, message: 'CSV file is empty or invalid.' };
    }

    const processedRecords = recordsToCreate.map(rec => ({
      ...rec,
      property_code: rec.property_code || defaultPropertyCode
    }));


    switch(uploadType) {
        case 'attendance':
             console.log('Simulating processing of attendance...', processedRecords);
            break;
        case 'employees':
            console.log('Simulating processing of employee details...', processedRecords);
            return { success: false, message: 'Employee upload is not implemented yet.' };
        case 'punch_logs':
             console.log('Simulating processing of punch logs...', processedRecords);
             return { success: false, message: 'Punch log upload is not implemented yet.' };
        default:
            return { success: false, message: 'Invalid upload type.' };
    }

    return { success: true, message: `Successfully processed ${recordsToCreate.length} records from ${file.name}.` };
  } catch (error: any) {
    console.error(`Error processing file for ${uploadType}:`, error);
    return { success: false, message: error.message || `Failed to process ${file.name}.` };
  }
}

export async function runAudit(recordIds: string[], auditNotes: string) {
    try {
        console.log("Running mock audit:", { recordIds, auditNotes });

        const adminEmail = 'admin@staffwise.com'; 
        const subject = `Audit Completed: ${new Date().toLocaleString()}`;
        
        const body = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <p>An audit was finalized with the following details:</p>
                <p><b>Audit Notes:</b> ${auditNotes || 'No notes provided.'}</p>
                <p><b>${recordIds.length} record(s)</b> were audited.</p>
            </div>
        `;

        await logEmail({
            to: adminEmail,
            subject,
            body,
            emailType: 'admin_report',
        });


        return { success: true, message: `${recordIds.length} records audited successfully. A summary email has been logged.` };
    } catch (error: any) {
        console.error("Error running audit:", error);
        return { success: false, message: error.message || "Failed to audit records. Please try again." };
    }
}
