import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BookUser,
  Clock,
  AlarmClockOff,
  Building,
  Loader2,
} from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

type StatsCardsProps = {
  stats: {
    totalRecords: number;
    lateCount: number;
    totalOvertimeMinutes: number;
    departmentCount: number;
  };
  isLoading: boolean;
  propertyCode: string | null;
};

export default function StatsCards({ stats, isLoading, propertyCode }: StatsCardsProps) {
  const {
    totalRecords,
    lateCount,
    totalOvertimeMinutes,
    departmentCount,
  } = stats;
  const totalOvertimeHours = (totalOvertimeMinutes / 60).toFixed(1);

  const cardData = [
    {
      title: `Records for ${propertyCode}`,
      value: totalRecords.toLocaleString(),
      icon: BookUser,
      color: 'text-blue-500',
    },
    {
      title: 'Late Entries',
      value: lateCount.toLocaleString(),
      icon: AlarmClockOff,
      color: 'text-red-500',
    },
    {
      title: 'Total Overtime',
      value: `${totalOvertimeHours} hrs`,
      icon: Clock,
      color: 'text-green-500',
    },
    {
      title: 'Departments',
      value: departmentCount.toLocaleString(),
      icon: Building,
      color: 'text-purple-500',
    },
  ];

  if (isLoading) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cardData.map((_, index) => (
                <Card key={index}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-5 w-5 rounded-full" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-8 w-1/3" />
                    </CardContent>
                </Card>
            ))}
        </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cardData.map((card, index) => (
        <Card
          key={index}
          className="transition-all hover:shadow-lg hover:-translate-y-1"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className={`h-5 w-5 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
