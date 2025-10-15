
'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Mail, Eye } from 'lucide-react';
import type { EmailLog } from '@/lib/types';
import { format } from 'date-fns';

const LATE_ENTRY_TEMPLATE = `
<div style="font-family: Arial, sans-serif; background-color: #f4f4f9; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(to right, #6d28d9, #a78bfa); color: #ffffff; padding: 20px; text-align: center; font-size: 24px; font-weight: bold;">
      ⏰ Late Entry Notice
    </div>
    <div style="padding: 30px 20px; color: #333;">
      <p style="margin-bottom: 20px;">Dear Test User,</p>
      <p style="margin-bottom: 20px;">
        This is to inform you that you were late by <strong style="color: #ef4444;">30 minutes</strong> on <strong style="color: #333;">2025-10-11</strong>.
      </p>
      <p style="margin-bottom: 30px;">
        Please ensure timely attendance going forward.
      </p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
      <p style="font-size: 12px; color: #9ca3af; text-align: center;">
        This is an automated message from the Attendance Management System.
      </p>
    </div>
  </div>
</div>
`;

const ADMIN_REPORT_TEMPLATE = `
<div style="font-family: Arial, sans-serif; background-color: #f4f4f9; padding: 20px;">
  <div style="max-width: 700px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(to right, #6d28d9, #a78bfa); color: #ffffff; padding: 20px; text-align: center;">
      <h1 style="font-size: 24px; font-weight: bold; margin: 0;">Daily Audit Report</h1>
      <p style="margin: 4px 0 0; opacity: 0.9;">October 14th, 2025</p>
    </div>
    <div style="padding: 30px 20px; color: #333;">
      
      <!-- Engineering Department -->
      <h2 style="font-size: 18px; font-weight: bold; margin-top: 0; margin-bottom: 15px; border-bottom: 2px solid #eee; padding-bottom: 10px;">Engineering Department</h2>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
        <thead>
          <tr>
            <th style="padding: 8px; text-align: left; background-color: #f8f9fa; border-bottom: 1px solid #dee2e6;">Summary</th>
            <th style="padding: 8px; text-align: left; background-color: #f8f9fa; border-bottom: 1px solid #dee2e6;">Count/Duration</th>
          </tr>
        </thead>
        <tbody>
          <tr><td style="padding: 8px; border-bottom: 1px solid #e9ecef;">Present</td><td style="padding: 8px; border-bottom: 1px solid #e9ecef;">8</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #e9ecef;">Absent</td><td style="padding: 8px; border-bottom: 1px solid #e9ecef;">1</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #e9ecef;">Late</td><td style="padding: 8px; border-bottom: 1px solid #e9ecef;">4</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #e9ecef;">Overtime</td><td style="padding: 8px; border-bottom: 1px solid #e9ecef;">45 mins</td></tr>
        </tbody>
      </table>

      <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">Late Comers</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 14px;">
         <thead>
          <tr>
            <th style="padding: 8px; text-align: left; background-color: #f8f9fa; border-bottom: 1px solid #dee2e6;">Employee</th>
            <th style="padding: 8px; text-align: left; background-color: #f8f9fa; border-bottom: 1px solid #dee2e6;">Entry Time</th>
            <th style="padding: 8px; text-align: left; background-color: #f8f9fa; border-bottom: 1px solid #dee2e6;">Late By</th>
          </tr>
        </thead>
        <tbody>
           <tr><td style="padding: 8px; border-bottom: 1px solid #e9ecef;">John Doe</td><td style="padding: 8px; border-bottom: 1px solid #e9ecef;">09:15</td><td style="padding: 8px; border-bottom: 1px solid #e9ecef;">15 mins</td></tr>
           <tr><td style="padding: 8px; border-bottom: 1px solid #e9ecef;">Peter Jones</td><td style="padding: 8px; border-bottom: 1px solid #e9ecef;">09:05</td><td style="padding: 8px; border-bottom: 1px solid #e9ecef;">5 mins</td></tr>
           <tr><td style="padding: 8px; border-bottom: 1px solid #e9ecef;">Sam Wilson</td><td style="padding: 8px; border-bottom: 1px solid #e9ecef;">09:25</td><td style="padding: 8px; border-bottom: 1px solid #e9ecef;">25 mins</td></tr>
           <tr><td style="padding: 8px; border-bottom: 1px solid #e9ecef;">Chris Rogers</td><td style="padding: 8px; border-bottom: 1px solid #e9ecef;">09:12</td><td style="padding: 8px; border-bottom: 1px solid #e9ecef;">12 mins</td></tr>
        </tbody>
      </table>

      <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">Overtime</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 14px;">
         <thead>
          <tr>
            <th style="padding: 8px; text-align: left; background-color: #f8f9fa; border-bottom: 1px solid #dee2e6;">Employee</th>
            <th style="padding: 8px; text-align: left; background-color: #f8f9fa; border-bottom: 1px solid #dee2e6;">Exit Time</th>
            <th style="padding: 8px; text-align: left; background-color: #f8f9fa; border-bottom: 1px solid #dee2e6;">OT</th>
          </tr>
        </thead>
        <tbody>
           <tr><td style="padding: 8px; border-bottom: 1px solid #e9ecef;">Emily White</td><td style="padding: 8px; border-bottom: 1px solid #e9ecef;">18:45</td><td style="padding: 8px; border-bottom: 1px solid #e9ecef;">45 mins</td></tr>
        </tbody>
      </table>
      
      <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">Absentees</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 14px;">
         <thead>
          <tr><th style="padding: 8px; text-align: left; background-color: #f8f9fa; border-bottom: 1px solid #dee2e6;">Employee</th></tr>
        </thead>
        <tbody>
           <tr><td style="padding: 8px; border-bottom: 1px solid #e9ecef;">Mike Ross</td></tr>
        </tbody>
      </table>


      <!-- Housekeeping Department -->
      <h2 style="font-size: 18px; font-weight: bold; margin-bottom: 15px; border-bottom: 2px solid #eee; padding-bottom: 10px;">Housekeeping Department</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="padding: 8px; text-align: left; background-color: #f8f9fa; border-bottom: 1px solid #dee2e6;">Summary</th>
            <th style="padding: 8px; text-align: left; background-color: #f8f9fa; border-bottom: 1px solid #dee2e6;">Count/Duration</th>
          </tr>
        </thead>
        <tbody>
          <tr><td style="padding: 8px; border-bottom: 1px solid #e9ecef;">Present</td><td style="padding: 8px; border-bottom: 1px solid #e9ecef;">12</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #e9ecef;">Absent</td><td style="padding: 8px; border-bottom: 1px solid #e9ecef;">0</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #e9ecef;">Late</td><td style="padding: 8px; border-bottom: 1px solid #e9ecef;">3</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #e9ecef;">Overtime</td><td style="padding: 8px; border-bottom: 1px solid #e9ecef;">0 mins</td></tr>
        </tbody>
      </table>
       <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px; margin-top: 25px;">Late Comers</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 14px;">
         <thead>
          <tr>
            <th style="padding: 8px; text-align: left; background-color: #f8f9fa; border-bottom: 1px solid #dee2e6;">Employee</th>
            <th style="padding: 8px; text-align: left; background-color: #f8f9fa; border-bottom: 1px solid #dee2e6;">Entry Time</th>
            <th style="padding: 8px; text-align: left; background-color: #f8f9fa; border-bottom: 1px solid #dee2e6;">Late By</th>
          </tr>
        </thead>
        <tbody>
           <tr><td style="padding: 8px; border-bottom: 1px solid #e9ecef;">Jane Smith</td><td style="padding: 8px; border-bottom: 1px solid #e9ecef;">09:02</td><td style="padding: 8px; border-bottom: 1px solid #e9ecef;">2 mins</td></tr>
           <tr><td style="padding: 8px; border-bottom: 1px solid #e9ecef;">Maria Hill</td><td style="padding: 8px; border-bottom: 1px solid #e9ecef;">09:08</td><td style="padding: 8px; border-bottom: 1px solid #e9ecef;">8 mins</td></tr>
           <tr><td style="padding: 8px; border-bottom: 1px solid #e9ecef;">Donna Troy</td><td style="padding: 8px; border-bottom: 1px solid #e9ecef;">09:03</td><td style="padding: 8px; border-bottom: 1px solid #e9ecef;">3 mins</td></tr>
        </tbody>
      </table>
      
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
      <p style="font-size: 12px; color: #9ca3af; text-align: center;">
        This is an automated message from the HEZEE ACCESS System.
      </p>
    </div>
  </div>
</div>
`;


