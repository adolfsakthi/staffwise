'use server';

import { auditRecords, getRecordsByIds, logEmail } from "@/lib/data";

export async function uploadAttendance(formData: FormData) {
  const file = formData.get('file') as File;

  if (!file || file.size === 0) {
    return { success: false, message: 'No file provided.' };
  }
  
  // In a real app, you would process the file here (e.g., parse CSV/Excel)
  // For this demo, we'll simulate processing.
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  console.log(`Simulating processing of file: ${file.name}`);
  
  return { success: true, message: `Successfully processed ${file.name}.` };
}

export async function runAudit(recordIds: string[], auditNotes: string) {
    try {
        await auditRecords(recordIds, auditNotes);

        // --- Send Audit Summary Email ---
        const auditedRecords = await getRecordsByIds(recordIds);
        const adminEmail = 'sakthi@hezee.co.in';
        const subject = `Audit Completed: ${new Date().toLocaleString()}`;
        
        const auditedList = auditedRecords.map(r => 
            `<li>${r.employee_name} (${r.department}) - Date: ${r.date} - Status: ${r.is_late ? `Late by ${r.late_by_minutes} mins` : 'On Time'}</li>`
        ).join('');

        const body = `
            <h1>Manual Audit Summary</h1>
            <p>An audit was finalized with the following details:</p>
            <p><b>Audit Notes:</b> ${auditNotes || 'No notes provided.'}</p>
            <p><b>${auditedRecords.length} records were audited:</b></p>
            <ul>
                ${auditedList}
            </ul>
            <p>This is an automated notification. The audit was triggered manually from the StaffWise dashboard.</p>
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
