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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Trash2, Edit, X, Check } from 'lucide-react';
import type { Role } from '@/lib/types';
import { useFirestore } from '@/firebase';
import { collection, addDoc, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';


// This can be fetched from a 'settings' collection in a real app
export const ALL_PERMISSIONS = ['read', 'write', 'delete', 'manage_users'];

type RoleManagementProps = {
    initialRoles: Role[];
    propertyCode: string;
}


export default function RoleManagement({ initialRoles, propertyCode }: RoleManagementProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [roles, setRoles] = useState(initialRoles);
  const [newRoleName, setNewRoleName] = useState('');
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  useState(() => {
    setRoles(initialRoles);
  });

  const handleAddRole = async () => {
    if (newRoleName.trim() && propertyCode) {
      const newRole: Omit<Role, 'id'> = {
        name: newRoleName.trim(),
        permissions: ['read'],
        property_code: propertyCode,
      };

      const rolesCollection = collection(firestore, 'roles');
      addDoc(rolesCollection, newRole)
        .then(() => {
            toast({title: 'Role added', description: `Role "${newRole.name}" created.`})
            setNewRoleName('');
        }).catch(err => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: 'roles',
                operation: 'create',
                requestResourceData: newRole
            }));
        })
    }
  };

  const handleDeleteRole = (id: string) => {
    const roleRef = doc(firestore, 'roles', id);
    deleteDoc(roleRef)
    .then(() => {
        toast({title: 'Role deleted'})
    })
    .catch(err => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: `roles/${id}`,
            operation: 'delete'
        }));
    });
  };

  const handleStartEdit = (role: Role) => {
    setEditingRole({ ...role });
  };

  const handleCancelEdit = () => {
    setEditingRole(null);
  };

  const handleSaveEdit = async () => {
    if (editingRole) {
        const { id, ...roleData } = editingRole;
        const roleRef = doc(firestore, 'roles', id);
        setDoc(roleRef, roleData, { merge: true })
            .then(() => {
                setEditingRole(null);
                toast({ title: 'Role updated' });
            })
            .catch(err => {
                errorEmitter.emit('permission-error', new FirestorePermissionError({
                    path: `roles/${id}`,
                    operation: 'update',
                    requestResourceData: roleData
                }));
            });
    }
  };

  const togglePermission = (permission: string) => {
    if (editingRole) {
      const newPermissions = editingRole.permissions.includes(permission)
        ? editingRole.permissions.filter((p) => p !== permission)
        : [...editingRole.permissions, permission];
      setEditingRole({ ...editingRole, permissions: newPermissions });
    }
  };

  return (
    <div className="space-y-6">
       <div className="space-y-2">
        <h3 className="text-lg font-medium">Create New Role</h3>
        <div className="flex gap-2">
            <Input
            placeholder="New role name (e.g., Manager)"
            value={newRoleName}
            onChange={(e) => setNewRoleName(e.target.value)}
            className="max-w-xs"
            />
            <Button onClick={handleAddRole}>
            <PlusCircle className="mr-2" /> Add Role
            </Button>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-medium">Existing Roles</h3>
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role Name</TableHead>
                <TableHead>Property Code</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead className="w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id}>
                  {editingRole?.id === role.id ? (
                     <>
                        <TableCell>
                            <Input value={editingRole.name} onChange={(e) => setEditingRole({...editingRole, name: e.target.value})} />
                        </TableCell>
                        <TableCell>
                           {editingRole.property_code}
                        </TableCell>
                        <TableCell>
                            <div className="flex flex-wrap gap-2">
                                {ALL_PERMISSIONS.map(permission => (
                                    <Button key={permission} variant={editingRole.permissions.includes(permission) ? 'secondary': 'outline'} size="sm" onClick={() => togglePermission(permission)}>
                                        {permission}
                                    </Button>
                                ))}
                            </div>
                        </TableCell>
                        <TableCell>
                            <div className="flex gap-2">
                                <Button size="icon" variant="ghost" onClick={handleSaveEdit}><Check className="text-green-500" /></Button>
                                <Button size="icon" variant="ghost" onClick={handleCancelEdit}><X /></Button>
                            </div>
                        </TableCell>
                     </>
                  ) : (
                    <>
                      <TableCell className="font-medium">{role.name}</TableCell>
                      <TableCell className="text-muted-foreground">{role.property_code}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {role.permissions.length > 0 ? role.permissions.map((p) => (
                            <Badge key={p} variant="secondary">
                              {p}
                            </Badge>
                          )): <span className='text-muted-foreground'>No permissions</span>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                            <Button size="icon" variant="ghost" onClick={() => handleStartEdit(role)}><Edit /></Button>
                            <Button size="icon" variant="ghost" onClick={() => handleDeleteRole(role.id)}><Trash2 className="text-destructive" /></Button>
                        </div>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

     
    </div>
  );
}
