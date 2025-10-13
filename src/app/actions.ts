'use server';

import { smartStaffingSchedule, type SmartStaffingScheduleInput } from "@/ai/flows/smart-staffing-schedule";

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

export async function getSmartSchedule(input: SmartStaffingScheduleInput) {
    try {
        const result = await smartStaffingSchedule(input);
        return { success: true, data: result };
    } catch (error) {
        console.error("Error generating smart schedule:", error);
        return { success: false, message: "Failed to generate schedule. Please try again." };
    }
}
