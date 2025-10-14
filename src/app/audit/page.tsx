'use client';
import AuditDashboard from "@/components/audit/audit-dashboard";

export default function AuditPage() {
    // In a real app this would be a custom claim or from user context
    const propertyCode = 'D001';

    return <AuditDashboard propertyCode={propertyCode} />
}
