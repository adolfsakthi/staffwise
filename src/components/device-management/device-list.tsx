
'use client';

import { useState, useMemo } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  MoreVertical,
  Wifi,
  WifiOff,
  Loader2,
  Activity,
} from 'lucide-react';
import type { Device } from '@/lib/types';
import { pingDevice, updateDeviceStatus } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface DeviceListProps {
    initialDevices: Device[];
}

export default function DeviceList({ initialDevices }: DeviceListProps) {
  const [devices, setDevices] = useState<Device[]>(initialDevices);
  const [pingingDeviceId, setPingingDeviceId] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const handlePingDevice = async (device: Device) => {
    setPingingDeviceId(device.id);
    const result = await pingDevice(device.ipAddress, device.port);
    
    const newStatus = result.success ? 'online' : 'offline';

    if (result.success) {
      toast({
        title: 'Device Online',
        description: `Successfully connected to ${device.deviceName}.`,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Device Offline',
        description: result.message,
      });
    }
    
    try {
        await updateDeviceStatus(device.id, newStatus);
        setDevices(prev => prev.map(d => d.id === device.id ? {...d, status: newStatus} : d));
        // No full router.refresh() needed, just update local state
    } catch(error) {
        console.error(error);
        toast({ variant: 'destructive', title: 'Error updating status', description: 'Could not save device status.' });
    }

    setPingingDeviceId(null);
  };

  return (
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Device Name</TableHead>
              <TableHead>Branch</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialDevices && initialDevices.length > 0 ? (
              initialDevices.map((device) => (
                <TableRow key={device.id}>
                  <TableCell className="font-medium">{device.deviceName}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {device.branchName || 'N/A'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {device.ipAddress}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        device.status === 'online' ? 'secondary' : 'destructive'
                      }
                      className={
                        device.status === 'online'
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-500'
                          : 'border-red-200 bg-red-50 text-red-500'
                      }
                    >
                      {pingingDeviceId === device.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : device.status === 'online' ? (
                        <Wifi className="mr-2" />
                      ) : (
                        <WifiOff className="mr-2" />
                      )}
                      {pingingDeviceId === device.id ? 'Pinging...' : (device.status ? device.status.charAt(0).toUpperCase() + device.status.slice(1) : 'Unknown')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" disabled={!!pingingDeviceId}>
                          <MoreVertical />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handlePingDevice(device)}>
                          <Activity className="mr-2" />
                          Ping Device
                        </DropdownMenuItem>
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
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No devices found for this property.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
  );
}
