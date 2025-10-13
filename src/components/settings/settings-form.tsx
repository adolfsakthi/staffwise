'use client';

import { useState, useEffect } from 'react';
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
import { getDepartments } from '@/lib/data';

type SettingsFormProps = {
  // currentSettings?: any; // Removed to make component self-contained
};

const DEFAULT_GRACE_TIME = 15;
const DEFAULT_AUTO_AUDIT_TIME = '00:00';

export default function SettingsForm({
  // currentSettings = {}, // No longer needed
}: SettingsFormProps) {
  const { toast } = useToast();
  const [departments, setDepartments] = useState<string[]>([]);
  const [graceDepartment, setGraceDepartment] = useState('global');
  
  // State is now managed internally with default values
  const [graceMinutes, setGraceMinutes] = useState(DEFAULT_GRACE_TIME);
  const [autoAuditEnabled, setAutoAuditEnabled] = useState(true);
  const [autoAuditTime, setAutoAuditTime] = useState(DEFAULT_AUTO_AUDIT_TIME);

  useEffect(() => {
    async function fetchDepartments() {
      const depts = await getDepartments();
      setDepartments(depts);
    }
    fetchDepartments();
  }, []);

  const handleGraceDepartmentChange = (value: string) => {
    setGraceDepartment(value);
    // In a real app, you would fetch the specific grace time for the selected department
    // For now, we'll just reset to the global default for simplicity
    setGraceMinutes(DEFAULT_GRACE_TIME);
  };

  const handleSaveGraceTime = () => {
    // In a real app, you'd call a server action here to save to Firestore
    console.log(`Saving grace time for ${graceDepartment}: ${graceMinutes} minutes`);
    toast({
      title: 'Settings Saved',
      description: `Grace time for ${graceDepartment} set to ${graceMinutes} minutes.`,
    });
  };

  const handleSaveAutoAudit = () => {
    // In a real app, you'd call a server action here to save to Firestore
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
                                    {departments.map(dept => (
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
