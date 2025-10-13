import { add, format, parse, startOfWeek, subDays } from 'date-fns';

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

const MOCK_DEPARTMENTS = ['Engineering', 'Sales', 'HR', 'Marketing', 'IT', 'Operations'];
const MOCK_EMPLOYEES = [
    { name: 'John Doe', username: 'johndoe', email: 'john.doe@example.com', department: 'Engineering' },
    { name: 'Jane Smith', username: 'janesmith', email: 'jane.smith@example.com', department: 'Sales' },
    { name: 'Robert Brown', username: 'robertbrown', email: 'robert.brown@example.com', department: 'HR' },
    { name: 'Sarah Wilson', username: 'sarahwilson', email: 'sarah.wilson@example.com', department: 'Engineering' },
    { name: 'Michael Davis', username: 'michaeldavis', email: 'michael.davis@example.com', department: 'Sales' },
    { name: 'Emily White', username: 'emilywhite', email: 'emily.white@example.com', department: 'Marketing' },
    { name: 'David Green', username: 'davidgreen', email: 'david.green@example.com', department: 'IT' },
    { name: 'Lisa Ray', username: 'lisaray', email: 'lisa.ray@example.com', department: 'Operations' },
    { name: 'Chris Martin', username: 'chrismartin', email: 'chris.martin@example.com', department: 'Engineering' },
    { name: 'Anna Taylor', username: 'annataylor', email: 'anna.taylor@example.com', department: 'Marketing' },
];

const generateMockData = (numRecords: number): AttendanceRecord[] => {
    const records: AttendanceRecord[] = [];
    const today = new Date();

    for (let i = 0; i < numRecords; i++) {
        const employee = MOCK_EMPLOYEES[i % MOCK_EMPLOYEES.length];
        const recordDate = subDays(today, Math.floor(i / 5));
        
        const shiftStart = parse('09:00', 'HH:mm', new Date());
        const shiftEnd = parse('18:00', 'HH:mm', new Date());

        const isLate = Math.random() > 0.6;
        const lateMinutes = isLate ? Math.floor(Math.random() * 45) + 1 : 0;
        const entryTime = add(shiftStart, { minutes: lateMinutes });

        const hasOvertime = Math.random() > 0.5;
        const overtimeMinutes = hasOvertime ? Math.floor(Math.random() * 90) + 5 : 0;
        const exitTime = add(shiftEnd, { minutes: overtimeMinutes });

        records.push({
            id: `rec_${i + 1}`,
            employee_name: employee.name,
            email: employee.email,
            department: employee.department,
            shift_start: '09:00',
            shift_end: '18:00',
            entry_time: format(entryTime, 'HH:mm'),
            exit_time: format(exitTime, 'HH:mm'),
            date: format(recordDate, 'yyyy-MM-dd'),
            is_late: isLate,
            late_by_minutes: lateMinutes,
            overtime_minutes: overtimeMinutes,
            is_audited: Math.random() > 0.3,
        });
    }
    return records;
};

let MOCK_RECORDS = generateMockData(50);
export const ALL_PERMISSIONS = ['read', 'write', 'hidden'];

const MOCK_ROLES = [
    { id: 'role_1', name: 'Administrator', permissions: ['read', 'write'] },
    { id: 'role_2', name: 'HR Manager', permissions: ['read', 'write'] },
    { id: 'role_3', name: 'Employee', permissions: ['read'] },
    { id: 'role_4', name: 'Guest', permissions: ['hidden'] },
];

const MOCK_USERS = [
    { id: 'user_1', name: 'Admin User', username: 'admin', email: 'admin@staffwise.com', avatar: 'https://i.pravatar.cc/150?u=admin@staffwise.com', role: 'Administrator', password: 'password123' },
    { id: 'user_2', name: 'HR Head', username: 'hrhead', email: 'hr@staffwise.com', avatar: 'https://i.pravatar.cc/150?u=hr@staffwise.com', role: 'HR Manager', password: 'password123' },
    { id: 'user_3', name: 'Regular Staff', username: 'staff', email: 'employee@staffwise.com', avatar: 'https://i.pravatar.cc/150?u=employee@staffwise.com', role: 'Employee', password: 'password123' },
     ...MOCK_EMPLOYEES.map((emp, i) => ({
        id: `user_${i + 4}`,
        name: emp.name,
        username: emp.username,
        email: emp.email,
        avatar: `https://i.pravatar.cc/150?u=${emp.email}`,
        role: 'Employee',
        password: 'password123'
    }))
];

export async function getAttendanceRecords(filters?: { date?: string; department?: string, audited?: boolean }): Promise<AttendanceRecord[]> {
    let filteredRecords = MOCK_RECORDS;
    if (filters?.date) {
        filteredRecords = filteredRecords.filter(r => r.date === filters.date);
    }
    if (filters?.department) {
        filteredRecords = filteredRecords.filter(r => r.department === filters.department);
    }
    if (filters?.audited !== undefined) {
        filteredRecords = filteredRecords.filter(r => r.is_audited === filters.audited);
    }
    return filteredRecords;
}

export async function getAttendanceStats() {
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

export async function getDepartments() {
    return MOCK_DEPARTMENTS;
}

export async function getWeeklyAttendance() {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weeklyData = Array.from({ length: 7 }).map((_, i) => {
        const date = add(weekStart, { days: i });
        const dateStr = format(date, 'yyyy-MM-dd');
        const recordsForDay = MOCK_RECORDS.filter(r => r.date === dateStr);
        const onTime = recordsForDay.filter(r => !r.is_late).length;
        const late = recordsForDay.filter(r => r.is_late).length;
        return {
            name: format(date, 'EEE'),
            onTime,
            late,
        };
    });
    return weeklyData;
}

export async function auditRecords(recordIds: string[], auditNotes: string): Promise<void> {
    MOCK_RECORDS = MOCK_RECORDS.map(record => {
        if (recordIds.includes(record.id)) {
            return { ...record, is_audited: true, audit_notes: auditNotes };
        }
        return record;
    });
    return;
}

export async function getUsers() {
    return MOCK_USERS;
}

export async function getRoles() {
    return MOCK_ROLES;
}
