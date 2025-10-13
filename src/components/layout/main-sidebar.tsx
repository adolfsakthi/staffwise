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
  LogOut,
  Users,
  FileText,
  Fingerprint,
  Bell,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useAuth } from '@/firebase';

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
  const router = useRouter();
  const { setOpenMobile, isMobile } = useSidebar();
  const userAvatar = PlaceHolderImages.find((img) => img.id === 'user-avatar');
  const { user } = useUser();
  const auth = useAuth();
  
  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const handleLogout = async () => {
    if (auth) {
        await signOut(auth);
    }
    router.push('/login');
  };

  const getAvatarFallback = (name?: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('');
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
      {user && (
        <SidebarFooter>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 p-2 group-data-[collapsible=icon]:size-10 group-data-[collapsible=icon]:justify-center"
              >
                <Avatar className="h-8 w-8">
                  {user?.photoURL ? (
                    <AvatarImage
                      src={user.photoURL}
                      alt={user.displayName || 'User Avatar'}
                      width={32}
                      height={32}
                    />
                  ) : userAvatar && (
                    <AvatarImage
                      src={userAvatar.imageUrl}
                      alt={userAvatar.description}
                      width={32}
                      height={32}
                      data-ai-hint={userAvatar.imageHint}
                    />
                  )}
                  <AvatarFallback>{getAvatarFallback(user?.displayName)}</AvatarFallback>
                </Avatar>
                <div className="text-left group-data-[collapsible=icon]:hidden">
                  <p className="text-sm font-medium">{user?.displayName || 'Admin User'}</p>
                  <p className="text-xs text-muted-foreground">
                    {user?.email || 'demo@staffwise.com'}
                  </p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.displayName || 'Admin User'}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
