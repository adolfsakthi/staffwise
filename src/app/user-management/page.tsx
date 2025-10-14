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
import type { Role, UserProfile } from '@/lib/types';
import { useMemo } from 'react';
import { collection, query, where } from 'firebase/firestore';


export default function UserManagementPage() {
    const { user: currentUser, isUserLoading } = useUser();
    const firestore = useFirestore();
    const clientId = 'default_client';

    // @ts-ignore
    const propertyCode = currentUser?.property_code || null;

    const rolesQuery = useMemoFirebase(() => {
        if (!firestore || !clientId) return null;
        return query(collection(firestore, `clients/${clientId}/roles`));
    }, [firestore, clientId]);

    const usersQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        // This fetches all users. In a real app, this should be paginated and filtered.
        return collection(firestore, 'users');
    }, [firestore]);


    const { data: rolesData, isLoading: isLoadingRoles, error: rolesError } = useCollection<Role>(rolesQuery);
    const { data: usersData, isLoading: isLoadingUsers, error: usersError } = useCollection<UserProfile>(usersQuery);

    const roles = useMemo(() => {
      if (!rolesData || !propertyCode) return [];
      return rolesData.filter(r => r.property_code === propertyCode);
    }, [rolesData, propertyCode]);
    
    const users = useMemo(() => {
      if (!usersData || !propertyCode) return [];
      return usersData.filter(u => u.property_code === propertyCode);
    }, [usersData, propertyCode]);

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
                <UserList roles={roles || []} users={users || []} clientId={clientId} propertyCode={propertyCode || ''} />
            </TabsContent>
            <TabsContent value="roles" className="pt-6">
                <RoleManagement initialRoles={roles || []} clientId={clientId} propertyCode={propertyCode || ''} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    );
}
