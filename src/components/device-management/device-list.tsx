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
} from '@/components/ui/dialog';
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
import { removeDevice, pingDevice, requestLogSync } from '@/app/actions';
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

  const [showLogsDialog, setShowLogsDialog] = useState(false);
  const [logs, setLogs] = useState<any[] | null>(null);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [deviceForLogs, setDeviceForLogs] = useState<Device | null>(null);
  const [logError, setLogError] = useState<string | null>(null);

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
    // No need to call updateDeviceStatus here as ping is ephemeral. Status updates when device pushes data.
    setActionState(device.id, { isPinging: false });
  }
  
  const handleSyncLogs = async (device: Device) => {
    if (!device.serialNumber) {
        toast({
            variant: 'destructive',
            title: 'Sync Failed',
            description: 'Device serial number is missing. Cannot queue sync request.',
        });
        return;
    }

    setActionState(device.id, { isSyncing: true });
    
    // This is a fire-and-forget action in the ADMS protocol
    requestLogSync(device.serialNumber);

    toast({
      title: "Sync Request Sent",
      description: "A sync request has been sent to the device. New logs will appear on the Live Logs page shortly."
    });

    setTimeout(() => {
        setActionState(device.id, { isSyncing: false });
        router.refresh();
    }, 1500)
  }

  const handleViewLogs = async (device: Device) => {
    setDeviceForLogs(device);
    setShowLogsDialog(true);
    setIsLoadingLogs(true);
    setLogs(null);
    setLogError(null);

    try {
      const response = await fetch(`/api/fetch-mock-logs?ip=${device.ipAddress}&port=${device.port}`);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch logs from device.');
      }
      
      setLogs(result);

    } catch (error: any) {
      console.error(error);
      const errorMessage = error.message || 'Could not retrieve mock logs.';
      setLogError(errorMessage);
       toast({
        variant: 'destructive',
        title: 'Failed to View Logs',
        description: errorMessage,
      });
      setLogs([]); // show empty state instead of loading
    } finally {
      setIsLoadingLogs(false);
    }
  };

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
                      {device.ipAddress}:{device.port}
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
                          <DropdownMenuItem onClick={() => handleViewLogs(device)}>
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
        <Dialog open={showLogsDialog} onOpenChange={setShowLogsDialog}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Mock Punch Logs for {deviceForLogs?.deviceName}</DialogTitle>
                    <DialogDescription>
                        Displaying data from <code className='bg-muted text-muted-foreground rounded-sm px-1 py-0.5'>{`http://${deviceForLogs?.ipAddress}:${deviceForLogs?.port}/mock/adms/logs`}</code>
                    </DialogDescription>
                </DialogHeader>
                <div className="mt-4 max-h-[500px] overflow-y-auto rounded-md border bg-muted p-4">
                    {isLoadingLogs ? (
                        <div className="flex justify-center items-center h-48">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : logs && logs.length > 0 ? (
                        <pre className="text-sm whitespace-pre-wrap break-words">
                            {JSON.stringify(logs, null, 2)}
                        </pre>
                    ) : (
                        <div className="flex justify-center items-center h-48 text-muted-foreground">
                            <p>{logError ? logError : "No logs found at the specified endpoint."}</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    </>
  );
}
