
'use client';
import AuditDashboard from "@/components/audit/audit-dashboard";
import { useUserProfile } from "@/firebase/auth/use-user-profile";
import { Loader2 } from "lucide-react";

export default function AuditPage() {
    const { userProfile, isLoading } = useUserProfile();

    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    if (!userProfile) {
        return <div>User profile not found.</div>
    }

    return <AuditDashboard propertyCode={userProfile.property_code} />
}
