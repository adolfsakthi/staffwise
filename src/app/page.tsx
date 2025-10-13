
'use client';

import { useEffect, useState } from 'react';
import DataUpload from '@/components/dashboard/data-upload';
import OverviewChart from '@/components/dashboard/overview-chart';
import StatsCards from '@/components/dashboard/stats-cards';
import { getAttendanceStats, getWeeklyAttendance } from '@/lib/data';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { useUserProfile } from '@/firebase/auth/use-user-profile';

export default function DashboardPage() {
  const firestore = useFirestore();
  const { userProfile, isLoading: isLoadingProfile } = useUserProfile();

  const [stats, setStats] = useState({
    totalRecords: 0,
    lateCount: 0,
    totalOvertimeMinutes: 0,
    departmentCount: 0,
  });
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const attendanceQuery = useMemoFirebase(() => {
    if (!firestore || !userProfile?.property_code) return null;
    return query(collection(firestore, 'attendance_records'), where('property_code', '==', userProfile.property_code));
  }, [firestore, userProfile]);

  const { data: records, isLoading: isLoadingRecords } = useCollection(attendanceQuery);

  useEffect(() => {
    async function fetchData() {
        setIsLoading(true);
        if (records && userProfile) {
            const stats = await getAttendanceStats(userProfile.property_code);
            const weeklyData = await getWeeklyAttendance(userProfile.property_code);
            setStats(stats);
            setWeeklyData(weeklyData);
        }
        setIsLoading(false);
    }
    fetchData();
  }, [records, userProfile]);

  const overallLoading = isLoading || isLoadingProfile || isLoadingRecords;

  return (
    <div className="flex flex-col gap-8">
      <StatsCards stats={stats} isLoading={overallLoading} />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <OverviewChart data={weeklyData} isLoading={overallLoading} />
        </div>
        <div>
          <DataUpload />
        </div>
      </div>
    </div>
  );
}
