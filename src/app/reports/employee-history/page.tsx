
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useMockData } from '@/lib/mock-data-store';
import { format } from 'date-fns';
import { User } from 'lucide-react';

export default function EmployeeHistoryPage() {
    const { attendanceRecords, employees } = useMockData();
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');

    const employeeHistory = useMemo(() => {
        if (!selectedEmployeeId) return [];
        return attendanceRecords
            .filter(r => r.employeeId === selectedEmployeeId)
            .sort((a,b) => new Date(b.attendanceDate).getTime() - new Date(a.attendanceDate).getTime());
    }, [attendanceRecords, selectedEmployeeId]);

    const propertyCode = 'D001';
    const filteredEmployees = employees.filter(e => e.property_code === propertyCode);


  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <User className="size-8 text-primary" />
                    <div>
                        <CardTitle>Employee Attendance History</CardTitle>
                        <CardDescription>
                        Select an employee to view their complete attendance history.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                 <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                    <SelectTrigger className="w-full sm:w-[300px]">
                        <SelectValue placeholder="Select an employee..." />
                    </SelectTrigger>
                    <SelectContent>
                        {filteredEmployees.map((emp) => (
                            <SelectItem key={emp.id} value={emp.id}>
                                {emp.firstName} {emp.lastName} ({emp.employeeCode})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </CardContent>
        </Card>
        
        {selectedEmployeeId && (
            <Card>
                <CardHeader>
                    <CardTitle>History for {filteredEmployees.find(e => e.id === selectedEmployeeId)?.firstName}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto rounded-md border">
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Times (Entry/Exit)</TableHead>
                            <TableHead>Deviation</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {employeeHistory.length > 0 ? (
                            employeeHistory.map((record) => (
                            <TableRow key={record.id}>
                                <TableCell className="font-medium">{format(new Date(record.attendanceDate), 'PPP')}</TableCell>
                                <TableCell>
                                    {record.is_absent ? <Badge variant="destructive">Absent</Badge> : 
                                     record.is_on_leave ? <Badge variant="outline">On Leave</Badge> :
                                     <Badge variant="secondary">Present</Badge>
                                    }
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {record.entry_time || 'N/A'} / {record.exit_time || 'N/A'}
                                </TableCell>
                                <TableCell>
                                    <div className='flex flex-col gap-1'>
                                        {record.is_late && <Badge variant="destructive">Late: {record.late_by_minutes}m</Badge>}
                                        {(record.overtime_minutes || 0) > 0 && <Badge>Overtime: {record.overtime_minutes}m</Badge>}
                                        {(record.early_going_minutes || 0) > 0 && <Badge variant="outline">Early: {record.early_going_minutes}m</Badge>}
                                    </div>
                                </TableCell>
                            </TableRow>
                            ))
                        ) : (
                            <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center">
                                No attendance history found for this employee.
                            </TableCell>
                            </TableRow>
                        )}
                        </TableBody>
                    </Table>
                    </div>
                </CardContent>
            </Card>
        )}
    </div>
  );
}
