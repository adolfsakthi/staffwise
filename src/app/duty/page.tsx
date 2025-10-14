'use client';

import { useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PlusCircle, Trash2, Edit } from 'lucide-react';

const DEPARTMENTS = ['Housekeeping', 'Front Desk', 'Engineering', 'Kitchen', 'Security', 'Sales'];

type Duty = {
  id: string;
  name: string;
  description: string;
  department: string;
};

export default function DutyPage() {
  const [duties, setDuties] = useState<Duty[]>([
    { id: '1', name: 'Morning Security Patrol', description: 'Patrol all floors and emergency exits.', department: 'Security' },
    { id: '2', name: 'Room Cleaning - 3rd Floor', description: 'Clean all vacated rooms on the third floor.', department: 'Housekeeping' },
  ]);
  const [dutyName, setDutyName] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState('');

  const handleAddDuty = () => {
    if (!dutyName || !department) {
      alert('Please fill out the duty name and department.');
      return;
    }
    const newDuty: Duty = {
      id: (duties.length + 1).toString(),
      name: dutyName,
      description: description,
      department: department,
    };
    setDuties([...duties, newDuty]);
    // Reset form
    setDutyName('');
    setDescription('');
    setDepartment('');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Define New Duty</CardTitle>
          <CardDescription>
            Create a new duty and assign it to a department.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="duty-name">Duty Name</Label>
              <Input
                id="duty-name"
                value={dutyName}
                onChange={(e) => setDutyName(e.target.value)}
                placeholder="e.g., Morning Lobby Cleanup"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger id="department">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the tasks involved in this duty."
            />
          </div>
          <Button onClick={handleAddDuty}>
            <PlusCircle className="mr-2" />
            Add Duty
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Defined Duties</CardTitle>
          <CardDescription>
            List of all duties defined in the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Duty Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {duties.length > 0 ? (
                  duties.map((duty) => (
                    <TableRow key={duty.id}>
                      <TableCell className="font-medium">{duty.name}</TableCell>
                      <TableCell>{duty.department}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {duty.description}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                            <Button size="icon" variant="ghost">
                                <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost">
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No duties defined yet.
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
