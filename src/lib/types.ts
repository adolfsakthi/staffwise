


// Maps to the 'Employee' entity
export type Employee = {
  id: string;
  clientId: string;
  branchId: string;
  property_code: string; // This is a custom claim or derived property
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  employeeCode: string;
  shiftStartTime: string;
  shiftEndTime: string;
};

// Maps to the 'AttendanceRecord' entity
export type AttendanceRecord = {
  id: string;
  employeeId: string;
  deviceId: string;
  punchInTime: any; // ISO String
  punchOutTime?: any; // ISO String
  attendanceDate: string; // YYYY-MM-DD
  logType: string;

  // Denormalized/calculated data for easier display
  employee_name?: string;
  email?: string;
  department?: string;
  property_code?: string;
  entry_time?: string; // HH:mm
  exit_time?: string; // HH:mm
  is_late?: boolean;
  late_by_minutes?: number;
  overtime_minutes?: number;
  is_present?: boolean;
  is_absent?: boolean;
  is_on_leave?: boolean;
  early_going_minutes?: number;
  is_audited?: boolean;
  audit_notes?: string;
};

// Maps to the 'BiometricDevice' entity
export type Device = {
  id: string;
  clientId: string;
  branchId: string;
  deviceName: string;
  ipAddress: string;
  port: number;
  connectionKey: string;
  
  // UI-specific or derived properties
  model?: string;
  branchName?: string;
  property_code?: string; // This is a custom claim or derived property
  status: 'online' | 'offline'; // This would be determined by a separate process
  serialNumber?: string;
  lastPing?: string;
};

// Maps to the 'Notification' entity, with added denormalized data
export type LiveLog = {
    id: string;
    employeeId?: string; // employeeId is optional in Notification schema
    type: 'late' | 'overtime' | 'early' | 'on_time' | 'audit_summary'; // From Notification 'type'
    message: string; // from Notification 'message'
    timestamp: any; // ISO String
    isRead: boolean;

    // Denormalized data for display
    property_code?: string;
    employee?: string; // employee name
    department?: string;
    time?: string; // Formatted time
    deviation?: number; // Calculated deviation
};


// Represents a user profile, potentially stored in a 'users' collection
export type UserProfile = {
  id: string;       // document ID
  uid: string;      // Auth UID
  displayName: string | null;
  email: string;
  role: string;     // e.g., 'Admin', 'Manager'
  property_code: string; // The property they have access to
  photoURL?: string;
  clientId: string;
};

// Maps to a potential 'roles' collection for RBAC
export type Role = {
  id: string;
  clientId: string;
  property_code: string;
  name: string;
  permissions: string[];
};

// Maps to the 'EmailLog' entity
export type EmailLog = {
  id: string;
  recipient: string;
  subject: string;
  body: string;
  timestamp: any; // ISO String
  emailType: 'late_notice' | 'admin_report' | 'department_report';
};

// Maps to the 'AuditLog' entity
export type AuditLog = {
  id: string;
  timestamp: any; // ISO String
  auditorId: string;
  auditType: 'daily' | 'weekly' | 'monthly' | 'manual';
  summary: string;
}

// Maps to the 'Client' entity
export type Client = {
    id: string;
    name: string;
    contactEmail: string;
    createdAt: any; // ISO String
}

// Maps to the 'Branch' entity
export type Branch = {
    id: string;
    clientId: string;
    name: string;
    location: string;
    biometricDeviceId: string;
}