const MOCK_EMAIL_LOGS: EmailLog[] = [
    { id: '1', recipient: 'manager@staffwise.com', subject: 'Late Arrival Notice', body: LATE_ENTRY_TEMPLATE, timestamp: new Date(), emailType: 'late_notice' },
    { id: '2', recipient: 'admin@staffwise.com', subject: 'Daily Audit Report', body: ADMIN_REPORT_TEMPLATE, timestamp: new Date(), emailType: 'admin_report' },
]

export default function EmailLogsPage() {
  const [selectedEmail, setSelectedEmail] = useState<EmailLog | null>(null);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>(MOCK_EMAIL_LOGS);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, 'PPP p');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Logs</CardTitle>
        <CardDescription>
          A log of all automated emails sent by the system.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Sent At</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingLogs ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                  </TableCell>
                </TableRow>
              ) : emailLogs && emailLogs.length > 0 ? (
                emailLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <Mail className="text-muted-foreground" />
                    </TableCell>
                    <TableCell className="font-medium">{log.recipient}</TableCell>
                    <TableCell className="text-muted-foreground">{log.subject}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{log.emailType}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(log.timestamp)}
                    </TableCell>
                    <TableCell>
                      <Dialog onOpenChange={(isOpen) => !isOpen && setSelectedEmail(null)}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedEmail(log)}>
                            <Eye className="mr-2 h-4 w-4" /> Preview
                          </Button>
                        </DialogTrigger>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No email logs found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {selectedEmail && (
            <Dialog open={!!selectedEmail} onOpenChange={(isOpen) => !isOpen && setSelectedEmail(null)}>
                 <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Email Preview</DialogTitle>
                        <div className="text-sm text-muted-foreground space-y-1 pt-2">
                            <p><strong>To:</strong> {selectedEmail.recipient}</p>
                            <p><strong>Subject:</strong> {selectedEmail.subject}</p>
                            <p><strong>Date:</strong> {formatDate(selectedEmail.timestamp)}</p>
                        </div>
                    </DialogHeader>
                    <div className="mt-4 rounded-md border bg-white">
                        <iframe
                        srcDoc={selectedEmail.body}
                        className="h-[500px] w-full"
                        />
                    </div>
                </DialogContent>
            </Dialog>
        )}
      </CardContent>
    </Card>
  );
}
