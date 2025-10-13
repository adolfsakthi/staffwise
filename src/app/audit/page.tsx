
'use client';
import AuditDashboard from "@/components/audit/audit-dashboard";

export default function AuditPage() {
    // Hardcoding propertyCode as auth is removed.
    return <AuditDashboard propertyCode="PROP-001" />
}
