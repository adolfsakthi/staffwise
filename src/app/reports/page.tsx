
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from '@/components/ui/card';
  import { Button } from '@/components/ui/button';
  import { Download, FileText, CalendarRange, Building } from 'lucide-react';
  import Link from 'next/link';
  
  const reportTypes = [
    { title: 'Daily Attendance Summary', description: 'A summary of attendance for all employees for a specific day.', icon: FileText, href: '#' },
    { title: 'Monthly Late Report', description: 'Detailed report of all late entries for a selected month.', icon: FileText, href: '#' },
    { title: 'Overtime Analysis', description: 'Breakdown of overtime hours by department and employee.', icon: FileText, href: '#' },
    { title: 'Department-wise Consolidated Report', description: 'Consolidated audit report for each department.', icon: Building, href: '/reports/department-consolidated' },
    { title: 'Employee Attendance History', description: 'Complete attendance history for a single employee.', icon: FileText, href: '#' },
  ]
  
  export default function ReportsPage() {
    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Generate Reports</CardTitle>
                    <CardDescription>
                        Select a report type and date range to generate and download attendance data.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 sm:flex-row">
                    {/* In a real app, these would be interactive components */}
                    <div className="flex items-center gap-2 rounded-md border p-2 text-muted-foreground">
                        <CalendarRange/>
                        <span>Date Range: Last 30 Days</span>
                    </div>
                     <Button>
                        <Download className="mr-2" />
                        Generate & Download CSV
                    </Button>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {reportTypes.map(report => (
                    <Link key={report.title} href={report.href} className="block hover:shadow-lg hover:-translate-y-1 transition-transform">
                        <Card className="h-full">
                            <CardHeader className="flex flex-row items-start gap-4">
                                <report.icon className="size-8 text-primary" />
                                <div>
                                    <CardTitle className="text-lg">{report.title}</CardTitle>
                                    <CardDescription>{report.description}</CardDescription>
                                </div>
                            </CardHeader>
                        </Card>
                    </Link>
                ))}
            </div>
      </div>
    );
  }
  
