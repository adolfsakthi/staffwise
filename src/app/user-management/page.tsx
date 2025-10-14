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
import { useUser } from '@/firebase';
import type { Role, UserProfile } from '@/lib/types';
import { useMemo, useState } from 'react';

const MOCK_ROLES: Role[] = [
    { id: '1', name: 'Admin', permissions: ['read', 'write', 'delete', 'manage_users'], property_code: 'D001', clientId: 'default_client' },
    { id: '2', name: 'Manager', permissions: ['read', 'write'], property_code: 'D001', clientId: 'default_client' },
    { id: '3', name: 'Auditor', permissions: ['read', 'run_audit'], property_code: 'D001', clientId: 'default_client' },
    { id: '4', name: 'Manager', permissions: ['read', 'write'], property_code: 'D002', clientId: 'default_client' },
];

const MOCK_USERS: UserProfile[] = [
    { id: '1', uid: 'user1', displayName: 'Admin User', email: 'admin@staffwise.com', role: 'Admin', property_code: 'D001', clientId: 'default_client' },
    { id: '2', uid: 'user2', displayName: 'Manager User', email: 'manager@staffwise.com', role: 'Manager', property_code: 'D001', clientId: 'default_client' },
    { id: '3', uid: 'user3', displayName: 'Hotel B Manager', email: 'manager@hotelb.com', role: 'Manager', property_code: 'D002', clientId: 'default_client' },
];


export default function UserManagementPage() {
    const { user: currentUser, isUserLoading } = useUser();
    
    // @ts-ignore
    const propertyCode = currentUser?.property_code || null;

    const [rolesData, setRolesData] = useState(MOCK_ROLES);
    const [usersData, setUsersData] = useState(MOCK_USERS);

    const roles = useMemo(() => {
      if (!rolesData || !propertyCode) return [];
      return rolesData.filter(r => r.property_code === propertyCode);
    }, [rolesData, propertyCode]);
    
    const users = useMemo(() => {
      if (!usersData || !propertyCode) return [];
      return usersData.filter(u => u.property_code === propertyCode);
    }, [usersData, propertyCode]);
    
    const handleUpdateUserRole = (userId: string, newRole: string) => {
        setUsersData(prev => prev.map(u => u.id === userId ? {...u, role: newRole} : u));
    }
    
    const handleUpdateRoles = (updatedRoles: Role[]) => {
        // This is a bit tricky as roles could be added/deleted/edited.
        // For simplicity, we'll just replace the roles for the current property.
        const otherPropertyRoles = rolesData.filter(r => r.property_code !== propertyCode);
        setRolesData([...otherPropertyRoles, ...updatedRoles]);
    }
    
    const handleAddUser = (newUser: UserProfile) => {
        setUsersData(prev => [...prev, newUser]);
    }

    if (isUserLoading) {
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
                <UserList 
                    roles={roles || []} 
                    users={users || []} 
                    propertyCode={propertyCode || ''}
                    onUpdateUserRole={handleUpdateUserRole}
                    onAddUser={handleAddUser}
                />
            </TabsContent>
            <TabsContent value="roles" className="pt-6">
                <RoleManagement 
                    initialRoles={roles || []} 
                    propertyCode={propertyCode || ''}
                    onRolesChange={handleUpdateRoles}
                />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    );
}
