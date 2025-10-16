
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useMockData } from '@/lib/mock-data-store';
import { format } from 'date-fns';
import { User, Printer, ArrowLeft } from 'lucide-react';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

export default function EmployeeHistoryPage() {
    const { attendanceRecords, employees } = useMockData();
    const [dateFilter, setDateFilter] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
    const [departmentFilter, setDepartmentFilter] = useState<string>('all');

    const propertyCode = 'D001';

    const departments = useMemo(() => {
        const depts = new Set(employees.filter(r => r.property_code === propertyCode).map(r => r.department || ''));
        return Array.from(depts).filter(Boolean);
    }, [propertyCode, employees]);

    const filteredRecords = useMemo(() => {
        return attendanceRecords.filter(r => {
            const dateMatch = !dateFilter || r.attendanceDate === dateFilter;
            const departmentMatch = departmentFilter === 'all' || r.department === departmentFilter;
            const propertyMatch = r.property_code === propertyCode;
            return dateMatch && departmentMatch && propertyMatch;
        }).sort((a,b) => (a.employee_name || '').localeCompare(b.employee_name || ''));
    }, [attendanceRecords, dateFilter, departmentFilter, propertyCode]);
    
    const handlePrint = () => {
        window.print();
    }


  return (
    <div className="space-y-6">
        <Card className="no-print">
            <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <User className="size-8 text-primary" />
                        <div>
                            <CardTitle>Consolidated Employee Report</CardTitle>
                            <CardDescription>
                            A detailed attendance log for all employees.
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
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 space-y-2">
                        <Label htmlFor="date-filter">Date</Label>
                        <Input
                            id="date-filter"
                            type="date"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="w-full"
                        />
                    </div>
                    <div className="flex-1 space-y-2">
                        <Label htmlFor="dept-filter">Department</Label>
                        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                            <SelectTrigger id="dept-filter" className="w-full">
                                <SelectValue placeholder="Filter by department" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Departments</SelectItem>
                                {departments.map((dept) => (
                                    <SelectItem key={dept} value={dept}>
                                    {dept}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="flex-1 flex items-end">
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
                <CardTitle>Filtered Results ({filteredRecords.length})</CardTitle>
                <CardDescription>Displaying records for {format(new Date(dateFilter.replace(/-/g, '/')), 'PPP')} {departmentFilter !== 'all' && `in ${departmentFilter}`}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto rounded-md border">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Times (Entry/Exit)</TableHead>
                        <TableHead>Deviation</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {filteredRecords.length > 0 ? (
                        filteredRecords.map((record) => (
                        <TableRow key={record.id}>
                            <TableCell className="font-medium">{record.employee_name}</TableCell>
                            <TableCell className="text-muted-foreground">{record.department}</TableCell>
                            <TableCell>{format(new Date(record.attendanceDate), 'PPP')}</TableCell>
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
                                <div className='flex flex-col items-start gap-1'>
                                    {record.is_late && <Badge variant="destructive">Late: {record.late_by_minutes}m</Badge>}
                                    {(record.overtime_minutes || 0) > 0 && <Badge>Overtime: {record.overtime_minutes}m</Badge>}
                                    {(record.early_going_minutes || 0) > 0 && <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Early: {record.early_going_minutes}m</Badge>}
                                    {!record.is_late && (record.overtime_minutes || 0) === 0 && (record.early_going_minutes || 0) === 0 && !record.is_absent && !record.is_on_leave && (
                                        <Badge variant="secondary" className="text-green-600 border-green-200">On Time</Badge>
                                    )}
                                </div>
                            </TableCell>
                        </TableRow>
                        ))
                    ) : (
                        <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                            No attendance history found for the selected criteria.
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
