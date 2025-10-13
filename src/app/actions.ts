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
