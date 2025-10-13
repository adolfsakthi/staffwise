'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { BrainCircuit, Loader2 } from 'lucide-radix-icons';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getSmartSchedule } from '@/app/actions';
import type { SmartStaffingScheduleOutput } from '@/ai/flows/smart-staffing-schedule';

const formSchema = z.object({
  priorMonthAttendanceData: z
    .string()
    .min(1, 'Attendance data is required.')
    .refine(
      (val) => {
        try {
          JSON.parse(val);
          return true;
        } catch (e) {
          return false;
        }
      },
      { message: 'Must be valid JSON.' }
    ),
  currentMonth: z.string().min(1, 'Current month is required.'),
});

type SmartSchedulerProps = {
  departments: string[];
};

export default function SmartScheduler({ departments }: SmartSchedulerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SmartStaffingScheduleOutput | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      priorMonthAttendanceData:
        '[\n  {\n    "employee_name": "John Doe",\n    "date": "2024-06-15",\n    "entry_time": "09:10",\n    "exit_time": "18:05"\n  }\n]',
      currentMonth: '2024-07',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null);
    setResult(null);

    const response = await getSmartSchedule({
      ...values,
      departments: departments,
    });

    if (response.success && response.data) {
      setResult(response.data);
    } else {
      setError(response.message || 'An unknown error occurred.');
    }
    setIsLoading(false);
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Smart Staffing Schedule</CardTitle>
          <CardDescription>
            Generate an optimized schedule using prior month's attendance data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="priorMonthAttendanceData"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prior Month Attendance (JSON)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Paste prior month's attendance data in JSON format..."
                        className="h-48 font-mono"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currentMonth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Month (YYYY-MM)</FormLabel>
                    <FormControl>
                      <Input type="month" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <BrainCircuit className="mr-2 h-4 w-4" />
                )}
                Generate Schedule
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Generated Schedule & Analysis</CardTitle>
          <CardDescription>
            The optimized schedule and insights from the AI will appear here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border-2 border-dashed border-muted p-8 text-center">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-muted-foreground">
                Analyzing data and generating schedule...
              </p>
            </div>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {result && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold">Analysis Summary</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {result.analysisSummary}
                </p>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold">Optimized Schedule (JSON)</h3>
                <pre className="mt-2 w-full overflow-x-auto rounded-md bg-muted p-4 text-sm">
                  <code>
                    {JSON.stringify(JSON.parse(result.optimizedSchedule), null, 2)}
                  </code>
                </pre>
              </div>
            </div>
          )}
          {!isLoading && !error && !result && (
             <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-muted p-8 text-center">
                <p className="text-muted-foreground">Results will be displayed here.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
