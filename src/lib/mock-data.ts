
import type { AttendanceRecord, Device, LiveLog, UserProfile, Role, EmailLog } from './types';
import { format } from 'date-fns';

const todayStr = format(new Date(), 'yyyy-MM-dd');

export const MOCK_ATTENDANCE_RECORDS: AttendanceRecord[] = [
  {
    id: 'rec1',
    clientId: 'default_client',
    branchId: 'default_branch',
    property_code: 'D001',
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
    clientId: 'default_client',
    branchId: 'default_branch',
    property_code: 'D001',
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
    clientId: 'default_client',
    branchId: 'default_branch',
    property_code: 'D001',
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
    is_audited: true,
    audit_notes: 'Approved by supervisor.',
  },
   {
    id: 'rec4',
    clientId: 'default_client',
    branchId: 'default_branch',
    property_code: 'PROP-002',
    employee_name: 'Susan May',
    email: 'susan.may@example.com',
    department: 'Sales',
    shift_start: '09:00',
    shift_end: '17:30',
    entry_time: '09:00',
    exit_time: '17:30',
    date: todayStr,
    is_late: false,
    late_by_minutes: 0,
    overtime_minutes: 0,
    is_audited: true,
     audit_notes: 'Standard day.',
  },
];

export const MOCK_DEVICES: Device[] = [
    { id: 'dev1', property_code: 'D001', deviceName: 'Main Entrance Biometric', model: 'ZK-Teco-X10', ipAddress: '192.168.1.100', status: 'online', branchName: 'Main Lobby', port: 5000, connectionKey: 'key', clientId: 'default_client', branchId: 'default_branch' },
    { id: 'dev2', property_code: 'D001', deviceName: 'Staff Exit Biometric', model: 'ZK-Teco-X10', ipAddress: '192.168.1.101', status: 'offline', branchName: 'Staff Area', port: 5000, connectionKey: 'key', clientId: 'default_client', branchId: 'default_branch' },
    { id: 'dev3', property_code: 'PROP-002', deviceName: 'Resort Entrance', model: 'BioMax-Pro', ipAddress: '192.168.2.50', status: 'online', branchName: 'Beach Resort', port: 5000, connectionKey: 'key', clientId: 'default_client', branchId: 'default_branch' }
];

export const MOCK_LIVE_LOGS: LiveLog[] = [
    { id: 'log1', property_code: 'D001', type: 'late', employee: 'John Doe', department: 'Housekeeping', time: '09:15', deviation: 15, timestamp: new Date(), clientId: 'default_client', branchId: 'default_branch' },
    { id: 'log2', property_code: 'D001', type: 'overtime', employee: 'Jane Smith', department: 'Front Desk', time: '17:30', deviation: 30, timestamp: new Date(), clientId: 'default_client', branchId: 'default_branch' },
    { id: 'log3', property_code: 'D001', type: 'on_time', employee: 'Alice Brown', department: 'Kitchen', time: '13:59', deviation: 0, timestamp: new Date(), clientId: 'default_client', branchId: 'default_branch' },
    { id: 'log4', property_code: 'PROP-002', type: 'on_time', employee: 'Susan May', department: 'Sales', time: '09:00', deviation: 0, timestamp: new Date(), clientId: 'default_client', branchId: 'default_branch' },
];

export const MOCK_USERS: UserProfile[] = [
    { id: 'usr1', uid: 'user_1', property_code: 'D001', displayName: 'Admin User', email: 'admin@staffwise.com', role: 'Admin', clientId: 'default_client' },
    { id: 'usr2', uid: 'user_2', property_code: 'D001', displayName: 'Manager User', email: 'manager@staffwise.com', role: 'Manager', clientId: 'default_client' },
    { id: 'usr3', uid: 'user_3', property_code: 'D001', displayName: 'Staff User', email: 'staff@staffwise.com', role: 'Staff', clientId: 'default_client' },
    { id: 'usr4', uid: 'user_4', property_code: 'PROP-002', displayName: 'Resort Admin', email: 'admin@resort.com', role: 'Admin', clientId: 'default_client' }
];

export const MOCK_ROLES: Role[] = [
    { id: 'role1', property_code: 'D001', name: 'Admin', permissions: ['read', 'write', 'delete', 'manage_users'], clientId: 'default_client' },
    { id: 'role2', property_code: 'D001', name: 'Manager', permissions: ['read', 'write'], clientId: 'default_client' },
    { id: 'role3', property_code: 'D001', name: 'Staff', permissions: ['read'], clientId: 'default_client' },
    { id: 'role4', property_code: 'PROP-002', name: 'Admin', permissions: ['read', 'write', 'delete', 'manage_users'], clientId: 'default_client' },
];

export const MOCK_DEPARTMENTS: string[] = ['Housekeeping', 'Front Desk', 'Engineering', 'Kitchen', 'Security', 'Sales'];

export const MOCK_EMAIL_LOGS: EmailLog[] = [
    { id: 'email1', to: 'admin@staffwise.com', subject: 'Audit Summary Report', body: 'Audit for D001 completed.', emailType: 'admin_report', sentAt: new Date() }
]
