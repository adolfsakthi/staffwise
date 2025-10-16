'use client';

import React, { createContext, useContext, useState } from 'react';
import type { Employee, Device, AttendanceRecord, LiveLog, UserProfile, Role, EmailLog } from './types';
import { format } from 'date-fns';


const LATE_ENTRY_TEMPLATE = `
<div style="font-family: Arial, sans-serif; background-color: #f4f4f9; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(to right, #6d28d9, #a78bfa); color: #ffffff; padding: 20px; text-align: center; font-size: 24px; font-weight: bold;">
      ⏰ Late Entry Notice
    </div>
    <div style="padding: 30px 20px; color: #333;">
      <p style="margin-bottom: 20px;">Dear Test User,</p>
      <p style="margin-bottom: 20px;">
        This is to inform you that you were late by <strong style="color: #ef4444;">30 minutes</strong> on <strong style="color: #333;">2025-10-11</strong>.
      </p>
      <p style="margin-bottom: 30px;">
        Please ensure timely attendance going forward.
      </p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
      <p style="font-size: 12px; color: #9ca3af; text-align: center;">
        This is an automated message from the Attendance Management System.
      </p>
    </div>
  </div>
</div>
`;

const ADMIN_REPORT_TEMPLATE = `
<div style="font-family: Arial, sans-serif; background-color: #f4f4f9; padding: 20px;">
  <div style="max-width: 700px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(to right, #6d28d9, #a78bfa); color: #ffffff; padding: 20px; text-align: center;">
      <h1 style="font-size: 24px; font-weight: bold; margin: 0;">Daily Audit Report</h1>
      <p style="margin: 4px 0 0; opacity: 0.9;">October 14th, 2025</p>
    </div>
    <div style="padding: 30px 20px; color: #333;">
      
      <!-- Engineering Department -->
      <h2 style="font-size: 18px; font-weight: bold; margin-top: 0; margin-bottom: 15px; border-bottom: 2px solid #eee; padding-bottom: 10px;">Engineering Department</h2>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
        <thead>
          <tr>
            <th style="padding: 8px; text-align: left; background-color: #f8f9fa; border-bottom: 1px solid #dee2e6;">Summary</th>
            <th style="padding: 8px; text-align: left; background-color: #f8f9fa; border-bottom: 1px solid #dee2e6;">Count/Duration</th>
          </tr>
        </thead>
        <tbody>
          <tr><td style="padding: 8px; border-bottom: 1px solid #e9ecef;">Present</td><td style="padding: 8px; border-bottom: 1px solid #e9ecef;">8</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #e9ecef;">Absent</td><td style="padding: 8px; border-bottom: 1px solid #e9ecef;">1</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #e9ecef;">Late</td><td style="padding: 8px; border-bottom: 1px solid #e9ecef;">4</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #e9ecef;">Overtime</td><td style="padding: 8px; border-bottom: 1px solid #e9ecef;">45 mins</td></tr>
        </tbody>
      </table>

      <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">Late Comers</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 14px;">
         <thead>
          <tr>
            <th style="padding: 8px; text-align: left; background-color: #f8f9fa; border-bottom: 1px solid #dee2e6;">Employee</th>
            <th style="padding: 8px; text-align: left; background-color: #f8f9fa; border-bottom: 1px solid #dee2e6;">Entry Time</th>
            <th style="padding: 8px; text-align: left; background-color: #f8f9fa; border-bottom: 1px solid #dee2e6;">Late By</th>
          </tr>
        </thead>
        <tbody>
           <tr><td style="padding: 8px; border-bottom: 1px solid #e9ecef;">John Doe</td><td style="padding: 8px; border-bottom: 1px solid #e9ecef;">09:15</td><td style="padding: 8px; border-bottom: 1px solid #e9ecef;">15 mins</td></tr>
           <tr><td style="padding: 8px; border-bottom: 1px solid #e9ecef;">Peter Jones</td><td style="padding: 8px; border-bottom: 1px solid #e9ecef;">09:05</td><td style="padding: 8px; border-bottom: 1px solid #e9ecef;">5 mins</td></tr>
           <tr><td style="padding: 8px; border-bottom: 1px solid #e9ecef;">Sam Wilson</td><td style="padding: 8px; border-bottom: 1px solid #e9ecef;">09:25</td><td style="padding: 8px; border-bottom: 1px solid #e9ecef;">25 mins</td></tr>
           <tr><td style="padding: 8px; border-bottom: 1px solid #e9ecef;">Chris Rogers</td><td style="padding: 8px; border-bottom: 1px solid #e9ecef;">09:12</td><td style="padding: 8px; border-bottom: 1px solid #e9ecef;">12 mins</td></tr>
        </tbody>
      </table>

      <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">Overtime</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 14px;">
         <thead>
          <tr>
            <th style="padding: 8px; text-align: left; background-color: #f8f9fa; border-bottom: 1px solid #dee2e6;">Employee</th>
            <th style="padding: 8px; text-align: left; background-color: #f8f9fa; border-bottom: 1px solid #dee2e6;">Exit Time</th>
            <th style="padding: 8px; text-align: left; background-color: #f8f9fa; border-bottom: 1px solid #dee2e6;">OT</th>
          </tr>
        </thead>
        <tbody>
           <tr><td style="padding: 8px; border-bottom: 1px solid #e9ecef;">Emily White</td><td style="padding: 8px; border-bottom: 1px solid #e9ecef;">18:45</td><td style="padding: 8px; border-bottom: 1px solid #e9ecef;">45 mins</td></tr>
        </tbody>
      </table>
      
      <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">Absentees</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 14px;">
         <thead>
          <tr><th style="padding: 8px; text-align: left; background-color: #f8f9fa; border-bottom: 1px solid #dee2e6;">Employee</th></tr>
        </thead>
        <tbody>
           <tr><td style="padding: 8px; border-bottom: 1px solid #e9ecef;">Mike Ross</td></tr>
        </tbody>
      </table>


      <!-- Housekeeping Department -->
      <h2 style="font-size: 18px; font-weight: bold; margin-bottom: 15px; border-bottom: 2px solid #eee; padding-bottom: 10px;">Housekeeping Department</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="padding: 8px; text-align: left; background-color: #f8f9fa; border-bottom: 1px solid #dee2e6;">Summary</th>
            <th style="padding: 8px; text-align: left; background-color: #f8f9fa; border-bottom: 1px solid #dee2e6;">Count/Duration</th>
          </tr>
        </thead>
        <tbody>
          <tr><td style="padding: 8px; border-bottom: 1px solid #e9ecef;">Present</td><td style="padding: 8px; border-bottom: 1px solid #e9ecef;">12</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #e9ecef;">Absent</td><td style="padding: 8px; border-bottom: 1px solid #e9ecef;">0</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #e9ecef;">Late</td><td style="padding: 8px; border-bottom: 1px solid #e9ecef;">3</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #e9ecef;">Overtime</td><td style="padding: 8px; border-bottom: 1px solid #e9ecef;">0 mins</td></tr>
        </tbody>
      </table>
       <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px; margin-top: 25px;">Late Comers</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 14px;">
         <thead>
          <tr>
            <th style="padding: 8px; text-align: left; background-color: #f8f9fa; border-bottom: 1px solid #dee2e6;">Employee</th>
            <th style="padding: 8px; text-align: left; background-color: #f8f9fa; border-bottom: 1px solid #dee2e6;">Entry Time</th>
            <th style="padding: 8px; text-align: left; background-color: #f8f9fa; border-bottom: 1px solid #dee2e6;">Late By</th>
          </tr>
        </thead>
        <tbody>
           <tr><td style="padding: 8px; border-bottom: 1px solid #e9ecef;">Jane Smith</td><td style="padding: 8px; border-bottom: 1px solid #e9ecef;">09:02</td><td style="padding: 8px; border-bottom: 1px solid #e9ecef;">2 mins</td></tr>
           <tr><td style="padding: 8px; border-bottom: 1px solid #e9ecef;">Maria Hill</td><td style="padding: 8px; border-bottom: 1px solid #e9ecef;">09:08</td><td style="padding: 8px; border-bottom: 1px solid #e9ecef;">8 mins</td></tr>
           <tr><td style="padding: 8px; border-bottom: 1px solid #e9ecef;">Donna Troy</td><td style="padding: 8px; border-bottom: 1px solid #e9ecef;">09:03</td><td style="padding: 8px; border-bottom: 1px solid #e9ecef;">3 mins</td></tr>
        </tbody>
      </table>
      
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
      <p style="font-size: 12px; color: #9ca3af; text-align: center;">
        This is an automated message from the HEZEE ACCESS System.
      </p>
    </div>
  </div>
</div>
`;


