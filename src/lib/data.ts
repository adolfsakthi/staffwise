

import { add, format, startOfWeek, parse, differenceInMinutes } from 'date-fns';
import { MOCK_ATTENDANCE_RECORDS, MOCK_DEPARTMENTS } from './mock-data';
import type { AttendanceRecord } from './types';


export type EmailLog = {
    id?: string;
    to: string;
    subject: string;
    body: string;
    emailType: 'late_notice' | 'admin_report' | 'department_report';
    sentAt?: Date;
}


// A helper function to calculate late minutes and overtime
function processRecord(record: any): Omit<AttendanceRecord, 'id' | 'is_audited'> {
    const shiftStart = parse(record.shift_start, 'HH:mm', new Date(record.date));
    const entryTime = parse(record.entry_time, 'HH:mm', new Date(record.date));
    const lateByMinutes = differenceInMinutes(entryTime, shiftStart) > 15 
        ? differenceInMinutes(entryTime, shiftStart) 
        : 0;

    const shiftEnd = parse(record.shift_end, 'HH:mm', new Date(record.date));
    const exitTime = parse(record.exit_time, 'HH:mm', new Date(record.date));
    const overtimeMinutes = differenceInMinutes(exitTime, shiftEnd) > 0 
        ? differenceInMinutes(exitTime, shiftEnd)
        : 0;
    
    return {
        property_code: record.property_code,
        employee_name: record.employee_name,
        email: record.email,
        department: record.department,
        shift_start: record.shift_start,
        shift_end: record.shift_end,
        entry_time: record.entry_time,
        exit_time: record.exit_time,
        date: format(new Date(record.date), 'yyyy-MM-dd'),
        is_late: lateByMinutes > 0,
        late_by_minutes: lateByMinutes,
        overtime_minutes: overtimeMinutes,
    };
}


export async function addAttendanceRecords(records: any[]) {
    console.log("Simulating adding records. In a real app, this would write to Firestore.");
    
    const newRecords: AttendanceRecord[] = records.map((record, index) => {
        const processed = processRecord(record);
        return {
            ...processed,
            id: `new_rec_${Date.now()}_${index}`,
            is_audited: false,
        };
    });

    // In a mock environment, we can't persist this, but we can log what would be added.
    console.log("Records to be added:", newRecords);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
}


export async function getAttendanceRecords(propertyCode: string): Promise<AttendanceRecord[]> {
    console.log(`Fetching mock records for property: ${propertyCode}`);
    return MOCK_ATTENDANCE_RECORDS.filter(r => r.property_code === propertyCode);
}


export async function getRecordsByIds(recordIds: string[]): Promise<AttendanceRecord[]> {
    if (recordIds.length === 0) return [];
    
    console.log(`Fetching mock records for IDs: ${recordIds.join(', ')}`);
    const records = MOCK_ATTENDANCE_RECORDS.filter(r => recordIds.includes(r.id));
    return records;
}

export async function getAttendanceStats(propertyCode: string) {
    const records = await getAttendanceRecords(propertyCode);
    const totalRecords = records.length;
    const lateCount = records.filter(r => r.is_late).length;
    const totalOvertimeMinutes = records.reduce((sum, r) => sum + r.overtime_minutes, 0);
    const departmentCount = [...new Set(records.map(r => r.department))].length;
    
    return {
        totalRecords,
        lateCount,
        totalOvertimeMinutes,
        departmentCount,
    };
}

export async function getDepartments(propertyCode?: string): Promise<string[]> {
    if (!propertyCode) return [];
    console.log(`Fetching mock departments for property: ${propertyCode}`);
    return MOCK_DEPARTMENTS;
}


export async function getWeeklyAttendance(propertyCode: string) {
    const records = await getAttendanceRecords(propertyCode);
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const data = Array.from({ length: 7 }).map((_, i) => {
        const date = add(weekStart, { days: i });
        const recordsForDay = records.filter(r => r.date === format(date, 'yyyy-MM-dd'));
        return {
            name: format(date, 'EEE'),
            onTime: recordsForDay.filter(r => !r.is_late).length,
            late: recordsForDay.filter(r => r.is_late).length,
        };
    });
    return data;
}

export async function auditRecords(recordIds: string[], auditNotes: string): Promise<void> {
    console.log(`Simulating audit for records: ${recordIds.join(', ')} with notes: ${auditNotes}`);
    // In a mock environment, we can't update the source, so we just log the action.
    await new Promise(resolve => setTimeout(resolve, 500));
}


export async function logEmail(email: EmailLog): Promise<void> {
    console.log('--- MOCK EMAIL LOG ---');
    console.log(`To: ${email.to}`);
    console.log(`Subject: ${email.subject}`);
    console.log('--- Body ---');
    console.log(email.body);
    console.log('--------------------');
    await new Promise(res => setTimeout(res, 500));
}
