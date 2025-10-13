'use client';
import AuditDashboard from "@/components/audit/audit-dashboard";
import { Loader2 } from "lucide-react";

// Mock user for frontend-only mode
const useUser = () => ({ propertyCode: 'D001', isUserLoading: false });

export default function AuditPage() {
    const { propertyCode, isUserLoading } = useUser();

    if (isUserLoading || !propertyCode) {
        return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    return <AuditDashboard propertyCode={propertyCode} />
}
