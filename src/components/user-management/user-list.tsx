'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '../ui/button';
import { MoreVertical, PlusCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

type User = {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  role: string;
};

type Role = {
  id: string;
  name: string;
};

type UserListProps = {
    initialUsers: User[];
    roles: Role[];
}

export default function UserList({ initialUsers, roles }: UserListProps) {
  const [users, setUsers] = useState(initialUsers);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('Guest');

  const handleRoleChange = (userId: string, newRole: string) => {
    setUsers(
      users.map((user) =>
        user.id === userId ? { ...user, role: newRole } : user
      )
    );
    // In a real app, you would call an API to update the user's role.
    console.log(`Changed user ${userId} role to ${newRole}`);
  };

  const handleAddUser = () => {
    if (newUserEmail.trim() && newUserPassword.trim()) {
        const newUser: User = {
            id: `user_${Date.now()}`,
            email: newUserEmail.trim(),
            role: newUserRole,
            name: 'New User', // You might want a name field as well
            username: newUserEmail.split('@')[0],
            avatar: `https://i.pravatar.cc/150?u=${newUserEmail.trim()}`
        };
        setUsers([newUser, ...users]);
        setNewUserEmail('');
        setNewUserPassword('');
        setNewUserRole('Guest');
    }
  };

  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Create New User</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                        <Label htmlFor="new-user-email">Email</Label>
                        <Input id="new-user-email" placeholder="user@example.com" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="new-user-password">Password</Label>
                        <Input id="new-user-password" type="password" placeholder="********" value={newUserPassword} onChange={e => setNewUserPassword(e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="new-user-role">Role</Label>
                        <Select value={newUserRole} onValueChange={setNewUserRole}>
                            <SelectTrigger id="new-user-role">
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                                {roles.map((role) => (
                                <SelectItem key={role.id} value={role.name}>
                                    {role.name}
                                </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <Button onClick={handleAddUser}>
                    <PlusCircle className="mr-2" />
                    Add User
                </Button>
            </CardContent>
        </Card>

        <div className="overflow-x-auto rounded-md border">
        <Table>
            <TableHeader>
            <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="w-[50px]">Actions</TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
            {users.map((user) => (
                <TableRow key={user.id}>
                <TableCell>
                    <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>
                        {user.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">
                        {user.email}
                        </div>
                    </div>
                    </div>
                </TableCell>
                <TableCell>
                    <span className="text-sm text-muted-foreground">@{user.username}</span>
                </TableCell>
                <TableCell>
                    <Select
                    value={user.role}
                    onValueChange={(newRole) => handleRoleChange(user.id, newRole)}
                    >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                        {roles.map((role) => (
                        <SelectItem key={role.id} value={role.name}>
                            {role.name}
                        </SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                </TableCell>
                <TableCell>
                    <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                        <MoreVertical />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem>View Profile</DropdownMenuItem>
                        <DropdownMenuItem>Edit User</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:text-destructive">
                        Deactivate User
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
                </TableRow>
            ))}
            </TableBody>
        </Table>
        </div>
    </div>
  );
}
