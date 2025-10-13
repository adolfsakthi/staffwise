import AttendanceUpload from '@/components/dashboard/attendance-upload';
import OverviewChart from '@/components/dashboard/overview-chart';
import StatsCards from '@/components/dashboard/stats-cards';
import { getAttendanceStats, getWeeklyAttendance } from '@/lib/data';

export default async function DashboardPage() {
  const stats = await getAttendanceStats();
  const weeklyData = await getWeeklyAttendance();

  return (
    <div className="flex flex-col gap-8">
      <StatsCards stats={stats} />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <OverviewChart data={weeklyData} />
        </div>
        <div>
          <AttendanceUpload />
        </div>
      </div>
    </div>
  );
}
