'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Shield,
  Users,
  Settings,
  Eye,
  MoreHorizontal,
  UserCheck,
  UserX,
  Building2,
  FileText,
  BarChart3
} from 'lucide-react'

const roles = [
  {
    id: 1,
    name: 'Super Admin',
    description: 'Full system access and control',
    users: 2,
    permissions: [
      'user_management', 'garage_management', 'system_settings', 
      'security_policies', 'statistics_view', 'logs_view', 'role_management'
    ],
    isDefault: false,
    createdAt: '2024-01-01'
  },
  {
    id: 2,
    name: 'Admin',
    description: 'Administrative access with limited system control',
    users: 5,
    permissions: [
      'user_management', 'garage_management', 'statistics_view', 'logs_view'
    ],
    isDefault: false,
    createdAt: '2024-01-15'
  },
  {
    id: 3,
    name: 'Moderator',
    description: 'Content moderation and user support',
    users: 12,
    permissions: [
      'user_management', 'content_moderation', 'support_tickets'
    ],
    isDefault: false,
    createdAt: '2024-02-01'
  },
  {
    id: 4,
    name: 'User',
    description: 'Standard user access',
    users: 2847,
    permissions: ['basic_access'],
    isDefault: true,
    createdAt: '2024-01-01'
  }
]

const availablePermissions = [
  { id: 'user_management', name: 'User Management', description: 'Manage user accounts' },
  { id: 'garage_management', name: 'Garage Management', description: 'Manage garage accounts' },
  { id: 'system_settings', name: 'System Settings', description: 'Configure system settings' },
  { id: 'security_policies', name: 'Security Policies', description: 'Manage security policies' },
  { id: 'statistics_view', name: 'View Statistics', description: 'Access system statistics' },
  { id: 'logs_view', name: 'View Logs', description: 'Access system logs' },
  { id: 'role_management', name: 'Role Management', description: 'Manage user roles' },
  { id: 'content_moderation', name: 'Content Moderation', description: 'Moderate content' },
  { id: 'support_tickets', name: 'Support Tickets', description: 'Handle support tickets' },
  { id: 'basic_access', name: 'Basic Access', description: 'Basic user access' }
]

