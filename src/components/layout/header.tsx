'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import Link from 'next/link';

export default function Header() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  // If we are not on the dashboard, the first segment is the page title.
  // if we are on the dashboard, it is the only segment.
  const pageTitle = segments.length > 0 && segments[0] !== 'dashboard' 
      ? segments[0]
      : 'Dashboard';

  const capitalizedTitle = pageTitle.charAt(0).toUpperCase() + pageTitle.slice(1).replace('-', ' ');


  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur sm:px-6">
      <SidebarTrigger className="md:hidden" />
      <div className="flex-1">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard">Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {segments.map((segment, index) => {
              if (segment === 'dashboard') return null;
              const isLast = index === segments.length - 1;
              const capitalizedSegment = segment.charAt(0).toUpperCase() + segment.slice(1).replace('-', ' ');
              
              return (
                <React.Fragment key={segment}>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    {isLast ? (
                       <BreadcrumbPage>{capitalizedSegment}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link href={`/${segments.slice(0, index + 1).join('/')}`}>
                          {capitalizedSegment}
                        </Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  );
}
