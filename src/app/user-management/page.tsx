
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
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

type Role = {
  id: string;
  name: string;
  permissions: string[];
};
  
export default function UserManagementPage() {
    const firestore = useFirestore();

    const rolesQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'roles');
    }, [firestore]);

    const { data: roles, isLoading: isLoadingRoles } = useCollection<Role>(rolesQuery);

    if (isLoadingRoles) {
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
            Manage user accounts and their assigned roles.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="users">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="roles">Roles</TabsTrigger>
            </TabsList>
            <TabsContent value="users" className="pt-6">
                <UserList roles={roles || []} />
            </TabsContent>
            <TabsContent value="roles" className="pt-6">
                <RoleManagement initialRoles={roles || []} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    );
}

    