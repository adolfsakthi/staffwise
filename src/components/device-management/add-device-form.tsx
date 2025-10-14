
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
import { addDevice } from '@/app/actions';
import { useRouter } from 'next/navigation';

type AddDeviceFormProps = {
  propertyCode: string;
};

export default function AddDeviceForm({ propertyCode }: AddDeviceFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  
  async function handleAddDeviceAction(formData: FormData) {
    const deviceName = formData.get('deviceName') as string;
    const branchName = formData.get('branchName') as string;
    const ipAddress = formData.get('ipAddress') as string;
    const port = Number(formData.get('port'));
    const connectionKey = formData.get('connectionKey') as string;

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
            status: 'offline',
            clientId: 'default_client', 
            branchId: 'default_branch',
        });
        
        toast({
            title: 'Device Added',
            description: `${deviceName} has been registered.`,
        });

        // Reset form by clearing the form element
        const form = document.getElementById('add-device-form-element') as HTMLFormElement;
        form?.reset();
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
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Biometric Device</CardTitle>
        <CardDescription>
          Register a new device for property {propertyCode}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="add-device-form-element" action={handleAddDeviceAction} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="deviceName">Device Name</Label>
              <Input
                id="deviceName"
                name="deviceName"
                placeholder="e.g., Main Entrance"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="branchName">Branch/Location</Label>
              <Input
                id="branchName"
                name="branchName"
                placeholder="e.g., Main Lobby"
                defaultValue="Main Lobby"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ipAddress">IP Address</Label>
              <Input
                id="ipAddress"
                name="ipAddress"
                placeholder="e.g., 192.168.1.100"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="port">Port</Label>
              <Input
                id="port"
                name="port"
                type="number"
                defaultValue={4370}
                placeholder="e.g., 4370"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="connectionKey">Connection Key</Label>
              <Input
                id="connectionKey"
                name="connectionKey"
                type="password"
                placeholder="Device password (e.g. 0)"
                defaultValue="0"
              />
            </div>
          </div>
          <Button type="submit" disabled={isAdding}>
            {isAdding ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <PlusCircle className="mr-2 h-4 w-4" />
            )}
            Add Device
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
