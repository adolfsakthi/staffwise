
import { collection, getDocs, query, where, doc, writeBatch, getDoc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { add, format, startOfWeek } from 'date-fns';
import { firestore } from '@/firebase';

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

// This can be fetched from a 'settings' collection in Firestore
export const ALL_PERMISSIONS = ['read', 'write', 'hidden'];

export async function getAttendanceRecords(filters?: { audited?: boolean }): Promise<AttendanceRecord[]> {
    if (!firestore) {
        console.error("Firestore not initialized");
        return [];
    }
    const recordsCol = collection(firestore, 'attendance_records');
    let q = query(recordsCol);

     if (filters?.audited !== undefined) {
        q = query(q, where('is_audited', '==', filters.audited));
    }

    try {
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AttendanceRecord));
    } catch (error) {
        console.error("Error fetching attendance records: ", error);
        return [];
    }
}


export async function getAttendanceStats() {
    if (!firestore) return { totalRecords: 0, lateCount: 0, totalOvertimeMinutes: 0, departmentCount: 0 };
    
    try {
        const recordsCol = collection(firestore, 'attendance_records');
        const snapshot = await getDocs(recordsCol);
        
        const records = snapshot.docs.map(doc => doc.data() as AttendanceRecord);

        const totalRecords = records.length;
        const lateCount = records.filter(r => r.is_late).length;
        const totalOvertimeMinutes = records.reduce((sum, r) => sum + r.overtime_minutes, 0);

        const departmentsCol = collection(firestore, 'grace_settings'); // Assuming departments are managed via grace_settings
        const departmentsSnapshot = await getDocs(departmentsCol);
        // Exclude global setting from department count
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
    if (!firestore) return [];
    try {
        const departmentsCol = collection(firestore, 'grace_settings');
        const q = query(departmentsCol, where('department', '!=', null));
        const snapshot = await getDocs(q);
        // Using a Set to ensure uniqueness, as department name is the id
        const departments = new Set(snapshot.docs.map(doc => doc.data().department as string));
        return Array.from(departments);
    } catch (error) {
        console.error("Error fetching departments: ", error);
        return [];
    }
}


export async function getWeeklyAttendance() {
    if (!firestore) return [];

    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const recordsCol = collection(firestore, 'attendance_records');
    const weeklyDataPromises = Array.from({ length: 7 }).map(async (_, i) => {
        const date = add(weekStart, { days: i });
        const dateStr = format(date, 'yyyy-MM-dd');
        
        const q = query(recordsCol, where('date', '==', dateStr));
        const snapshot = await getDocs(q);
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
    if (!firestore) throw new Error("Firestore not initialized");
    const batch = writeBatch(firestore);
    recordIds.forEach(id => {
        const docRef = doc(firestore, 'attendance_records', id);
        batch.update(docRef, { is_audited: true, audit_notes: auditNotes });
    });
    await batch.commit();
}

export async function getUsers() {
    if (!firestore) return [];
    const usersCol = collection(firestore, 'users');
    const snapshot = await getDocs(usersCol);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
}

export async function getRoles() {
    if (!firestore) return [];
    const rolesCol = collection(firestore, 'roles');
    const snapshot = await getDocs(rolesCol);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
}

export async function getDevices() {
    if (!firestore) return [];
    const devicesCol = collection(firestore, 'devices');
    const snapshot = await getDocs(devicesCol);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
}
