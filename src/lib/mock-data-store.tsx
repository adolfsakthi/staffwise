'use client';

import React, { createContext, useContext, useState } from 'react';
import type { Employee, Device, AttendanceRecord, LiveLog, UserProfile, Role, EmailLog } from './types';
import { format, addMinutes, subMinutes, setHours, setMinutes, parse } from 'date-fns';


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

const firstNames = ['Aisha', 'Bruno', 'Chloe', 'David', 'Eva', 'Frank', 'Grace', 'Henry', 'Isla', 'Jack', 'Kara', 'Leo', 'Mia', 'Noah', 'Olivia', 'Paul', 'Quinn', 'Ruby', 'Sam', 'Tara', 'Uma', 'Vince', 'Willow', 'Xavi', 'Yara', 'Zane', 'Ben', 'Clara', 'Daniel', 'Emma'];
const lastNames = ['Khan', 'Fernandez', 'Kim', 'Garcia', 'Wang', 'Smith', 'Jones', 'Williams', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Green', 'Baker', 'Adams', 'Nelson'];
const departments = ['Housekeeping', 'Front Desk', 'Engineering', 'Kitchen', 'Security', 'Sales'];

const generateEmployees = (count: number): Employee[] => {
    const employees: Employee[] = [];
    for (let i = 0; i < count; i++) {
        const firstName = firstNames[i % firstNames.length];
        const lastName = lastNames[i % lastNames.length];
        employees.push({
            id: `${i + 1}`,
            clientId: 'default_client',
            branchId: 'default_branch',
            property_code: 'D001',
            firstName: firstName,
            lastName: lastName,
            email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
            department: departments[i % departments.length],
            employeeCode: `EMP${String(i + 1).padStart(3, '0')}`,
            shiftStartTime: '09:00',
            shiftEndTime: '18:00',
        });
    }
    return employees;
};

const INITIAL_EMPLOYEES: Employee[] = generateEmployees(30);

const generateAttendance = (employees: Employee[]): AttendanceRecord[] => {
    const records: AttendanceRecord[] = [];
    const today = new Date();
    const attendanceDate = format(today, 'yyyy-MM-dd');

    employees.forEach((emp, index) => {
        const base = {
            id: `rec-${emp.id}`,
            employeeId: emp.id,
            deviceId: 'device-1760525595923',
            logType: 'Biometric',
            employee_name: `${emp.firstName} ${emp.lastName}`,
            email: emp.email,
            department: emp.department,
            property_code: emp.property_code,
            attendanceDate: attendanceDate,
            is_audited: false,
        };

        const shiftStart = parse(emp.shiftStartTime, 'HH:mm', new Date());
        const shiftEnd = parse(emp.shiftEndTime, 'HH:mm', new Date());

        // Scenario 1: Absent (2 employees)
        if (index < 2) {
            records.push({
                ...base,
                is_present: false,
                is_absent: true,
                is_on_leave: false,
            });
            return;
        }

        // Scenario 2: On Leave (1 employee)
        if (index === 2) {
            records.push({
                ...base,
                is_present: false,
                is_absent: false,
                is_on_leave: true,
            });
            return;
        }

        let punchInTime: Date;
        let punchOutTime: Date;
        let is_late = false;
        let late_by_minutes = 0;
        let overtime_minutes = 0;
        
        // Scenario 3: Late (5 employees)
        if (index >= 3 && index < 8) {
            is_late = true;
            late_by_minutes = Math.floor(Math.random() * 25) + 5; // 5 to 30 mins late
            punchInTime = addMinutes(shiftStart, late_by_minutes);
        } else {
        // On time
            const onTimeOffset = Math.floor(Math.random() * 10); // 0 to 10 mins early
            punchInTime = subMinutes(shiftStart, onTimeOffset);
        }

        // Scenario 4: Overtime (4 employees)
        if (index >= 8 && index < 12) {
            overtime_minutes = Math.floor(Math.random() * 50) + 10; // 10 to 60 mins overtime
            punchOutTime = addMinutes(shiftEnd, overtime_minutes);
        } else {
        // Normal exit
            const exitTimeOffset = Math.floor(Math.random() * 15); // exit 0-15 mins before/after shift end
            punchOutTime = addMinutes(shiftEnd, exitTimeOffset - 5);
        }

        records.push({
            ...base,
            punchInTime: punchInTime.toISOString(),
            punchOutTime: punchOutTime.toISOString(),
            entry_time: format(punchInTime, 'HH:mm'),
            exit_time: format(punchOutTime, 'HH:mm'),
            is_late: is_late,
            late_by_minutes: late_by_minutes,
            overtime_minutes: overtime_minutes,
            is_present: true,
            is_absent: false,
            is_on_leave: false,
            early_going_minutes: Math.max(0, (shiftEnd.getTime() - punchOutTime.getTime()) / 60000),
        });
    });

    return records;
};

const INITIAL_RECORDS = generateAttendance(INITIAL_EMPLOYEES);


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

const INITIAL_LIVE_LOGS: LiveLog[] = [
    { id: '1', type: 'late', message: 'Bruno Fernandez arrived late', employee: 'Bruno Fernandez', department: 'Front Desk', time: '09:15', deviation: 15, property_code: 'D001', timestamp: new Date().toISOString(), isRead: false },
    { id: '2', type: 'overtime', message: 'Isla Williams worked overtime', employee: 'Isla Williams', department: 'Engineering', time: '18:45', deviation: 45, property_code: 'D001', timestamp: new Date().toISOString(), isRead: false }
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
