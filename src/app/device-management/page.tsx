
'use client';

import { useState, useEffect } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import { addDevice, requestLogSync } from '@/app/actions';
import { Loader2, Plus, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useRouter } from 'next/navigation';

export default function DeviceManagementPage() {
  const [device, setDevice] = useState({
    name: '',
    branch: 'Main Lobby',
    serialNumber: '',
    ipAddress: '209.38.125.241',
    port: 8080,
  });
  const [targetUrl, setTargetUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { toast } = useToast();
  const router = useRouter();


  // Auto-detect server URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const protocol = window.location.protocol;
      const host = window.location.host;
      setTargetUrl(`${protocol}//${host}/api/adms/iclock/cdata`);
    }
  }, []);

  const handleAddDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
       await addDevice({
            deviceName: device.name,
            branchName: device.branch,
            ipAddress: device.ipAddress,
            serialNumber: device.serialNumber,
            port: device.port,
            connectionKey: '', 
            property_code: 'D001',
            status: 'offline', 
            clientId: 'default_client', 
            branchId: 'default_branch',
        });

      setMessage('✅ Device registered successfully!');
      toast({
        title: 'Device Added',
        description: `${device.name} has been registered.`,
      });

      setDevice({
        name: '',
        branch: 'Main Lobby',
        serialNumber: '',
        ipAddress: '209.38.125.241',
        port: 8080,
      });
      router.refresh();
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
       toast({
        variant: 'destructive',
        title: 'Error Adding Device',
        description: error.message || 'Could not save the new device.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    if (!targetUrl) {
      setMessage('❌ Target URL not set');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const result = await requestLogSync(device.ipAddress, device.port);

      if (result.success) {
        setMessage(`✅ Sync triggered successfully! Status: ${result.data?.status || 'success'}`);
         toast({
          title: 'Sync Triggered',
          description: result.message,
        });
      } else {
        setMessage(`❌ Sync failed: ${result.message || 'Unknown error'}`);
        toast({
            variant: "destructive",
            title: "Sync Failed",
            description: result.message,
        });
      }
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
      toast({
            variant: "destructive",
            title: "Sync Error",
            description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Register ADMS / Push Protocol Device</CardTitle>
        <CardDescription>
            Add a new biometric device that will push data to this server.
        </CardDescription>
      </CardHeader>
      <CardContent>
      <form onSubmit={handleAddDevice} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="device-name">Device Name</Label>
            <Input
              id="device-name"
              type="text"
              placeholder="e.g., Main Entrance"
              value={device.name}
              onChange={(e) => setDevice({ ...device, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="branch-location">Branch/Location</Label>
            <Input
              id="branch-location"
              type="text"
              placeholder="Main Lobby"
              value={device.branch}
              onChange={(e) => setDevice({ ...device, branch: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="serial-number">Device Serial Number</Label>
            <Input
              id="serial-number"
              type="text"
              placeholder="e.g., ESSL12345678"
              value={device.serialNumber}
              onChange={(e) => setDevice({ ...device, serialNumber: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ip-address">IP Address</Label>
            <Input
              id="ip-address"
              type="text"
              placeholder="e.g., 209.38.125.241"
              value={device.ipAddress}
              onChange={(e) => setDevice({ ...device, ipAddress: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="port">Port</Label>
          <Input
            id="port"
            type="number"
            placeholder="e.g., 8080"
            value={device.port}
            onChange={(e) => setDevice({ ...device, port: parseInt(e.target.value) })}
            required
          />
        </div>

        <Alert>
            <AlertTitle className="flex items-center gap-2">
                 Target URL 
                 <span className="text-xs font-normal text-muted-foreground">
                    (Where data will be pushed)
                </span>
            </AlertTitle>
            <AlertDescription className="mt-2">
                <Input
                    type="text"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    placeholder="e.g., https://abc123.ngrok-free.app/api/adms/iclock/cdata"
                />
                {targetUrl.includes('localhost') && (
                    <p className="text-xs text-orange-600 mt-2">
                    💡 For local testing, use a tunneling service like ngrok: <code>ngrok http 9002</code>
                    </p>
                )}
            </AlertDescription>
        </Alert>
        

        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            type="submit"
            disabled={loading}
            className="flex-1"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Plus />}
            {loading ? 'Adding...' : 'Add Device'}
          </Button>

          <Button
            type="button"
            onClick={handleSync}
            disabled={loading || !device.ipAddress || !targetUrl}
            className="flex-1"
            variant="secondary"
          >
            {loading ? <Loader2 className="animate-spin" /> : <RefreshCw />}
            {loading ? 'Syncing...' : 'Sync Now'}
          </Button>
        </div>
      </form>

      {message && (
        <div className={`mt-4 p-4 rounded-lg text-center font-medium ${
          message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message}
        </div>
      )}
      </CardContent>
    </Card>
  );
}
