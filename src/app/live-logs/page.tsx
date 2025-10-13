
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

const MOCK_LOGS = [
    { type: 'late', employee: 'John Doe', department: 'Engineering', time: '09:18', deviation: 18, id: 1 },
    { type: 'overtime', employee: 'Sarah Wilson', department: 'Engineering', time: '18:45', deviation: 45, id: 2 },
    { type: 'early', employee: 'Jane Smith', department: 'Sales', time: '08:50', deviation: 10, id: 3 },
    { type: 'late', employee: 'Robert Brown', department: 'HR', time: '09:05', deviation: 5, id: 4 },
    { type: 'overtime', employee: 'David Green', department: 'IT', time: '19:02', deviation: 62, id: 5 },
    { type: 'on_time', employee: 'Lisa Ray', department: 'Operations', time: '08:59', deviation: 0, id: 6 },
    { type: 'late', employee: 'Michael Davis', department: 'Sales', time: '09:25', deviation: 25, id: 7 },
];

const logConfig = {
    late: { icon: AlertTriangle, color: 'text-red-500', label: 'Late Arrival', badge: 'destructive' },
    overtime: { icon: Clock, color: 'text-blue-500', label: 'Overtime', badge: 'default' },
    early: { icon: ArrowUp, color: 'text-yellow-500', label: 'Early Arrival', badge: 'secondary' },
    on_time: { icon: UserCheck, color: 'text-green-500', label: 'On Time', badge: 'secondary' },
} as const;


export default function LiveLogsPage() {
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
                <TableHead>Department</TableHead>
                <TableHead>Punch Time</TableHead>
                <TableHead>Deviation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_LOGS.map((log) => {
                const config = logConfig[log.type as keyof typeof logConfig] || logConfig.on_time;
                return (
                    <TableRow key={log.id}>
                        <TableCell>
                            <div className='flex items-center gap-2'>
                                <config.icon className={`size-5 ${config.color}`} />
                                <span className='font-medium'>{config.label}</span>
                            </div>
                        </TableCell>
                        <TableCell className="font-medium">{log.employee}</TableCell>
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
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}