import { add, format, startOfWeek, parse, differenceInMinutes } from 'date-fns';
import type { AttendanceRecord } from './types';
import { MOCK_DEPARTMENTS } from './mock-data';


export type EmailLog = {
    id?: string;
    to: string;
    subject: string;
    body: string;
    emailType: 'late_notice' | 'admin_report' | 'department_report';
    sentAt?: Date;
}


function processRecord(record: any): Omit<AttendanceRecord, 'id' | 'is_audited' | 'audit_notes'> {
    const shiftStart = parse(record.shift_start, 'HH:mm', new Date(record.date));
    const entryTime = parse(record.entry_time, 'HH:mm', new Date(record.date));
    
    const graceMinutes = 15; 
    
    const lateByMinutes = differenceInMinutes(entryTime, shiftStart) > graceMinutes
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
    // This is a mock function. In a real app, it would add records to a database.
    console.log("Mock addAttendanceRecords called with:", records);
    records.forEach(record => {
        const processed = processRecord(record);
        console.log("Processed record:", processed);
    });
    return Promise.resolve();
}


export async function getRecordsByIds(recordIds: string[]): Promise<AttendanceRecord[]> {
    // This is a mock function.
    console.log("Mock getRecordsByIds called with:", recordIds);
    return Promise.resolve([]);
}

export async function auditRecords(recordIds: string[], auditNotes: string): Promise<void> {
    // This is a mock function.
    console.log("Mock auditRecords called with:", { recordIds, auditNotes });
    return Promise.resolve();
}


export async function logEmail(email: EmailLog): Promise<void> {
    // This is a mock function.
    console.log("Mock logEmail called with:", email);
    return Promise.resolve();
}


export async function getAttendanceRecords(propertyCode: string): Promise<AttendanceRecord[]> {
    // This is a mock function.
    console.log("Mock getAttendanceRecords called for propertyCode:", propertyCode);
    return Promise.resolve([]);
}


export async function getDepartments(): Promise<string[]> {
    // In mock mode, we return a static list of departments.
    return Promise.resolve(MOCK_DEPARTMENTS);
}
