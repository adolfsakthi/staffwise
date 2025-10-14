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

type AddDeviceFormProps = {
  clientId: string;
  branchId: string;
  propertyCode: string;
};

export default function AddDeviceForm({ clientId, branchId, propertyCode }: AddDeviceFormProps) {
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [deviceName, setDeviceName] = useState('');
  const [branchName, setBranchName] = useState('Main Lobby');
  const [model, setModel] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [status, setStatus] = useState<'online' | 'offline'>('online');

  const handleAddDevice = async () => {
    if (!deviceName || !branchName || !model || !ipAddress) {
      toast({
        variant: 'destructive',
        title: 'Missing Fields',
        description: 'Please fill out all fields to add a device.',
      });
      return;
    }
    setIsAdding(true);

    // Mock functionality since backend is disabled
    setTimeout(() => {
        toast({
          title: 'Device Added (Mock)',
          description: `${deviceName} has been added to the mock list.`,
        });
        // Reset form
        setDeviceName('');
        setBranchName('Main Lobby');
        setModel('');
        setIpAddress('');
        setIsAdding(false);
    }, 1000)
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
            <Label htmlFor="model">Device Model</Label>
            <Input
              id="model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="e.g., ZK-Teco-X10"
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
