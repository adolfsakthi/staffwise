
'use client';

import { Pie, PieChart, Cell } from 'recharts';
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
} from '@/components/ui/chart';
import { Skeleton } from '../ui/skeleton';
import { PieChart as PieIcon } from 'lucide-react';

interface AttendancePieChartProps {
    data: { name: string; value: number; fill: string }[];
    isLoading: boolean;
}

export default function AttendancePieChart({ data, isLoading }: AttendancePieChartProps) {
    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-7 w-1/3" />
                    <Skeleton className="h-4 w-2/3" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[200px] w-[200px] rounded-full mx-auto" />
                </CardContent>
            </Card>
        )
    }

    const total = data.reduce((acc, curr) => acc + curr.value, 0);
    const presentValue = data.find(d => d.name === 'Present')?.value ?? 0;
    const presentPercentage = total > 0 ? (presentValue / total * 100).toFixed(0) : 0;


  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <PieIcon className="text-primary" />
            Employee Present/Absent
        </CardTitle>
        <CardDescription>
            Employee presence for today.
        </CardDescription>
      </CardHeader>
      <CardContent>
         <div style={{ width: '100%', height: 200 }} className="relative">
            <ChartContainer config={{}} className="h-full w-full">
                <PieChart>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={60}
                        outerRadius={80}
                        startAngle={90}
                        endAngle={450}
                    >
                         {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Pie>
                </PieChart>
            </ChartContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold">{presentPercentage}%</span>
                <span className="text-sm text-muted-foreground">Present</span>
            </div>
        </div>
         <div className="mt-2 flex justify-around text-sm">
            {data.map(d => (
                <div key={d.name} className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: d.fill }}></span>
                    <span>{d.name}: {d.value}</span>
                </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
