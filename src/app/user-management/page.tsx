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
import { getUsers, getRoles } from '@/lib/data';
  
  export default async function UserManagementPage() {

    const users = await getUsers();
    const roles = await getRoles();

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
                <UserList initialUsers={users} roles={roles} />
            </TabsContent>
            <TabsContent value="roles" className="pt-6">
                <RoleManagement initialRoles={roles} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    );
  }
  