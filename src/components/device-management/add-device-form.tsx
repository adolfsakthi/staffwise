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
import { Loader2, PlusCircle, Server } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

type AddDeviceFormProps = {
    propertyCode: string;
}

export default function AddDeviceForm({ propertyCode }: AddDeviceFormProps) {
    const { toast } = useToast();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        // Mock adding device
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        toast({
            title: 'Device Added (Mock)',
            description: 'The new device has been registered locally.',
        });

        setIsLoading(false);
        router.refresh();
    }

    return (
        <Card>
            <CardHeader>
            <CardTitle>Register New Biometric Device</CardTitle>
            <CardDescription>
                Add a new ADMS / Push Protocol compatible device to this property.
            </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                         <div className="space-y-2">
                            <Label htmlFor="device-name">Device Name</Label>
                            <Input id="device-name" placeholder="e.g., Main Entrance" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="ip-address">IP Address</Label>
                            <Input id="ip-address" placeholder="e.g., 192.168.1.100" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="port">Port</Label>
                            <Input id="port" type="number" placeholder="e.g., 4370" required />
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