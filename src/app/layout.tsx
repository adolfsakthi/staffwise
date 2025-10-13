'use client';

import './globals.css';
import { cn } from '@/lib/utils';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toaster';
import ConditionalLayout from '@/components/layout/conditional-layout';
import { Inter as FontSans } from 'next/font/google';
import { useState, useEffect } from 'react';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

// A mock auth wrapper
function AuthWrapper({ children }: { children: React.ReactNode }) {
  // In a real app, you'd have auth logic here.
  // For now, we'll just render the children.
  return <>{children}</>;
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>StaffWise - Employee Attendance Management</title>
        <meta name="description" content="A comprehensive Employee Attendance Tracking and Audit Management System." />
      </head>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          fontSans.variable
        )}
      >
        <AuthWrapper>
          <SidebarProvider>
            <ConditionalLayout>
              {children}
            </ConditionalLayout>
          </SidebarProvider>
        </AuthWrapper>
        <Toaster />
      </body>
    </html>
  );
}
