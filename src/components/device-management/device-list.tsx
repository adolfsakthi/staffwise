'use client';

import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  MoreVertical,
  Wifi,
  WifiOff,
  Loader2,
  Trash2,
  Edit,
  Activity,
  FileText,
  RefreshCw
} from 'lucide-react';
import type { Device } from '@/lib/types';
import { removeDevice, pingDevice, processLogs, updateDeviceStatus } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface DeviceListProps {
    initialDevices: Device[];
}

type ActionState = {
    isDeleting?: boolean;
    isPinging?: boolean;
    isSyncing?: boolean;
}

export default function DeviceList({ initialDevices }: DeviceListProps) {
  const [devices, setDevices] = useState<Device[]>(initialDevices);
  const [actionStates, setActionStates] = useState<{[key: string]: ActionState}>({});
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState<Device | null>(null);

  const { toast } = useToast();
  const router = useRouter();

  const setActionState = (deviceId: string, state: ActionState) => {
    setActionStates(prev => ({ ...prev, [deviceId]: { ...prev[deviceId], ...state }}));
  };

  const handlePingDevice = async (device: Device) => {
    setActionState(device.id, { isPinging: true });
    
    const result = await pingDevice(device.ipAddress, device.port);
    
    toast({
        title: result.success ? 'Ping Successful' : 'Ping Failed',
        description: result.message,
        variant: result.success ? 'default' : 'destructive',
    });

    const newStatus = result.success ? 'online' : 'offline';
    setDevices(prev => prev.map(d => d.id === device.id ? { ...d, status: newStatus } : d));
    await updateDeviceStatus(device.id, newStatus);
    setActionState(device.id, { isPinging: false });
    router.refresh();
  }
  
  const handleSyncLogs = async (device: Device) => {
    setActionState(device.id, { isSyncing: true });
    try {
        const response = await fetch('/api/sync-device', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ip: device.ipAddress,
                port: device.port,
                connectionKey: device.connectionKey
            }),
        });

        // The response might not be JSON if an unexpected server error occurs.
        // First, check if the response is ok, then check the content type.
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(result.message || `Sync failed: ${errorText}`);
        }
        
        const result = await response.json();
        
        // The API now returns the raw data object, which contains a `data` property with the logs.
        const logs = result.logs?.data || [];
        const formattedLogs = logs.map((log: any) => ({
             userId: log.userId,
             attTime: log.recordTime,
        }));


        if (result.success && formattedLogs.length > 0) {
            // Now process these logs
            if (device.property_code) {
                const processResult = await processLogs(formattedLogs, device.property_code);
                 toast({
                    title: 'Sync Successful',
                    description: `Successfully synced ${formattedLogs.length} logs. ${processResult.message}`,
                });
            } else {
                 toast({
                    title: 'Sync Successful, Processing Skipped',
                    description: `Synced ${formattedLogs.length} logs, but no property code set for device.`,
                });
            }
        } else if (result.success) {
            toast({
                title: 'No New Logs',
                description: 'The device is connected, but there are no new attendance logs to sync.',
            });
        } else {
             toast({
                variant: 'destructive',
                title: 'Sync Failed',
                description: result.message,
            });
        }

        router.refresh();

    } catch(e: any) {
        console.error("Error during sync:", e);
        toast({ variant: 'destructive', title: 'Error During Sync', description: e.message || "An unexpected error occurred." });
    } finally {
        setActionState(device.id, { isSyncing: false });
    }
  }

  const confirmRemoveDevice = async () => {
    if (!deviceToDelete) return;
    
    setActionState(deviceToDelete.id, { isDeleting: true });
    setShowDeleteAlert(false);

    const result = await removeDevice(deviceToDelete.id);

    if (result.success) {
        setDevices(prev => prev.filter(d => d.id !== deviceToDelete.id));
        toast({
            title: 'Device Removed',
            description: 'The device has been successfully removed.',
        });
        router.refresh();
    } else {
        toast({
            variant: 'destructive',
            title: 'Removal Failed',
            description: result.message || 'Could not remove the device.',
        });
    }
    
    setActionState(deviceToDelete.id, { isDeleting: false });
    setDeviceToDelete(null);
  };

  return (
      <>
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Device Name</TableHead>
                <TableHead>Serial Number</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {devices && devices.length > 0 ? (
                devices.map((device) => {
                  const state = actionStates[device.id] || {};
                  const isLoading = state.isDeleting || state.isPinging || state.isSyncing;
                  
                  let statusLabel = device.status;
                  if (state.isDeleting) statusLabel = 'Removing...';
                  else if (state.isPinging) statusLabel = 'Pinging...';
                  else if (state.isSyncing) statusLabel = 'Syncing...';


                  return (
                  <TableRow key={device.id}>
                    <TableCell className="font-medium">{device.deviceName}</TableCell>
                    <TableCell className="font-medium text-muted-foreground">{device.serialNumber || 'N/A'}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {device.ipAddress}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          device.status === 'online' ? 'secondary' : 'outline'
                        }
                      >
                         {isLoading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                         ) : device.status === 'online' ? (
                          <Wifi className="mr-2 text-green-500" />
                        ) : (
                          <WifiOff className="mr-2 text-red-500" />
                        )}
                        {statusLabel.charAt(0).toUpperCase() + statusLabel.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" disabled={isLoading}>
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <MoreVertical />
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handlePingDevice(device)}>
                            <Activity className="mr-2 h-4 w-4" />
                            Ping Device
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSyncLogs(device)}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Sync Logs
                          </DropdownMenuItem>
                          <DropdownMenuItem disabled>
                            <FileText className="mr-2 h-4 w-4" />
                            View Logs
                          </DropdownMenuItem>
                           <DropdownMenuItem disabled>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10" onClick={() => { setDeviceToDelete(device); setShowDeleteAlert(true); }}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove Device
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )})
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No devices found for this property. Add one above to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the device
                        <span className='font-bold'> {deviceToDelete?.deviceName}</span>.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setDeviceToDelete(null)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmRemoveDevice}>
                        {actionStates[deviceToDelete?.id || '']?.isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Continue
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </>
  );
}
