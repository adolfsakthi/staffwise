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
