
'use client';

import { useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Printer, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { useMockData } from '@/lib/mock-data-store';
import type { AttendanceRecord } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type DepartmentReport = {
    name: string;
    summary: {
        present: number;
        absent: number;
        late: number;
        overtime: string;
    };
    records: AttendanceRecord[];
}


export default function DepartmentConsolidatedReportPage() {
  const { attendanceRecords } = useMockData();
  const [dateFilter, setDateFilter] = useState<string>(format(new Date(), 'yyyy-MM-dd'));

  const reportData = useMemo(() => {
    const selectedDateRecords = attendanceRecords.filter(r => r.attendanceDate === dateFilter);

    const departments = selectedDateRecords.reduce((acc, record) => {
        if (!record.department) return acc;
        if (!acc[record.department]) {
            acc[record.department] = {
                name: record.department,
                summary: { present: 0, absent: 0, late: 0, overtime: 0 },
                records: [],
            };
        }

        if (record.is_present) acc[record.department].summary.present++;
        if (record.is_absent) acc[record.department].summary.absent++;
        if (record.is_late) acc[record.department].summary.late++;
        if (record.overtime_minutes) acc[record.department].summary.overtime += record.overtime_minutes;
        
        acc[record.department].records.push(record);
        
        return acc;
    }, {} as Record<string, any>);


    return Object.values(departments).map(dept => ({
        ...dept,
        summary: {
            ...dept.summary,
            overtime: `${dept.summary.overtime} mins`
        }
    }));

  }, [attendanceRecords, dateFilter]);
    
  const handlePrint = () => {
    window.print();
  }
  
  const reportDate = dateFilter ? new Date(dateFilter.replace(/-/g, '/')) : new Date();

  return (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 no-print">
            <Button asChild variant="outline">
                <Link href="/reports">
                    <ArrowLeft className="mr-2" />
                    Back to Reports
                </Link>
            </Button>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="space-y-1">
                    <Label htmlFor="date-filter" className="text-sm">Select Report Date</Label>
                    <Input 
                        id="date-filter"
                        type="date"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="w-full sm:w-auto"
                    />
                </div>
                <Button onClick={handlePrint} className="w-full sm:w-auto">
                    <Printer className="mr-2" /> Print Report
                </Button>
            </div>
        </div>

        <div className="bg-muted/20 p-4 sm:p-6 lg:p-8 rounded-xl printable-content">
            <div className="max-w-4xl mx-auto">
                <div style={{ background: 'linear-gradient(to right, hsl(var(--primary)), hsl(var(--primary)/0.8))' }} className="rounded-t-lg p-6 text-white shadow-lg">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">Consolidated Audit Report</h1>
                        <p className="text-sm opacity-90">Department-wise Summary for {format(reportDate, 'MMMM do, yyyy')}</p>
                    </div>
                </div>
                </div>

                <div className="space-y-6 bg-card p-6 rounded-b-lg border border-t-0 shadow-lg">
                
                {reportData.length > 0 ? reportData.map((dept) => (
                    <Card key={dept.name} className="overflow-hidden">
                    <CardHeader className="bg-muted/50 border-b">
                        <CardTitle className="text-xl">{dept.name} Department</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border">
                            <div className="p-4 bg-card">
                                <p className="text-sm text-muted-foreground">Present</p>
                                <p className="text-2xl font-bold">{dept.summary.present}</p>
                            </div>
                            <div className="p-4 bg-card">
                                <p className="text-sm text-muted-foreground">Absent</p>
                                <p className="text-2xl font-bold">{dept.summary.absent}</p>
                            </div>
                            <div className="p-4 bg-card">
                                <p className="text-sm text-muted-foreground">Late</p>
                                <p className="text-2xl font-bold">{dept.summary.late}</p>
                            </div>
                            <div className="p-4 bg-card">
                                <p className="text-sm text-muted-foreground">Overtime</p>
                                <p className="text-2xl font-bold">{dept.summary.overtime}</p>
                            </div>
                        </div>
                        <div className="p-4">
                        <h4 className="font-medium mb-2">Individual Records</h4>
                        <div className="overflow-x-auto rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                    <TableHead>Employee</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Entry</TableHead>
                                    <TableHead>Exit</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {dept.records.map((rec) => (
                                        <TableRow key={rec.id}>
                                            <TableCell className="font-medium">{rec.employee_name}</TableCell>
                                            <TableCell>
                                                {rec.is_absent ? <Badge variant="destructive">Absent</Badge> : 
                                                rec.is_on_leave ? <Badge variant="outline">On Leave</Badge> :
                                                rec.is_late ? <Badge variant="destructive">Late ({rec.late_by_minutes}m)</Badge> :
                                                <Badge variant="secondary">On Time</Badge>
                                                }
                                            </TableCell>
                                            <TableCell>{rec.entry_time || 'N/A'}</TableCell>
                                            <TableCell>{rec.exit_time || 'N/A'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        </div>
                    </CardContent>
                    </Card>
                )) : (
                    <div className="text-center py-12 text-muted-foreground">
                        No attendance data found for the selected date.
                    </div>
                )}
                </div>
            </div>
        </div>
    </div>
  );
}
