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
import { Loader2, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Device } from '@/lib/types';

type AddDeviceFormProps = {
    propertyCode: string;
    onAddDevice: (device: Omit<Device, 'id' | 'status' | 'clientId' | 'branchId'>) => void;
}

export default function AddDeviceForm({ propertyCode, onAddDevice }: AddDeviceFormProps) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const form = e.currentTarget;
        const formData = new FormData(form);
        const deviceData = {
            deviceName: formData.get('device-name') as string,
            serialNumber: formData.get('serial-number') as string | undefined,
            ipAddress: formData.get('ip-address') as string,
            port: Number(formData.get('port')),
            connectionKey: '0', // Default value
            property_code: propertyCode,
        };
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        onAddDevice(deviceData);

        toast({
            title: 'Device Added',
            description: 'The new device has been added to the list.',
        });
        
        form.reset();
        setIsLoading(false);
    }

    return (
        <Card>
            <CardHeader>
            <CardTitle>Register New Biometric Device</CardTitle>
            <CardDescription>
                Add a new device to this property.
            </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                         <div className="space-y-2">
                            <Label htmlFor="device-name">Device Name</Label>
                            <Input name="device-name" id="device-name" placeholder="e.g., Main Entrance" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="serial-number">Serial Number (Optional)</Label>
                            <Input name="serial-number" id="serial-number" placeholder="e.g., C072K12345" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="ip-address">IP Address</Label>
                            <Input name="ip-address" id="ip-address" placeholder="e.g., 192.168.1.100" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="port">Port</Label>
                            <Input name="port" id="port" type="number" placeholder="e.g., 4370" required />
                        </div>
                    </div>
                     <Button type="submit" disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 animate-spin" /> : <PlusCircle className="mr-2" />}
                        Add Device
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
