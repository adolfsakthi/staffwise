
import { Button } from '@/components/ui/button';
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
import { Badge } from '@/components/ui/badge';
import { MoreVertical, PlusCircle, Wifi, WifiOff } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const MOCK_DEVICES = [
    { id: 'dev_1', name: 'Main Entrance Biometric', model: 'ESSL x990', ip: '192.168.1.100', status: 'online', branch: 'Head Office' },
    { id: 'dev_2', name: 'Server Room Access', model: 'ESSL F22', ip: '192.168.1.101', status: 'online', branch: 'Head Office' },
    { id: 'dev_3', name: 'Warehouse Exit', model: 'ESSL x990', ip: '192.168.1.102', status: 'offline', branch: 'Warehouse A' },
    { id: 'dev_4', name: 'HR Department', model: 'ESSL F18', ip: '192.168.1.103', status: 'online', branch: 'Head Office' },
    { id: 'dev_5', name: 'Branch Office 1', model: 'ESSL x990', ip: '10.10.5.20', status: 'online', branch: 'Branch Office 1' },
];

export default function DeviceManagementPage() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Device Management</CardTitle>
          <CardDescription>
            Manage and monitor your connected biometric devices across all branches.
          </CardDescription>
        </div>
        <Button>
          <PlusCircle className="mr-2" /> Add Device
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Device Name</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_DEVICES.map((device) => (
                <TableRow key={device.id}>
                  <TableCell className="font-medium">{device.name}</TableCell>
                  <TableCell className="text-muted-foreground">{device.branch}</TableCell>
                  <TableCell className="text-muted-foreground">{device.model}</TableCell>
                  <TableCell className="text-muted-foreground">{device.ip}</TableCell>
                  <TableCell>
                    <Badge variant={device.status === 'online' ? 'secondary' : 'destructive'} className={device.status === 'online' ? 'text-emerald-500 bg-emerald-50 border border-emerald-200' : 'bg-red-50 text-red-500 border border-red-200'}>
                      {device.status === 'online' ? <Wifi className="mr-2" /> : <WifiOff className="mr-2" />}
                      {device.status.charAt(0).toUpperCase() + device.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>View Logs</DropdownMenuItem>
                        <DropdownMenuItem>Sync Device</DropdownMenuItem>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:text-destructive">
                          Remove Device
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
