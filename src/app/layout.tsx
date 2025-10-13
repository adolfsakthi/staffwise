
'use client';

import './globals.css';
import { cn } from '@/lib/utils';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toaster';
import ConditionalLayout from '@/components/layout/conditional-layout';
import { Inter as FontSans } from 'next/font/google';
import { FirebaseClientProvider, useUserProfile } from '@/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { userProfile, isLoading, user } = useUserProfile();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If auth is done loading and there's no user, redirect to login (if not already there)
    if (!isLoading && !user && pathname !== '/login') {
      router.push('/login');
    }
    // If auth is done loading and there IS a user, redirect from login to home
    if (!isLoading && user && pathname === '/login') {
        router.push('/');
    }
  }, [user, isLoading, router, pathname]);

  // While checking auth state or loading the profile, show a loader
  if (isLoading && pathname !== '/login') {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  // On the login page, render immediately
  if (pathname === '/login') {
     return <>{children}</>;
  }

  // If we have a user and their profile, render the app
  if (user && userProfile) {
    return <>{children}</>;
  }

  // Fallback while redirecting or if profile is missing after login
  return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
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
        <FirebaseClientProvider>
          <AuthWrapper>
            <SidebarProvider>
              <ConditionalLayout>
                {children}
              </ConditionalLayout>
            </SidebarProvider>
          </AuthWrapper>
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
