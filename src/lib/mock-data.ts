
import type { AttendanceRecord, Device, LiveLog, User, Role } from './types';
import { format } from 'date-fns';

const todayStr = format(new Date(), 'yyyy-MM-dd');

export const MOCK_ATTENDANCE_RECORDS: AttendanceRecord[] = [
  {
    id: 'rec1',
    property_code: 'PROP-001',
    employee_name: 'John Doe',
    email: 'john.doe@example.com',
    department: 'Housekeeping',
    shift_start: '09:00',
    shift_end: '18:00',
    entry_time: '09:15',
    exit_time: '18:05',
    date: todayStr,
    is_late: true,
    late_by_minutes: 15,
    overtime_minutes: 5,
    is_audited: false,
  },
  {
    id: 'rec2',
    property_code: 'PROP-001',
    employee_name: 'Jane Smith',
    email: 'jane.smith@example.com',
    department: 'Front Desk',
    shift_start: '08:00',
    shift_end: '17:00',
    entry_time: '07:58',
    exit_time: '17:30',
    date: todayStr,
    is_late: false,
    late_by_minutes: 0,
    overtime_minutes: 30,
    is_audited: false,
  },
  {
    id: 'rec3',
    property_code: 'PROP-001',
    employee_name: 'Peter Jones',
    email: 'peter.jones@example.com',
    department: 'Engineering',
    shift_start: '10:00',
    shift_end: '19:00',
    entry_time: '10:05',
    exit_time: '19:00',
    date: todayStr,
    is_late: true,
    late_by_minutes: 5,
    overtime_minutes: 0,
    is_audited: true,
    audit_notes: 'Approved by supervisor.',
  },
];

export const MOCK_DEVICES: Device[] = [
    { id: 'dev1', property_code: 'PROP-001', name: 'Main Entrance Biometric', model: 'ZK-Teco-X10', ip: '192.168.1.100', status: 'online', branch: 'Main Lobby' },
    { id: 'dev2', property_code: 'PROP-001', name: 'Staff Exit Biometric', model: 'ZK-Teco-X10', ip: '192.168.1.101', status: 'offline', branch: 'Staff Area' },
    { id: 'dev3', property_code: 'PROP-002', name: 'Resort Entrance', model: 'BioMax-Pro', ip: '192.168.2.50', status: 'online', branch: 'Beach Resort' }
];

export const MOCK_LIVE_LOGS: LiveLog[] = [
    { id: 'log1', property_code: 'PROP-001', type: 'late', employee: 'John Doe', department: 'Housekeeping', time: '09:15', deviation: 15 },
    { id: 'log2', property_code: 'PROP-001', type: 'overtime', employee: 'Jane Smith', department: 'Front Desk', time: '17:30', deviation: 30 },
    { id: 'log3', property_code: 'PROP-001', type: 'on_time', employee: 'Alice Brown', department: 'Kitchen', time: '13:59', deviation: 0 },
];

export const MOCK_USERS: User[] = [
    { id: 'usr1', uid: 'user_1', property_code: 'PROP-001', displayName: 'Admin User', email: 'admin@staffwise.com', role: 'Admin' },
    { id: 'usr2', uid: 'user_2', property_code: 'PROP-001', displayName: 'Manager User', email: 'manager@staffwise.com', role: 'Manager' },
    { id: 'usr3', uid: 'user_3', property_code: 'PROP-001', displayName: 'Staff User', email: 'staff@staffwise.com', role: 'Staff' }
];

export const MOCK_ROLES: Role[] = [
    { id: 'role1', property_code: 'PROP-001', name: 'Admin', permissions: ['read', 'write', 'delete', 'manage_users'] },
    { id: 'role2', property_code: 'PROP-001', name: 'Manager', permissions: ['read', 'write'] },
    { id: 'role3', property_code: 'PROP-001', name: 'Staff', permissions: ['read'] }
];

export const MOCK_DEPARTMENTS: string[] = ['Housekeeping', 'Front Desk', 'Engineering', 'Kitchen', 'Security'];
