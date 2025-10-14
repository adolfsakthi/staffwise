'use client';

import { useMemo, useState } from 'react';
import DataUpload from '@/components/dashboard/data-upload';
import OverviewChart from '@/components/dashboard/overview-chart';
import StatsCards from '@/components/dashboard/stats-cards';
import { useUser } from '@/firebase';
import { add, format, startOfWeek } from 'date-fns';

// Using local state and mock data as requested
const MOCK_EMPLOYEES = [
  { id: '1', property_code: 'D001', department: 'Housekeeping' },
  { id: '2', property_code: 'D001', department: 'Front Desk' },
  { id: '3', property_code: 'D002', department: 'Engineering' },
];

const MOCK_RECORDS = [
    { attendanceDate: format(new Date(), 'yyyy-MM-dd'), is_late: true, overtime_minutes: 0, department: 'Housekeeping', property_code: 'D001' },
    { attendanceDate: format(new Date(), 'yyyy-MM-dd'), is_late: false, overtime_minutes: 30, department: 'Front Desk', property_code: 'D001' },
    { attendanceDate: format(add(new Date(), {days: -1}), 'yyyy-MM-dd'), is_late: false, overtime_minutes: 0, department: 'Housekeeping', property_code: 'D001' },
];


export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  // @ts-ignore
  const propertyCode = user?.property_code || null;
  const isLoading = isUserLoading;

  const filteredEmployees = useMemo(() => {
    if (!MOCK_EMPLOYEES || !propertyCode) return [];
    return MOCK_EMPLOYEES.filter(emp => emp.property_code === propertyCode);
  }, [propertyCode]);

  const filteredRecords = useMemo(() => {
    if(!MOCK_RECORDS || !propertyCode) return [];
    return MOCK_RECORDS.filter(rec => rec.property_code === propertyCode);
  }, [propertyCode]);


  const stats = useMemo(() => {
    const totalEmployees = filteredEmployees.length;
    const lateCount = filteredRecords.filter(r => r.is_late && r.attendanceDate === format(new Date(), 'yyyy-MM-dd')).length;
    const totalOvertimeMinutes = filteredRecords.filter(r => r.attendanceDate === format(new Date(), 'yyyy-MM-dd')).reduce((sum, r) => sum + (r.overtime_minutes || 0), 0);
    const departmentCount = [...new Set(filteredEmployees.map(r => r.department))].length;
    
    return {
        totalEmployees,
        lateCount,
        totalOvertimeMinutes,
        departmentCount,
    };
  }, [filteredRecords, filteredEmployees]);

  const weeklyData = useMemo(() => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const data = Array.from({ length: 7 }).map((_, i) => {
        const date = add(weekStart, { days: i });
        const dateString = format(date, 'yyyy-MM-dd');
        const recordsForDay = filteredRecords.filter(r => r.attendanceDate === dateString);
        return {
            name: format(date, 'EEE'),
            onTime: recordsForDay.filter(r => !r.is_late).length,
            late: recordsForDay.filter(r => r.is_late).length,
        };
    });
    return data;
  }, [filteredRecords]);
  
  const handleDataUpload = () => {
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
          <OverviewChart data={weeklyData} isLoading={isLoading} />
        </div>
        <div>
          <DataUpload clientId="mock_client" branchId="mock_branch" propertyCode={propertyCode} onUploadComplete={handleDataUpload} />
        </div>
      </div>
    </div>
  );
}
