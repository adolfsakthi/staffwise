
'use client';

import MainSidebar from './main-sidebar';
import { SidebarInset } from '../ui/sidebar';
import Header from './header';

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  // Since auth is removed, we always show the main layout.
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
