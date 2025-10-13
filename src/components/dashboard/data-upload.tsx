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
import { Upload, FileCheck2, Users, FileClock, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

type UploadType = 'attendance' | 'employees' | 'punch_logs';

const uploadTypes = {
  attendance: {
    label: 'Bulk Attendance',
    icon: FileClock,
    template: 'Employee Name,Email,Department,Shift Start,Shift End,Entry Time,Exit Time\nJohn Doe,john@company.com,Engineering,09:00,18:00,09:15,18:30',
    templateName: 'attendance_template.csv',
  },
  employees: {
    label: 'Employee Details',
    icon: Users,
    template: 'Employee ID,Employee Name,Email,Department,Role\nEMP001,Jane Doe,jane@company.com,Sales,Employee',
    templateName: 'employee_template.csv',
  },
  punch_logs: {
    label: 'Punch Logs',
    icon: FileClock,
    template: 'Device ID,Employee ID,Punch Time\nDEV001,EMP001,2024-05-21 09:05:12',
    templateName: 'punch_log_template.csv',
  },
};

export default function DataUpload() {
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

    setIsUploading(true);
    // In a real app, you would use a server action here based on uploadType
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log(`Simulating upload of ${uploadType}: ${file.name}`);
    
    toast({
      title: 'Upload Successful',
      description: `Successfully processed ${file.name}.`,
      action: <FileCheck2 className="text-green-500" />,
    });
    
    setFile(null);
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
          <Button onClick={handleUpload} disabled={isUploading || !file} className="w-full">
            <Upload className="mr-2" />
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