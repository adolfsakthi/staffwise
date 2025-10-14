'use client';
import AttendanceTable from "@/components/attendance/attendance-table";

export default function AttendancePage() {
    // In a real app this would be a custom claim or from user context
    const propertyCode = 'D001';

    return <AttendanceTable propertyCode={propertyCode} />
}
