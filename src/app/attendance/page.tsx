import AttendanceTable from "@/components/attendance/attendance-table";
import { getAttendanceRecords, getDepartments } from "@/lib/data";

export default async function AttendancePage() {
    const initialRecords = await getAttendanceRecords();
    const departments = await getDepartments();

    return <AttendanceTable initialRecords={initialRecords} departments={departments} />
}