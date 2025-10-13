
'use client';

import './globals.css';
import { cn } from '@/lib/utils';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toaster';
import ConditionalLayout from '@/components/layout/conditional-layout';
import { Inter as FontSans } from 'next/font/google';
import { FirebaseClientProvider } from '@/firebase';
import { useUserProfile } from '@/firebase/auth/use-user-profile';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { isUserLoading, user } = useUserProfile();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If auth is done loading and there's no user, redirect to login (if not already there)
    if (!isUserLoading && !user && pathname !== '/login') {
      router.push('/login');
    }
  }, [user, isUserLoading, router, pathname]);

  // While checking auth state show a loader (on any page other than login)
  if (isUserLoading && pathname !== '/login') {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  // If we are on the login page or we have a user, render the children.
  // The login page itself handles the redirect *after* a successful login.
  if (pathname === '/login' || user) {
     return <>{children}</>;
  }

  // Fallback while redirecting or for any other unhandled case
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
