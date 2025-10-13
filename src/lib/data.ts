
import { collection, getDocs, Firestore, query, where, doc, getDoc, setDoc, writeBatch } from 'firebase/firestore';
import { add, format, startOfWeek, parse, differenceInMinutes } from 'date-fns';
import type { AttendanceRecord, Role } from './types';
import { MOCK_DEPARTMENTS } from './mock-data';
import { errorEmitter } from './error-emitter';
import { FirestorePermissionError } from './errors';


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


export async function addAttendanceRecords(db: Firestore, records: any[]): Promise<void> {
    const batch = writeBatch(db);

    records.forEach((recordData) => {
        const processed = processRecord(recordData);
        const newRecordRef = doc(collection(db, 'attendance_records'));
        const recordWithAudited = {
            ...processed,
            id: newRecordRef.id,
            is_audited: false,
            audit_notes: ''
        };
        batch.set(newRecordRef, recordWithAudited);
    });

    return batch.commit().catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: 'attendance_records',
            operation: 'create',
            requestResourceData: records.map(processRecord),
        });
        errorEmitter.emit('permission-error', permissionError);
        // We still throw the original error to not swallow it completely
        throw serverError;
    });
}


export async function getRecordsByIds(db: Firestore, recordIds: string[]): Promise<AttendanceRecord[]> {
    const records: AttendanceRecord[] = [];
    if (recordIds.length === 0) return records;

    const CHUNK_SIZE = 30; // Firestore 'in' query limit
    for (let i = 0; i < recordIds.length; i += CHUNK_SIZE) {
        const chunk = recordIds.slice(i, i + CHUNK_SIZE);
        const recordsQuery = query(collection(db, "attendance_records"), where('id', 'in', chunk));
        
        try {
            const querySnapshot = await getDocs(recordsQuery);
            querySnapshot.forEach(doc => {
                records.push(doc.data() as AttendanceRecord);
            });
        } catch (serverError: any) {
            const permissionError = new FirestorePermissionError({
                path: 'attendance_records',
                operation: 'list',
            });
            errorEmitter.emit('permission-error', permissionError);
            throw serverError;
        }
    }
    return records;
}

export async function auditRecords(db: Firestore, recordIds: string[], auditNotes: string): Promise<void> {
    const batch = writeBatch(db);
    recordIds.forEach(id => {
        const docRef = doc(db, 'attendance_records', id);
        batch.update(docRef, { is_audited: true, audit_notes: auditNotes });
    });

    return batch.commit().catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: 'attendance_records',
            operation: 'update',
            requestResourceData: { is_audited: true, audit_notes: auditNotes }
        });
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
    });
}


export async function logEmail(email: EmailLog): Promise<void> {
    console.log('Simulating email log:', email);
    // In a real app, this would write to Firestore.
    // For now, we'll just log to the console.
    return Promise.resolve();
}


export async function getDepartments(): Promise<string[]> {
    // This now fetches unique department values from the 'roles' collection.
    // In a real app, this would be a Firestore query.
    console.log("Fetching mock departments");
    return Promise.resolve(MOCK_DEPARTMENTS);
}
