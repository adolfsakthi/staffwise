
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
import { Upload, FileCheck2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { processLogs } from '@/app/actions';
import { useRouter } from 'next/navigation';

// Mock data has been removed to rely on actual file uploads.
const MOCK_RAW_LOGS: any[] = [];


type DataUploadProps = {
  clientId: string;
  branchId: string;
  propertyCode: string | null;
  onUploadComplete?: () => void;
}

export default function DataUpload({ clientId, branchId, propertyCode, onUploadComplete }: DataUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        variant: 'destructive',
        title: 'No file selected',
        description: 'Please choose a file to upload.',
      });
      return;
    }
    if (!propertyCode || !clientId || !branchId) {
       toast({
        variant: 'destructive',
        title: 'Configuration Missing',
        description: 'Cannot upload file because client, branch, or property code is missing.',
      });
      return;
    }

    setIsUploading(true);
    
    // In a real app, you would parse the file here.
    // For this demonstration, we'll use mock data to simulate the file content.
    const result = await processLogs(MOCK_RAW_LOGS, propertyCode);

    if (result.success) {
        toast({
            title: 'Upload Successful',
            description: result.message,
            action: <FileCheck2 className="text-green-500" />,
        });
        if (onUploadComplete) {
            onUploadComplete();
        }
        router.refresh();
    } else {
        toast({
            variant: 'destructive',
            title: 'Upload Failed',
            description: result.message,
        });
    }
    
    setFile(null);
    const fileInput = document.getElementById('data-file') as HTMLInputElement;
    if(fileInput) fileInput.value = '';

    setIsUploading(false);
  };
  

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Upload className="text-primary" />
            <span>Upload Attendance Logs</span>
        </CardTitle>
        <CardDescription>
          Upload CSV/DAT files exported from your biometric device.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Input id="data-file" type="file" onChange={handleFileChange} accept=".csv,.dat,.txt"/>
          {file && <p className="text-sm text-muted-foreground">Selected: {file.name}</p>}
        </div>
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
          <Button onClick={handleUpload} disabled={isUploading || !file || !propertyCode} className="w-full">
            {isUploading ? (
                <Loader2 className="mr-2 animate-spin" />
            ) : (
                <Upload className="mr-2" />
            )}
            {isUploading ? 'Processing...' : 'Upload & Process'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
