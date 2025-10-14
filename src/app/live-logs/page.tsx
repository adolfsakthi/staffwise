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
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { useMemo } from 'react';
import { collection, query, where, orderBy, limit } from 'firebase/firestore';


const logConfig = {
    late: { icon: AlertTriangle, color: 'text-red-500', label: 'Late Arrival', badge: 'destructive' },
    overtime: { icon: Clock, color: 'text-blue-500', label: 'Overtime', badge: 'default' },
    early: { icon: ArrowUp, color: 'text-yellow-500', label: 'Early Arrival', badge: 'secondary' },
    on_time: { icon: UserCheck, color: 'text-green-500', label: 'On Time', badge: 'secondary' },
    audit_summary: { icon: Activity, color: 'text-gray-500', label: 'Audit', badge: 'outline' },
} as const;


export default function LiveLogsPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    // @ts-ignore
    const propertyCode = user?.property_code || null;

    const logsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        // This assumes notifications are stored per-user.
        // A more complex system might query a global log collection filtered by property code.
        return query(collection(firestore, `users/${user.uid}/notifications`), orderBy('timestamp', 'desc'), limit(50));
    }, [user, firestore]);

    const { data: logs, isLoading: isLoadingLogs, error } = useCollection<LiveLog>(logsQuery);
    
    const filteredLogs = useMemo(() => {
      if (!logs || !propertyCode) return [];
      // This client-side filter is suboptimal. A proper backend query would be better.
      // It assumes 'property_code' is denormalized onto the notification document.
      return logs.filter(l => l.property_code === propertyCode);
    }, [logs, propertyCode]);


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
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-destructive">
                    Error: {error.message}
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
                                {log.deviation && log.deviation > 0 ? (
                                    <Badge variant={config.badge as any}>{log.deviation} min</Badge>
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
