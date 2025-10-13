import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BookUser,
  Clock,
  AlarmClockOff,
  Building,
} from 'lucide-react';

type StatsCardsProps = {
  stats: {
    totalRecords: number;
    lateCount: number;
    totalOvertimeMinutes: number;
    departmentCount: number;
  };
};

export default function StatsCards({ stats }: StatsCardsProps) {
  const {
    totalRecords,
    lateCount,
    totalOvertimeMinutes,
    departmentCount,
  } = stats;
  const totalOvertimeHours = (totalOvertimeMinutes / 60).toFixed(1);

  const cardData = [
    {
      title: 'Total Records',
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
