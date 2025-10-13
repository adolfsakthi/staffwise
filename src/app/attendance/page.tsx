'use client';
import AttendanceTable from "@/components/attendance/attendance-table";
import { Loader2 } from "lucide-react";

// Mock user for frontend-only mode
const useUser = () => ({ propertyCode: 'D001', isUserLoading: false });

export default function AttendancePage() {
    const { propertyCode, isUserLoading } = useUser();

    if (isUserLoading || !propertyCode) {
        return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    return <AttendanceTable propertyCode={propertyCode} />
}
