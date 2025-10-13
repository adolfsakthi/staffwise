
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

export type Device = {
  id: string;
  property_code: string;
  name: string;
  model: string;
  ip: string;
  status: 'online' | 'offline';
  branch: string;
};

export type LiveLog = {
    id: string;
    property_code: string;
    type: 'late' | 'overtime' | 'early' | 'on_time';
    employee: string;
    department: string;
    time: string;
    deviation: number;
};

export type User = {
  id: string;
  property_code: string;
  displayName: string;
  email: string;
  role: string;
  uid: string;
};

export type Role = {
  id: string;
  property_code: string;
  name: string;
  permissions: string[];
};
