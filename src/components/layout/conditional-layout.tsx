'use client';

import { usePathname } from 'next/navigation';
import MainSidebar from './main-sidebar';
import { SidebarInset } from '../ui/sidebar';
import Header from './header';

// Mock user for frontend-only mode
const useUser = () => ({ user: { email: 'demo@staffwise.com', displayName: 'Demo User' }, isUserLoading: false });

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const pathname = usePathname();

  // Don't render the main layout on the login page.
  if (pathname === '/login') {
    return <>{children}</>;
  }

  // Still show a loading state while user is being determined to prevent flicker
  if (isUserLoading) {
    return null; // Or a loading spinner
  }

  if (!user) {
     return <>{children}</>;
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
