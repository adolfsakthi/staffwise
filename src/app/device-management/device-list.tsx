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
import { useToast } from '@/hooks/use-toast';
import { pingDevice, removeDevice, getDeviceLogs, requestLogSync } from '@/app/actions';

interface DeviceListProps {
    initialDevices: Device[];
}

type ActionState = {
    isDeleting?: boolean;
    isPinging?: boolean;
    isSyncing?: boolean;
}

export default function DeviceList({ initialDevices }: DeviceListProps) {
  const [actionStates, setActionStates] = useState<{[key: string]: ActionState}>({});
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState<Device | null>(null);

  const [showLogsDialog, setShowLogsDialog] = useState(false);
  const [logs, setLogs] = useState<any[] | null>(null);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [logError, setLogError] = useState<string | null>(null);
  const [deviceForLogs, setDeviceForLogs] = useState<Device | null>(null);

  const { toast } = useToast();

  const setActionState = (deviceId: string, state: ActionState) => {
    setActionStates(prev => ({ ...prev, [deviceId]: { ...prev[deviceId], ...state }}));
  };

  const handlePingDevice = async (device: Device) => {
    setActionState(device.id, { isPinging: true });
    
    const result = await pingDevice(device.id);

    if (result.success) {
        toast({
            title: 'Ping Successful',
            description: `Device ${device.deviceName} is ${result.status}.`,
        });
    } else {
        toast({
            variant: 'destructive',
            title: 'Ping Failed',
            description: `Could not reach device ${device.deviceName}.`,
        });
    }

    setActionState(device.id, { isPinging: false });
  }
  
  const handleSyncLogs = async (device: Device) => {
    setActionState(device.id, { isSyncing: true });

    const result = await requestLogSync(device.id, window.location.host);

    if (result.success) {
        toast({
            title: 'Sync Started',
            description: result.message,
        });
        handleViewLogs(device);
    } else {
        toast({
            variant: 'destructive',
            title: 'Sync Failed',
            description: result.message || 'Could not start sync process.',
        });
    }

    setActionState(device.id, { isSyncing: false });
  }

  const handleViewLogs = async (device: Device) => {
    setDeviceForLogs(device);
    setShowLogsDialog(true);
    setIsLoadingLogs(true);
    setLogs(null);
    setLogError(null);
  
    const result = await getDeviceLogs(device.id);
    
    if (result.success) {
        setLogs(result.logs || []);
    } else {
        setLogError(result.error || 'An unknown error occurred.');
    }

    setIsLoadingLogs(false);
  };

  const confirmRemoveDevice = async () => {
    if (!deviceToDelete) return;
    
    setActionState(deviceToDelete.id, { isDeleting: true });
    setShowDeleteAlert(false);

    const result = await removeDevice(deviceToDelete.id);
    
    if (result.success) {
      toast({
          title: 'Device Removed',
          description: 'The device has been successfully removed.',
      });
    } else {
      toast({
          variant: 'destructive',
          title: 'Error',
          description: result.message,
      });
    }
    
    setDeviceToDelete(null);
    // No need to set isDeleting to false as the component will re-render
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
              {initialDevices && initialDevices.length > 0 ? (
                initialDevices.map((device) => {
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
                    <DialogTitle>Stored Punch Logs for {deviceForLogs?.deviceName}</DialogTitle>
                    <DialogDescription>
                       Displaying raw data from the server's stored logs.
                    </DialogDescription>
                </DialogHeader>
                <div className="mt-4 max-h-[500px] overflow-y-auto rounded-md border bg-muted p-4">
                    {isLoadingLogs ? (
                        <div className="flex justify-center items-center h-48">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : logError ? (
                         <div className="flex flex-col justify-center items-center h-48 text-destructive-foreground bg-destructive/80 rounded-md p-4">
                            <p className="font-bold">Failed to fetch logs</p>
                            <p className="text-sm">{logError}</p>
                        </div>
                    ) : logs && logs.length > 0 ? (
                        <pre className="text-sm whitespace-pre-wrap break-words">
                            {JSON.stringify(logs, null, 2)}
                        </pre>
                    ) : (
                        <div className="flex justify-center items-center h-48 text-muted-foreground">
                            No stored logs found on the server.
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    </>
  );
}
