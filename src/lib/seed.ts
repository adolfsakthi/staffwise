'use server';

import { initializeFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp, getDocs, query, limit } from 'firebase/firestore';

export async function seedDatabase() {
  const { firestore } = initializeFirebase();

  try {
    // 1. Seed Users Collection
    const usersCollection = collection(firestore, 'users');
    const userQuery = query(usersCollection, limit(1));
    const userSnapshot = await getDocs(userQuery);
    if (userSnapshot.empty) {
      await addDoc(usersCollection, {
        uid: 'initial_user_seed',
        email: 'seed@example.com',
        displayName: 'Seed User',
        property_code: 'D001',
        role: 'Admin',
      });
      console.log('Users collection seeded.');
    } else {
        console.log('Users collection already has data.');
    }

    // 2. Seed Attendance Records Collection
    const attendanceCollection = collection(firestore, 'attendance_records');
    const attendanceQuery = query(attendanceCollection, limit(1));
    const attendanceSnapshot = await getDocs(attendanceQuery);
    if (attendanceSnapshot.empty) {
      await addDoc(attendanceCollection, {
        employee_name: 'Seed Employee',
        email: 'employee.seed@example.com',
        department: 'General',
        property_code: 'D001',
        shift_start: '09:00',
        shift_end: '17:00',
        entry_time: '09:00',
        exit_time: '17:00',
        date: '2024-01-01',
        is_late: false,
        late_by_minutes: 0,
        overtime_minutes: 0,
        is_audited: true,
        audit_notes: 'Initial seed record.',
        createdAt: serverTimestamp(),
      });
      console.log('Attendance records collection seeded.');
    } else {
      console.log('Attendance records collection already has data.');
    }

    // 3. Seed Email Logs Collection
    const emailLogsCollection = collection(firestore, 'email_logs');
    const emailQuery = query(emailLogsCollection, limit(1));
    const emailSnapshot = await getDocs(emailQuery);
    if (emailSnapshot.empty) {
      await addDoc(emailLogsCollection, {
        to: 'admin@example.com',
        subject: 'Seed Email',
        body: 'This is an initial email log.',
        emailType: 'admin_report',
        sentAt: serverTimestamp(),
      });
      console.log('Email logs collection seeded.');
    } else {
        console.log('Email logs collection already has data.');
    }
    
    return { success: true, message: 'Database seeding checked. Collections are initialized.' };

  } catch (error: any) {
    console.error('Error seeding database:', error);
    return { success: false, message: error.message || 'Failed to seed database.' };
  }
}
