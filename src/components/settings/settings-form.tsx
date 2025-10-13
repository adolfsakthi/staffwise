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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
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
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

const MOCK_DEPARTMENTS = ['Engineering', 'Sales', 'HR', 'IT', 'Operations'];


type SettingsFormProps = {
  currentSettings: any; // Replace with actual types
};

export default function SettingsForm({
  currentSettings,
}: SettingsFormProps) {
  const { toast } = useToast();
  const [graceDepartment, setGraceDepartment] = useState('global');
  const [graceMinutes, setGraceMinutes] = useState(
    currentSettings.globalGraceTime
  );
  const [autoAuditEnabled, setAutoAuditEnabled] = useState(
    currentSettings.autoAudit.enabled
  );
  const [autoAuditTime, setAutoAuditTime] = useState(
    currentSettings.autoAudit.time
  );

  const handleGraceDepartmentChange = (value: string) => {
    setGraceDepartment(value);
    if (value === 'global') {
      setGraceMinutes(currentSettings.globalGraceTime);
    } else {
      setGraceMinutes(currentSettings.departmentGraceTimes[value] || currentSettings.globalGraceTime);
    }
  };

  const handleSaveGraceTime = () => {
    // In a real app, you'd call a server action here
    console.log(`Saving grace time for ${graceDepartment}: ${graceMinutes} minutes`);
    toast({
      title: 'Settings Saved',
      description: `Grace time for ${graceDepartment} set to ${graceMinutes} minutes.`,
    });
  };

  const handleSaveAutoAudit = () => {
    // In a real app, you'd call a server action here
    console.log(`Saving auto-audit settings: enabled=${autoAuditEnabled}, time=${autoAuditTime}`);
    toast({
      title: 'Settings Saved',
      description: `Auto-audit settings have been updated.`,
    });
  };


  return (
    <Card className="max-w-2xl mx-auto">
        <CardHeader>
            <CardTitle>Application Settings</CardTitle>
            <CardDescription>Manage system-wide configurations for attendance and audits.</CardDescription>
        </CardHeader>
        <CardContent>
            <Tabs defaultValue="grace-time">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="grace-time">Grace Time</TabsTrigger>
                <TabsTrigger value="auto-audit">Auto-Audit</TabsTrigger>
            </TabsList>
            <TabsContent value="grace-time" className="pt-6">
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Set the grace period for late entries, globally or for specific departments.
                    </p>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="department-select">Department</Label>
                            <Select value={graceDepartment} onValueChange={handleGraceDepartmentChange}>
                                <SelectTrigger id="department-select">
                                    <SelectValue placeholder="Select department" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="global">Global (All Departments)</SelectItem>
                                    {MOCK_DEPARTMENTS.map(dept => (
                                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="grace-minutes">Grace Minutes</Label>
                            <Input id="grace-minutes" type="number" value={graceMinutes} onChange={e => setGraceMinutes(Number(e.target.value))} />
                        </div>
                    </div>
                     <Button onClick={handleSaveGraceTime} className="w-full sm:w-auto">Save Grace Time</Button>
                </div>
            </TabsContent>
            <TabsContent value="auto-audit" className="pt-6">
                <div className="space-y-4">
                     <p className="text-sm text-muted-foreground">
                        Configure the system to automatically run audits at a specific time each day.
                    </p>
                    <div className="flex items-center space-x-2">
                        <Switch id="auto-audit-enabled" checked={autoAuditEnabled} onCheckedChange={setAutoAuditEnabled}/>
                        <Label htmlFor="auto-audit-enabled">Enable Auto-Audit</Label>
                    </div>
                    {autoAuditEnabled && (
                        <div className="space-y-2">
                            <Label htmlFor="audit-time">Audit Time</Label>
                            <Input id="audit-time" type="time" value={autoAuditTime} onChange={e => setAutoAuditTime(e.target.value)} className="w-full sm:w-[180px]" />
                        </div>
                    )}
                     <Button onClick={handleSaveAutoAudit} className="w-full sm:w-auto">Save Auto-Audit Config</Button>
                </div>
            </TabsContent>
            </Tabs>
        </CardContent>
    </Card>
  );
}
