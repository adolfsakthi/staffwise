
'use client';

import { useEffect, useState } from 'react';
import type { AttendanceRecord } from '@/lib/data';
import { getDepartments } from '@/lib/data';
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
import { useCollection } from '@/firebase';
import { collection, query, where, and } from 'firebase/firestore';
import { useFirestore, useMemoFirebase } from '@/firebase/provider';

interface AttendanceTableProps {
    propertyCode: string;
}

export default function AttendanceTable({ propertyCode }: AttendanceTableProps) {
  const firestore = useFirestore();
  const [departments, setDepartments] = useState<string[]>([]);
  const [dateFilter, setDateFilter] = useState<string>(
    format(new Date(), 'yyyy-MM-dd')
  );
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(true);

  const attendanceQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    
    const filters = [where('property_code', '==', propertyCode)];
    if(dateFilter) {
        filters.push(where('date', '==', dateFilter));
    }
    if (departmentFilter !== 'all') {
        filters.push(where('department', '==', departmentFilter));
    }

    return query(collection(firestore, 'attendance_records'), and(...filters));

  }, [firestore, dateFilter, departmentFilter, propertyCode]);


  const { data: records, isLoading: isLoadingRecords, error } = useCollection<AttendanceRecord>(attendanceQuery);

  useEffect(() => {
    const fetchDepartments = async () => {
      if (!propertyCode) return;
      setIsLoadingDepartments(true);
      const departmentsData = await getDepartments(propertyCode);
      setDepartments(departmentsData);
      setIsLoadingDepartments(false);
    };
    fetchDepartments();
  }, [records, propertyCode]); // Re-fetch if records change to capture new departments

  if(error) {
    console.error("Firestore Error:", error);
    // You might want to render an error state to the user here
  }

  const isLoading = isLoadingRecords || isLoadingDepartments;

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
                <TableHead>Property Code</TableHead>
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
                  <TableCell colSpan={7} className="h-24 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin" />
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
                    <TableCell>{record.property_code}</TableCell>
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
                        <Badge variant={record.is_audited ? 'secondary' : 'outline'}>
                            {record.is_audited ? 'Yes' : 'No'}
                        </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
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
