'use client';
import AuditDashboard from "@/components/audit/audit-dashboard";
import { Loader2 } from "lucide-react";
import { useUser } from "@/firebase";

export default function AuditPage() {
    const { user, isUserLoading } = useUser();

    // @ts-ignore
    const propertyCode = user?.property_code || null;

    if (isUserLoading || !propertyCode) {
        return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    return <AuditDashboard propertyCode={propertyCode} />
}
