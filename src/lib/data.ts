import { add, format, startOfWeek, parse, differenceInMinutes } from 'date-fns';
import { initialAttendanceRecords } from './attendance-data';
import { collection, writeBatch, getDocs, query, where, getFirestore, runTransaction, doc } from 'firebase/firestore';
import { getSdks } from '@/firebase';

export type AttendanceRecord = {
  id: string;
  employee_name: string;
  email: string;
  department: string;
  shift_start: string;
  shift_end: string;
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

const MOCK_DEPARTMENTS = ['Engineering', 'Sales', 'HR', 'IT', 'Operations', 'Support', 'Admin', 'Finance'];


async function seedInitialData() {
    const { firestore } = getSdks();
    const attendanceCollection = collection(firestore, 'attendance_records');
    const snapshot = await getDocs(attendanceCollection);

    if (snapshot.empty) {
        console.log('No attendance records found, seeding initial data...');
        const batch = writeBatch(firestore);
        initialAttendanceRecords.forEach((record) => {
            const docRef = doc(collection(firestore, 'attendance_records'));
            batch.set(docRef, record);
        });
        await batch.commit();
        console.log('Initial data seeded.');
    }
}


export async function addAttendanceRecords(records: Omit<AttendanceRecord, 'id' | 'is_audited'>[]) {
    const { firestore } = getSdks();
    const batch = writeBatch(firestore);
    const attendanceCollection = collection(firestore, 'attendance_records');

    records.forEach(record => {
        const today = new Date();
        const entryTime = parse(record.entry_time, 'HH:mm', today);
        const shiftStart = parse(record.shift_start, 'HH:mm', today);
        const exitTime = parse(record.exit_time, 'HH:mm', today);
        const shiftEnd = parse(record.shift_end, 'HH:mm', today);

        const lateByMinutes = differenceInMinutes(entryTime, shiftStart);
        const overtimeMinutes = differenceInMinutes(exitTime, shiftEnd);

        const newRecord = {
            ...record,
            is_late: lateByMinutes > 0,
            late_by_minutes: Math.max(0, lateByMinutes),
            overtime_minutes: Math.max(0, overtimeMinutes),
            is_audited: false,
            date: format(new Date(), 'yyyy-MM-dd')
        };
        const docRef = doc(attendanceCollection);
        batch.set(docRef, newRecord);
    });

    await batch.commit();
}


export async function getAttendanceRecords(): Promise<AttendanceRecord[]> {
    await seedInitialData();
    const { firestore } = getSdks();
    const attendanceCollection = collection(firestore, 'attendance_records');
    const snapshot = await getDocs(attendanceCollection);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AttendanceRecord));
}

export async function getUnauditedRecords(): Promise<AttendanceRecord[]> {
    const { firestore } = getSdks();
    const attendanceCollection = collection(firestore, 'attendance_records');
    const q = query(attendanceCollection, where('is_audited', '==', false));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AttendanceRecord));
}

export async function getRecordsByIds(recordIds: string[]): Promise<AttendanceRecord[]> {
    if (recordIds.length === 0) return [];
    const { firestore } = getSdks();
    const attendanceCollection = collection(firestore, 'attendance_records');
    // Firestore 'in' query is limited to 30 elements.
    // We'll fetch documents in chunks of 30.
    const chunks = [];
    for (let i = 0; i < recordIds.length; i += 30) {
        chunks.push(recordIds.slice(i, i + 30));
    }

    const records: AttendanceRecord[] = [];
    for (const chunk of chunks) {
        const q = query(attendanceCollection, where('__name__', 'in', chunk));
        const snapshot = await getDocs(q);
        snapshot.forEach(doc => {
            records.push({ id: doc.id, ...doc.data() } as AttendanceRecord);
        });
    }
    return records;
}

export async function getAttendanceStats() {
    const records = await getAttendanceRecords();
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

export async function getDepartments(): Promise<string[]> {
    await new Promise(res => setTimeout(res, 500));
    return MOCK_DEPARTMENTS;
}


export async function getWeeklyAttendance() {
    const records = await getAttendanceRecords();
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const data = Array.from({ length: 7 }).map((_, i) => {
        const date = add(weekStart, { days: i });
        const recordsForDay = records.filter(r => format(new Date(r.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'));
        return {
            name: format(date, 'EEE'),
            onTime: recordsForDay.filter(r => !r.is_late).length,
            late: recordsForDay.filter(r => r.is_late).length,
        };
    });
    return data;
}

export async function auditRecords(recordIds: string[], auditNotes: string): Promise<void> {
    const { firestore } = getSdks();
    const attendanceCollection = collection(firestore, 'attendance_records');
    
    await runTransaction(firestore, async (transaction) => {
        const recordsToUpdate = await Promise.all(recordIds.map(id => {
            const docRef = doc(attendanceCollection, id);
            return transaction.get(docRef);
        }));

        recordsToUpdate.forEach(doc => {
            if (doc.exists()) {
                transaction.update(doc.ref, { 
                    is_audited: true,
                    audit_notes: auditNotes
                });
            }
        });
    });
}


export async function logEmail(email: EmailLog): Promise<void> {
    console.log('--- MOCK EMAIL LOG ---');
    console.log(`To: ${email.to}`);
    console.log(`Subject: ${email.subject}`);
    console.log('--- Body ---');
    console.log(email.body);
    console.log('--------------------');
    // In a real app, this would use an email service (e.g., SendGrid, Nodemailer)
    // and save a log to the database.
    await new Promise(res => setTimeout(res, 500));
}

export async function getUsers() {
    // This would fetch from a database
    await new Promise(res => setTimeout(res, 500));
    return [
        { id: '1', displayName: 'Alice Johnson', email: 'alice@example.com', role: 'Admin' },
        { id: '2', displayName: 'Bob Williams', email: 'bob@example.com', role: 'Manager' },
        { id: '3', displayName: 'Charlie Brown', email: 'charlie@example.com', role: 'Staff' },
    ];
}

export async function getRoles() {
    await new Promise(res => setTimeout(res, 500));
    return [
        { id: '1', name: 'Admin', permissions: ['read', 'write', 'delete', 'manage_users'] },
        { id: '2', name: 'Manager', permissions: ['read', 'write'] },
        { id: '3', name: 'Staff', permissions: ['read'] },
    ];
}

export async function getDevices() {
    await new Promise(res => setTimeout(res, 500));
    return [
        { id: '1', name: 'Main Entrance', model: 'ZK-Teco-X1', ip: '192.168.1.101', status: 'online', branch: 'Headquarters' },
        { id: '2', name: 'Warehouse-1', model: 'BioMax-9000', ip: '192.168.1.102', status: 'offline', branch: 'West Wing' },
    ];
}
