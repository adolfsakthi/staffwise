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
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';


interface AttendanceTableProps {
    clientId: string;
    branchId: string;
    propertyCode: string;
}

export default function AttendanceTable({ clientId, branchId, propertyCode }: AttendanceTableProps) {
  const [dateFilter, setDateFilter] = useState<string>(
    format(new Date(), 'yyyy-MM-dd')
  );
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const firestore = useFirestore();

  const recordsQuery = useMemoFirebase(() => {
    if (!firestore || !clientId || !branchId) return null;

    let q = query(
      collection(firestore, `clients/${clientId}/branches/${branchId}/attendanceRecords`),
      where('attendanceDate', '==', dateFilter)
    );
    
    if (departmentFilter !== 'all') {
      // Note: This requires a composite index in Firestore.
      // The app will throw an error with a link to create it if it doesn't exist.
      q = query(q, where('department', '==', departmentFilter));
    }
    
    return q;
  }, [firestore, clientId, branchId, dateFilter, departmentFilter]);
  
  const { data: records, isLoading, error } = useCollection<AttendanceRecord>(recordsQuery);

  // Departments would ideally be fetched from a 'departments' collection.
  // For now, we derive it from the records or a static list.
  const departments = useMemo(() => {
    if (!records) return [];
    const depts = new Set(records.map(r => r.department || ''));
    return Array.from(depts).filter(Boolean);
  }, [records]);


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
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-destructive">
                    Error: {error.message}
                  </TableCell>
                </TableRow>
              ) : records && records.length > 0 ? (
                records.map((record) => (
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
