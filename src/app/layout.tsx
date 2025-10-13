
'use client';

import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toaster';
import ConditionalLayout from '@/components/layout/conditional-layout';
import { Inter as FontSans } from 'next/font/google';
import { FirebaseClientProvider, useUser } from '@/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

// Metadata can't be dynamically generated in a client component,
// so we'll define it statically here. We could move this to a server
// component wrapper if dynamic metadata were needed.
// export const metadata: Metadata = {
//   title: 'StaffWise - Employee Attendance Management',
//   description:
//     'A comprehensive Employee Attendance Tracking and Audit Management System.',
// };

function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isUserLoading && !user && pathname !== '/login') {
      router.push('/login');
    }
    if (!isUserLoading && user && pathname === '/login') {
        router.push('/');
    }
  }, [user, isUserLoading, router, pathname]);

  if (isUserLoading && pathname !== '/login') {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  // Render children immediately if on login page or if user is loaded
  if (pathname === '/login' || user) {
     return <>{children}</>;
  }

  // If loading and not on login, show loader. If not loading and no user, will redirect.
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
