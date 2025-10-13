
'use client';

import { useEffect, useState } from 'react';
import DataUpload from '@/components/dashboard/data-upload';
import OverviewChart from '@/components/dashboard/overview-chart';
import StatsCards from '@/components/dashboard/stats-cards';
import { useFirestore, useMemoFirebase } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query, where } from 'firebase/firestore';
import type { AttendanceRecord } from '@/lib/types';
import { getWeeklyAttendance, getAttendanceStats } from '@/lib/data';


const propertyCode = 'D001'; // Hardcoded property code

export default function DashboardPage() {
  const firestore = useFirestore();
  
  const attendanceQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'attendance_records'),
      where('property_code', '==', propertyCode)
    );
  }, [firestore, propertyCode]);
  
  const { data: records, isLoading, error } = useCollection<AttendanceRecord>(attendanceQuery);

  const [stats, setStats] = useState({
    totalRecords: 0,
    lateCount: 0,
    totalOvertimeMinutes: 0,
    departmentCount: 0,
  });
  const [weeklyData, setWeeklyData] = useState<any[]>([]);

  useEffect(() => {
    if (records) {
        const totalRecords = records.length;
        const lateCount = records.filter(r => r.is_late).length;
        const totalOvertimeMinutes = records.reduce((sum, r) => sum + r.overtime_minutes, 0);
        const departmentCount = [...new Set(records.map(r => r.department))].length;
        setStats({ totalRecords, lateCount, totalOvertimeMinutes, departmentCount });
        
        // This logic is simple enough to run on the client with the fetched records
        const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
        const weekly = Array.from({ length: 7 }).map((_, i) => {
            const date = add(weekStart, { days: i });
            const recordsForDay = records.filter(r => r.date === format(date, 'yyyy-MM-dd'));
            return {
                name: format(date, 'EEE'),
                onTime: recordsForDay.filter(r => !r.is_late).length,
                late: recordsForDay.filter(r => r.is_late).length,
            };
        });
        setWeeklyData(weekly);
    }
  }, [records]);

  if (error) {
    return <p className='text-destructive'>Error loading dashboard: {error.message}</p>
  }

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

// Helper functions from date-fns to avoid importing them on the client if not needed elsewhere
import { add, format, startOfWeek } from 'date-fns';
