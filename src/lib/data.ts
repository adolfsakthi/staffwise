import { add, format, startOfWeek } from 'date-fns';

export type AttendanceRecord = {
  id: string;
  employee_name: string;
  email: string;
  department: string;
  shift_start: string;
  shift_end:string;
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

const MOCK_RECORDS: AttendanceRecord[] = [
    { id: '1', employee_name: 'John Doe', email: 'john.doe@example.com', department: 'Engineering', shift_start: '09:00', shift_end: '18:00', entry_time: '09:15', exit_time: '18:05', date: '2024-05-27', is_late: true, late_by_minutes: 15, overtime_minutes: 5, is_audited: false },
    { id: '2', employee_name: 'Jane Smith', email: 'jane.smith@example.com', department: 'Sales', shift_start: '09:00', shift_end: '18:00', entry_time: '08:55', exit_time: '18:30', date: '2024-05-27', is_late: false, late_by_minutes: 0, overtime_minutes: 30, is_audited: true },
    { id: '3', employee_name: 'Mike Johnson', email: 'mike.j@example.com', department: 'Engineering', shift_start: '10:00', shift_end: '19:00', entry_time: '10:01', exit_time: '19:00', date: '2024-05-27', is_late: true, late_by_minutes: 1, overtime_minutes: 0, is_audited: false },
    { id: '4', employee_name: 'Sarah Lee', email: 'sarah.lee@example.com', department: 'HR', shift_start: '09:00', shift_end: '18:00', entry_time: '09:30', exit_time: '18:00', date: '2024-05-26', is_late: true, late_by_minutes: 30, overtime_minutes: 0, is_audited: false },
];
const MOCK_DEPARTMENTS = ['Engineering', 'Sales', 'HR', 'IT', 'Operations'];

export async function getAttendanceRecords(): Promise<AttendanceRecord[]> {
    await new Promise(res => setTimeout(res, 500));
    return MOCK_RECORDS.filter(r => !r.is_audited);
}

export async function getUnauditedRecords(): Promise<AttendanceRecord[]> {
    await new Promise(res => setTimeout(res, 500));
    return MOCK_RECORDS.filter(r => !r.is_audited);
}

export async function getRecordsByIds(recordIds: string[]): Promise<AttendanceRecord[]> {
    await new Promise(res => setTimeout(res, 100));
    return MOCK_RECORDS.filter(r => recordIds.includes(r.id));
}

export async function getAttendanceStats() {
    await new Promise(res => setTimeout(res, 500));
    const totalRecords = MOCK_RECORDS.length;
    const lateCount = MOCK_RECORDS.filter(r => r.is_late).length;
    const totalOvertimeMinutes = MOCK_RECORDS.reduce((sum, r) => sum + r.overtime_minutes, 0);
    const departmentCount = MOCK_DEPARTMENTS.length;
    
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
        return {
            name: format(date, 'EEE'),
            onTime: Math.floor(Math.random() * 20) + 5,
            late: Math.floor(Math.random() * 5),
        };
    });
    await new Promise(res => setTimeout(res, 500));
    return data;
}

export async function auditRecords(recordIds: string[], auditNotes: string): Promise<void> {
    console.log('Simulating auditing of records:', recordIds, 'with notes:', auditNotes);
    // In a real app, you would update these records in the database.
    // For now, we don't need to change the mock data here as the component will filter its view.
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
