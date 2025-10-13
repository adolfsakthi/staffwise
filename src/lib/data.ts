import { add, format, startOfWeek, parse, differenceInMinutes } from 'date-fns';
import { initialAttendanceRecords, ATTENDANCE_RECORDS } from './attendance-data';

export type AttendanceRecord = {
  id: string;
  employee_name: string;
  email: string;
  department: string;
  shift_start: string;
  shift_end: string;
  entry_time: string;
  exit_time: string;
  date: string;
  is_late: boolean;
  late_by_minutes: number;
  overtime_minutes: number;
  is_audited: boolean;
  audit_notes?: string;
};

export type EmailLog = {
    id?: string;
    to: string;
    subject: string;
    body: string;
    emailType: 'late_notice' | 'admin_report' | 'department_report';
    sentAt?: Date;
}

const MOCK_DEPARTMENTS = ['Engineering', 'Sales', 'HR', 'IT', 'Operations', 'Support', 'Admin', 'Finance'];

// Initialize with the provided data, but allow it to be modified.
if (ATTENDANCE_RECORDS.length === 0) {
  initialAttendanceRecords.forEach(record => ATTENDANCE_RECORDS.push(record));
}

export async function addAttendanceRecords(records: Omit<AttendanceRecord, 'id'>[]) {
    const newRecords: AttendanceRecord[] = records.map((record, index) => {
        const today = new Date();
        const entryTime = parse(record.entry_time, 'HH:mm', today);
        const shiftStart = parse(record.shift_start, 'HH:mm', today);
        const exitTime = parse(record.exit_time, 'HH:mm', today);
        const shiftEnd = parse(record.shift_end, 'HH:mm', today);

        const lateByMinutes = differenceInMinutes(entryTime, shiftStart);
        const overtimeMinutes = differenceInMinutes(exitTime, shiftEnd);

        return {
            ...record,
            id: `rec_${Date.now()}_${index}`,
            is_late: lateByMinutes > 0,
            late_by_minutes: Math.max(0, lateByMinutes),
            overtime_minutes: Math.max(0, overtimeMinutes),
            is_audited: false,
            date: format(new Date(), 'yyyy-MM-dd')
        }
    });

    ATTENDANCE_RECORDS.unshift(...newRecords);
    await new Promise(res => setTimeout(res, 300));
    return newRecords;
}


export async function getAttendanceRecords(): Promise<AttendanceRecord[]> {
    await new Promise(res => setTimeout(res, 500));
    return ATTENDANCE_RECORDS;
}

export async function getUnauditedRecords(): Promise<AttendanceRecord[]> {
    await new Promise(res => setTimeout(res, 500));
    return ATTENDANCE_RECORDS.filter(r => !r.is_audited);
}

export async function getRecordsByIds(recordIds: string[]): Promise<AttendanceRecord[]> {
    await new Promise(res => setTimeout(res, 100));
    return ATTENDANCE_RECORDS.filter(r => recordIds.includes(r.id));
}

export async function getAttendanceStats() {
    await new Promise(res => setTimeout(res, 500));
    const totalRecords = ATTENDANCE_RECORDS.length;
    const lateCount = ATTENDANCE_RECORDS.filter(r => r.is_late).length;
    const totalOvertimeMinutes = ATTENDANCE_RECORDS.reduce((sum, r) => sum + r.overtime_minutes, 0);
    const departmentCount = [...new Set(ATTENDANCE_RECORDS.map(r => r.department))].length;
    
    return {
        totalRecords,
        lateCount,
        totalOvertimeMinutes,
        departmentCount,
    };
}

export async function getDepartments(): Promise<string[]> {
    await new Promise(res => setTimeout(res, 500));
    return MOCK_DEPARTMENTS;
}


export async function getWeeklyAttendance() {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const data = Array.from({ length: 7 }).map((_, i) => {
        const date = add(weekStart, { days: i });
        const recordsForDay = ATTENDANCE_RECORDS.filter(r => format(new Date(r.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'));
        return {
            name: format(date, 'EEE'),
            onTime: recordsForDay.filter(r => !r.is_late).length,
            late: recordsForDay.filter(r => r.is_late).length,
        };
    });
    await new Promise(res => setTimeout(res, 500));
    return data;
}

export async function auditRecords(recordIds: string[], auditNotes: string): Promise<void> {
    console.log('Simulating auditing of records:', recordIds, 'with notes:', auditNotes);
    recordIds.forEach(id => {
        const record = ATTENDANCE_RECORDS.find(r => r.id === id);
        if (record) {
            record.is_audited = true;
            record.audit_notes = auditNotes;
        }
    });
    await new Promise(res => setTimeout(res, 1000));
}

export async function logEmail(email: EmailLog): Promise<void> {
    console.log('--- MOCK EMAIL LOG ---');
    console.log(`To: ${email.to}`);
    console.log(`Subject: ${email.subject}`);
    console.log('--- Body ---');
    console.log(email.body);
    console.log('--------------------');
    // In a real app, this would use an email service (e.g., SendGrid, Nodemailer)
    // and save a log to the database.
    await new Promise(res => setTimeout(res, 500));
}

export async function getUsers() {
    // This would fetch from a database
    await new Promise(res => setTimeout(res, 500));
    return [
        { id: '1', displayName: 'Alice Johnson', email: 'alice@example.com', role: 'Admin' },
        { id: '2', displayName: 'Bob Williams', email: 'bob@example.com', role: 'Manager' },
        { id: '3', displayName: 'Charlie Brown', email: 'charlie@example.com', role: 'Staff' },
    ];
}

export async function getRoles() {
    await new Promise(res => setTimeout(res, 500));
    return [
        { id: '1', name: 'Admin', permissions: ['read', 'write', 'delete', 'manage_users'] },
        { id: '2', name: 'Manager', permissions: ['read', 'write'] },
        { id: '3', name: 'Staff', permissions: ['read'] },
    ];
}

export async function getDevices() {
    await new Promise(res => setTimeout(res, 500));
    return [
        { id: '1', name: 'Main Entrance', model: 'ZK-Teco-X1', ip: '192.168.1.101', status: 'online', branch: 'Headquarters' },
        { id: '2', name: 'Warehouse-1', model: 'BioMax-9000', ip: '192.168.1.102', status: 'offline', branch: 'West Wing' },
    ];
}
