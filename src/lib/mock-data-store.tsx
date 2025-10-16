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
        // Set the attendance date to today for all records on initial load
        const today = format(new Date(), 'yyyy-MM-dd');
        
        const updatedAttendance = (initialAttendance as AttendanceRecord[]).map(rec => ({
            ...rec,
            attendanceDate: today,
        }));
        setAttendanceRecords(updatedAttendance);

        const updatedLiveLogs = (initialLiveLogs as LiveLog[]).map(log => ({
            ...log,
            timestamp: new Date(log.timestamp),
        }));
        setLiveLogs(updatedLiveLogs);
        
        const updatedEmailLogs = (initialEmailLogs as EmailLog[]).map(log => ({
            ...log,
            timestamp: new Date(log.timestamp),
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
