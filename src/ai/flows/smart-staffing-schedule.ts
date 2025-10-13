'use server';
/**
 * @fileOverview Implements the SmartStaffingSchedule flow, which uses
 * the previous month's attendance data to generate an optimized staffing schedule.
 *
 * - smartStaffingSchedule - A function that generates an optimized staffing schedule.
 * - SmartStaffingScheduleInput - The input type for the smartStaffingSchedule function.
 * - SmartStaffingScheduleOutput - The return type for the smartStaffingSchedule function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartStaffingScheduleInputSchema = z.object({
  priorMonthAttendanceData: z
    .string()
    .describe("The prior month's attendance data in JSON format.  Each object should contain 'employee_name', 'date', 'entry_time', and 'exit_time' fields."),
  departments: z.array(z.string()).describe('A list of departments to include in the schedule generation.'),
  currentMonth: z.string().describe('The current month and year (e.g., YYYY-MM) for which to generate the schedule.'),
});
export type SmartStaffingScheduleInput = z.infer<typeof SmartStaffingScheduleInputSchema>;

const SmartStaffingScheduleOutputSchema = z.object({
  optimizedSchedule: z
    .string()
    .describe("An optimized staffing schedule in JSON format, including employee assignments, shift times, and department assignments for the current month."),
  analysisSummary: z
    .string()
    .describe('A summary of the analysis performed on the prior month attendance data, including identified peak times and staffing recommendations.'),
});
export type SmartStaffingScheduleOutput = z.infer<typeof SmartStaffingScheduleOutputSchema>;

export async function smartStaffingSchedule(input: SmartStaffingScheduleInput): Promise<SmartStaffingScheduleOutput> {
  return smartStaffingScheduleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'smartStaffingSchedulePrompt',
  input: {schema: SmartStaffingScheduleInputSchema},
  output: {schema: SmartStaffingScheduleOutputSchema},
  prompt: `You are an AI-powered scheduling assistant that optimizes staffing requirements based on historical attendance data.

Analyze the prior month's attendance data to identify trends, peak hours, and potential understaffing or overstaffing issues.

Based on your analysis, generate an optimized staffing schedule for the current month, ensuring adequate coverage during peak times and minimizing unnecessary staffing during off-peak times.

Prior Month Attendance Data: {{{priorMonthAttendanceData}}}
Departments: {{departments}}
Current Month: {{currentMonth}}

Provide both the optimized staffing schedule (in JSON format) and a summary of your analysis, including specific recommendations for staffing adjustments.

Ensure that the optimizedSchedule includes all departments and provides balanced coverage across all days of the week.

Output the optimized schedule and analysis summary.`,
});

const smartStaffingScheduleFlow = ai.defineFlow(
  {
    name: 'smartStaffingScheduleFlow',
    inputSchema: SmartStaffingScheduleInputSchema,
    outputSchema: SmartStaffingScheduleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
