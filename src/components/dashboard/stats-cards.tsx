
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users,
  Clock,
  AlarmClockOff,
  Building,
  Loader2,
  Wifi,
  UserCheck,
  UserX,
  Plane,
  DoorOpen,
  ChevronsRight,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

type StatsCardsProps = {
  stats: {
    totalEmployees?: number;
    lateCount?: number;
    totalOvertimeMinutes?: number;
    departmentCount?: number;
    activeDevices?: number;
    presentCount?: number;
    absentCount?: number;
    leaveCount?: number;
    earlyGoingCount?: number;
    outDoorEntryCount?: number; // Assuming this is a stat
  };
  isLoading: boolean;
};

export default function StatsCards({ stats, isLoading }: StatsCardsProps) {
  const {
    totalEmployees = 0,
    lateCount = 0,
    totalOvertimeMinutes = 0,
    activeDevices = 0,
    presentCount = 0,
    absentCount = 0,
    leaveCount = 0,
    earlyGoingCount = 0,
    outDoorEntryCount = 0,
  } = stats;
  const totalOvertimeHours = (totalOvertimeMinutes / 60).toFixed(1);

  const cardData = [
    {
      title: `Active Devices`,
      value: activeDevices,
      icon: Wifi,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-50',
    },
    {
      title: 'Present Employee',
      value: presentCount,
      icon: UserCheck,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Absent Employee',
      value: absentCount,
      icon: UserX,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Leave',
      value: leaveCount,
      icon: Plane,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Out Door Entry',
      value: outDoorEntryCount,
      icon: DoorOpen,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Late Coming',
      value: lateCount,
      icon: TrendingDown,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
    },
     {
      title: 'Early Going',
      value: earlyGoingCount,
      icon: ChevronsRight,
      color: 'text-teal-500',
      bgColor: 'bg-teal-50',
    },
    {
      title: 'Over Time',
      value: `${totalOvertimeHours} hrs`,
      icon: TrendingUp,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50',
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
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-4">
      {cardData.map((card, index) => (
        <Card
          key={index}
          className={cn('transition-all hover:shadow-lg hover:-translate-y-1', card.bgColor)}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className={cn('h-5 w-5', card.color)} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function cn(...inputs: any[]) {
    // A simplified version of the real cn utility
    return inputs.filter(Boolean).join(' ');
}
