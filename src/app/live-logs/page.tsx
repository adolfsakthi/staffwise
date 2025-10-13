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
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';


type LiveLog = {
    id: string;
    property_code: string;
    type: 'late' | 'overtime' | 'early' | 'on_time';
    employee: string;
    department: string;
    time: string;
    deviation: number;
}

const logConfig = {
    late: { icon: AlertTriangle, color: 'text-red-500', label: 'Late Arrival', badge: 'destructive' },
    overtime: { icon: Clock, color: 'text-blue-500', label: 'Overtime', badge: 'default' },
    early: { icon: ArrowUp, color: 'text-yellow-500', label: 'Early Arrival', badge: 'secondary' },
    on_time: { icon: UserCheck, color: 'text-green-500', label: 'On Time', badge: 'secondary' },
} as const;


export default function LiveLogsPage() {
    const firestore = useFirestore();
    const logsQuery = useMemoFirebase(() => (
        firestore ? collection(firestore, 'live_logs') : null
    ), [firestore]);
    const { data: logs, isLoading } = useCollection<LiveLog>(logsQuery);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Activity className="size-8 text-primary" />
          <div>
            <CardTitle>Live Attendance Logs</CardTitle>
            <CardDescription>
              Real-time feed of notable attendance events from connected devices.
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
                <TableHead>Employee</TableHead>
                <TableHead>Property Code</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Punch Time</TableHead>
                <TableHead>Deviation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                        <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                    </TableCell>
                </TableRow>
              ) : logs && logs.length > 0 ? (
                logs.map((log) => {
                    const config = logConfig[log.type] || logConfig.on_time;
                    return (
                        <TableRow key={log.id}>
                            <TableCell>
                                <div className='flex items-center gap-2'>
                                    <config.icon className={`size-5 ${config.color}`} />
                                    <span className='font-medium'>{config.label}</span>
                                </div>
                            </TableCell>
                            <TableCell className="font-medium">{log.employee}</TableCell>
                            <TableCell className="text-muted-foreground">{log.property_code}</TableCell>
                            <TableCell className="text-muted-foreground">{log.department}</TableCell>
                            <TableCell className="text-muted-foreground">{log.time}</TableCell>
                            <TableCell>
                                {log.deviation > 0 ? (
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
                        No live logs available.
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
