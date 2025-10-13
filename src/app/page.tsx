
'use client';

import { useEffect, useState } from 'react';
import DataUpload from '@/components/dashboard/data-upload';
import OverviewChart from '@/components/dashboard/overview-chart';
import StatsCards from '@/components/dashboard/stats-cards';
import type { AttendanceRecord } from '@/lib/types';
import { getAttendanceStats, getWeeklyAttendance } from '@/lib/data';

const propertyCode = 'D001'; // Hardcoded property code

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);

  const [stats, setStats] = useState({
    totalRecords: 0,
    lateCount: 0,
    totalOvertimeMinutes: 0,
    departmentCount: 0,
  });
  const [weeklyData, setWeeklyData] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
        setIsLoading(true);
        try {
            const [statsData, weekly] = await Promise.all([
                getAttendanceStats(propertyCode),
                getWeeklyAttendance(propertyCode)
            ]);
            setStats(statsData);
            setWeeklyData(weekly);
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
            // Set to default empty state on error
            setStats({ totalRecords: 0, lateCount: 0, totalOvertimeMinutes: 0, departmentCount: 0 });
            setWeeklyData([]);
        } finally {
            setIsLoading(false);
        }
    }
    fetchData();
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <StatsCards stats={stats} isLoading={isLoading} />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <OverviewChart data={weeklyData} isLoading={isLoading} />
        </div>
        <div>
          <DataUpload />
        </div>
      </div>
    </div>
  );
}
