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
import { Upload, Download, FileCheck2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { uploadAttendance } from '@/app/actions';

export default function AttendanceUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
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
    const formData = new FormData();
    formData.append('file', file);
    
    const result = await uploadAttendance(formData);

    if (result.success) {
      toast({
        title: 'Upload Successful',
        description: result.message,
        action: <FileCheck2 className="text-green-500" />,
      });
      setFile(null);
    } else {
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: result.message,
        action: <AlertCircle className="text-white" />,
      });
    }

    setIsUploading(false);
  };
  
  const handleDownloadTemplate = () => {
    const csvContent = `Employee Name,Email,Department,Shift Start,Shift End,Entry Time,Exit Time\nJohn Doe,john@company.com,Engineering,09:00,18:00,09:15,18:30`;
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'attendance_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Attendance</CardTitle>
        <CardDescription>
          Upload Excel or CSV files with employee attendance data.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Input id="attendance-file" type="file" onChange={handleFileChange} accept=".csv,.xlsx,.xls"/>
          {file && <p className="text-sm text-muted-foreground">Selected: {file.name}</p>}
        </div>
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
          <Button onClick={handleUpload} disabled={isUploading || !file} className="w-full">
            <Upload className="mr-2" />
            {isUploading ? 'Uploading...' : 'Upload & Process'}
          </Button>
          <Button onClick={handleDownloadTemplate} variant="outline" className="w-full">
            <Download className="mr-2" />
            Sample
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
