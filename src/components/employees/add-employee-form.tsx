
'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Employee } from '@/lib/types';

type AddEmployeeFormProps = {
    propertyCode: string;
    onAddEmployee: (employee: Omit<Employee, 'id' | 'clientId' | 'branchId'>) => void;
}

const DEPARTMENTS = ['Housekeeping', 'Front Desk', 'Engineering', 'Kitchen', 'Security', 'Sales'];

export default function AddEmployeeForm({ propertyCode, onAddEmployee }: AddEmployeeFormProps) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        const form = e.currentTarget;

        const formData = new FormData(form);
        const employeeData = {
            firstName: formData.get('first-name') as string,
            lastName: formData.get('last-name') as string,
            email: formData.get('email') as string,
            department: formData.get('department') as string,
            employeeCode: formData.get('employee-code') as string,
            shiftStartTime: formData.get('shift-start-time') as string,
            shiftEndTime: formData.get('shift-end-time') as string,
            property_code: propertyCode,
        };
        
        await new Promise(resolve => setTimeout(resolve, 500));

        onAddEmployee(employeeData);

        toast({
            title: 'Employee Added (Mock)',
            description: `Employee ${employeeData.firstName} has been added.`,
        });
        
        form.reset();
        setIsLoading(false);
    }

    return (
        <Card>
            <CardHeader>
            <CardTitle>Add New Employee</CardTitle>
            <CardDescription>
                Add a new employee to this property.
            </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                         <div className="space-y-2">
                            <Label htmlFor="first-name">First Name</Label>
                            <Input name="first-name" id="first-name" placeholder="e.g., John" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="last-name">Last Name</Label>
                            <Input name="last-name" id="last-name" placeholder="e.g., Doe" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input name="email" id="email" type="email" placeholder="e.g., john.d@example.com" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="department">Department</Label>
                             <Select name="department" required>
                                <SelectTrigger id="department">
                                    <SelectValue placeholder="Select department" />
                                </SelectTrigger>
                                <SelectContent>
                                    {DEPARTMENTS.map(dept => (
                                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="employee-code">Employee Code</Label>
                            <Input name="employee-code" id="employee-code" placeholder="e.g., EMP123" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="shift-start-time">Shift Start Time</Label>
                            <Input name="shift-start-time" id="shift-start-time" type="time" required />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="shift-end-time">Shift End Time</Label>
                            <Input name="shift-end-time" id="shift-end-time" type="time" required />
                        </div>
                    </div>
                     <Button type="submit" disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 animate-spin" /> : <PlusCircle className="mr-2" />}
                        Add Employee
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
