'use client';
import AuditDashboard from "@/components/audit/audit-dashboard";
import { useMockData } from "@/lib/mock-data-store";

export default function AuditPage() {
    // In a real app this would be a custom claim or from user context
    const propertyCode = 'D001';
    const { attendanceRecords, setAttendanceRecords } = useMockData();

    return <AuditDashboard 
        propertyCode={propertyCode} 
        allRecords={attendanceRecords}
        setAllRecords={setAttendanceRecords}
    />
}
