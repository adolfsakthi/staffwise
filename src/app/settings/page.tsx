'use client';

import SettingsForm from "@/components/settings/settings-form";
import { useUser } from "@/firebase";
import { Loader2 } from "lucide-react";


export default function SettingsPage() {
    const { user, isUserLoading } = useUser();
    const clientId = 'default_client';

    if (isUserLoading) {
        return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    // @ts-ignore
    const propertyCode = user?.property_code || 'D001';

    return <SettingsForm clientId={clientId} propertyCode={propertyCode} />
}
