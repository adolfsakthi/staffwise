import SettingsForm from "@/components/settings/settings-form";

export default function SettingsPage() {
    // The SettingsForm component now manages its own state internally.
    // In a real application, you would fetch settings here and pass them as props,
    // or the form itself would fetch them.
    return <SettingsForm />
}
