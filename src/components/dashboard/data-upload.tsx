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
import { Upload, FileCheck2, Users, FileClock, Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { uploadData } from '@/app/actions';

type UploadType = 'attendance' | 'employees' | 'punch_logs';

const uploadTypes = {
  attendance: {
    label: 'Bulk Attendance',
    icon: FileClock,
    template: 'employee_name,email,department,shift_start,shift_end,entry_time,exit_time,date,property_code\nJohn Doe,john@company.com,Engineering,09:00,18:00,09:15,18:30,2024-05-22,D001',
    templateName: 'attendance_template.csv',
  },
  employees: {
    label: 'Employee Details',
    icon: Users,
    template: 'employee_id,employee_name,email,department,role,property_code\nEMP001,Jane Doe,jane@company.com,Sales,Employee,D001',
    templateName: 'employee_template.csv',
  },
  punch_logs: {
    label: 'Punch Logs',
    icon: FileClock,
    template: 'device_id,employee_id,punch_time,property_code\nDEV001,EMP001,2024-05-21 09:05:12,D001',
    templateName: 'punch_log_template.csv',
  },
};

type DataUploadProps = {
  propertyCode: string | null;
  onUploadComplete?: () => void;
}

export default function DataUpload({ propertyCode, onUploadComplete }: DataUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadType, setUploadType] = useState<UploadType>('attendance');
  const { toast } = useToast();

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
    if (!propertyCode) {
       toast({
        variant: 'destructive',
        title: 'Property Code Missing',
        description: 'Cannot upload file because the property code is missing.',
      });
      return;
    }

    setIsUploading(true);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('uploadType', uploadType);
    formData.append('propertyCode', propertyCode);

    const result = await uploadData(formData);

    if (result.success) {
        toast({
            title: 'Upload Successful',
            description: result.message,
            action: <FileCheck2 className="text-green-500" />,
        });
        if (onUploadComplete) {
            onUploadComplete();
        }
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
  
  const handleDownloadTemplate = () => {
    const { template, templateName } = uploadTypes[uploadType];
    const blob = new Blob([template], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = templateName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };
  
  const CurrentIcon = uploadTypes[uploadType].icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <CurrentIcon className="text-primary" />
            <span>Data Upload</span>
        </CardTitle>
        <CardDescription>
          Upload Excel or CSV files for employees, attendance, or punch logs.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
            <Label htmlFor="upload-type">Upload Type</Label>
            <Select value={uploadType} onValueChange={(v) => setUploadType(v as UploadType)}>
                <SelectTrigger id="upload-type">
                    <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="attendance">Bulk Attendance</SelectItem>
                    <SelectItem value="employees">Employee Details</SelectItem>
                    <SelectItem value="punch_logs">Punch Logs</SelectItem>
                </SelectContent>
            </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="data-file">File</Label>
          <Input id="data-file" type="file" onChange={handleFileChange} accept=".csv,.xlsx,.xls"/>
          {file && <p className="text-sm text-muted-foreground">Selected: {file.name}</p>}
        </div>
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
          <Button onClick={handleUpload} disabled={isUploading || !file || !propertyCode} className="w-full">
            {isUploading ? (
                <Loader2 className="mr-2 animate-spin" />
            ) : (
                <Upload className="mr-2" />
            )}
            {isUploading ? 'Uploading...' : 'Upload & Process'}
          </Button>
          <Button onClick={handleDownloadTemplate} variant="outline" className="w-full">
            <Download className="mr-2" />
            Template
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
