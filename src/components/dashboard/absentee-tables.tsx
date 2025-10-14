
'use client';

import {
  Card,
  CardContent,
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
import { Button } from '../ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function AbsenteeTable() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base font-medium">Top 10 Absent Employee (Current Month)</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Code</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Cont.</TableHead>
                            <TableHead>Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
                                No data available
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
                <div className="mt-4 flex justify-end items-center gap-2 text-sm">
                    <Button variant="outline" size="icon" className="h-8 w-8">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span>1</span>
                     <Button variant="outline" size="icon" className="h-8 w-8">
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

export default function AbsenteeTables() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <AbsenteeTable />
            <AbsenteeTable />
            <AbsenteeTable />
            <AbsenteeTable />
        </div>
    )
}
