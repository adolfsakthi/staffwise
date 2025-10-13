import { collection, getDocs, onSnapshot, query, where, doc, writeBatch, getDoc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/firebase/firestore'; // Assuming you have a db export
import { add, format, parse, startOfWeek, subDays } from 'date-fns';
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


export async function getAttendanceRecords(filters?: { date?: string; department?: string, audited?: boolean }): Promise<AttendanceRecord[]> {
    const recordsCol = collection(firestore, 'attendanceRecords');
    let q = query(recordsCol);

    if (filters?.date) {
        q = query(q, where('date', '==', filters.date));
    }
    if (filters?.department) {
        q = query(q, where('department', '==', filters.department));
    }
     if (filters?.audited !== undefined) {
        q = query(q, where('is_audited', '==', filters.audited));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AttendanceRecord));
}

export async function getAttendanceStats() {
    const recordsCol = collection(firestore, 'attendanceRecords');
    const snapshot = await getDocs(recordsCol);
    
    const records = snapshot.docs.map(doc => doc.data() as AttendanceRecord);

    const totalRecords = records.length;
    const lateCount = records.filter(r => r.is_late).length;
    const totalOvertimeMinutes = records.reduce((sum, r) => sum + r.overtime_minutes, 0);

    const departmentsCol = collection(firestore, 'departments');
    const departmentsSnapshot = await getDocs(departmentsCol);
    const departmentCount = departmentsSnapshot.size;
    
    return {
        totalRecords,
        lateCount,
        totalOvertimeMinutes,
        departmentCount,
    };
}

export async function getDepartments() {
    const departmentsCol = collection(firestore, 'departments');
    const snapshot = await getDocs(departmentsCol);
    return snapshot.docs.map(doc => doc.data().name as string);
}

export async function getWeeklyAttendance() {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const recordsCol = collection(firestore, 'attendanceRecords');
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
    const batch = writeBatch(firestore);
    recordIds.forEach(id => {
        const docRef = doc(firestore, 'attendanceRecords', id);
        batch.update(docRef, { is_audited: true, audit_notes: auditNotes });
    });
    await batch.commit();
}

export async function getUsers() {
    const usersCol = collection(firestore, 'users');
    const snapshot = await getDocs(usersCol);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
}

export async function getRoles() {
    const rolesCol = collection(firestore, 'roles');
    const snapshot = await getDocs(rolesCol);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
}

export async function getDevices() {
    const devicesCol = collection(firestore, 'devices');
    const snapshot = await getDocs(devicesCol);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
}
