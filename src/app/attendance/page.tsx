
import AttendanceTable from "@/components/attendance/attendance-table";
import { getDepartments } from "@/lib/data";

export default async function AttendancePage() {
    const departments = await getDepartments();

    return <AttendanceTable departments={departments} />
}
