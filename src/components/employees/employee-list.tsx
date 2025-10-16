
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MoreVertical, Trash2, Edit } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Employee } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

type EmployeeListProps = {
    initialEmployees: Employee[];
    propertyCode: string;
}

export default function EmployeeList({ initialEmployees, propertyCode }: EmployeeListProps) {
  const { toast } = useToast();
  const [employees, setEmployees] = useState(initialEmployees);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEmployees = useMemo(() => {
    return (employees || [])
        .filter(e => e.property_code === propertyCode)
        .filter(e => 
            e.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.employeeCode.toLowerCase().includes(searchTerm.toLowerCase())
        );
  }, [employees, propertyCode, searchTerm]);

  const handleRemoveEmployee = (employeeId: string) => {
    setEmployees(prev => prev.filter(e => e.id !== employeeId));
    toast({
        title: 'Employee Removed (Mock)',
        description: 'The employee has been removed from the list.',
    })
  }

  return (
    <Card>
        <CardHeader>
            <CardTitle>Employee List</CardTitle>
            <div className="mt-2">
                <Input 
                    placeholder="Search employees..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                />
            </div>
        </CardHeader>
        <CardContent>
            <div className="overflow-x-auto rounded-md border">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Employee Code</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Shift</TableHead>
                    <TableHead className="w-[50px]">Actions</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {filteredEmployees.length > 0 ? (
                    filteredEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                        <TableCell>
                        <div className="flex items-center gap-3">
                            <Avatar>
                                <AvatarImage src={`https://i.pravatar.cc/150?u=${employee.email}`} alt={employee.firstName} />
                                <AvatarFallback>
                                    {employee.firstName?.[0]}{employee.lastName?.[0]}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="font-medium">{employee.firstName} {employee.lastName}</div>
                                <div className="text-sm text-muted-foreground">
                                    {employee.email}
                                </div>
                            </div>
                        </div>
                        </TableCell>
                        <TableCell>
                            <Badge variant="outline">{employee.employeeCode}</Badge>
                        </TableCell>
                        <TableCell>{employee.department}</TableCell>
                        <TableCell>{employee.shiftStartTime} - {employee.shiftEndTime}</TableCell>
                        <TableCell>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreVertical />
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem disabled>
                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleRemoveEmployee(employee.id)} className="text-destructive focus:text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" /> Remove
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        </TableCell>
                    </TableRow>
                    ))
                ) : (
                    <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                        No employees found.
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
