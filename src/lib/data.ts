
import { add, format, startOfWeek } from 'date-fns';
import { getFirestoreAdmin } from '@/firebase/admin';
import type { Query } from 'firebase-admin/firestore';


export type AttendanceRecord = {
  id: string;
  employee_name: string;
  email: string;
  department: string;
  shift_start: string;
  shift_end:string;
  entry_time: string;
  exit_time: string;
  date: string;
  is_late: boolean;
  late_by_minutes: number;
  overtime_minutes: number;
  is_audited: boolean;
  audit_notes?: string;
};

export type EmailLog = {
    id?: string;
    to: string;
    subject: string;
    body: string;
    emailType: 'late_notice' | 'admin_report' | 'department_report';
    sentAt?: Date;
}

// This can be fetched from a 'settings' collection in Firestore
export const ALL_PERMISSIONS = ['read', 'write', 'hidden'];

export async function getAttendanceRecords(): Promise<AttendanceRecord[]> {
    const firestore = getFirestoreAdmin();
    let recordsQuery: Query = firestore.collection('attendance_records');

    try {
        const snapshot = await recordsQuery.get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AttendanceRecord));
    } catch (error) {
        console.error("Error fetching attendance records: ", error);
        if (error instanceof Error && 'code' in error && (error as any).code === 'permission-denied') {
             throw new Error("Firestore permission denied. Please check your security rules.");
        }
        return []; // Return empty array on error
    }
}

export async function getRecordsByIds(recordIds: string[]): Promise<AttendanceRecord[]> {
    if (recordIds.length === 0) {
        return [];
    }
    const firestore = getFirestoreAdmin();
    const recordsCol = firestore.collection('attendance_records');
    const snapshot = await recordsCol.where('__name__', 'in', recordIds).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AttendanceRecord));
}

export async function getAttendanceStats() {
    const firestore = getFirestoreAdmin();
    try {
        const recordsCol = firestore.collection('attendance_records');
        const snapshot = await recordsCol.get();
        
        const records = snapshot.docs.map(doc => doc.data() as AttendanceRecord);

        const totalRecords = records.length;
        const lateCount = records.filter(r => r.is_late).length;
        const totalOvertimeMinutes = records.reduce((sum, r) => sum + r.overtime_minutes, 0);

        const departmentsCol = firestore.collection('grace_settings');
        const departmentsSnapshot = await departmentsCol.get();
        const departmentCount = departmentsSnapshot.docs.filter(d => d.id !== 'global').length;
        
        return {
            totalRecords,
            lateCount,
            totalOvertimeMinutes,
            departmentCount,
        };
    } catch (error) {
        console.error("Error fetching attendance stats: ", error);
        return { totalRecords: 0, lateCount: 0, totalOvertimeMinutes: 0, departmentCount: 0 };
    }
}

export async function getDepartments(): Promise<string[]> {
    const firestore = getFirestoreAdmin();
    try {
        const departmentsCol = firestore.collection('grace_settings');
        const q = departmentsCol.where('department', '!=', null);
        const snapshot = await q.get();
        const departments = new Set(snapshot.docs.map(doc => doc.data().department as string));
        return Array.from(departments);
    } catch (error) {
        console.error("Error fetching departments: ", error);
        return [];
    }
}


export async function getWeeklyAttendance() {
    const firestore = getFirestoreAdmin();

    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const recordsCol = firestore.collection('attendance_records');
    const weeklyDataPromises = Array.from({ length: 7 }).map(async (_, i) => {
        const date = add(weekStart, { days: i });
        const dateStr = format(date, 'yyyy-MM-dd');
        
        const q = recordsCol.where('date', '==', dateStr);
        const snapshot = await q.get();
        const recordsForDay = snapshot.docs.map(doc => doc.data() as AttendanceRecord);

        const onTime = recordsForDay.filter(r => !r.is_late).length;
        const late = recordsForDay.filter(r => r.is_late).length;

        return {
            name: format(date, 'EEE'),
            onTime,
            late,
        };
    });
    return Promise.all(weeklyDataPromises);
}

export async function auditRecords(recordIds: string[], auditNotes: string): Promise<void> {
    const firestore = getFirestoreAdmin();
    const batch = firestore.batch();
    recordIds.forEach(id => {
        const docRef = firestore.collection('attendance_records').doc(id);
        batch.update(docRef, { is_audited: true, audit_notes: auditNotes });
    });
    await batch.commit();
}

export async function logEmail(email: EmailLog): Promise<void> {
    const firestore = getFirestoreAdmin();
    const emailLogWithTimestamp = {
        ...email,
        sentAt: new Date(),
    };
    await firestore.collection('email_logs').add(emailLogWithTimestamp);
}

export async function getUsers() {
    const firestore = getFirestoreAdmin();
    const usersCol = firestore.collection('users');
    const snapshot = await usersCol.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
}

export async function getRoles() {
    const firestore = getFirestoreAdmin();
    const rolesCol = firestore.collection('roles');
    const snapshot = await rolesCol.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
}

export async function getDevices() {
    const firestore = getFirestoreAdmin();
    const devicesCol = firestore.collection('devices');
    const snapshot = await devicesCol.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
}
