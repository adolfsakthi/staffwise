
'use client';

import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, Edit, Trash2, Loader2 } from 'lucide-react';
import type { Employee } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';


async function deleteEmployeeAction(employeeId: string): Promise<void> {
    const response = await fetch(`/api/employees?id=${employeeId}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete employee');
    }
}

type EmployeeListProps = {
  initialEmployees: Employee[];
  propertyCode: string;
};

export default function EmployeeList({ initialEmployees, propertyCode }: EmployeeListProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [employees, setEmployees] = useState(initialEmployees);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredEmployees = useMemo(() => {
    if (!employees || !propertyCode) return [];
    return employees.filter(emp => emp.property_code === propertyCode);
  }, [employees, propertyCode]);

  const handleEdit = (employee: Employee) => {
    // In a real app, this would open a dialog/form to edit the employee
    toast({
      title: 'Edit Employee (Not Implemented)',
      description: `Editing ${employee.firstName} ${employee.lastName}.`,
    });
  };

  const handleDelete = async (employee: Employee) => {
    if (!confirm(`Are you sure you want to delete ${employee.firstName} ${employee.lastName}?`)) {
        return;
    }
    setDeletingId(employee.id);
    try {
      await deleteEmployeeAction(employee.id);
      setEmployees(prev => prev.filter(emp => emp.id !== employee.id));
      toast({
          title: 'Employee Deleted',
          description: `${employee.firstName} ${employee.lastName} has been deleted.`,
      });
      router.refresh();
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: error.message || 'Could not delete employee.'
        });
    } finally {
        setDeletingId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Employee List</CardTitle>
        <CardDescription>View and manage all employees for the current property.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Employee Code</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Shift</TableHead>
                <TableHead className="w-[50px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                  </TableCell>
                </TableRow>
              ) : filteredEmployees && filteredEmployees.length > 0 ? (
                filteredEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <div className="font-medium">{employee.firstName} {employee.lastName}</div>
                      <div className="text-sm text-muted-foreground">{employee.email}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{employee.employeeCode}</Badge>
                    </TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {employee.shiftStartTime} - {employee.shiftEndTime}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" disabled={!!deletingId}>
                            {deletingId === employee.id ? <Loader2 className="animate-spin" /> : <MoreVertical />}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleEdit(employee)} disabled={!!deletingId}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(employee)}
                            className="text-destructive focus:text-destructive"
                            disabled={!!deletingId}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No employees found for this property.
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
