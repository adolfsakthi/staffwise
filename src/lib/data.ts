

import { add, format, startOfWeek, parse, differenceInMinutes } from 'date-fns';
import { MOCK_DEPARTMENTS } from './mock-data';
import type { AttendanceRecord } from './types';
import { initializeFirebase } from '@/firebase';
import { collection, addDoc, doc, updateDoc, getDocs, query, where } from 'firebase/firestore';


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

    const promises = records.map(record => {
        const processed = processRecord(record);
        return addDoc(attendanceCollection, {
            ...processed,
            is_audited: false, // New records are not audited
            audit_notes: '',
        });
    });

    await Promise.all(promises);
}


export async function getRecordsByIds(recordIds: string[]): Promise<AttendanceRecord[]> {
    if (recordIds.length === 0) return [];
    
    const { firestore } = initializeFirebase();
    const recordsCollection = collection(firestore, 'attendance_records');
    const q = query(recordsCollection, where('__name__', 'in', recordIds));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AttendanceRecord));
}

// NOTE: The functions below now fetch from Firestore but are not used by the real-time components.
// They can be used for server-side logic or components that do not need real-time updates.

export async function getAttendanceRecords(propertyCode: string): Promise<AttendanceRecord[]> {
    const { firestore } = initializeFirebase();
    const recordsCollection = collection(firestore, 'attendance_records');
    const q = query(recordsCollection, where('property_code', '==', propertyCode));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AttendanceRecord));
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
    // In a real app with many records, this is inefficient.
    // It's better to have a separate 'departments' collection.
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

export async function auditRecords(recordIds: string[], auditNotes: string): Promise<void> {
    const { firestore } = initializeFirebase();
    const promises = recordIds.map(id => {
        const docRef = doc(firestore, 'attendance_records', id);
        return updateDoc(docRef, {
            is_audited: true,
            audit_notes: auditNotes,
        });
    });
    await Promise.all(promises);
}


export async function logEmail(email: EmailLog): Promise<void> {
    const { firestore } = initializeFirebase();
    const emailsCollection = collection(firestore, 'sent_emails');
    await addDoc(emailsCollection, {
        ...email,
        sentAt: new Date(),
    });
    console.log(`Email to ${email.to} logged to Firestore.`);
}
