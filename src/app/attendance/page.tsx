'use client';
import AttendanceTable from "@/components/attendance/attendance-table";
import { useUser } from "@/firebase";
import { Loader2 } from "lucide-react";

export default function AttendancePage() {
    const { propertyCode, isUserLoading } = useUser();

    if (isUserLoading || !propertyCode) {
        return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    return <AttendanceTable propertyCode={propertyCode} />
}
