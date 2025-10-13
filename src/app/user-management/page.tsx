
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
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { useUserProfile } from '@/firebase/auth/use-user-profile';

type Role = {
  id: string;
  name: string;
  permissions: string[];
  property_code: string;
};
  
export default function UserManagementPage() {
    const firestore = useFirestore();
    const { userProfile, isLoading: isLoadingProfile } = useUserProfile();

    const rolesQuery = useMemoFirebase(() => {
      if (!firestore || !userProfile?.property_code) return null;
      return query(collection(firestore, 'roles'), where('property_code', '==', userProfile.property_code));
    }, [firestore, userProfile]);
    const { data: roles, isLoading: isLoadingRoles } = useCollection<Role>(rolesQuery);

    const isLoading = isLoadingProfile || isLoadingRoles;

    if (isLoading) {
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
            Manage user accounts and their assigned roles for property {userProfile?.property_code}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="users">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="roles">Roles</TabsTrigger>
            </TabsList>
            <TabsContent value="users" className="pt-6">
                <UserList roles={roles || []} propertyCode={userProfile?.property_code || ''} />
            </TabsContent>
            <TabsContent value="roles" className="pt-6">
                <RoleManagement initialRoles={roles || []} propertyCode={userProfile?.property_code || ''} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    );
}
