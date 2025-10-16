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
import type { Role, UserProfile } from '@/lib/types';
import { useMemo } from 'react';
import { useMockData } from '@/lib/mock-data-store';


export default function UserManagementPage() {
    const propertyCode = 'D001';

    const { roles, setRoles, users, setUsers } = useMockData();

    const filteredRoles = useMemo(() => {
      if (!roles || !propertyCode) return [];
      return roles.filter(r => r.property_code === propertyCode);
    }, [roles, propertyCode]);
    
    const filteredUsers = useMemo(() => {
      if (!users || !propertyCode) return [];
      return users.filter(u => u.property_code === propertyCode);
    }, [users, propertyCode]);
    
    const handleUpdateUserRole = (userId: string, newRole: string) => {
        setUsers(prev => prev.map(u => u.id === userId ? {...u, role: newRole} : u));
    }
    
    const handleUpdateRoles = (updatedRoles: Role[]) => {
        const otherPropertyRoles = roles.filter(r => r.property_code !== propertyCode);
        setRoles([...otherPropertyRoles, ...updatedRoles]);
    }
    
    const handleAddUser = (newUser: UserProfile) => {
        setUsers(prev => [...prev, newUser]);
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
                    roles={filteredRoles || []} 
                    users={filteredUsers || []} 
                    propertyCode={propertyCode || ''}
                    onUpdateUserRole={handleUpdateUserRole}
                    onAddUser={handleAddUser}
                />
            </TabsContent>
            <TabsContent value="roles" className="pt-6">
                <RoleManagement 
                    initialRoles={filteredRoles || []} 
                    propertyCode={propertyCode || ''}
                    onRolesChange={handleUpdateRoles}
                />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    );
}
