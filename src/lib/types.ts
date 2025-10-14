export type AttendanceRecord = {
  id: string;
  clientId: string;
  branchId: string;
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

export type Device = {
  id: string;
  property_code: string;
  deviceName: string;
  model: string;
  ipAddress: string;
  port: number;
  connectionKey: string;
  status: 'online' | 'offline';
  branchName: string;
  clientId: string;
  branchId: string;
};

export type LiveLog = {
    id: string;
    property_code: string;
    type: 'late' | 'overtime' | 'early' | 'on_time';
    employee: string;
    department: string;
    time: string;
    deviation: number;
    timestamp: any; // Firestore timestamp
    clientId: string;
    branchId: string;
};

export type UserProfile = {
  id: string;
  uid: string;
  displayName: string | null;
  email: string;
  role: string;
  property_code: string;
  photoURL?: string;
  clientId: string;
};

// This type is deprecated, use UserProfile instead.
export type User = UserProfile;


export type Role = {
  id: string;
  property_code: string;
  name: string;
  permissions: string[];
  clientId: string;
};

export type EmailLog = {
  id: string;
  to: string;
  subject: string;
  body: string;
  emailType: 'late_notice' | 'admin_report' | 'department_report';
  sentAt: any; // Firestore timestamp
}
