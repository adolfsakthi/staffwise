'use client';

import './globals.css';
import { cn } from '@/lib/utils';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toaster';
import ConditionalLayout from '@/components/layout/conditional-layout';
import { Inter as FontSans } from 'next/font/google';
import { MockDataStoreProvider } from '@/lib/mock-data-store';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>HEZEE ACCESS - Employee Attendance Management</title>
        <meta name="description" content="A comprehensive Employee Attendance Tracking and Audit Management System." />
      </head>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          fontSans.variable
        )}
      >
        <MockDataStoreProvider>
            <SidebarProvider>
            <ConditionalLayout>
                {children}
            </ConditionalLayout>
            </SidebarProvider>
            <Toaster />
        </MockDataStoreProvider>
      </body>
    </html>
  );
}
