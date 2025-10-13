import { add, format, startOfWeek, parse, differenceInMinutes } from 'date-fns';
import type { AttendanceRecord } from './types';
import { collection, addDoc, getDocs, query, where, updateDoc, doc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';


export type EmailLog = {
    id?: string;
    to: string;
    subject: string;
    body: string;
    emailType: 'late_notice' | 'admin_report' | 'department_report';
    sentAt?: Date;
}


function processRecord(record: any): Omit<AttendanceRecord, 'id' | 'is_audited' | 'audit_notes'> {
    const shiftStart = parse(record.shift_start, 'HH:mm', new Date(record.date));
    const entryTime = parse(record.entry_time, 'HH:mm', new Date(record.date));
    
    // Grace period can be fetched from settings, here it's assumed to be 15 minutes.
    const graceMinutes = 15; 
    
    const lateByMinutes = differenceInMinutes(entryTime, shiftStart) > graceMinutes
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
    
    const batch = writeBatch(firestore);
    records.forEach(record => {
        const processed = processRecord(record);
        const newRecordData = {
            ...processed,
            is_audited: false,
            audit_notes: '',
            createdAt: serverTimestamp(),
        };
        const docRef = doc(attendanceCollection);
        batch.set(docRef, newRecordData);
    });

    return batch.commit().catch(error => {
        const contextualError = new FirestorePermissionError({
            operation: 'write',
            path: attendanceCollection.path,
        });
        errorEmitter.emit('permission-error', contextualError);
        // Re-throw the original error to be caught by the caller if needed
        throw error;
    });
}


export async function getRecordsByIds(recordIds: string[]): Promise<AttendanceRecord[]> {
    const { firestore } = initializeFirebase();
    if (recordIds.length === 0) return [];
    
    const attendanceCollection = collection(firestore, 'attendance_records');
    const q = query(collection(firestore, 'attendance_records'), where('__name__', 'in', recordIds.slice(0, 30)));
    try {
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AttendanceRecord));
    } catch(error) {
        const contextualError = new FirestorePermissionError({
            operation: 'list',
            path: attendanceCollection.path,
        });
        errorEmitter.emit('permission-error', contextualError);
        // We need to re-throw something or return an empty array so the calling function doesn't break
        return [];
    }
}

export async function auditRecords(recordIds: string[], auditNotes: string): Promise<void> {
    const { firestore } = initializeFirebase();
    const batch = writeBatch(firestore);
    recordIds.forEach(id => {
        const docRef = doc(firestore, 'attendance_records', id);
        batch.update(docRef, { is_audited: true, audit_notes: auditNotes });
    });

    batch.commit().catch(error => {
        // Since we are updating multiple docs, we can't provide a single path.
        // Emitting an error for the collection path is a reasonable fallback.
        const contextualError = new FirestorePermissionError({
            operation: 'update',
            path: 'attendance_records',
        });
        errorEmitter.emit('permission-error', contextualError);
    });
}


export async function logEmail(email: EmailLog): Promise<void> {
    const { firestore } = initializeFirebase();
    const emailLogsCollection = collection(firestore, 'email_logs');
    
    addDoc(emailLogsCollection, {
        ...email,
        sentAt: serverTimestamp()
    }).catch(error => {
        const contextualError = new FirestorePermissionError({
            operation: 'create',
            path: emailLogsCollection.path,
            requestResourceData: email,
        });
        errorEmitter.emit('permission-error', contextualError);
    });
}


export async function getAttendanceRecords(propertyCode: string): Promise<AttendanceRecord[]> {
    const { firestore } = initializeFirebase();
    const attendanceCollection = collection(firestore, "attendance_records");
    
    const q = query(attendanceCollection, where("property_code", "==", propertyCode));
    
    try {
        const querySnapshot = await getDocs(q);
        const records: AttendanceRecord[] = [];
        querySnapshot.forEach((doc) => {
            records.push({ id: doc.id, ...doc.data() } as AttendanceRecord);
        });
        return records;
    } catch (error) {
        const contextualError = new FirestorePermissionError({
            operation: 'list',
            path: attendanceCollection.path,
        });
        errorEmitter.emit('permission-error', contextualError);
        return []; // Return empty array on error
    }
}


export async function getDepartments(propertyCode: string): Promise<string[]> {
    const records = await getAttendanceRecords(propertyCode);
    const uniqueDepartments = [...new Set(records.map(r => r.department))];
    return uniqueDepartments.length > 0 ? uniqueDepartments : [];
}
