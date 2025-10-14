'use client';

import SettingsForm from "@/components/settings/settings-form";


export default function SettingsPage() {
    const propertyCode = 'D001';

    return <SettingsForm propertyCode={propertyCode} />
}
