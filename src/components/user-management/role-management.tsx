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

// This can be fetched from a 'settings' collection in Firestore
export const ALL_PERMISSIONS = ['read', 'write', 'hidden'];

type Role = {
  id: string;
  name: string;
  permissions: string[];
};

type RoleManagementProps = {
    initialRoles: Role[]
}


export default function RoleManagement({ initialRoles }: RoleManagementProps) {
  const [roles, setRoles] = useState(initialRoles);
  const [newRoleName, setNewRoleName] = useState('');
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  const handleAddRole = () => {
    if (newRoleName.trim()) {
      const newRole: Role = {
        id: `role_${Date.now()}`,
        name: newRoleName.trim(),
        permissions: ['read'],
      };
      setRoles([...roles, newRole]);
      setNewRoleName('');
    }
  };

  const handleDeleteRole = (id: string) => {
    setRoles(roles.filter((role) => role.id !== id));
  };

  const handleStartEdit = (role: Role) => {
    setEditingRole({ ...role });
  };

  const handleCancelEdit = () => {
    setEditingRole(null);
  };

  const handleSaveEdit = () => {
    if (editingRole) {
      setRoles(
        roles.map((role) =>
          role.id === editingRole.id ? editingRole : role
        )
      );
      setEditingRole(null);
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
