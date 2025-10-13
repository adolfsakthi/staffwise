'use client';

import { useMemo, useState, useEffect } from 'react';
import DataUpload from '@/components/dashboard/data-upload';
import OverviewChart from '@/components/dashboard/overview-chart';
import StatsCards from '@/components/dashboard/stats-cards';
import type { AttendanceRecord } from '@/lib/types';
import { add, format, startOfWeek } from 'date-fns';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { seedDatabase } from '@/lib/seed'; // Assuming seed functionality is moved here
import { Button } from '@/components/ui/button';


export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  // In a real app, these would come from user claims or a user profile document
  const clientId = 'default_client';
  const branchId = 'default_branch';
  // @ts-ignore
  const propertyCode = user?.property_code || 'D001';

  const recordsQuery = useMemoFirebase(() => {
    if (!firestore || !clientId || !branchId) return null;
    return query(collection(firestore, `clients/${clientId}/branches/${branchId}/attendanceRecords`), where('property_code', '==', propertyCode));
  }, [firestore, clientId, branchId, propertyCode]);
  
  const { data: records, isLoading, error } = useCollection<AttendanceRecord>(recordsQuery);

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
    console.log("Data upload finished, dashboard will refresh automatically.");
  }
  
  const handleSeed = async () => {
    if (firestore) {
      await seedDatabase(firestore, clientId, branchId);
      alert('Database has been seeded with initial data.');
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-start">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button onClick={handleSeed} variant="outline">Initialize Database Collections</Button>
      </div>
      <StatsCards stats={stats} isLoading={isLoading || isUserLoading} propertyCode={propertyCode} />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <OverviewChart data={weeklyData} isLoading={isLoading || isUserLoading} error={error}/>
        </div>
        <div>
          <DataUpload clientId={clientId} branchId={branchId} propertyCode={propertyCode} onUploadComplete={handleDataUpload} />
        </div>
      </div>
    </div>
  );
}
