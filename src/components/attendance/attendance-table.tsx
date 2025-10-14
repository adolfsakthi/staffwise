'use client';

import { useState, useMemo } from 'react';
import type { AttendanceRecord } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';

const MOCK_RECORDS: AttendanceRecord[] = [
    { id: '1', employeeId: '1', deviceId: '1', punchInTime: '2024-05-23T09:05:00Z', attendanceDate: '2024-05-23', logType: 'Biometric', employee_name: 'John Doe', email: 'john@example.com', department: 'Engineering', property_code: 'D001', entry_time: '09:05', exit_time: '18:02', is_late: true, late_by_minutes: 5, overtime_minutes: 2, is_audited: false },
    { id: '2', employeeId: '2', deviceId: '1', punchInTime: '2024-05-23T08:58:00Z', attendanceDate: '2024-05-23', logType: 'Biometric', employee_name: 'Jane Smith', email: 'jane@example.com', department: 'Housekeeping', property_code: 'D001', entry_time: '08:58', exit_time: '17:30', is_late: false, overtime_minutes: 0, is_audited: true },
    { id: '3', employeeId: '3', deviceId: '1', punchInTime: '2024-05-22T09:15:00Z', attendanceDate: '2024-05-22', logType: 'Manual', employee_name: 'Peter Jones', email: 'peter@example.com', department: 'Engineering', property_code: 'D001', entry_time: '09:15', exit_time: '18:00', is_late: true, late_by_minutes: 15, overtime_minutes: 0, is_audited: false },
];

interface AttendanceTableProps {
    propertyCode: string;
}

export default function AttendanceTable({ propertyCode }: AttendanceTableProps) {
  const [dateFilter, setDateFilter] = useState<string>(
    format(new Date(), 'yyyy-MM-dd')
  );
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);

  const filteredRecords = useMemo(() => {
    return MOCK_RECORDS.filter(r => {
        const dateMatch = r.attendanceDate === dateFilter;
        const departmentMatch = departmentFilter === 'all' || r.department === departmentFilter;
        const propertyMatch = r.property_code === propertyCode;
        return dateMatch && departmentMatch && propertyMatch;
    });
  }, [dateFilter, departmentFilter, propertyCode]);

  const departments = useMemo(() => {
    const depts = new Set(MOCK_RECORDS.filter(r => r.property_code === propertyCode).map(r => r.department || ''));
    return Array.from(depts).filter(Boolean);
  }, [propertyCode]);


  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance Records for Property {propertyCode}</CardTitle>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full sm:w-auto"
          />
          <Select
            value={departmentFilter}
            onValueChange={setDepartmentFilter}
          >
            <SelectTrigger className="w-full sm:w-[200px]">
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
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Times (Entry/Exit)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Overtime</TableHead>
                <TableHead>Audited</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                  </TableCell>
                </TableRow>
              ) : filteredRecords && filteredRecords.length > 0 ? (
                filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div className="font-medium">{record.employee_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {record.email}
                      </div>
                    </TableCell>
                    <TableCell>{record.department}</TableCell>
                    <TableCell>
                      {record.entry_time} / {record.exit_time}
                    </TableCell>
                    <TableCell>
                      {record.is_late ? (
                        <Badge variant="destructive">
                          Late ({record.late_by_minutes}m)
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-green-600 border-green-200">On Time</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {record.overtime_minutes && record.overtime_minutes > 0 ? (
                        <span>{record.overtime_minutes} min</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                        <Badge variant={record.is_audited ? 'secondary' : 'outline'}>
                            {record.is_audited ? 'Yes' : 'No'}
                        </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No records found for the selected criteria.
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
