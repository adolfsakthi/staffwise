import { collection, writeBatch, Firestore, doc } from 'firebase/firestore';

// Define some mock data
const MOCK_USERS = [
    { uid: 'admin_user_uid', displayName: 'Admin User', email: 'admin@staffwise.com', role: 'Admin', property_code: 'D001' },
];

const MOCK_ROLES = [
    { name: 'Admin', permissions: ['read', 'write', 'delete', 'manage_users'], property_code: 'D001' },
    { name: 'Manager', permissions: ['read', 'write'], property_code: 'D001' },
    { name: 'Staff', permissions: ['read'], property_code: 'D001' },
];

const MOCK_ATTENDANCE_RECORDS = [
  {
    employee_name: 'John Doe',
    email: 'john.doe@example.com',
    department: 'Housekeeping',
    shift_start: '09:00',
    shift_end: '18:00',
    entry_time: '09:15',
    exit_time: '18:05',
    date: '2024-05-23',
    is_late: true,
    late_by_minutes: 15,
    overtime_minutes: 5,
    is_audited: false,
    property_code: 'D001',
    clientId: 'default_client',
    branchId: 'default_branch',
  },
];

const MOCK_EMAIL_LOGS = [
    { to: 'hr@staffwise.com', subject: 'Weekly Digest', body: '<p>Here is your weekly summary.</p>', emailType: 'admin_report', sentAt: new Date() }
]

/**
 * Seeds the database with initial data for users, roles, and a sample attendance record.
 * This function is idempotent; it won't create duplicate data if run multiple times
 * because it uses specific document IDs where possible.
 */
export async function seedDatabase(db: Firestore, clientId: string, branchId: string) {
  const batch = writeBatch(db);

  // Seed Users
  const usersCollection = collection(db, 'users');
  MOCK_USERS.forEach(user => {
    const userDocRef = doc(usersCollection, user.uid); // Use UID as document ID
    batch.set(userDocRef, user);
  });

  // Seed Roles
  const rolesCollection = collection(db, 'roles');
  MOCK_ROLES.forEach(role => {
    const roleDocRef = doc(rolesCollection, `${role.property_code}_${role.name.toLowerCase()}`); // Create a predictable ID
    batch.set(roleDocRef, role);
  });

  // Seed Attendance Records
  const attendanceCollection = collection(db, `clients/${clientId}/branches/${branchId}/attendanceRecords`);
  MOCK_ATTENDANCE_RECORDS.forEach(record => {
    const newRecordRef = doc(attendanceCollection); // Let Firestore generate ID
    batch.set(newRecordRef, record);
  });
  
  // Seed Email Logs
  const emailLogCollection = collection(db, 'emailLogs');
  MOCK_EMAIL_LOGS.forEach(log => {
      const newLogRef = doc(emailLogCollection);
      batch.set(newLogRef, log);
  })

  try {
    await batch.commit();
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}
