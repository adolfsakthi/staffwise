
'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Device } from '@/lib/types';
import { addDevice } from '@/app/actions';
import { useRouter } from 'next/navigation';

type AddDeviceFormProps = {
  propertyCode: string;
};

export default function AddDeviceForm({ propertyCode }: AddDeviceFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [deviceName, setDeviceName] = useState('');
  const [branchName, setBranchName] = useState('Main Lobby');
  const [ipAddress, setIpAddress] = useState('');
  const [port, setPort] = useState(4370);
  const [connectionKey, setConnectionKey] = useState('');


  const handleAddDevice = async () => {
    if (!deviceName || !branchName || !ipAddress) {
      toast({
        variant: 'destructive',
        title: 'Missing Fields',
        description: 'Please fill out all required fields to add a device.',
      });
      return;
    }
    setIsAdding(true);

    try {
        await addDevice({
            deviceName,
            branchName,
            ipAddress,
            port,
            connectionKey,
            property_code: propertyCode,
            status: 'offline', // Default status
            // These would come from the user's session in a real app
            clientId: 'default_client', 
            branchId: 'default_branch',
        });
        
        toast({
            title: 'Device Added',
            description: `${deviceName} has been registered.`,
        });

        // Reset form
        setDeviceName('');
        setBranchName('Main Lobby');
        setIpAddress('');
        setPort(4370);
        setConnectionKey('');

        // Re-route to refresh the page and show the new device
        router.refresh();

    } catch(error) {
        console.error(error);
        toast({
            variant: 'destructive',
            title: 'Error Adding Device',
            description: 'Could not save the new device. Please check the logs.'
        })
    } finally {
        setIsAdding(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Biometric Device</CardTitle>
        <CardDescription>
          Register a new device for property {propertyCode}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="device-name">Device Name</Label>
            <Input
              id="device-name"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              placeholder="e.g., Main Entrance"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="branch">Branch/Location</Label>
            <Input
              id="branch"
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
              placeholder="e.g., Main Lobby"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ip-address">IP Address</Label>
            <Input
              id="ip-address"
              value={ipAddress}
              onChange={(e) => setIpAddress(e.target.value)}
              placeholder="e.g., 192.168.1.100"
            />
          </div>
           <div className="space-y-2">
            <Label htmlFor="port">Port</Label>
            <Input
              id="port"
              type="number"
              value={port}
              onChange={(e) => setPort(Number(e.target.value))}
              placeholder="e.g., 4370"
            />
          </div>
           <div className="space-y-2">
            <Label htmlFor="connection-key">Connection Key</Label>
            <Input
              id="connection-key"
              type="password"
              value={connectionKey}
              onChange={(e) => setConnectionKey(e.target.value)}
              placeholder="Device password (e.g. 0)"
            />
          </div>
        </div>
        <Button onClick={handleAddDevice} disabled={isAdding}>
          {isAdding ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <PlusCircle className="mr-2 h-4 w-4" />
          )}
          Add Device
        </Button>
      </CardContent>
    </Card>
  );
}
