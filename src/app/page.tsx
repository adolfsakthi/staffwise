'use client';

import { useMemo } from 'react';
import DataUpload from '@/components/dashboard/data-upload';
import OverviewChart from '@/components/dashboard/overview-chart';
import StatsCards from '@/components/dashboard/stats-cards';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { AttendanceRecord } from '@/lib/types';
import { add, format, startOfWeek } from 'date-fns';

export default function DashboardPage() {
  const { propertyCode } = useUser();
  const firestore = useFirestore();

  const attendanceQuery = useMemoFirebase(() => {
    if (!firestore || !propertyCode) return null;
    return query(collection(firestore, 'attendance_records'), where('property_code', '==', propertyCode));
  }, [firestore, propertyCode]);
  
  const { data: records, isLoading } = useCollection<AttendanceRecord>(attendanceQuery);

  const stats = useMemo(() => {
    if (!records || records.length === 0) {
      return { totalRecords: 0, lateCount: 0, totalOvertimeMinutes: 0, departmentCount: 0 };
    }
    const totalRecords = records.length;
    const lateCount = records.filter(r => r.is_late).length;
    const totalOvertimeMinutes = records.reduce((sum, r) => sum + (r.overtime_minutes || 0), 0);
    const departmentCount = [...new Set(records.map(r => r.department))].length;
    
    return {
        totalRecords,
        lateCount,
        totalOvertimeMinutes,
        departmentCount,
    };
  }, [records]);

  const weeklyData = useMemo(() => {
    if (!records || records.length === 0) return [];
    
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const data = Array.from({ length: 7 }).map((_, i) => {
        const date = add(weekStart, { days: i });
        const dateString = format(date, 'yyyy-MM-dd');
        const recordsForDay = records.filter(r => r.date === dateString);
        return {
            name: format(date, 'EEE'),
            onTime: recordsForDay.filter(r => !r.is_late).length,
            late: recordsForDay.filter(r => r.is_late).length,
        };
    });
    return data;
  }, [records]);
  
  const handleDataUpload = () => {
    // The useCollection hook will automatically refresh the data.
    // This function can be used for any additional side effects after upload.
    console.log("Data upload finished, dashboard refreshed.");
  }

  return (
    <div className="flex flex-col gap-8">
      <StatsCards stats={stats} isLoading={isLoading} propertyCode={propertyCode} />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <OverviewChart data={weeklyData} isLoading={isLoading} />
        </div>
        <div>
          <DataUpload propertyCode={propertyCode} onUploadComplete={handleDataUpload} />
        </div>
      </div>
    </div>
  );
}
