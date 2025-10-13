'use client';

import { useState } from 'react';
import type { AttendanceRecord } from '@/lib/data';
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
    { id: '1', employee_name: 'John Doe', email: 'john.doe@example.com', department: 'Engineering', shift_start: '09:00', shift_end: '18:00', entry_time: '09:15', exit_time: '18:05', date: '2024-05-27', is_late: true, late_by_minutes: 15, overtime_minutes: 5, is_audited: false },
    { id: '2', employee_name: 'Jane Smith', email: 'jane.smith@example.com', department: 'Sales', shift_start: '09:00', shift_end: '18:00', entry_time: '08:55', exit_time: '18:30', date: '2024-05-27', is_late: false, late_by_minutes: 0, overtime_minutes: 30, is_audited: true },
    { id: '3', employee_name: 'Mike Johnson', email: 'mike.j@example.com', department: 'Engineering', shift_start: '10:00', shift_end: '19:00', entry_time: '10:01', exit_time: '19:00', date: '2024-05-27', is_late: true, late_by_minutes: 1, overtime_minutes: 0, is_audited: false },
];
const MOCK_DEPARTMENTS = ['Engineering', 'Sales', 'HR', 'IT', 'Operations'];

export default function AttendanceTable() {
  const [dateFilter, setDateFilter] = useState<string>(
    format(new Date(), 'yyyy-MM-dd')
  );
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);

  const filteredRecords = MOCK_RECORDS.filter(record => {
    const dateMatch = !dateFilter || record.date === dateFilter;
    const departmentMatch = departmentFilter === 'all' || record.department === departmentFilter;
    return dateMatch && departmentMatch;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance Records</CardTitle>
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
              {MOCK_DEPARTMENTS.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
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
              ) : filteredRecords.length > 0 ? (
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
                      {record.overtime_minutes > 0 ? (
                        <span>{record.overtime_minutes} min</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                        {record.is_audited ? 'Yes' : 'No'}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No records found for the selected filters.
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
