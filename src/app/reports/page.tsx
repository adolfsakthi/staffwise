
'use client';

import { useState, useMemo } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from '@/components/ui/card';
  import { Button } from '@/components/ui/button';
  import { Download, FileText, Building, User, Clock, LineChart, Calendar } from 'lucide-react';
  import Link from 'next/link';
  import { useMockData } from '@/lib/mock-data-store';
  import * as XLSX from 'xlsx';
  import { format, startOfMonth, endOfMonth } from 'date-fns';
  import { Input } from '@/components/ui/input';
  import { Label } from '@/components/ui/label';
  import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
  
  export default function ReportsPage() {
    const { attendanceRecords } = useMockData();
    const [reportType, setReportType] = useState('full_attendance');
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date()),
    });

    const handleDownload = () => {
        if (!dateRange?.from || !dateRange?.to) {
            alert('Please select a date range.');
            return;
        }

        const filteredRecords = attendanceRecords.filter(record => {
            const recordDate = new Date(record.attendanceDate);
            return recordDate >= dateRange.from! && recordDate <= dateRange.to!;
        });

        let dataToExport: any[] = [];
        let fileName = `Report_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;

        switch (reportType) {
            case 'late_entry':
                dataToExport = filteredRecords
                    .filter(r => r.is_late)
                    .map(r => ({
                        'Date': r.attendanceDate,
                        'Employee Name': r.employee_name,
                        'Department': r.department,
                        'Punch In Time': r.entry_time,
                        'Late By (min)': r.late_by_minutes,
                    }));
                fileName = `LateEntries_${format(dateRange.from, 'yyyy-MM-dd')}_to_${format(dateRange.to, 'yyyy-MM-dd')}.xlsx`;
                break;
            case 'overtime':
                dataToExport = filteredRecords
                    .filter(r => (r.overtime_minutes || 0) > 0)
                    .map(r => ({
                        'Date': r.attendanceDate,
                        'Employee Name': r.employee_name,
                        'Department': r.department,
                        'Punch Out Time': r.exit_time,
                        'Overtime (min)': r.overtime_minutes,
                    }));
                fileName = `Overtime_${format(dateRange.from, 'yyyy-MM-dd')}_to_${format(dateRange.to, 'yyyy-MM-dd')}.xlsx`;
                break;
            default: // full_attendance
                dataToExport = filteredRecords.map(record => ({
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
                fileName = `FullAttendance_${format(dateRange.from, 'yyyy-MM-dd')}_to_${format(dateRange.to, 'yyyy-MM-dd')}.xlsx`;
                break;
        }

        if (dataToExport.length === 0) {
            alert('No data found for the selected criteria.');
            return;
        }

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
        
        const objectMaxLength = Object.keys(dataToExport[0] || {}).map(key => key.length);
        const wscols = objectMaxLength.map((w, i) => ({ width: Math.max(w, ...dataToExport.map(r => r[Object.keys(r)[i] as keyof typeof r]?.toString().length || 0)) + 2 }));
        worksheet['!cols'] = wscols;

        XLSX.writeFile(workbook, fileName);
    }

    const reportTypes = [
        { title: 'Monthly Late Report', description: 'Detailed report of all late entries for the selected month.', icon: Clock, href: '/reports/monthly-late' },
        { title: 'Overtime Analysis', description: 'Breakdown of overtime hours by department and employee.', icon: LineChart, href: '/reports/overtime-analysis' },
        { title: 'Department-wise Consolidated Report', description: 'Consolidated audit report for each department.', icon: Building, href: '/reports/department-consolidated' },
        { title: 'Employee Attendance History', description: 'Complete attendance history for a single employee.', icon: User, href: '/reports/employee-history' },
    ]

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Generate & Download Reports</CardTitle>
                    <CardDescription>
                        Select a report type and date range to download a customized Excel report.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                         <div className="space-y-2">
                            <Label>Date Range</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                <Button
                                    id="date"
                                    variant={"outline"}
                                    className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !dateRange && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateRange?.from ? (
                                    dateRange.to ? (
                                        <>
                                        {format(dateRange.from, "LLL dd, y")} -{" "}
                                        {format(dateRange.to, "LLL dd, y")}
                                        </>
                                    ) : (
                                        format(dateRange.from, "LLL dd, y")
                                    )
                                    ) : (
                                    <span>Pick a date</span>
                                    )}
                                </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                <CalendarComponent
                                    initialFocus
                                    mode="range"
                                    defaultMonth={dateRange?.from}
                                    selected={dateRange}
                                    onSelect={setDateRange}
                                    numberOfMonths={2}
                                />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="report-type">Report Type</Label>
                            <Select value={reportType} onValueChange={setReportType}>
                                <SelectTrigger id="report-type">
                                    <SelectValue placeholder="Select report type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="full_attendance">Full Attendance Report</SelectItem>
                                    <SelectItem value="late_entry">Late Entry Report</SelectItem>
                                    <SelectItem value="overtime">Overtime Report</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="flex items-end space-y-2">
                            <Button onClick={handleDownload} className="w-full">
                                <Download className="mr-2" />
                                Download Report
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {reportTypes.map(report => (
                    <Link key={report.title} href={report.href} className="block hover:shadow-lg hover:-translate-y-1 transition-transform">
                        <Card className="h-full">
                            <CardHeader className="flex flex-row items-start gap-4">
                                <report.icon className="size-8 text-primary" />
                                <div>
                                    <CardTitle className="text-lg">{report.title}</CardTitle>
                                    <CardDescription>{report.description}</CardDescription>
                                </div>
                            </CardHeader>
                        </Card>
                    </Link>
                ))}
            </div>
      </div>
    );
  }
  
