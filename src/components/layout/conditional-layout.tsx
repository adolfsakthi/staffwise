'use client';

import { usePathname, useRouter } from 'next/navigation';
import MainSidebar from './main-sidebar';
import { SidebarInset } from '../ui/sidebar';
import Header from './header';
import { useUser } from '@/firebase';
import { useEffect } from 'react';

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // If loading has finished and there's no user, and we are not on the login page, redirect.
    if (!isUserLoading && !user && pathname !== '/login') {
      router.push('/login');
    }
  }, [user, isUserLoading, pathname, router]);

  // Don't render the main layout on the login page.
  if (pathname === '/login') {
    return <>{children}</>;
  }

  // Still show a loading state while user is being determined to prevent flicker
  if (isUserLoading || !user) {
    return null; // Or a full-page loading spinner
  }

  return (
    <>
      <MainSidebar />
      <SidebarInset>
        <Header />
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </>
  );
}
