
'use client';

import { useMemo, useState } from 'react';
import OverviewChart from '@/components/dashboard/overview-chart';
import StatsCards from '@/components/dashboard/stats-cards';
import { add, format, startOfWeek } from 'date-fns';
import OfflineDevices from '@/components/dashboard/offline-devices';
import GenderChart from '@/components/dashboard/gender-chart';
import AttendancePieChart from '@/components/dashboard/attendance-pie-chart';
import EmployeeReportFilters from '@/components/dashboard/employee-report-filters';
import AbsenteeTables from '@/components/dashboard/absentee-tables';

// Using local state and mock data as requested
const MOCK_EMPLOYEES = [
  { id: '1', property_code: 'D001', department: 'Housekeeping', gender: 'Female' },
  { id: '2', property_code: 'D001', department: 'Front Desk', gender: 'Male' },
  { id: '3', property_code: 'D002', department: 'Engineering', gender: 'Male' },
  { id: '4', property_code: 'D001', department: 'Engineering', gender: 'Male' },

];

const MOCK_RECORDS = [
    { id: 'rec1', attendanceDate: format(new Date(), 'yyyy-MM-dd'), is_late: true, is_present: true, is_absent: false, is_on_leave: false, early_going_minutes: 0, overtime_minutes: 0, department: 'Housekeeping', property_code: 'D001' },
    { id: 'rec2', attendanceDate: format(new Date(), 'yyyy-MM-dd'), is_late: false, is_present: true, is_absent: false, is_on_leave: false, early_going_minutes: 0, overtime_minutes: 30, department: 'Front Desk', property_code: 'D001' },
    { id: 'rec3', attendanceDate: format(add(new Date(), {days: -1}), 'yyyy-MM-dd'), is_late: false, is_present: true, is_absent: false, is_on_leave: false, early_going_minutes: 15, overtime_minutes: 0, department: 'Housekeeping', property_code: 'D001' },
    { id: 'rec4', attendanceDate: format(new Date(), 'yyyy-MM-dd'), is_late: false, is_present: false, is_absent: true, is_on_leave: false, early_going_minutes: 0, overtime_minutes: 0, department: 'Engineering', property_code: 'D001' },
    { id: 'rec5', attendanceDate: format(new Date(), 'yyyy-MM-dd'), is_late: false, is_present: false, is_absent: false, is_on_leave: true, early_going_minutes: 0, overtime_minutes: 0, department: 'Engineering', property_code: 'D001' },

];

const MOCK_DEVICES = [
    { id: '1', deviceName: 'Main Entrance', status: 'online', property_code: 'D001' },
    { id: '2', deviceName: 'Staff Entrance', status: 'offline', property_code: 'D001', serialNumber: 'CKUH211960123', lastPing: '2023-04-11 16:06:05' },
    { id: '3', deviceName: 'Rooftop Bar', status: 'offline', property_code: 'D002', serialNumber: 'CKUH211960124', lastPing: '2023-04-11 16:05:00' },
]


export default function DashboardPage() {
  const propertyCode = 'D001';
  const isLoading = false;

  const filteredEmployees = useMemo(() => {
    if (!MOCK_EMPLOYEES || !propertyCode) return [];
    return MOCK_EMPLOYEES.filter(emp => emp.property_code === propertyCode);
  }, [propertyCode]);

  const filteredRecords = useMemo(() => {
    if(!MOCK_RECORDS || !propertyCode) return [];
    return MOCK_RECORDS.filter(rec => rec.property_code === propertyCode);
  }, [propertyCode]);

  const filteredDevices = useMemo(() => {
    if(!MOCK_DEVICES || !propertyCode) return [];
    return MOCK_DEVICES.filter(dev => dev.property_code === propertyCode);
  }, [propertyCode]);


  const stats = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const recordsToday = filteredRecords.filter(r => r.attendanceDate === today);
    
    return {
        totalEmployees: filteredEmployees.length,
        lateCount: recordsToday.filter(r => r.is_late).length,
        totalOvertimeMinutes: recordsToday.reduce((sum, r) => sum + (r.overtime_minutes || 0), 0),
        departmentCount: [...new Set(filteredEmployees.map(r => r.department))].length,
        activeDevices: filteredDevices.filter(d => d.status === 'online').length,
        presentCount: recordsToday.filter(r => r.is_present).length,
        absentCount: recordsToday.filter(r => r.is_absent).length,
        leaveCount: recordsToday.filter(r => r.is_on_leave).length,
        earlyGoingCount: recordsToday.filter(r => (r.early_going_minutes || 0) > 0).length,
    };
  }, [filteredRecords, filteredEmployees, filteredDevices]);

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

  const genderData = useMemo(() => {
    const male = filteredEmployees.filter(e => e.gender === 'Male').length;
    const female = filteredEmployees.filter(e => e.gender === 'Female').length;
    return [
      { name: 'Male', value: male, fill: 'hsl(var(--chart-3))' },
      { name: 'Female', value: female, fill: 'hsl(var(--chart-4))' },
    ];
  }, [filteredEmployees]);

  const pieChartData = useMemo(() => {
      return [
          { name: 'Present', value: stats.presentCount, fill: 'hsl(var(--chart-1))' },
          { name: 'Absent', value: stats.absentCount, fill: 'hsl(var(--chart-2))' },
      ]
  }, [stats]);
  

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-start">
        <h1 className="text-3xl font-bold">Attendance</h1>
      </div>
      <StatsCards stats={stats} isLoading={isLoading} />
      
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
          <AttendancePieChart data={pieChartData} isLoading={isLoading} />
          <GenderChart data={genderData} isLoading={isLoading} />
        </div>
        <OfflineDevices devices={filteredDevices.filter(d => d.status === 'offline')} isLoading={isLoading} />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
         <div className="lg:col-span-3">
          <OverviewChart data={weeklyData} isLoading={isLoading} />
        </div>
      </div>
      
      <div>
        <EmployeeReportFilters />
        <AbsenteeTables />
      </div>
    </div>
  );
}
