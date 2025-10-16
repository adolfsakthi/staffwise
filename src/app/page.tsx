
'use client';

import { useMemo } from 'react';
import OverviewChart from '@/components/dashboard/overview-chart';
import StatsCards from '@/components/dashboard/stats-cards';
import { add, format, startOfWeek } from 'date-fns';
import OfflineDevices from '@/components/dashboard/offline-devices';
import GenderChart from '@/components/dashboard/gender-chart';
import AttendancePieChart from '@/components/dashboard/attendance-pie-chart';
import EmployeeReportFilters from '@/components/dashboard/employee-report-filters';
import AbsenteeTables from '@/components/dashboard/absentee-tables';
import { useMockData } from '@/lib/mock-data-store';


export default function DashboardPage() {
  const propertyCode = 'D001';
  const isLoading = false;
  const { employees, attendanceRecords, devices } = useMockData();

  const filteredEmployees = useMemo(() => {
    if (!employees || !propertyCode) return [];
    return employees.filter(emp => emp.property_code === propertyCode);
  }, [employees, propertyCode]);

  const filteredRecords = useMemo(() => {
    if(!attendanceRecords || !propertyCode) return [];
    return attendanceRecords.filter(rec => rec.property_code === propertyCode);
  }, [attendanceRecords, propertyCode]);

  const filteredDevices = useMemo(() => {
    if(!devices || !propertyCode) return [];
    return devices.filter(dev => dev.property_code === propertyCode);
  }, [devices, propertyCode]);


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
    const male = filteredEmployees.filter(e => (e as any).gender === 'Male').length;
    const female = filteredEmployees.filter(e => (e as any).gender === 'Female').length;
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
