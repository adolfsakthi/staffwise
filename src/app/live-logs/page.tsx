'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from '@/components/ui/card';
import {
    Activity,
    AlertTriangle,
    ArrowUp,
    Clock,
    UserCheck,
    Loader2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { LiveLog } from '@/lib/types';
import { useUser } from '@/firebase';
import { useMemo, useState } from 'react';


const MOCK_LOGS: LiveLog[] = [
    { id: '1', type: 'late', message: 'John Doe arrived late', timestamp: new Date(), isRead: false, employee: 'John Doe', department: 'Engineering', time: '09:15', deviation: 15, property_code: 'D001' },
    { id: '2', type: 'early', message: 'Jane Smith arrived early', timestamp: new Date(), isRead: false, employee: 'Jane Smith', department: 'Housekeeping', time: '08:45', deviation: -15, property_code: 'D001' },
    { id: '3', type: 'overtime', message: 'Peter Jones started overtime', timestamp: new Date(), isRead: false, employee: 'Peter Jones', department: 'Security', time: '18:30', deviation: 30, property_code: 'D001' },
    { id: '4', type: 'on_time', message: 'Mary Johnson arrived on time', timestamp: new Date(), isRead: false, employee: 'Mary Johnson', department: 'Front Desk', time: '09:00', deviation: 0, property_code: 'D002' },
];


const logConfig = {
    late: { icon: AlertTriangle, color: 'text-red-500', label: 'Late Arrival', badge: 'destructive' },
    overtime: { icon: Clock, color: 'text-blue-500', label: 'Overtime', badge: 'default' },
    early: { icon: ArrowUp, color: 'text-yellow-500', label: 'Early Arrival', badge: 'secondary' },
    on_time: { icon: UserCheck, color: 'text-green-500', label: 'On Time', badge: 'secondary' },
    audit_summary: { icon: Activity, color: 'text-gray-500', label: 'Audit', badge: 'outline' },
} as const;


export default function LiveLogsPage() {
    const { user, isUserLoading } = useUser();
    const [isLoadingLogs, setIsLoadingLogs] = useState(false);

    // @ts-ignore
    const propertyCode = user?.property_code || null;

    const filteredLogs = useMemo(() => {
      if (!MOCK_LOGS || !propertyCode) return [];
      return MOCK_LOGS.filter(l => l.property_code === propertyCode);
    }, [propertyCode]);


  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Activity className="size-8 text-primary" />
          <div>
            <CardTitle>Live Attendance Logs</CardTitle>
            <CardDescription>
              Real-time feed of notable attendance events for property {propertyCode || '...'}.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
         <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-[150px]'>Event</TableHead>
                <TableHead>Employee/Message</TableHead>
                <TableHead>Property Code</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Punch Time</TableHead>
                <TableHead>Deviation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isUserLoading || isLoadingLogs ? (
                <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                        <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                    </TableCell>
                </TableRow>
              ) : filteredLogs && filteredLogs.length > 0 ? (
                filteredLogs.map((log) => {
                    const configKey = log.type in logConfig ? log.type : 'on_time';
                    const config = logConfig[configKey];
                    return (
                        <TableRow key={log.id}>
                            <TableCell>
                                <div className='flex items-center gap-2'>
                                    <config.icon className={`size-5 ${config.color}`} />
                                    <span className='font-medium'>{config.label}</span>
                                </div>
                            </TableCell>
                            <TableCell className="font-medium">{log.employee || log.message}</TableCell>
                            <TableCell className="text-muted-foreground">{log.property_code}</TableCell>
                            <TableCell className="text-muted-foreground">{log.department || 'N/A'}</TableCell>
                            <TableCell className="text-muted-foreground">{log.time || 'N/A'}</TableCell>
                            <TableCell>
                                {log.deviation && log.deviation !== 0 ? (
                                    <Badge variant={config.badge as any}>{Math.abs(log.deviation)} min</Badge>
                                ) : (
                                    <span className='text-muted-foreground'>--</span>
                                )}
                            </TableCell>
                        </TableRow>
                    )
                })
              ) : (
                <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                        No live logs available for this property.
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
