'use client';

import { useEffect, useState, useMemo } from 'react';
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
  PlusCircle,
  Wifi,
  WifiOff,
  Loader2,
} from 'lucide-react';
import type { Device } from '@/lib/types';
import { useUser } from '@/firebase';
import AddDeviceForm from '@/components/device-management/add-device-form';
import { MOCK_DEVICES } from '@/lib/mock-data';


export default function DeviceManagementPage() {
  const { user, isUserLoading } = useUser();

  const clientId = 'default_client';
  const branchId = 'default_branch';

  // @ts-ignore
  const propertyCode = user?.property_code || 'D001';

  const devices = useMemo(() => {
      return MOCK_DEVICES.filter(d => d.property_code === propertyCode)
  }, [propertyCode]);
  const isLoadingDevices = false;
  const error = null;

  if (isUserLoading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }

  return (
    <div className='space-y-6'>
      <AddDeviceForm clientId={clientId} branchId={branchId} propertyCode={propertyCode} />
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
                  <TableHead>Property Code</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingDevices ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                    </TableCell>
                  </TableRow>
                ) : error ? (
                   <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-destructive">
                      Error: {error.message}
                    </TableCell>
                  </TableRow>
                ) : devices && devices.length > 0 ? (
                  devices.map((device) => (
                    <TableRow key={device.id}>
                      <TableCell className="font-medium">{device.deviceName}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {device.property_code}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {device.branchName}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {device.model}
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
                          {device.status === 'online' ? (
                            <Wifi className="mr-2" />
                          ) : (
                            <WifiOff className="mr-2" />
                          )}
                          {device.status.charAt(0).toUpperCase() +
                            device.status.slice(1)}
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
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
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
