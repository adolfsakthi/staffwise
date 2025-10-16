
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Employee, Device, AttendanceRecord, LiveLog, UserProfile, Role, EmailLog } from './types';
import { format } from 'date-fns';

import initialEmployees from './employees.json';
import initialDevices from './devices.json';
import initialAttendance from './attendance.json';
import initialLiveLogs from './live-logs.json';
import initialUsers from './users.json';
import initialRoles from './roles.json';
import initialEmailLogs from './email-logs.json';

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
    const [employees, setEmployees] = useState<Employee[]>(initialEmployees as Employee[]);
    const [devices, setDevices] = useState<Device[]>(initialDevices as Device[]);
    const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
    const [liveLogs, setLiveLogs] = useState<LiveLog[]>([]);
    const [users, setUsers] = useState<UserProfile[]>(initialUsers as UserProfile[]);
    const [roles, setRoles] = useState<Role[]>(initialRoles as Role[]);
    const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);

    useEffect(() => {
        const now = new Date();
        const today = format(now, 'yyyy-MM-dd');
        const todayLong = format(now, 'MMMM do, yyyy');

        const updatedAttendance = (initialAttendance as AttendanceRecord[]).map(rec => ({
            ...rec,
            attendanceDate: today,
        }));
        setAttendanceRecords(updatedAttendance);

        const updatedLiveLogs = (initialLiveLogs as LiveLog[]).map(log => ({
            ...log,
            timestamp: new Date(log.timestamp.replace('2024-07-30', today)),
        }));
        setLiveLogs(updatedLiveLogs);
        
        const updatedEmailLogs = (initialEmailLogs as EmailLog[]).map(log => ({
            ...log,
            timestamp: new Date(log.timestamp.replace('2024-07-30', today)),
            body: log.body
                     .replace(/{{current_date_long}}/g, todayLong)
                     .replace(/{{current_date}}/g, today)
        }));
        setEmailLogs(updatedEmailLogs);

    }, []);

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
