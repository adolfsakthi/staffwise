

import { add, format, startOfWeek, parse, differenceInMinutes } from 'date-fns';
import { collection, writeBatch, getDocs, query, where, getFirestore, runTransaction, doc, and, getDoc } from 'firebase/firestore';
import { getSdks } from '@/firebase';

export type AttendanceRecord = {
  id: string;
  property_code: string;
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

    // Since auth is removed, we expect permission errors. We will log them
    // but not re-throw, to prevent the app from crashing.
    try {
        await batch.commit();
    } catch (error) {
         console.error("Firestore Error writing records:", error);
         // Do not re-throw error to avoid crashing the upload component.
    }
}


export async function getAttendanceRecords(propertyCode: string): Promise<AttendanceRecord[]> {
    const { firestore } = getSdks();
    const attendanceCollection = collection(firestore, 'attendance_records');
    const q = query(attendanceCollection, where('property_code', '==', propertyCode));
    
    try {
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AttendanceRecord));
    } catch (error: any) {
        // Since auth is removed, permission errors are expected.
        // Log the error and return an empty array to prevent crashing.
        console.error("Firestore Error getting records:", error);
        return [];
    }
}


export async function getRecordsByIds(recordIds: string[]): Promise<AttendanceRecord[]> {
    if (recordIds.length === 0) return [];
    const { firestore } = getSdks();
    const records: AttendanceRecord[] = [];
    
    // Firestore 'in' queries are limited to 30 elements
    const chunks = [];
    for (let i = 0; i < recordIds.length; i += 30) {
        chunks.push(recordIds.slice(i, i + 30));
    }
    
    try {
        for (const chunk of chunks) {
            const q = query(collection(firestore, 'attendance_records'), where('__name__', 'in', chunk));
            const snapshot = await getDocs(q);
            snapshot.forEach(docSnap => {
                 if (docSnap.exists()) {
                    records.push({ id: docSnap.id, ...docSnap.data() } as AttendanceRecord);
                }
            })
        }
    } catch (error: any) {
        // Since auth is removed, permission errors are expected.
        // Log the error and return what we have.
        console.error("Firestore Error getting records by ID:", error);
    }
    
    return records;
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
    if (!propertyCode) return [];
    const records = await getAttendanceRecords(propertyCode);
    return [...new Set(records.map(r => r.department))].sort();
}


export async function getWeeklyAttendance(propertyCode: string) {
    const records = await getAttendanceRecords(propertyCode);
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
    
    try {
        await runTransaction(firestore, async (transaction) => {
            const recordsToUpdate = await Promise.all(recordIds.map(id => {
                const docRef = doc(firestore, 'attendance_records', id);
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
    } catch (error: any) {
        // Since auth is removed, permission errors are expected.
        console.error("Firestore Error auditing records:", error);
        throw error;
    }
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
