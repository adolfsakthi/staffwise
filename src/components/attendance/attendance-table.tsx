'use client';

import { useState, useMemo, useEffect } from 'react';
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

interface AttendanceTableProps {
    propertyCode: string;
}

export default function AttendanceTable({ propertyCode }: AttendanceTableProps) {
  const [allRecords, setAllRecords] = useState<AttendanceRecord[]>([]);
  const [dateFilter, setDateFilter] = useState<string>(
    format(new Date(), 'yyyy-MM-dd')
  );
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
        setIsLoading(true);
        try {
            const response = await fetch('/api/attendance/logs');
            if (!response.ok) {
                throw new Error('Failed to fetch logs');
            }
            const data: AttendanceRecord[] = await response.json();
            setAllRecords(data);
        } catch (error) {
            console.error(error);
            // In a real app, show a toast notification
        } finally {
            setIsLoading(false);
        }
    }
    fetchLogs();
  }, []);


  const filteredRecords = useMemo(() => {
    if (isLoading) return [];
    return allRecords.filter(r => {
        // Assuming attendanceDate is in 'YYYY-MM-DD' format from server
        const recordDate = r.attendanceDate;
        const dateMatch = recordDate === dateFilter;
        const departmentMatch = departmentFilter === 'all' || r.department === departmentFilter;
        const propertyMatch = r.property_code === propertyCode;
        return dateMatch && departmentMatch && propertyMatch;
    });
  }, [dateFilter, departmentFilter, propertyCode, allRecords, isLoading]);

  const departments = useMemo(() => {
    const depts = new Set(allRecords.filter(r => r.property_code === propertyCode).map(r => r.department || ''));
    return Array.from(depts).filter(Boolean);
  }, [propertyCode, allRecords]);


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
            disabled={isLoading}
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
                      {record.entry_time || 'N/A'} / {record.exit_time || 'N/A'}
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