export function UserRolesManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState<any>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isViewDetailsDialogOpen, setIsViewDetailsDialogOpen] = useState(false)
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  })

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateRole = () => {
    setNewRole({ name: '', description: '', permissions: [] })
    setIsCreateDialogOpen(true)
  }

  const handleEditRole = (role: any) => {
    setSelectedRole(role)
    setIsEditDialogOpen(true)
  }

  const handleDeleteRole = (role: any) => {
    setSelectedRole(role)
    setIsDeleteDialogOpen(true)
  }

  const handleViewDetails = (role: any) => {
    setSelectedRole(role)
    setIsViewDetailsDialogOpen(true)
  }

  const confirmCreateRole = () => {
    console.log('Creating role:', newRole)
    setIsCreateDialogOpen(false)
    setNewRole({ name: '', description: '', permissions: [] })
  }

  const confirmEditRole = () => {
    console.log('Editing role:', selectedRole)
    setIsEditDialogOpen(false)
    setSelectedRole(null)
  }

  const confirmDeleteRole = () => {
    console.log('Deleting role:', selectedRole)
    setIsDeleteDialogOpen(false)
    setSelectedRole(null)
  }

  const togglePermission = (permissionId: string, rolePermissions: string[]) => {
    if (rolePermissions.includes(permissionId)) {
      return rolePermissions.filter(p => p !== permissionId)
    } else {
      return [...rolePermissions, permissionId]
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Roles Overview</h2>
          <p className="text-sm text-gray-600">Manage user roles and their permissions</p>
        </div>
        <Button onClick={handleCreateRole}>
          <Plus className="mr-2 h-4 w-4" />
          Create Role
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search Roles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search roles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Roles Table */}
      <Card>
        <CardHeader>
          <CardTitle>Roles ({filteredRoles.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Default</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRoles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">{role.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate" title={role.description}>
                      {role.description}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span>{role.users}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.slice(0, 3).map((permission) => (
                        <Badge key={permission} variant="secondary" className="text-xs">
                          {permission}
                        </Badge>
                      ))}
                      {role.permissions.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{role.permissions.length - 3}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {role.isDefault ? (
                      <Badge className="bg-green-100 text-green-800">Default</Badge>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-500">{role.createdAt}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleEditRole(role)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Role
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleViewDetails(role)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {!role.isDefault && (
                          <DropdownMenuItem 
                            onClick={() => handleDeleteRole(role)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Role
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Role Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Role</DialogTitle>
            <DialogDescription>
              Create a new user role with specific permissions
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="role-name">Role Name</Label>
              <Input
                id="role-name"
                value={newRole.name}
                onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                placeholder="Enter role name"
              />
            </div>
            <div>
              <Label htmlFor="role-description">Description</Label>
              <Input
                id="role-description"
                value={newRole.description}
                onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                placeholder="Enter role description"
              />
            </div>
            <div>
              <Label>Permissions</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                {availablePermissions.map((permission) => (
                  <div key={permission.id} className="flex items-center space-x-2">
                    <Switch
                      id={permission.id}
                      checked={newRole.permissions.includes(permission.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setNewRole({
                            ...newRole,
                            permissions: [...newRole.permissions, permission.id]
                          })
                        } else {
                          setNewRole({
                            ...newRole,
                            permissions: newRole.permissions.filter(p => p !== permission.id)
                          })
                        }
                      }}
                    />
                    <Label htmlFor={permission.id} className="text-sm">
                      {permission.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmCreateRole}>
              Create Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Role: {selectedRole?.name}</DialogTitle>
          </DialogHeader>
          {selectedRole && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-role-name">Role Name</Label>
                <Input
                  id="edit-role-name"
                  value={selectedRole.name}
                  onChange={(e) => setSelectedRole({ ...selectedRole, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-role-description">Description</Label>
                <Input
                  id="edit-role-description"
                  value={selectedRole.description}
                  onChange={(e) => setSelectedRole({ ...selectedRole, description: e.target.value })}
                />
              </div>
              <div>
                <Label>Permissions</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  {availablePermissions.map((permission) => (
                    <div key={permission.id} className="flex items-center space-x-2">
                      <Switch
                        id={`edit-${permission.id}`}
                        checked={selectedRole.permissions.includes(permission.id)}
                        onCheckedChange={(checked) => {
                          setSelectedRole({
                            ...selectedRole,
                            permissions: togglePermission(permission.id, selectedRole.permissions)
                          })
                        }}
                      />
                      <Label htmlFor={`edit-${permission.id}`} className="text-sm">
                        {permission.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmEditRole}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Role Details Dialog */}
      <Dialog open={isViewDetailsDialogOpen} onOpenChange={setIsViewDetailsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Role Details: {selectedRole?.name}</DialogTitle>
          </DialogHeader>
          {selectedRole && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{selectedRole.name}</h3>
                  <p className="text-gray-600">{selectedRole.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Users with this role</label>
                  <p className="text-lg font-semibold">{selectedRole.users}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Default Role</label>
                  <div className="mt-1">
                    {selectedRole.isDefault ? (
                      <Badge className="bg-green-100 text-green-800">Default</Badge>
                    ) : (
                      <Badge variant="secondary">Custom</Badge>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Created Date</label>
                  <p className="text-sm">{selectedRole.createdAt}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Total Permissions</label>
                  <p className="text-sm">{selectedRole.permissions.length}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Permissions</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                  {selectedRole.permissions.map((permissionId) => {
                    const permission = availablePermissions.find(p => p.id === permissionId)
                    return (
                      <div key={permissionId} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div>
                          <div className="text-sm font-medium">{permission?.name}</div>
                          <div className="text-xs text-gray-500">{permission?.description}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Actions</label>
                <div className="flex space-x-2 mt-2">
                  <Button variant="outline" size="sm">
                    <Users className="mr-2 h-4 w-4" />
                    View Users
                  </Button>
                  <Button variant="outline" size="sm">
                    <Shield className="mr-2 h-4 w-4" />
                    Manage Permissions
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Role
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Role Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Role</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the role "{selectedRole?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteRole}>
              Delete Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 