'use client';

import { useState, useEffect } from 'react';
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
import { MoreVertical, PlusCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useToast } from '@/hooks/use-toast';
import type { UserProfile, Role } from '@/lib/types';
import { useAuth, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc, setDoc, doc } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';


type UserListProps = {
    roles: Role[];
    users: UserProfile[];
    propertyCode: string;
}

export default function UserList({ roles, users, propertyCode }: UserListProps) {
  const auth = useAuth();
  const firestore = useFirestore();

  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState(roles[0]?.name || '');
  const [showPassword, setShowPassword] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    if (roles.length > 0 && !newUserRole) {
        setNewUserRole(roles[0].name);
    }
  }, [roles, newUserRole]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    const userRef = doc(firestore, 'users', userId);
    setDoc(userRef, { role: newRole }, { merge: true })
        .then(() => {
            toast({ title: "User role updated" });
        })
        .catch(err => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: `users/${userId}`,
                operation: 'update',
                requestResourceData: { role: newRole }
            }))
        })
  };

  const handleAddUser = async () => {
    if (!newUserEmail.trim() || !newUserName.trim() || !propertyCode || !newUserPassword) {
      toast({ variant: 'destructive', title: 'Please fill all fields.' });
      return;
    }
    
    setIsCreatingUser(true);
    
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, newUserEmail, newUserPassword);
        const user = userCredential.user;

        const newUserProfile: Omit<UserProfile, 'id'> = {
            uid: user.uid,
            displayName: newUserName,
            email: newUserEmail,
            role: newUserRole,
            property_code: propertyCode,
        };

        // We use setDoc with user.uid to keep user doc ID and auth UID in sync
        const userCollection = collection(firestore, 'users');
        await setDoc(doc(userCollection, user.uid), newUserProfile);

        toast({
            title: 'User Created Successfully',
            description: 'The user has been added and can now log in.',
        });

        setNewUserEmail('');
        setNewUserPassword('');
        setNewUserName('');
        setNewUserRole(roles[0]?.name || '');

    } catch(error: any) {
        let description = "An unexpected error occurred."
        if (error.code) {
            switch(error.code) {
                case 'auth/email-already-in-use':
                    description = "This email is already registered.";
                    break;
                case 'auth/invalid-email':
                    description = "The email address is not valid.";
                    break;
                case 'auth/weak-password':
                    description = "The password is too weak.";
                    break;
                default:
                    description = error.message;
            }
        }
        toast({ variant: 'destructive', title: 'User creation failed', description});
    } finally {
        setIsCreatingUser(false);
    }
  };

  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Create New User</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-2">
                        <Label htmlFor="new-user-name">Full Name</Label>
                        <Input id="new-user-name" placeholder="John Doe" value={newUserName} onChange={e => setNewUserName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="new-user-email">Email</Label>
                        <Input id="new-user-email" placeholder="user@example.com" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} />
                    </div>
                     <div className="relative space-y-2">
                        <Label htmlFor="new-user-password">Password</Label>
                        <Input 
                            id="new-user-password" 
                            type={showPassword ? 'text' : 'password'} 
                            placeholder="********" 
                            value={newUserPassword} 
                            onChange={e => setNewUserPassword(e.target.value)} 
                            className="pr-10"
                        />
                         <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-6 h-7 px-3"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            <span className="sr-only">
                                {showPassword ? 'Hide password' : 'Show password'}
                            </span>
                        </Button>
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
                <Button onClick={handleAddUser} disabled={isCreatingUser}>
                    {isCreatingUser ? <Loader2 className="mr-2 animate-spin" /> : <PlusCircle className="mr-2" />}
                    Add User
                </Button>
            </CardContent>
        </Card>

        <div className="overflow-x-auto rounded-md border">
        <Table>
            <TableHeader>
            <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Property Code</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="w-[50px]">Actions</TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
             {users && users.length > 0 ? (
                users.map((user) => (
                <TableRow key={user.id}>
                <TableCell>
                    <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarImage src={user.photoURL || `https://i.pravatar.cc/150?u=${user.email}`} alt={user.displayName || ""} />
                        <AvatarFallback>
                        {user.displayName
                            ?.split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="font-medium">{user.displayName}</div>
                        <div className="text-sm text-muted-foreground">
                        {user.email}
                        </div>
                    </div>
                    </div>
                </TableCell>
                <TableCell>{user.property_code}</TableCell>
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
            ))
            ) : (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                        No users found for this property.
                    </TableCell>
                </TableRow>
            )}
            </TableBody>
        </Table>
        </div>
    </div>
  );
}
