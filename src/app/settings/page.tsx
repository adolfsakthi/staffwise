import SettingsForm from "@/components/settings/settings-form";

export default function SettingsPage() {
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

    return <SettingsForm currentSettings={currentSettings} />
}
