
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useAuth } from '@/firebase';
import { useUserProfile } from '@/firebase/auth/use-user-profile';
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
    href: '/settings',
    icon: Settings,
    label: 'Settings',
  },
];

export default function MainSidebar() {
  const pathname = usePathname();
  const { setOpenMobile, isMobile } = useSidebar();
  const userAvatar = PlaceHolderImages.find((img) => img.id === 'user-avatar');
  const auth = useAuth();
  const { userProfile } = useUserProfile();

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const getAvatarFallback = (name?: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('');
  }

  const handleSignOut = () => {
    auth.signOut();
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Icons.logo className="size-7 text-primary" />
          <span className="text-lg font-semibold text-foreground">StaffWise</span>
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
              <AvatarFallback>{getAvatarFallback(userProfile?.displayName)}</AvatarFallback>
            </Avatar>
            <div className="text-left group-data-[collapsible=icon]:hidden">
              <p className="text-sm font-medium">{userProfile?.displayName || 'Admin User'}</p>
              <p className="text-xs text-muted-foreground">
                {userProfile?.email || 'demo@staffwise.com'}
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
