
'use client';

import { useEffect, useState } from 'react';
import DataUpload from '@/components/dashboard/data-upload';
import OverviewChart from '@/components/dashboard/overview-chart';
import StatsCards from '@/components/dashboard/stats-cards';
import { getAttendanceStats, getWeeklyAttendance } from '@/lib/data';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';

const propertyCode = 'PROP-001'; // Hardcoded property code

export default function DashboardPage() {
  const firestore = useFirestore();

  const [stats, setStats] = useState({
    totalRecords: 0,
    lateCount: 0,
    totalOvertimeMinutes: 0,
    departmentCount: 0,
  });
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const attendanceQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'attendance_records'), where('property_code', '==', propertyCode));
  }, [firestore]);

  const { data: records, isLoading: isLoadingRecords } = useCollection(attendanceQuery);

  useEffect(() => {
    async function fetchData() {
        setIsLoading(true);
        if (records) {
            const stats = await getAttendanceStats(propertyCode);
            const weeklyData = await getWeeklyAttendance(propertyCode);
            setStats(stats);
            setWeeklyData(weeklyData);
        }
        setIsLoading(false);
    }
    fetchData();
  }, [records]);


  return (
    <div className="flex flex-col gap-8">
      <StatsCards stats={stats} isLoading={isLoadingRecords} />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <OverviewChart data={weeklyData} isLoading={isLoadingRecords} />
        </div>
        <div>
          <DataUpload />
        </div>
      </div>
    </div>
  );
}
