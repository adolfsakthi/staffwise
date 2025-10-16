
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
import { Badge } from '@/components/ui/badge';
import { useMockData } from '@/lib/mock-data-store';
import { format, getMonth, getYear } from 'date-fns';
import { Clock, ArrowLeft, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function MonthlyLateReportPage() {
    const { attendanceRecords } = useMockData();
    const now = new Date();

    const lateRecords = useMemo(() => {
        return attendanceRecords.filter(r => {
            const recordDate = new Date(r.attendanceDate);
            return r.is_late && 
                   getMonth(recordDate) === getMonth(now) &&
                   getYear(recordDate) === getYear(now);
        });
    }, [attendanceRecords, now]);

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
          <Clock className="size-8 text-destructive" />
          <div>
            <CardTitle>Monthly Late Report</CardTitle>
            <CardDescription>
              A detailed list of all late entries for {format(now, 'MMMM yyyy')}.
            </CardDescription>
          </div>
        </div>
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
                    No late records found for this month.
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
