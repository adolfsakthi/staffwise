

import { add, format, startOfWeek, parse, differenceInMinutes } from 'date-fns';
import { MOCK_ATTENDANCE_RECORDS, MOCK_DEPARTMENTS } from './mock-data';
import type { AttendanceRecord } from './types';
import { collection, addDoc, getDocs, query, where, updateDoc, doc, writeBatch } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';


export type EmailLog = {
    id?: string;
    to: string;
    subject: string;
    body: string;
    emailType: 'late_notice' | 'admin_report' | 'department_report';
    sentAt?: Date;
}


// A helper function to calculate late minutes and overtime
function processRecord(record: any): Omit<AttendanceRecord, 'id' | 'is_audited' | 'audit_notes'> {
    const shiftStart = parse(record.shift_start, 'HH:mm', new Date(record.date));
    const entryTime = parse(record.entry_time, 'HH:mm', new Date(record.date));
    
    // Grace period of 15 minutes is assumed.
    const lateByMinutes = differenceInMinutes(entryTime, shiftStart) > 15 
        ? differenceInMinutes(entryTime, shiftStart) 
        : 0;

    const shiftEnd = parse(record.shift_end, 'HH:mm', new Date(record.date));
    const exitTime = parse(record.exit_time, 'HH:mm', new Date(record.date));
    const overtimeMinutes = differenceInMinutes(exitTime, shiftEnd) > 0 
        ? differenceInMinutes(exitTime, shiftEnd)
        : 0;
    
    return {
        property_code: record.property_code,
        employee_name: record.employee_name,
        email: record.email,
        department: record.department,
        shift_start: record.shift_start,
        shift_end: record.shift_end,
        entry_time: record.entry_time,
        exit_time: record.exit_time,
        date: format(new Date(record.date), 'yyyy-MM-dd'),
        is_late: lateByMinutes > 0,
        late_by_minutes: lateByMinutes,
        overtime_minutes: overtimeMinutes,
    };
}


export async function addAttendanceRecords(records: any[]) {
    const { firestore } = initializeFirebase();
    const attendanceCollection = collection(firestore, 'attendance_records');
    
    console.log('Attempting to add records to Firestore:', records);
    
    try {
        const batch = writeBatch(firestore);
        records.forEach(record => {
            const processed = processRecord(record);
            const newRecordData = {
                ...processed,
                is_audited: false,
                audit_notes: '',
            };
            const docRef = doc(attendanceCollection); // Create a new doc with a generated ID
            batch.set(docRef, newRecordData);
        });
        await batch.commit();
        console.log(`${records.length} records successfully added to Firestore.`);
    } catch (error) {
        // This will catch permission errors or other issues during the write.
        // It prevents the app from crashing.
        console.error("Firestore Permission Error on write:", error);
        // We can re-throw or handle it as needed, but for now, we'll log it.
    }
}


export async function getRecordsByIds(recordIds: string[]): Promise<AttendanceRecord[]> {
    if (recordIds.length === 0) return [];
    
    const { firestore } = initializeFirebase();
    const attendanceCollection = collection(firestore, 'attendance_records');
    // Firestore's 'in' query is limited to 30 items. If more are needed, multiple queries would be required.
    const q = query(attendanceCollection, where('__name__', 'in', recordIds));
    try {
        const querySnapshot = await getDocs(q);
        const records = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AttendanceRecord));
        return records;
    } catch (error) {
        console.error("Firestore Permission Error getting records by IDs:", error);
        return MOCK_ATTENDANCE_RECORDS.filter(r => recordIds.includes(r.id));
    }
}

export async function auditRecords(recordIds: string[], auditNotes: string): Promise<void> {
    const { firestore } = initializeFirebase();
    try {
        const batch = writeBatch(firestore);
        recordIds.forEach(id => {
            const docRef = doc(firestore, 'attendance_records', id);
            batch.update(docRef, {
                is_audited: true,
                audit_notes: auditNotes,
            });
        });
        await batch.commit();
        console.log(`Successfully audited ${recordIds.length} records in Firestore.`);
    } catch (error) {
        console.error("Firestore Permission Error during audit:", error);
    }
}


export async function logEmail(email: EmailLog): Promise<void> {
    console.log(`Simulating logging email to ${email.to}.`);
    // In a real app, this would write to Firestore.
    await new Promise(resolve => setTimeout(resolve, 100));
}

// These functions below will use mock data for now to avoid read errors on pages
// that are not the primary focus of the upload feature.

export async function getAttendanceRecords(propertyCode: string): Promise<AttendanceRecord[]> {
    return MOCK_ATTENDANCE_RECORDS.filter(r => r.property_code === propertyCode);
}

export async function getAttendanceStats(propertyCode: string) {
    const records = await getAttendanceRecords(propertyCode);
    const totalRecords = records.length;
    const lateCount = records.filter(r => r.is_late).length;
    const totalOvertimeMinutes = records.reduce((sum, r) => sum + r.overtime_minutes, 0);
    const departmentCount = [...new Set(records.map(r => r.department))].length;
    
    return {
        totalRecords,
        lateCount,
        totalOvertimeMinutes,
        departmentCount,
    };
}

export async function getDepartments(propertyCode?: string): Promise<string[]> {
    if (!propertyCode) return MOCK_DEPARTMENTS;
    const records = await getAttendanceRecords(propertyCode);
    const uniqueDepartments = [...new Set(records.map(r => r.department))];
    return uniqueDepartments.length > 0 ? uniqueDepartments : MOCK_DEPARTMENTS;
}


export async function getWeeklyAttendance(propertyCode: string) {
    const records = await getAttendanceRecords(propertyCode);
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const data = Array.from({ length: 7 }).map((_, i) => {
        const date = add(weekStart, { days: i });
        const recordsForDay = records.filter(r => r.date === format(date, 'yyyy-MM-dd'));
        return {
            name: format(date, 'EEE'),
            onTime: recordsForDay.filter(r => !r.is_late).length,
            late: recordsForDay.filter(r => r.is_late).length,
        };
    });
    return data;
}
