import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toaster';
import ConditionalLayout from '@/components/layout/conditional-layout';

export const metadata: Metadata = {
  title: 'StaffWise - Employee Attendance Management',
  description:
    'A comprehensive Employee Attendance Tracking and Audit Management System.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={cn(
          'min-h-screen bg-background font-body antialiased'
        )}
      >
        <SidebarProvider>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
