'use client';

import { useMemo } from 'react';
import DataUpload from '@/components/dashboard/data-upload';
import OverviewChart from '@/components/dashboard/overview-chart';
import StatsCards from '@/components/dashboard/stats-cards';
import type { AttendanceRecord, Employee } from '@/lib/types';
import { add, format, startOfWeek } from 'date-fns';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';


export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const clientId = 'default_client';
  const branchId = 'default_branch';
  // @ts-ignore
  const propertyCode = user?.property_code || null;

  const recordsQuery = useMemoFirebase(() => {
    if (!firestore || !clientId || !branchId) return null;
    const today = format(new Date(), 'yyyy-MM-dd');
    return query(
      collection(firestore, `clients/${clientId}/branches/${branchId}/attendanceRecords`),
      where('attendanceDate', '==', today)
    );
  }, [firestore, clientId, branchId]);

  const employeesQuery = useMemoFirebase(() => {
    if (!firestore || !clientId || !branchId) return null;
    return query(collection(firestore, `clients/${clientId}/branches/${branchId}/employees`));
  }, [firestore, clientId, branchId]);


  const { data: records, isLoading: isLoadingRecords, error: recordsError } = useCollection<AttendanceRecord>(recordsQuery);
  const { data: employees, isLoading: isLoadingEmployees, error: employeesError } = useCollection<Employee>(employeesQuery);

  const isLoading = isLoadingRecords || isLoadingEmployees || isUserLoading;
  const error = recordsError || employeesError;

  const filteredEmployees = useMemo(() => {
    if (!employees || !propertyCode) return [];
    return employees.filter(emp => emp.property_code === propertyCode);
  }, [employees, propertyCode]);


  const stats = useMemo(() => {
    if (!records || !filteredEmployees) {
      return { totalEmployees: 0, lateCount: 0, totalOvertimeMinutes: 0, departmentCount: 0 };
    }
    const totalEmployees = filteredEmployees.length;
    const lateCount = records.filter(r => r.is_late).length;
    const totalOvertimeMinutes = records.reduce((sum, r) => sum + (r.overtime_minutes || 0), 0);
    const departmentCount = [...new Set(records.map(r => r.department))].length;
    
    return {
        totalEmployees,
        lateCount,
        totalOvertimeMinutes,
        departmentCount,
    };
  }, [records, filteredEmployees]);

  const weeklyData = useMemo(() => {
    if (!records || records.length === 0) return [];
    
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const data = Array.from({ length: 7 }).map((_, i) => {
        const date = add(weekStart, { days: i });
        const dateString = format(date, 'yyyy-MM-dd');
        // This is a client-side filter. For large datasets, this should be an aggregate query.
        const recordsForDay = records.filter(r => r.attendanceDate === dateString);
        return {
            name: format(date, 'EEE'),
            onTime: recordsForDay.filter(r => !r.is_late).length,
            late: recordsForDay.filter(r => r.is_late).length,
        };
    });
    return data;
  }, [records]);
  
  const handleDataUpload = () => {
    // We can add a re-fetch mechanism here if needed
    console.log("Data upload finished.");
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-start">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>
      <StatsCards stats={stats} isLoading={isLoading} propertyCode={propertyCode} />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <OverviewChart data={weeklyData} isLoading={isLoading} error={error}/>
        </div>
        <div>
          <DataUpload clientId={clientId} branchId={branchId} propertyCode={propertyCode} onUploadComplete={handleDataUpload} />
        </div>
      </div>
    </div>
  );
}
