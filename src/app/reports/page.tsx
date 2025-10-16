
'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from '@/components/ui/card';
  import { Button } from '@/components/ui/button';
  import { Download, FileText, CalendarRange, Building, User, Clock, LineChart } from 'lucide-react';
  import Link from 'next/link';
  import { useMockData } from '@/lib/mock-data-store';
  import * as XLSX from 'xlsx';
  import { format } from 'date-fns';
  
  export default function ReportsPage() {
    const { attendanceRecords } = useMockData();

    const handleDownload = () => {
        const dataToExport = attendanceRecords.map(record => ({
            'Date': record.attendanceDate,
            'Employee Name': record.employee_name,
            'Employee Email': record.email,
            'Department': record.department,
            'Status': record.is_absent ? 'Absent' : (record.is_on_leave ? 'On Leave' : 'Present'),
            'Entry Time': record.entry_time || 'N/A',
            'Exit Time': record.exit_time || 'N/A',
            'Is Late': record.is_late ? `Yes (${record.late_by_minutes} min)` : 'No',
            'Overtime': record.overtime_minutes ? `${record.overtime_minutes} min` : '0 min',
            'Early Going': record.early_going_minutes ? `${record.early_going_minutes} min` : '0 min',
            'Audited': record.is_audited ? 'Yes' : 'No',
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance Report");
        
        // Auto-size columns
        const objectMaxLength = dataToExport.length > 0 ? Object.keys(dataToExport[0] || {}).map(key => key.length) : [];
        const wscols = objectMaxLength.map((w, i) => ({ width: Math.max(w, ...dataToExport.map(r => r[Object.keys(r)[i] as keyof typeof r]?.toString().length || 0)) + 2 }));
        worksheet['!cols'] = wscols;

        XLSX.writeFile(workbook, `AttendanceReport_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    }

    const reportTypes = [
        { title: 'Daily Attendance Summary', description: 'Download a summary of attendance for all employees for a specific day.', icon: Download, onClick: handleDownload, href: '#' },
        { title: 'Monthly Late Report', description: 'Detailed report of all late entries for the selected month.', icon: Clock, href: '/reports/monthly-late' },
        { title: 'Overtime Analysis', description: 'Breakdown of overtime hours by department and employee.', icon: LineChart, href: '/reports/overtime-analysis' },
        { title: 'Department-wise Consolidated Report', description: 'Consolidated audit report for each department.', icon: Building, href: '/reports/department-consolidated' },
        { title: 'Employee Attendance History', description: 'Complete attendance history for a single employee.', icon: User, href: '/reports/employee-history' },
    ]

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Generate Reports</CardTitle>
                    <CardDescription>
                        Select a report type or generate a full Excel export of the attendance data.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 sm:flex-row">
                    <div className="flex items-center gap-2 rounded-md border p-2 text-muted-foreground">
                        <CalendarRange/>
                        <span>Date Range: Current Month</span>
                    </div>
                     <Button onClick={handleDownload}>
                        <Download className="mr-2" />
                        Download Full Report (Excel)
                    </Button>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {reportTypes.map(report => {
                    const CardComponent = (
                        <Card className="h-full">
                            <CardHeader className="flex flex-row items-start gap-4">
                                <report.icon className="size-8 text-primary" />
                                <div>
                                    <CardTitle className="text-lg">{report.title}</CardTitle>
                                    <CardDescription>{report.description}</CardDescription>
                                </div>
                            </CardHeader>
                        </Card>
                    );

                    if (report.onClick) {
                        return (
                             <button key={report.title} onClick={report.onClick} className="block text-left hover:shadow-lg hover:-translate-y-1 transition-transform w-full">
                                {CardComponent}
                            </button>
                        );
                    }
                    
                    return (
                        <Link key={report.title} href={report.href} className="block hover:shadow-lg hover:-translate-y-1 transition-transform">
                            {CardComponent}
                        </Link>
                    );
                })}
            </div>
      </div>
    );
  }
  
