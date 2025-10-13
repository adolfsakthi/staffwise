import { format, subDays } from 'date-fns';

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

const today = new Date();

export const initialAttendanceRecords: Omit<AttendanceRecord, 'id'>[] = [
    {
      employee_name: 'John Doe',
      email: 'john@company.com',
      department: 'Engineering',
      shift_start: '09:00',
      shift_end: '18:00',
      entry_time: '09:15',
      exit_time: '18:30',
      date: format(today, 'yyyy-MM-dd'),
      is_late: true,
      late_by_minutes: 15,
      overtime_minutes: 30,
      is_audited: false,
    },
    {
      employee_name: 'Jane Smith',
      email: 'jane@company.com',
      department: 'Sales',
      shift_start: '09:00',
      shift_end: '18:00',
      entry_time: '08:55',
      exit_time: '18:00',
      date: format(today, 'yyyy-MM-dd'),
      is_late: false,
      late_by_minutes: 0,
      overtime_minutes: 0,
      is_audited: true,
    },
    {
      employee_name: 'Robert Brown',
      email: 'robert@company.com',
      department: 'HR',
      shift_start: '09:00',
      shift_end: '18:00',
      entry_time: '09:45',
      exit_time: '18:15',
      date: format(subDays(today, 1), 'yyyy-MM-dd'),
      is_late: true,
      late_by_minutes: 45,
      overtime_minutes: 15,
      is_audited: false,
    },
    {
      employee_name: 'Sarah Wilson',
      email: 'sarah@company.com',
      department: 'Engineering',
      shift_start: '09:00',
      shift_end: '18:00',
      entry_time: '09:05',
      exit_time: '19:00',
      date: format(subDays(today, 1), 'yyyy-MM-dd'),
      is_late: true,
      late_by_minutes: 5,
      overtime_minutes: 60,
      is_audited: false,
    },
     {
      employee_name: 'Michael Davis',
      email: 'michael@company.com',
      department: 'Sales',
      shift_start: '09:00',
      shift_end: '18:00',
      entry_time: '09:30',
      exit_time: '18:00',
      date: format(subDays(today, 2), 'yyyy-MM-dd'),
      is_late: true,
      late_by_minutes: 30,
      overtime_minutes: 0,
      is_audited: true,
    },
    {
      employee_name: 'Daniel Hall',
      email: 'daniel.hall@company.com',
      department: 'Support',
      shift_start: '09:00',
      shift_end: '18:00',
      entry_time: '08:45',
      exit_time: '20:30',
      date: format(subDays(today, 2), 'yyyy-MM-dd'),
      is_late: false,
      late_by_minutes: 0,
      overtime_minutes: 150,
      is_audited: false,
    },
     {
      employee_name: 'Ava Lewis',
      email: 'adolfsakthi@gmail.com',
      department: 'Support',
      shift_start: '09:00',
      shift_end: '18:00',
      entry_time: '10:45',
      exit_time: '17:30',
      date: format(subDays(today, 3), 'yyyy-MM-dd'),
      is_late: true,
      late_by_minutes: 105,
      overtime_minutes: 0,
      is_audited: false,
    }
];

export const initialDevices = [
    { name: 'Main Entrance', model: 'ZK-Teco-X1', ip: '192.168.1.101', status: 'online', branch: 'Headquarters' },
    { name: 'Warehouse-1', model: 'BioMax-9000', ip: '192.168.1.102', status: 'offline', branch: 'West Wing' },
    { name: 'Server Room', model: 'ZK-Teco-X1', ip: '192.168.1.103', status: 'online', branch: 'Headquarters' },
    { name: 'Marketing Floor', model: 'Generic-A2', ip: '192.168.2.50', status: 'online', branch: 'East Annex' },
];

export const initialLiveLogs = [
    { type: 'late', employee: 'John Doe', department: 'Engineering', time: '09:18', deviation: 18 },
    { type: 'overtime', employee: 'Sarah Wilson', department: 'Engineering', time: '18:45', deviation: 45 },
    { type: 'early', employee: 'Jane Smith', department: 'Sales', time: '08:50', deviation: 10 },
    { type: 'late', employee: 'Robert Brown', department: 'HR', time: '09:05', deviation: 5 },
    { type: 'overtime', employee: 'David Green', department: 'IT', time: '19:02', deviation: 62 },
    { type: 'on_time', employee: 'Lisa Ray', department: 'Operations', time: '08:59', deviation: 0 },
    { type: 'late', employee: 'Michael Davis', department: 'Sales', time: '09:25', deviation: 25 },
];

export const initialUsers = [
    { uid: 'user1', displayName: 'Alice Johnson', email: 'alice@example.com', role: 'Admin' },
    { uid: 'user2', displayName: 'Bob Williams', email: 'bob@example.com', role: 'Manager' },
    { uid: 'user3', displayName: 'Charlie Brown', email: 'charlie@example.com', role: 'Staff' },
];

export const initialRoles = [
    { name: 'Admin', permissions: ['read', 'write', 'delete', 'manage_users'] },
    { name: 'Manager', permissions: ['read', 'write'] },
    { name: 'Staff', permissions: ['read'] },
];
