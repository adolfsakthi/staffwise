'use client';
import AttendanceTable from "@/components/attendance/attendance-table";
import { Loader2 } from "lucide-react";
import { useUser } from "@/firebase";

export default function AttendancePage() {
    const { user, isUserLoading } = useUser();
    
    // In a real app, these would come from user claims or a user profile document
    const clientId = 'default_client';
    const branchId = 'default_branch';

    // @ts-ignore - In a real app this would be a custom claim
    const propertyCode = user?.property_code || 'D001';

    if (isUserLoading || !propertyCode || !clientId || !branchId) {
        return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    return <AttendanceTable clientId={clientId} branchId={branchId} propertyCode={propertyCode} />
}
