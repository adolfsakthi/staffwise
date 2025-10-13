import AuditDashboard from "@/components/audit/audit-dashboard";
import { getAttendanceRecords } from "@/lib/data";

export default async function AuditPage() {
    const unauditedRecords = await getAttendanceRecords({ audited: false });
    return <AuditDashboard initialRecords={unauditedRecords} />
}