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
};

const MOCK_DEPARTMENTS = ['Engineering', 'Sales', 'HR', 'Marketing', 'IT', 'Operations'];
const MOCK_EMPLOYEES = [
    { name: 'John Doe', email: 'john.doe@example.com', department: 'Engineering' },
    { name: 'Jane Smith', email: 'jane.smith@example.com', department: 'Sales' },
    { name: 'Robert Brown', email: 'robert.brown@example.com', department: 'HR' },
    { name: 'Sarah Wilson', email: 'sarah.wilson@example.com', department: 'Engineering' },
    { name: 'Michael Davis', email: 'michael.davis@example.com', department: 'Sales' },
    { name: 'Emily White', email: 'emily.white@example.com', department: 'Marketing' },
    { name: 'David Green', email: 'david.green@example.com', department: 'IT' },
    { name: 'Lisa Ray', email: 'lisa.ray@example.com', department: 'Operations' },
    { name: 'Chris Martin', email: 'chris.martin@example.com', department: 'Engineering' },
    { name: 'Anna Taylor', email: 'anna.taylor@example.com', department: 'Marketing' },
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

const MOCK_RECORDS = generateMockData(50);

export async function getAttendanceRecords(filters?: { date?: string; department?: string }): Promise<AttendanceRecord[]> {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    let filteredRecords = MOCK_RECORDS;
    if (filters?.date) {
        filteredRecords = filteredRecords.filter(r => r.date === filters.date);
    }
    if (filters?.department) {
        filteredRecords = filteredRecords.filter(r => r.department === filters.department);
    }
    return filteredRecords;
}

export async function getAttendanceStats() {
    await new Promise(resolve => setTimeout(resolve, 300));
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
    await new Promise(resolve => setTimeout(resolve, 100));
    return MOCK_DEPARTMENTS;
}

export async function getWeeklyAttendance() {
    await new Promise(resolve => setTimeout(resolve, 400));
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
