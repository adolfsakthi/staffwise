import { collection, getDocs, Firestore, query, where, doc, getDoc, setDoc, writeBatch, addDoc, serverTimestamp } from 'firebase/firestore';
import { add, format, startOfWeek, parse, differenceInMinutes } from 'date-fns';
import type { AttendanceRecord, Role } from './types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';


export type EmailLog = {
    id?: string;
    to: string;
    subject: string;
    body: string;
    emailType: 'late_notice' | 'admin_report' | 'department_report';
    sentAt?: any;
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
        clientId: record.clientId,
        branchId: record.branchId,
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


export async function addAttendanceRecords(db: Firestore, records: any[], clientId: string, branchId: string): Promise<void> {
    const batch = writeBatch(db);
    const attendanceCollection = collection(db, `clients/${clientId}/branches/${branchId}/attendanceRecords`);

    records.forEach((recordData) => {
        const processed = processRecord({ ...recordData, clientId, branchId });
        const newRecordRef = doc(attendanceCollection);
        const recordWithAudited = {
            ...processed,
            is_audited: false,
            audit_notes: ''
        };
        batch.set(newRecordRef, recordWithAudited);
    });

    return batch.commit().catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: `clients/${clientId}/branches/${branchId}/attendanceRecords`,
            operation: 'create',
            requestResourceData: records.map(rec => processRecord({...rec, clientId, branchId})),
        });
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
    });
}

export async function addEmployees(db: Firestore, employees: any[], clientId: string, branchId: string): Promise<void> {
    const batch = writeBatch(db);
    const employeeCollection = collection(db, `clients/${clientId}/branches/${branchId}/employees`);

    employees.forEach((emp) => {
        const newDocRef = doc(employeeCollection);
        batch.set(newDocRef, { ...emp, clientId, branchId });
    });
    
    return batch.commit().catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: `clients/${clientId}/branches/${branchId}/employees`,
            operation: 'create',
            requestResourceData: employees,
        });
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
    });
}

export async function addPunchLogs(db: Firestore, logs: any[], clientId: string, branchId: string): Promise<void> {
    const batch = writeBatch(db);
    const punchLogCollection = collection(db, `clients/${clientId}/branches/${branchId}/punchLogs`);
    
    logs.forEach((log) => {
        const newDocRef = doc(punchLogCollection);
        batch.set(newDocRef, { ...log, clientId, branchId });
    });
    
    return batch.commit().catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: `clients/${clientId}/branches/${branchId}/punchLogs`,
            operation: 'create',
            requestResourceData: logs,
        });
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
    });
}


export async function getRecordsByIds(db: Firestore, clientId: string, branchId: string, recordIds: string[]): Promise<AttendanceRecord[]> {
    const records: AttendanceRecord[] = [];
    if (recordIds.length === 0) return records;

    const CHUNK_SIZE = 30; // Firestore 'in' query limit
    for (let i = 0; i < recordIds.length; i += CHUNK_SIZE) {
        const chunk = recordIds.slice(i, i + CHUNK_SIZE);
        const recordsQuery = query(collection(db, `clients/${clientId}/branches/${branchId}/attendanceRecords`), where('__name__', 'in', chunk));
        
        try {
            const querySnapshot = await getDocs(recordsQuery);
            querySnapshot.forEach(doc => {
                records.push({ ...doc.data(), id: doc.id } as AttendanceRecord);
            });
        } catch (serverError: any) {
            const permissionError = new FirestorePermissionError({
                path: `clients/${clientId}/branches/${branchId}/attendanceRecords`,
                operation: 'list',
            });
            errorEmitter.emit('permission-error', permissionError);
            throw serverError;
        }
    }
    return records;
}

export async function auditRecords(db: Firestore, clientId: string, branchId: string, recordIds: string[], auditNotes: string): Promise<void> {
    const batch = writeBatch(db);
    recordIds.forEach(id => {
        const docRef = doc(db, `clients/${clientId}/branches/${branchId}/attendanceRecords`, id);
        batch.update(docRef, { is_audited: true, audit_notes: auditNotes });
    });

    return batch.commit().catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: `clients/${clientId}/branches/${branchId}/attendanceRecords`,
            operation: 'update',
            requestResourceData: { is_audited: true, audit_notes: auditNotes }
        });
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
    });
}


export async function logEmail(email: Omit<EmailLog, 'id' | 'sentAt'>): Promise<void> {
    const db = (await import('@/firebase/server')).getDb();
    const emailLogCollection = collection(db, 'emailLogs');
    const newLog = {
        ...email,
        sentAt: serverTimestamp()
    };
    
    addDoc(emailLogCollection, newLog).catch(async (serverError) => {
         const permissionError = new FirestorePermissionError({
            path: 'emailLogs',
            operation: 'create',
            requestResourceData: newLog
        });
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
    });
}


export async function getDepartments(db: Firestore, propertyCode: string): Promise<string[]> {
    // This function needs to query a subcollection, so we need clientId
    const clientId = 'default_client';
    const rolesQuery = query(collection(db, `clients/${clientId}/roles`), where('property_code', '==', propertyCode));
    try {
        const querySnapshot = await getDocs(rolesQuery);
        // This is a simplification. A real app might have a dedicated 'departments' collection.
        // Here, we assume roles might imply departments or can be used as a proxy.
        const departments = new Set<string>();
        querySnapshot.forEach(doc => {
            const role = doc.data() as Role;
            if (role.name) { // Simple logic to add role name as a department
                departments.add(role.name);
            }
        });
        // Add fallback departments if none are found from roles
        if (departments.size === 0) {
            ['Engineering', 'Housekeeping', 'Front Desk'].forEach(d => departments.add(d));
        }
        return Array.from(departments);
    } catch(e) {
        console.error("Error fetching departments (roles)", e);
        return ['Engineering', 'Housekeeping', 'Front Desk']; // Fallback
    }
}
