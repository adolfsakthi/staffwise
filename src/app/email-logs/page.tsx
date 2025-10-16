
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
import { useMockData } from '@/lib/mock-data-store';


export default function EmailLogsPage() {
  const [selectedEmail, setSelectedEmail] = useState<EmailLog | null>(null);
  const { emailLogs } = useMockData();
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  const formatDate = (date: any) => {
    if (!date || !(date instanceof Date)) return 'N/A';
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
