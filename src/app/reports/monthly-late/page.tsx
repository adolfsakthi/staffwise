
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
import { useMockData } from '@/lib/mock-data-store';
import { format, getMonth, getYear, setMonth, setYear } from 'date-fns';
import { Clock, ArrowLeft, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString());
const months = Array.from({ length: 12 }, (_, i) => ({
  value: i.toString(),
  label: format(new Date(0, i), 'MMMM'),
}));

export default function MonthlyLateReportPage() {
    const { attendanceRecords } = useMockData();
    const [selectedMonth, setSelectedMonth] = useState<string>(getMonth(new Date()).toString());
    const [selectedYear, setSelectedYear] = useState<string>(getYear(new Date()).toString());

    const lateRecords = useMemo(() => {
        return attendanceRecords.filter(r => {
            const recordDate = new Date(r.attendanceDate);
            return r.is_late && 
                   getMonth(recordDate).toString() === selectedMonth &&
                   getYear(recordDate).toString() === selectedYear;
        });
    }, [attendanceRecords, selectedMonth, selectedYear]);

    const handlePrint = () => {
        window.print();
    }
    
    const reportDate = setYear(setMonth(new Date(), parseInt(selectedMonth)), parseInt(selectedYear));

  return (
    <div className="space-y-6 printable-content">
        <div className="flex justify-between items-center no-print">
             <Button asChild variant="outline">
                <Link href="/reports">
                    <ArrowLeft className="mr-2" />
                    Back to Reports
                </Link>
            </Button>
        </div>
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Clock className="size-8 text-destructive" />
                        <div>
                            <CardTitle>Monthly Late Report</CardTitle>
                            <CardDescription>
                              Detailed list of all late entries for {format(reportDate, 'MMMM yyyy')}.
                            </CardDescription>
                        </div>
                    </div>
                    <Button onClick={handlePrint} className="no-print">
                        <Printer className="mr-2"/>
                        Print Report
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="no-print">
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
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
                </div>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Late Entries ({lateRecords.length})</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto rounded-md border">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Employee</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Punch In Time</TableHead>
                        <TableHead>Late By</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {lateRecords.length > 0 ? (
                        lateRecords.map((record) => (
                        <TableRow key={record.id}>
                            <TableCell className="font-medium">{format(new Date(record.attendanceDate), 'PPP')}</TableCell>
                            <TableCell>{record.employee_name}</TableCell>
                            <TableCell className="text-muted-foreground">{record.department}</TableCell>
                            <TableCell>{record.entry_time}</TableCell>
                            <TableCell>
                            <Badge variant="destructive">{record.late_by_minutes} min</Badge>
                            </TableCell>
                        </TableRow>
                        ))
                    ) : (
                        <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                            No late records found for the selected month and year.
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
