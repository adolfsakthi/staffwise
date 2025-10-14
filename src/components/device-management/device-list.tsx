
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  MoreVertical,
  Wifi,
  WifiOff,
  Loader2,
  Trash2,
  Edit,
  FileText,
  RefreshCw,
  FileCheck2,
} from 'lucide-react';
import type { Device, LiveLog } from '@/lib/types';
import { removeDevice, processLogs } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface DeviceListProps {
    initialDevices: Device[];
}

export default function DeviceList({ initialDevices }: DeviceListProps) {
  const [devices, setDevices] = useState<Device[]>(initialDevices);
  const [actionStates, setActionStates] = useState<{[key: string]: {isSyncing?: boolean, isDeleting?: boolean}}>({});
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState<Device | null>(null);
  const [syncedLogs, setSyncedLogs] = useState<any[] | null>(null);
  const [showLogsDialog, setShowLogsDialog] = useState(false);
  const [isSavingLogs, setIsSavingLogs] = useState(false);


  const { toast } = useToast();
  const router = useRouter();

  const setActionState = (deviceId: string, state: {isSyncing?: boolean, isDeleting?: boolean}) => {
    setActionStates(prev => ({ ...prev, [deviceId]: { ...prev[deviceId], ...state }}));
  };

  const handleSyncDevice = async (device: Device) => {
    setActionState(device.id, { isSyncing: true });

    try {
        const response = await fetch('/api/sync-device', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ip: device.ipAddress, port: device.port, connectionKey: device.connectionKey }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Sync failed with an unknown error.');
        }

        if (result.success) {
            toast({
                title: 'Sync Successful',
                description: `Fetched ${result.logs.length} logs from ${device.deviceName}.`,
            });
            setDevices(prev => prev.map(d => d.id === device.id ? { ...d, status: 'online' } : d));
            setSyncedLogs(result.logs);
            setShowLogsDialog(true);
        } else {
            throw new Error(result.message || 'The device responded with an error.');
        }

    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Sync Failed',
            description: error.message,
        });
         setDevices(prev => prev.map(d => d.id === device.id ? { ...d, status: 'offline' } : d));
    } finally {
        setActionState(device.id, { isSyncing: false });
    }
  };

  const handleProcessAndSaveLogs = async () => {
    if (!syncedLogs || syncedLogs.length === 0) {
      toast({ variant: 'destructive', title: 'No logs to save.' });
      return;
    }
    
    setIsSavingLogs(true);
    const device = devices.find(d => actionStates[d.id]?.isSyncing || syncedLogs);
    const propertyCode = device?.property_code;
    
    if(!propertyCode) {
         toast({ variant: 'destructive', title: 'Could not determine property code for logs.' });
         setIsSavingLogs(false);
         return;
    }

    try {
        const result = await processLogs(syncedLogs, propertyCode);
        if(result.success) {
            toast({
                title: 'Logs Processed!',
                description: result.message,
                action: <FileCheck2 className="text-green-500" />
            });
            setShowLogsDialog(false);
            setSyncedLogs(null);
            router.refresh();
        } else {
            throw new Error(result.message);
        }
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Error Processing Logs',
            description: error.message
        });
    } finally {
        setIsSavingLogs(false);
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
                <TableHead>Branch</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {devices && devices.length > 0 ? (
                devices.map((device) => {
                  const isLoading = actionStates[device.id]?.isSyncing || actionStates[device.id]?.isDeleting;
                  const status = actionStates[device.id]?.isSyncing ? 'Syncing...' : (actionStates[device.id]?.isDeleting ? 'Removing...' : device.status);

                  return (
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
                        {status.charAt(0).toUpperCase() + status.slice(1)}
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
                           <DropdownMenuItem onClick={() => handleSyncDevice(device)}>
                            <RefreshCw className="mr-2" />
                            Sync Logs
                          </DropdownMenuItem>
                          <DropdownMenuItem disabled>
                            <FileText className="mr-2" />
                            View Logs
                          </DropdownMenuItem>
                          <DropdownMenuItem disabled>
                            <Edit className="mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => { setDeviceToDelete(device); setShowDeleteAlert(true); }}>
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

        <Dialog open={showLogsDialog} onOpenChange={setShowLogsDialog}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Synced Logs</DialogTitle>
                    <DialogDescription>
                        Review the logs fetched from the device before saving them to the system. Found {syncedLogs?.length || 0} records.
                    </DialogDescription>
                </DialogHeader>
                <div className="max-h-[50vh] overflow-y-auto rounded-md border">
                   <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User ID</TableHead>
                                <TableHead>Timestamp</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {syncedLogs?.map((log, index) => (
                                <TableRow key={`${log.userId}-${index}`}>
                                    <TableCell>{log.userId}</TableCell>
                                    <TableCell>{new Date(log.attTime).toLocaleString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                   </Table>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleProcessAndSaveLogs} disabled={isSavingLogs}>
                        {isSavingLogs ? <Loader2 className="mr-2 animate-spin" /> : null}
                        Save & Process Logs
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </>
  );
}
