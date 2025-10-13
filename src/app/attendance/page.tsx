
'use client';
import AttendanceTable from "@/components/attendance/attendance-table";

export default function AttendancePage() {
    // Hardcoding propertyCode as auth is removed.
    return <AttendanceTable propertyCode="PROP-001" />
}
