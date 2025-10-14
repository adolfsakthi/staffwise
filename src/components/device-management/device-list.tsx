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
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import {
  MoreVertical,
  Wifi,
  WifiOff,
  Loader2,
  Activity,
  Trash2,
  Edit,
  FileText,
  UploadCloud,
} from 'lucide-react';
import type { Device } from '@/lib/types';
import { pingDevice, updateDeviceStatus, removeDevice, processLogs } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface DeviceListProps {
    initialDevices: Device[];
}

export default function DeviceList({ initialDevices }: DeviceListProps) {
  const [devices, setDevices] = useState<Device[]>(initialDevices);
  const [pingingDeviceId, setPingingDeviceId] = useState<string | null>(null);
  const [deletingDeviceId, setDeletingDeviceId] = useState<string | null>(null);
  const [syncingDeviceId, setSyncingDeviceId] = useState<string | null>(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState<Device | null>(null);
  const [showSyncDialog, setShowSyncDialog] = useState(false);
  const [syncResult, setSyncResult] = useState<{ logs: any[] | null, message: string } | null>(null);

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
        router.refresh();
    } catch(error) {
        console.error(error);
        toast({ variant: 'destructive', title: 'Error updating status', description: 'Could not save device status.' });
    }

    setPingingDeviceId(null);
  };
  
  const confirmRemoveDevice = async () => {
    if (!deviceToDelete) return;
    
    setDeletingDeviceId(deviceToDelete.id);
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
    
    setDeletingDeviceId(null);
    setDeviceToDelete(null);
  };

  const handleSyncDevice = async (device: Device) => {
    setSyncingDeviceId(device.id);
    setSyncResult(null);

    try {
        const response = await fetch('/api/sync-device', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ip: device.ipAddress, port: device.port }),
        });

        if (!response.ok) {
            const errorResult = await response.json();
            throw new Error(errorResult.message || 'Sync failed with an unknown error.');
        }

        const result = await response.json();

        if (result.success) {
            setSyncResult({ logs: result.data, message: `Found ${result.data.length} logs.` });
            setShowSyncDialog(true);
        } else {
             toast({
                variant: 'destructive',
                title: 'Sync Failed',
                description: result.message,
            });
        }
    } catch (error: any) {
        console.error("Sync error in component:", error);
        toast({
            variant: 'destructive',
            title: 'Sync Error',
            description: error.message || 'An unexpected error occurred.',
        });
    } finally {
        setSyncingDeviceId(null);
    }
  };

  const handleProcessAndSaveLogs = async () => {
    if (!syncResult || !syncResult.logs) return;
    const device = devices.find(d => d.id === syncingDeviceId);
    if (!device) return;

    const result = await processLogs(syncResult.logs, device.property_code as string);
    if (result.success) {
        toast({
            title: 'Logs Processed',
            description: 'Live logs and attendance records have been updated.',
        });
    } else {
        toast({
            variant: 'destructive',
            title: 'Processing Failed',
            description: result.message,
        });
    }
    setShowSyncDialog(false);
    setSyncResult(null);
    router.refresh();
  }


  const isActionRunning = !!pingingDeviceId || !!deletingDeviceId || !!syncingDeviceId;
  const getActionState = (deviceId: string) => {
      if (pingingDeviceId === deviceId) return 'Pinging...';
      if (deletingDeviceId === deviceId) return 'Removing...';
      if (syncingDeviceId === deviceId) return 'Syncing...';
      return null;
  }

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
                devices.map((device) => (
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
                      >
                        {getActionState(device.id) ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : device.status === 'online' ? (
                          <Wifi className="mr-2" />
                        ) : (
                          <WifiOff className="mr-2" />
                        )}
                        {getActionState(device.id) || (device.status ? device.status.charAt(0).toUpperCase() + device.status.slice(1) : 'Unknown')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" disabled={isActionRunning}>
                            {isActionRunning && (pingingDeviceId === device.id || deletingDeviceId === device.id || syncingDeviceId === device.id) ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <MoreVertical />
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                           <DropdownMenuItem onClick={() => handleSyncDevice(device)} disabled={isActionRunning}>
                            <UploadCloud className="mr-2" />
                            Sync Logs
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handlePingDevice(device)} disabled={isActionRunning}>
                            <Activity className="mr-2" />
                            Ping Device
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem disabled>
                            <FileText className="mr-2" />
                            View Logs
                          </DropdownMenuItem>
                          <DropdownMenuItem disabled>
                            <Edit className="mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => { setDeviceToDelete(device); setShowDeleteAlert(true); }} disabled={isActionRunning}>
                            <Trash2 className="mr-2 h-4 w-4" />
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
                        {deletingDeviceId ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Continue
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        <Dialog open={showSyncDialog} onOpenChange={(isOpen) => { if (!isOpen) setSyncResult(null); setShowSyncDialog(isOpen); }}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Sync Complete</DialogTitle>
                    <DialogDescription>
                        {syncResult?.message || 'Successfully fetched logs from the device.'}
                    </DialogDescription>
                </DialogHeader>
                <div className="max-h-60 overflow-y-auto rounded-md border bg-muted p-4">
                    <pre className="text-xs">{JSON.stringify(syncResult?.logs, null, 2)}</pre>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setShowSyncDialog(false)}>Cancel</Button>
                    <Button onClick={handleProcessAndSaveLogs} disabled={!syncResult?.logs || syncResult.logs.length === 0}>
                        Process and Save Logs
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </>
  );
}
