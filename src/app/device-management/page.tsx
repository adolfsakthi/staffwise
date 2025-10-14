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
import {
  MoreVertical,
  Wifi,
  WifiOff,
  Loader2,
  Activity,
} from 'lucide-react';
import type { Device } from '@/lib/types';
import AddDeviceForm from '@/components/device-management/add-device-form';
import { pingDevice } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

const MOCK_DEVICES: Device[] = [
    { id: '1', deviceName: 'Main Entrance', branchName: 'Lobby', ipAddress: '192.168.1.101', status: 'online', property_code: 'D001', clientId: 'default_client', branchId: 'default_branch', port: 4370, connectionKey: 'key1' },
    { id: '2', deviceName: 'Staff Entrance', branchName: 'Basement', ipAddress: '192.168.1.102', status: 'offline', property_code: 'D001', clientId: 'default_client', branchId: 'default_branch', port: 4370, connectionKey: 'key2' },
    { id: '3', deviceName: 'Rooftop Bar', branchName: 'Rooftop', ipAddress: '192.168.2.50', status: 'online', property_code: 'D002', clientId: 'default_client', branchId: 'default_branch', port: 4370, connectionKey: 'key3' },
];


export default function DeviceManagementPage() {
  const [devices, setDevices] = useState<Device[]>(MOCK_DEVICES);
  const [pingingDeviceId, setPingingDeviceId] = useState<string | null>(null);
  const { toast } = useToast();

  const propertyCode = 'D001';
  
  const handleAddDevice = (newDevice: Omit<Device, 'id' | 'clientId' | 'branchId'>) => {
    const newId = (Math.max(...devices.map(d => parseInt(d.id))) + 1).toString();
    setDevices(prev => [...prev, {
        ...newDevice,
        id: newId,
        clientId: 'default_client',
        branchId: 'default_branch',
    }])
  }

  const handlePingDevice = async (device: Device) => {
    setPingingDeviceId(device.id);
    const result = await pingDevice(device.ipAddress, device.port);
    
    if (result.success) {
      toast({
        title: 'Device Online',
        description: `Successfully connected to ${device.deviceName}.`,
      });
      setDevices(prev => prev.map(d => d.id === device.id ? {...d, status: 'online'} : d));
    } else {
      toast({
        variant: 'destructive',
        title: 'Device Offline',
        description: result.message,
      });
      setDevices(prev => prev.map(d => d.id === device.id ? {...d, status: 'offline'} : d));
    }
    setPingingDeviceId(null);
  };

  const filteredDevices = useMemo(() => {
    return devices.filter(d => d.property_code === propertyCode);
  }, [devices, propertyCode]);

  return (
    <div className='space-y-6'>
      <AddDeviceForm onAddDevice={handleAddDevice} propertyCode={propertyCode} />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Device Management</CardTitle>
            <CardDescription>
              Manage and monitor your connected biometric devices for property {propertyCode}.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
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
                {filteredDevices && filteredDevices.length > 0 ? (
                  filteredDevices.map((device) => (
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
        </CardContent>
      </Card>
    </div>
  );
}
