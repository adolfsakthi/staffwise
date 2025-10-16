
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
import { useMockData } from '@/lib/mock-data-store';
import { format, getMonth, getYear, setMonth, setYear } from 'date-fns';
import { LineChart, ArrowLeft, Printer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';


const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString());
const months = Array.from({ length: 12 }, (_, i) => ({
  value: i.toString(),
  label: format(new Date(0, i), 'MMMM'),
}));

export default function OvertimeAnalysisPage() {
    const { attendanceRecords, employees } = useMockData();
    const [selectedMonth, setSelectedMonth] = useState<string>(getMonth(new Date()).toString());
    const [selectedYear, setSelectedYear] = useState<string>(getYear(new Date()).toString());

    const overtimeRecords = useMemo(() => {
        const records = attendanceRecords.filter(r => {
            const recordDate = new Date(r.attendanceDate);
            return (r.overtime_minutes || 0) > 0 &&
                   getMonth(recordDate).toString() === selectedMonth &&
                   getYear(recordDate).toString() === selectedYear;
        });

        const byEmployee = records.reduce((acc, record) => {
            if (!record.employeeId) return acc;
            if (!acc[record.employeeId]) {
                const employee = employees.find(e => e.id === record.employeeId);
                acc[record.employeeId] = {
                    name: employee ? `${employee.firstName} ${employee.lastName}` : record.employee_name || 'Unknown',
                    department: employee?.department,
                    totalMinutes: 0,
                    count: 0,
                };
            }
            acc[record.employeeId].totalMinutes += record.overtime_minutes || 0;
            acc[record.employeeId].count += 1;
            return acc;
        }, {} as Record<string, {name: string, department?: string, totalMinutes: number, count: number}>);

        return Object.values(byEmployee).sort((a,b) => b.totalMinutes - a.totalMinutes);

    }, [attendanceRecords, employees, selectedMonth, selectedYear]);

    const handlePrint = () => {
        window.print();
    }
    
    const reportDate = setYear(setMonth(new Date(), parseInt(selectedMonth)), parseInt(selectedYear));

  return (
     <div className="space-y-6">
        <Card className="no-print">
            <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                    <div className="flex items-center gap-3">
                        <LineChart className="size-8 text-primary" />
                        <div>
                            <CardTitle>Overtime Analysis Report</CardTitle>
                            <CardDescription>
                                A breakdown of overtime hours by employee.
                            </CardDescription>
                        </div>
                    </div>
                    <Button asChild variant="outline" className="w-full sm:w-auto">
                        <Link href="/reports">
                            <ArrowLeft className="mr-2" />
                            Back to Reports
                        </Link>
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                    <div className="flex-1 space-y-2">
                        <Label htmlFor="month-filter">Month</Label>
                         <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                            <SelectTrigger id="month-filter">
                                <SelectValue placeholder="Select month" />
                            </SelectTrigger>
                            <SelectContent>
                                {months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex-1 space-y-2">
                        <Label htmlFor="year-filter">Year</Label>
                        <Select value={selectedYear} onValueChange={setSelectedYear}>
                           <SelectTrigger id="year-filter">
                                <SelectValue placeholder="Select year" />
                            </SelectTrigger>
                            <SelectContent>
                                {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex-1 sm:flex-none">
                        <Button onClick={handlePrint} className="w-full">
                            <Printer className="mr-2"/>
                            Print Report
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>

        <Card className="printable-content">
            <CardHeader>
                <CardTitle>Overtime Summary for {format(reportDate, 'MMMM yyyy')} ({overtimeRecords.length} Employees)</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto rounded-md border">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Total Overtime</TableHead>
                        <TableHead># of Instances</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {overtimeRecords.length > 0 ? (
                        overtimeRecords.map((record) => (
                        <TableRow key={record.name}>
                            <TableCell className="font-medium">{record.name}</TableCell>
                            <TableCell className="text-muted-foreground">{record.department}</TableCell>
                            <TableCell>
                                <Badge variant="secondary">
                                    {record.totalMinutes} min
                                </Badge>
                            </TableCell>
                            <TableCell>
                                {record.count}
                            </TableCell>
                        </TableRow>
                        ))
                    ) : (
                        <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                            No overtime records found for this month.
                        </TableCell>
                        </TableRow>
                    )}
                    </TableBody>
                </Table>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
