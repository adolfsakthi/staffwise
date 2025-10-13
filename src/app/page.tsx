
'use client';

import { useEffect, useState } from 'react';
import DataUpload from '@/components/dashboard/data-upload';
import OverviewChart from '@/components/dashboard/overview-chart';
import StatsCards from '@/components/dashboard/stats-cards';
import type { AttendanceRecord } from '@/lib/types';
import { MOCK_ATTENDANCE_RECORDS } from '@/lib/mock-data';

// Helper functions from date-fns to avoid importing them on the client if not needed elsewhere
import { add, format, startOfWeek } from 'date-fns';

const propertyCode = 'D001'; // Hardcoded property code

export default function DashboardPage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [stats, setStats] = useState({
    totalRecords: 0,
    lateCount: 0,
    totalOvertimeMinutes: 0,
    departmentCount: 0,
  });
  const [weeklyData, setWeeklyData] = useState<any[]>([]);

  useEffect(() => {
    setIsLoading(true);
    // Simulate fetching data
    setTimeout(() => {
        const propertyRecords = MOCK_ATTENDANCE_RECORDS.filter(r => r.property_code === propertyCode);
        setRecords(propertyRecords);

        // Process stats and weekly data from the mock records
        const totalRecords = propertyRecords.length;
        const lateCount = propertyRecords.filter(r => r.is_late).length;
        const totalOvertimeMinutes = propertyRecords.reduce((sum, r) => sum + r.overtime_minutes, 0);
        const departmentCount = [...new Set(propertyRecords.map(r => r.department))].length;
        setStats({ totalRecords, lateCount, totalOvertimeMinutes, departmentCount });
        
        const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
        const weekly = Array.from({ length: 7 }).map((_, i) => {
            const date = add(weekStart, { days: i });
            const recordsForDay = propertyRecords.filter(r => r.date === format(date, 'yyyy-MM-dd'));
            return {
                name: format(date, 'EEE'),
                onTime: recordsForDay.filter(r => !r.is_late).length,
                late: recordsForDay.filter(r => r.is_late).length,
            };
        });
        setWeeklyData(weekly);

        setIsLoading(false);
    }, 500);
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
