
'use client';

import { useMemo } from 'react';
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
import { format, getMonth, getYear } from 'date-fns';
import { LineChart, ArrowLeft, Printer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function OvertimeAnalysisPage() {
    const { attendanceRecords, employees } = useMockData();
    const now = new Date();

    const overtimeRecords = useMemo(() => {
        const records = attendanceRecords.filter(r => {
            const recordDate = new Date(r.attendanceDate);
            return (r.overtime_minutes || 0) > 0 &&
                   getMonth(recordDate) === getMonth(now) &&
                   getYear(recordDate) === getYear(now);
        });

        const byEmployee = records.reduce((acc, record) => {
            if (!acc[record.employeeId]) {
                const employee = employees.find(e => e.id === record.employeeId);
                acc[record.employeeId] = {
                    name: employee?.firstName + ' ' + employee?.lastName,
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

    }, [attendanceRecords, employees, now]);

    const handlePrint = () => {
        window.print();
    }

  return (
    <Card className="printable-content">
      <CardHeader>
        <div className="flex justify-between items-center no-print">
            <Button asChild variant="outline">
                <Link href="/reports">
                    <ArrowLeft className="mr-2" />
                    Back to Reports
                </Link>
            </Button>
             <Button onClick={handlePrint}>
                <Printer className="mr-2"/>
                Print Report
            </Button>
        </div>
        <div className="flex items-center gap-3 mt-4">
          <LineChart className="size-8 text-primary" />
          <div>
            <CardTitle>Overtime Analysis Report</CardTitle>
            <CardDescription>
              A breakdown of overtime hours for {format(now, 'MMMM yyyy')}.
            </CardDescription>
          </div>
        </div>
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
  );
}
