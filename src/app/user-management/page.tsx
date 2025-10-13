
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
import { useEffect, useState } from 'react';
import { MOCK_ROLES } from '@/lib/mock-data';
import type { Role } from '@/lib/types';


const propertyCode = 'D001'; // Hardcoded property code
  
export default function UserManagementPage() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [isLoadingRoles, setIsLoadingRoles] = useState(true);
    
    useEffect(() => {
        setIsLoadingRoles(true);
        setTimeout(() => {
            const propertyRoles = MOCK_ROLES.filter(r => r.property_code === propertyCode);
            setRoles(propertyRoles);
            setIsLoadingRoles(false);
        }, 500);
    }, []);

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
                <UserList roles={roles || []} propertyCode={propertyCode} />
            </TabsContent>
            <TabsContent value="roles" className="pt-6">
                <RoleManagement initialRoles={roles || []} propertyCode={propertyCode} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    );
}
