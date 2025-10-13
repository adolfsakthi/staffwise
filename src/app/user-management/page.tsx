'use client';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from '@/components/ui/card';
  import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
  } from '@/components/ui/tabs';
import UserList from '@/components/user-management/user-list';
import RoleManagement from '@/components/user-management/role-management';
import { Loader2 } from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Role, UserProfile } from '@/lib/types';

export default function UserManagementPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    // @ts-ignore
    const propertyCode = user?.property_code || 'D001';

    const rolesQuery = useMemoFirebase(() => {
        if (!firestore || !propertyCode) return null;
        return query(collection(firestore, 'roles'), where('property_code', '==', propertyCode));
    }, [firestore, propertyCode]);

    const usersQuery = useMemoFirebase(() => {
        if (!firestore || !propertyCode) return null;
        return query(collection(firestore, 'users'), where('property_code', '==', propertyCode));
    }, [firestore, propertyCode]);
    
    const { data: roles, isLoading: isLoadingRoles, error: rolesError } = useCollection<Role>(rolesQuery);
    const { data: users, isLoading: isLoadingUsers, error: usersError } = useCollection<UserProfile>(usersQuery);

    if (isUserLoading || isLoadingRoles || isLoadingUsers) {
        return (
            <div className="flex min-h-[400px] w-full items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            Manage user accounts and their assigned roles for property {propertyCode}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="users">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="roles">Roles</TabsTrigger>
            </TabsList>
            <TabsContent value="users" className="pt-6">
                <UserList roles={roles || []} users={users || []} propertyCode={propertyCode} />
            </TabsContent>
            <TabsContent value="roles" className="pt-6">
                <RoleManagement initialRoles={roles || []} propertyCode={propertyCode} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    );
}
