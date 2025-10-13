'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';
import { Skeleton } from '../ui/skeleton';
import { AlertTriangle, Info } from 'lucide-react';

const chartConfig = {
  onTime: {
    label: 'On Time',
    color: 'hsl(var(--chart-1))',
  },
  late: {
    label: 'Late',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

type OverviewChartProps = {
  data: {
    name: string;
    onTime: number;
    late: number;
  }[];
  isLoading: boolean;
  error?: Error | null;
};

export default function OverviewChart({ data, isLoading, error }: OverviewChartProps) {
  if (isLoading) {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-7 w-1/3" />
                <Skeleton className="h-4 w-2/3" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-[300px] w-full" />
            </CardContent>
        </Card>
    )
  }

  if (error) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Attendance Overview</CardTitle>
                <CardDescription>On-time vs. late entries for the last 7 days.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex h-[300px] flex-col items-center justify-center gap-4 text-center text-destructive">
                    <AlertTriangle className="h-10 w-10" />
                    <div className="space-y-1">
                        <h3 className="font-semibold">Error Loading Chart</h3>
                        <p className="text-sm">
                            Could not load attendance data. Please check permissions.
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance Overview</CardTitle>
        <CardDescription>On-time vs. late entries for the last 7 days.</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <BarChart accessibilityLayer data={data}>
                <CartesianGrid vertical={false} />
                <XAxis
                dataKey="name"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
                />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="onTime" fill="var(--color-onTime)" radius={4} />
                <Bar dataKey="late" fill="var(--color-late)" radius={4} />
            </BarChart>
            </ChartContainer>
        ) : (
            <div className="flex h-[300px] flex-col items-center justify-center gap-4 text-center">
                <Info className="h-10 w-10 text-muted-foreground" />
                <div className="space-y-1">
                    <h3 className="font-semibold">No Data to Display</h3>
                    <p className="text-sm text-muted-foreground">
                        There is no attendance data for the selected property.
                    </p>
                </div>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
