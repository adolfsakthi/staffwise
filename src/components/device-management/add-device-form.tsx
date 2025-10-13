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
import { useFirestore } from '@/firebase';
import { collection, addDoc } from 'firebase/firestore';
import type { Device } from '@/lib/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

type AddDeviceFormProps = {
  propertyCode: string;
};

export default function AddDeviceForm({ propertyCode }: AddDeviceFormProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [deviceName, setDeviceName] = useState('');
  const [branch, setBranch] = useState('');
  const [model, setModel] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [status, setStatus] = useState<'online' | 'offline'>('online');

  const handleAddDevice = async () => {
    if (!deviceName || !branch || !model || !ipAddress) {
      toast({
        variant: 'destructive',
        title: 'Missing Fields',
        description: 'Please fill out all fields to add a device.',
      });
      return;
    }
    setIsAdding(true);

    const newDevice: Omit<Device, 'id'> = {
      name: deviceName,
      branch,
      model,
      ip: ipAddress,
      status,
      property_code: propertyCode,
    };

    const devicesCollection = collection(firestore, 'devices');

    addDoc(devicesCollection, newDevice)
      .then(() => {
        toast({
          title: 'Device Added',
          description: `${deviceName} has been added successfully.`,
        });
        // Reset form
        setDeviceName('');
        setBranch('');
        setModel('');
        setIpAddress('');
      })
      .catch((err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: 'devices',
            operation: 'create',
            requestResourceData: newDevice
        }))
      })
      .finally(() => {
        setIsAdding(false);
      });
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
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
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