// --- INITIAL MOCK DATA ---

const INITIAL_EMPLOYEES: Employee[] = [
    { id: '1', clientId: 'default_client', branchId: 'default_branch', property_code: 'D001', firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', department: 'Engineering', employeeCode: 'EMP001', shiftStartTime: '09:00', shiftEndTime: '18:00' },
    { id: '2', clientId: 'default_client', branchId: 'default_branch', property_code: 'D001', firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com', department: 'Housekeeping', employeeCode: 'EMP002', shiftStartTime: '09:00', shiftEndTime: '18:00' },
    { id: '3', clientId: 'default_client', branchId: 'default_branch', property_code: 'D002', firstName: 'Peter', lastName: 'Jones', email: 'peter.jones@example.com', department: 'Security', employeeCode: 'EMP003', shiftStartTime: '22:00', shiftEndTime: '06:00' },
    { id: '4', property_code: 'D001', department: 'Engineering', firstName: 'Test', lastName: 'Person', email: 'test@test.com', employeeCode: 'EMP004', shiftStartTime: '09:00', shiftEndTime: '17:00' },
];

const INITIAL_DEVICES: Device[] = [
    {
        "deviceName": "ESSL Droplet",
        "serialNumber": "CKUH211960123",
        "ipAddress": "68.183.89.205",
        "port": 8080,
        "connectionKey": "0",
        "property_code": "D001",
        "id": "device-1760525595923",
        "status": "online",
        "clientId": "default_client",
        "branchId": "default_branch"
    },
    {
        "deviceName": "Hezee Office",
        "serialNumber": "ADZV204362807",
        "ipAddress": "192.168.1.3",
        "port": 81,
        "connectionKey": "0",
        "property_code": "D001",
        "id": "device-1760528646024",
        "status": "offline",
        "clientId": "default_client",
        "branchId": "default_branch"
    }
];

const INITIAL_RECORDS: AttendanceRecord[] = [
    { id: '1', employeeId: '1', deviceId: '1', punchInTime: '2024-05-23T09:05:00Z', attendanceDate: '2024-05-23', logType: 'Biometric', employee_name: 'John Doe', email: 'john@example.com', department: 'Engineering', property_code: 'D001', entry_time: '09:05', exit_time: '18:02', is_late: true, late_by_minutes: 5, overtime_minutes: 2, is_audited: false, is_present: true },
    { id: 'rec2', employeeId: '2', attendanceDate: format(new Date(), 'yyyy-MM-dd'), is_late: false, is_present: true, is_absent: false, is_on_leave: false, early_going_minutes: 0, overtime_minutes: 30, department: 'Front Desk', property_code: 'D001', punchInTime: '2024-05-23T08:58:00Z', deviceId: '1', logType: 'Biometric' },
    { id: '3', employeeId: '3', deviceId: '1', punchInTime: '2024-05-22T09:15:00Z', attendanceDate: '2024-05-22', logType: 'Manual', employee_name: 'Peter Jones', email: 'peter@example.com', department: 'Engineering', property_code: 'D001', entry_time: '09:15', exit_time: '18:00', is_late: true, late_by_minutes: 15, overtime_minutes: 0, is_audited: false },
    { id: 'rec4', employeeId: '4', attendanceDate: format(new Date(), 'yyyy-MM-dd'), is_late: false, is_present: false, is_absent: true, is_on_leave: false, early_going_minutes: 0, overtime_minutes: 0, department: 'Engineering', property_code: 'D001', punchInTime: '2024-05-23T09:00:00Z', deviceId: '1', logType: 'Biometric' },
    { id: 'rec5', employeeId: '4', attendanceDate: format(new Date(), 'yyyy-MM-dd'), is_late: false, is_present: false, is_absent: false, is_on_leave: true, early_going_minutes: 0, overtime_minutes: 0, department: 'Engineering', property_code: 'D001', punchInTime: '2024-05-23T09:00:00Z', deviceId: '1', logType: 'Biometric'  },
];

const INITIAL_LIVE_LOGS: LiveLog[] = [
    { id: '1', type: 'late', message: 'John Doe arrived late', employee: 'John Doe', department: 'Engineering', time: '09:05', deviation: 5, property_code: 'D001', timestamp: new Date().toISOString(), isRead: false },
    { id: '2', type: 'overtime', message: 'Jane Smith worked overtime', employee: 'Jane Smith', department: 'Housekeeping', time: '18:30', deviation: 30, property_code: 'D001', timestamp: new Date().toISOString(), isRead: false }
];

const INITIAL_USERS: UserProfile[] = [
    { id: '1', uid: 'user1', displayName: 'Admin User', email: 'admin@staffwise.com', role: 'Admin', property_code: 'D001', clientId: 'default_client' },
    { id: '2', uid: 'user2', displayName: 'Manager User', email: 'manager@staffwise.com', role: 'Manager', property_code: 'D001', clientId: 'default_client' },
    { id: '3', uid: 'user3', displayName: 'Hotel B Manager', email: 'manager@hotelb.com', role: 'Manager', property_code: 'D002', clientId: 'default_client' },
];

const INITIAL_ROLES: Role[] = [
    { id: '1', name: 'Admin', permissions: ['read', 'write', 'delete', 'manage_users'], property_code: 'D001', clientId: 'default_client' },
    { id: '2', name: 'Manager', permissions: ['read', 'write'], property_code: 'D001', clientId: 'default_client' },
    { id: '3', name: 'Auditor', permissions: ['read', 'run_audit'], property_code: 'D001', clientId: 'default_client' },
    { id: '4', name: 'Manager', permissions: ['read', 'write'], property_code: 'D002', clientId: 'default_client' },
];

const INITIAL_EMAIL_LOGS: EmailLog[] = [
    { id: '1', recipient: 'manager@staffwise.com', subject: 'Late Arrival Notice', body: LATE_ENTRY_TEMPLATE, timestamp: new Date(), emailType: 'late_notice' },
    { id: '2', recipient: 'admin@staffwise.com', subject: 'Daily Audit Report', body: ADMIN_REPORT_TEMPLATE, timestamp: new Date(), emailType: 'admin_report' },
];


// --- CONTEXT ---

interface MockDataStore {
    employees: Employee[];
    setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
    devices: Device[];
    setDevices: React.Dispatch<React.SetStateAction<Device[]>>;
    attendanceRecords: AttendanceRecord[];
    setAttendanceRecords: React.Dispatch<React.SetStateAction<AttendanceRecord[]>>;
    liveLogs: LiveLog[];
    setLiveLogs: React.Dispatch<React.SetStateAction<LiveLog[]>>;
    users: UserProfile[];
    setUsers: React.Dispatch<React.SetStateAction<UserProfile[]>>;
    roles: Role[];
    setRoles: React.Dispatch<React.SetStateAction<Role[]>>;
    emailLogs: EmailLog[];
    setEmailLogs: React.Dispatch<React.SetStateAction<EmailLog[]>>;
}

const MockDataContext = createContext<MockDataStore | null>(null);

export function MockDataStoreProvider({ children }: { children: React.ReactNode }) {
    const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
    const [devices, setDevices] = useState<Device[]>(INITIAL_DEVICES);
    const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(INITIAL_RECORDS);
    const [liveLogs, setLiveLogs] = useState<LiveLog[]>(INITIAL_LIVE_LOGS);
    const [users, setUsers] = useState<UserProfile[]>(INITIAL_USERS);
    const [roles, setRoles] = useState<Role[]>(INITIAL_ROLES);
    const [emailLogs, setEmailLogs] = useState<EmailLog[]>(INITIAL_EMAIL_LOGS);

    const value = {
        employees, setEmployees,
        devices, setDevices,
        attendanceRecords, setAttendanceRecords,
        liveLogs, setLiveLogs,
        users, setUsers,
        roles, setRoles,
        emailLogs, setEmailLogs,
    };

    return (
        <MockDataContext.Provider value={value}>
            {children}
        </MockDataContext.Provider>
    );
}

export function useMockData() {
    const context = useContext(MockDataContext);
    if (!context) {
        throw new Error('useMockData must be used within a MockDataStoreProvider');
    }
    return context;
}
