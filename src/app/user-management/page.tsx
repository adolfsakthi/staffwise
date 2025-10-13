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
import { useState } from 'react';

type Role = {
  id: string;
  name: string;
  permissions: string[];
};

const MOCK_ROLES: Role[] = [
    { id: '1', name: 'Admin', permissions: ['read', 'write', 'delete', 'manage_users'] },
    { id: '2', name: 'Manager', permissions: ['read', 'write'] },
    { id: '3', name: 'Staff', permissions: ['read'] },
];
  
export default function UserManagementPage() {
    const [roles, setRoles] = useState(MOCK_ROLES);
    const [isLoadingRoles, setIsLoadingRoles] = useState(false);


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
