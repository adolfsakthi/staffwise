import SmartScheduler from "@/components/schedule/smart-scheduler";
import { getDepartments } from "@/lib/data";

export default async function SchedulePage() {
    const departments = await getDepartments();
    return <SmartScheduler departments={departments} />
}