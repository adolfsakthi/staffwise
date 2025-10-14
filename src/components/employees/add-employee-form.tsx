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
import { PlusCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MOCK_DEPARTMENTS } from '@/lib/mock-data';

type AddEmployeeFormProps = {
  clientId: string;
  branchId: string;
  propertyCode: string;
};

export default function AddEmployeeForm({ clientId, branchId, propertyCode }: AddEmployeeFormProps) {
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [employeeCode, setEmployeeCode] = useState('');
  const [shiftStartTime, setShiftStartTime] = useState('09:00');
  const [shiftEndTime, setShiftEndTime] = useState('18:00');

  const handleAddEmployee = async () => {
    if (!firstName || !lastName || !email || !department || !employeeCode) {
      toast({
        variant: 'destructive',
        title: 'Missing Fields',
        description: 'Please fill out all fields to add an employee.',
      });
      return;
    }
    setIsAdding(true);

    // Mock functionality since backend is disabled
    setTimeout(() => {
        toast({
          title: 'Employee Added (Mock)',
          description: `${firstName} ${lastName} has been added to the mock list.`,
        });
        // Reset form
        setFirstName('');
        setLastName('');
        setEmail('');
        setDepartment('');
        setEmployeeCode('');
        setShiftStartTime('09:00');
        setShiftEndTime('18:00');
        setIsAdding(false);
    }, 1000)
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Employee</CardTitle>
        <CardDescription>
          Add a new employee to property {propertyCode}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="first-name">First Name</Label>
            <Input id="first-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="John" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last-name">Last Name</Label>
            <Input id="last-name" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Doe" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john.doe@company.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="employee-code">Employee Code</Label>
            <Input id="employee-code" value={employeeCode} onChange={(e) => setEmployeeCode(e.target.value)} placeholder="EMP123" />
          </div>
           <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger id="department">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {MOCK_DEPARTMENTS.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="shift-start">Shift Start</Label>
            <Input id="shift-start" type="time" value={shiftStartTime} onChange={e => setShiftStartTime(e.target.value)} />
          </div>
           <div className="space-y-2">
            <Label htmlFor="shift-end">Shift End</Label>
            <Input id="shift-end" type="time" value={shiftEndTime} onChange={e => setShiftEndTime(e.target.value)} />
          </div>
        </div>
        <Button onClick={handleAddEmployee} disabled={isAdding}>
          {isAdding ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <PlusCircle className="mr-2 h-4 w-4" />
          )}
          Add Employee
        </Button>
      </CardContent>
    </Card>
  );
}
