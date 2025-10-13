
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useMemoFirebase } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query, where } from 'firebase/firestore';
import type { AttendanceRecord } from '@/lib/types';
import { FileCheck2, Loader2, ShieldCheck } from 'lucide-react';
import { runAudit } from '@/app/actions';
import { format } from 'date-fns';

interface AuditDashboardProps {
    propertyCode: string;
}

export default function AuditDashboard({ propertyCode }: AuditDashboardProps) {
  const firestore = useFirestore();
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const [auditNotes, setAuditNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const unauditedQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
        collection(firestore, 'attendance_records'),
        where('property_code', '==', propertyCode),
        where('is_audited', '==', false)
    );
  }, [firestore, propertyCode]);
  
  const { data: unauditedRecords, isLoading: isFetching, error } = useCollection<AttendanceRecord>(unauditedQuery);

  // Clear selections if the data reloads
  useEffect(() => {
    setSelectedRecords([]);
  }, [unauditedRecords]);


  const handleSelectRecord = (id: string) => {
    setSelectedRecords((prev) =>
      prev.includes(id) ? prev.filter((rId) => rId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (!unauditedRecords || unauditedRecords.length === 0) return;
    if (selectedRecords.length === unauditedRecords.length) {
      setSelectedRecords([]);
    } else {
      setSelectedRecords(unauditedRecords.map((r) => r.id));
    }
  };

  const handleRunAudit = async () => {
    if (selectedRecords.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No records selected',
        description: 'Please select at least one record to audit.',
      });
      return;
    }

    setIsLoading(true);
    const result = await runAudit(selectedRecords, auditNotes);
    setIsLoading(false);

    if (result.success) {
      toast({
          title: 'Audit Successful',
          description: result.message,
          action: <FileCheck2 className="text-green-500" />,
      });
      // The real-time hook will automatically remove the audited records.
      setSelectedRecords([]);
      setAuditNotes('');
    } else {
       toast({
        variant: 'destructive',
        title: 'Audit Failed',
        description: result.message,
      });
    }
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Manual Audit</CardTitle>
          <CardDescription>
            Review and audit attendance records for property {propertyCode} that require attention.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && <p className='text-destructive mb-4'>Error: {error.message}</p>}
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={unauditedRecords ? unauditedRecords.length > 0 && selectedRecords.length === unauditedRecords.length : false}
                      onCheckedChange={handleSelectAll}
                      disabled={!unauditedRecords || unauditedRecords.length === 0}
                    />
                  </TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Property Code</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Times</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isFetching ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                    </TableCell>
                  </TableRow>
                ) : unauditedRecords && unauditedRecords.length > 0 ? (
                  unauditedRecords.map((record) => (
                    <TableRow
                      key={record.id}
                      data-state={selectedRecords.includes(record.id) && 'selected'}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedRecords.includes(record.id)}
                          onCheckedChange={() => handleSelectRecord(record.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{record.employee_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {record.department}
                        </div>
                      </TableCell>
                      <TableCell>{record.property_code}</TableCell>
                      <TableCell>{format(new Date(record.date), 'PPP')}</TableCell>
                      <TableCell>
                        {record.entry_time} / {record.exit_time}
                      </TableCell>
                      <TableCell>
                        {record.is_late ? (
                          <Badge variant="destructive">
                            Late ({record.late_by_minutes}m)
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-green-600 border-green-200">On Time</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No unaudited records found. Great job!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Audit Action</CardTitle>
          <CardDescription>
            Add notes and finalize the audit for the selected records.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="audit-notes">Audit Notes</label>
            <Textarea
              id="audit-notes"
              placeholder="Add any relevant notes for this audit..."
              value={auditNotes}
              onChange={(e) => setAuditNotes(e.target.value)}
              className="h-32"
            />
          </div>
          <Alert>
            <ShieldCheck className="h-4 w-4" />
            <AlertTitle>Confirm Audit</AlertTitle>
            <AlertDescription>
              You are about to finalize the audit for{' '}
              <span className="font-bold">{selectedRecords.length}</span>{' '}
              record(s). This action cannot be undone.
            </AlertDescription>
          </Alert>
          <Button
            onClick={handleRunAudit}
            disabled={isLoading || selectedRecords.length === 0}
            className="w-full"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ShieldCheck className="mr-2" />
            )}
            Finalize Audit ({selectedRecords.length})
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
