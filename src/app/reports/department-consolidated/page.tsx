
'use client';

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
import { Printer } from 'lucide-react';
import { format } from 'date-fns';

const reportData = {
  departments: [
    {
      name: 'Engineering',
      summary: {
        present: 8,
        absent: 1,
        late: 2,
        overtime: '45 mins',
      },
      records: [
        { name: 'John Doe', status: 'Late (5m)', entry: '09:05', exit: '18:02' },
        { name: 'Peter Jones', status: 'Late (15m)', entry: '09:15', exit: '18:00' },
        { name: 'Emily White', status: 'On Time', entry: '08:55', exit: '17:50' },
      ],
    },
    {
      name: 'Housekeeping',
      summary: {
        present: 12,
        absent: 0,
        late: 1,
        overtime: '0 mins',
      },
      records: [
        { name: 'Jane Smith', status: 'On Time', entry: '08:58', exit: '17:30' },
        { name: 'Maria Garcia', status: 'Late (2m)', entry: '09:02', exit: '17:35' },
      ],
    },
  ],
};

export default function DepartmentConsolidatedReportPage() {
    
  const handlePrint = () => {
    window.print();
  }

  return (
    <div className="bg-muted/20 p-4 sm:p-6 lg:p-8 rounded-xl">
      <div className="max-w-4xl mx-auto">
        <div style={{ background: 'linear-gradient(to right, #6d28d9, #a78bfa)' }} className="rounded-t-lg p-6 text-white shadow-lg">
          <div className="flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-bold">Consolidated Audit Report</h1>
                <p className="text-sm opacity-90">Department-wise Summary for {format(new Date(), 'MMMM do, yyyy')}</p>
            </div>
            <Button variant="secondary" onClick={handlePrint} className="hidden sm:flex">
                <Printer className="mr-2" /> Print Report
            </Button>
          </div>
        </div>

        <div className="space-y-6 bg-card p-6 rounded-b-lg border border-t-0 shadow-lg">
          <Button variant="secondary" onClick={handlePrint} className="w-full sm:hidden">
              <Printer className="mr-2" /> Print Report
          </Button>

          {reportData.departments.map((dept) => (
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
                            {dept.records.map((rec, i) => (
                                <TableRow key={i}>
                                    <TableCell className="font-medium">{rec.name}</TableCell>
                                    <TableCell>
                                        <Badge variant={rec.status.startsWith('Late') ? 'destructive' : 'secondary'}>
                                            {rec.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{rec.entry}</TableCell>
                                    <TableCell>{rec.exit}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
