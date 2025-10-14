
'use client';

import { Bar, BarChart, CartesianGrid, XAxis, ResponsiveContainer, Cell } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
} from '@/components/ui/chart';
import { Skeleton } from '../ui/skeleton';
import { Users } from 'lucide-react';

interface GenderChartProps {
    data: { name: string; value: number; fill: string }[];
    isLoading: boolean;
}

export default function GenderChart({ data, isLoading }: GenderChartProps) {
  if (isLoading) {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-7 w-1/3" />
                <Skeleton className="h-4 w-2/3" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-[200px] w-full" />
            </CardContent>
        </Card>
    )
  }

  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Users className="text-primary" />
            Employee Count By Gender
        </CardTitle>
        <CardDescription>
            Active employee count by gender. Total: {total}
        </CardDescription>
      </CardHeader>
      <CardContent>
         <div style={{ width: '100%', height: 200 }}>
            <ResponsiveContainer>
                <BarChart data={data} layout="vertical" margin={{ left: -10 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" hide />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
            <div className="mt-2 flex justify-around text-sm">
                {data.map(d => (
                    <div key={d.name} className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: d.fill }}></span>
                        <span>{d.name}: {d.value}</span>
                    </div>
                ))}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
