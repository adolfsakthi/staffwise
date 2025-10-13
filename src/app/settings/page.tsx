import SettingsForm from "@/components/settings/settings-form";
import { getDepartments } from "@/lib/data";

export default async function SettingsPage() {
    const departments = await getDepartments();
    // In a real app, you would fetch current settings here
    const currentSettings = {
        globalGraceTime: 15,
        departmentGraceTimes: {
            'Engineering': 10
        },
        autoAudit: {
            enabled: true,
            time: '00:00'
        }
    };

    return <SettingsForm departments={departments} currentSettings={currentSettings} />
}