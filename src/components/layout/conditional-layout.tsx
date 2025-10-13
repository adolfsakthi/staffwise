'use client';

import { usePathname } from 'next/navigation';
import MainSidebar from './main-sidebar';
import { SidebarInset } from '../ui/sidebar';
import Header from './header';

const PUBLIC_ROUTES = ['/login'];

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicPage = PUBLIC_ROUTES.includes(pathname);

  if (isPublicPage) {
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
