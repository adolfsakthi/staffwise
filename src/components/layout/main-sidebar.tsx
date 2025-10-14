'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Icons } from '@/components/icons';
import {
  LayoutDashboard,
  CalendarCheck,
  ShieldCheck,
  Settings,
  Users,
  FileText,
  Fingerprint,
  Bell,
  LogOut,
  Mail,
  UserPlus,
  ClipboardList,
  Building,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';

const navItems = [
  {
    href: '/',
    icon: LayoutDashboard,
    label: 'Dashboard',
  },
  {
    href: '/attendance',
    icon: CalendarCheck,
    label: 'Attendance',
  },
  {
    href: '/live-logs',
    icon: Bell,
    label: 'Live Logs',
  },
  {
    href: '/audit',
    icon: ShieldCheck,
    label: 'Audit',
  },
  {
    href: '/employees',
    icon: UserPlus,
    label: 'Employees',
  },
  {
    href: '/duty',
    icon: ClipboardList,
    label: 'Duty Roster',
  },
  {
    href: '/reports',
    icon: FileText,
    label: 'Reports',
  },
  {
    href: '/device-management',
    icon: Fingerprint,
    label: 'Devices',
  },
  {
    href: '/user-management',
    icon: Users,
    label: 'Users',
  },
  {
    href: '/email-logs',
    icon: Mail,
    label: 'Email Logs',
  },
  {
    href: '/settings',
    icon: Settings,
    label: 'Settings',
  },
];


export default function MainSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { setOpenMobile, isMobile } = useSidebar();
  const userAvatar = PlaceHolderImages.find((img) => img.id === 'user-avatar');

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const getAvatarFallback = (name?: string | null) => {
    if (!name) return 'A';
    return name.split(' ').map(n => n[0]).join('');
  }

  const handleSignOut = () => {
    router.push('/login');
  }

  const displayName = 'Demo User';
  const email = 'demo@hezeeaccess.com';

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Icons.logo className="size-7" />
          <h1 className="font-semibold text-lg group-data-[collapsible=icon]:hidden">HEZEE ACCESS</h1>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} onClick={handleLinkClick}>
                <SidebarMenuButton
                  isActive={pathname === item.href}
                  tooltip={item.label}
                  className="justify-start"
                >
                  <item.icon className="size-5" />
                  <span
                    className={cn(
                      'group-data-[collapsible=icon]:hidden'
                    )}
                  >
                    {item.label}
                  </span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
          <div
            className="w-full justify-start gap-3 p-2 group-data-[collapsible=icon]:size-10 group-data-[collapsible=icon]:justify-center flex items-center"
          >
            <Avatar className="h-8 w-8">
              {userAvatar && (
                <AvatarImage
                  src={userAvatar.imageUrl}
                  alt={userAvatar.description}
                  width={32}
                  height={32}
                  data-ai-hint={userAvatar.imageHint}
                />
              )}
              <AvatarFallback>{getAvatarFallback(displayName)}</AvatarFallback>
            </Avatar>
            <div className="text-left group-data-[collapsible=icon]:hidden">
              <p className="text-sm font-medium">{displayName}</p>
              <p className="text-xs text-muted-foreground">
                {email}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleSignOut} className="group-data-[collapsible=icon]:hidden ml-auto">
                <LogOut className="size-4" />
            </Button>
          </div>
        </SidebarFooter>
    </Sidebar>
  );
}
