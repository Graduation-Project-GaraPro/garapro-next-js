import { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Shield, Users, Edit } from 'lucide-react'
import { Role, Permission } from '@/services/role-service'
import { useRoleValidation } from '@/hooks/admin//roles/useRoles'

interface RoleDialogsProps {
  // Create dialog
  isCreateOpen: boolean
  onCreateClose: () => void
  onCreateSubmit: (roleData: { name: string; description: string; permissions: string[] }) => void
  
  // Edit dialog
  isEditOpen: boolean
  selectedRole: Role | null
  onEditClose: () => void
  onEditSubmit: (roleData: { name: string; description: string; permissions: string[] }) => void
  
  // View dialog
  isViewOpen: boolean
  selectedRoleForView: Role | null
  onViewClose: () => void
  
  // Delete dialog
  isDeleteOpen: boolean
  selectedRoleForDelete: Role | null
  onDeleteClose: () => void
  onDeleteConfirm: () => void
  
  // Duplicate dialog
  isDuplicateOpen: boolean
  selectedRoleForDuplicate: Role | null
  onDuplicateClose: () => void
  onDuplicateSubmit: (newName: string) => void
  
  // Data
  permissions: Permission[]
  loading: boolean
}

export const RoleDialogs = ({
  isCreateOpen,
  onCreateClose,
  onCreateSubmit,
  isEditOpen,
  selectedRole,
  onEditClose,
  onEditSubmit,
  isViewOpen,
  selectedRoleForView,
  onViewClose,
  isDeleteOpen,
  selectedRoleForDelete,
  onDeleteClose,
  onDeleteConfirm,
  isDuplicateOpen,
  selectedRoleForDuplicate,
  onDuplicateClose,
  onDuplicateSubmit,
  permissions,
  loading
}: RoleDialogsProps) => {
  // Create form state
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  })
  const [shouldValidateCreate, setShouldValidateCreate] = useState(false)

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  })
  const [shouldValidateEdit, setShouldValidateEdit] = useState(false)

  // Duplicate form state
  const [duplicateName, setDuplicateName] = useState('')

  // Validation
  const createErrors = useRoleValidation(createForm, shouldValidateCreate)
  const editErrors = useRoleValidation(editForm, shouldValidateEdit)

  // Update edit form when selected role changes
  useEffect(() => {
    if (selectedRole && isEditOpen) {
      setEditForm({
        name: selectedRole.name,
        description: selectedRole.description,
        permissions: [...selectedRole.permissions]
      })
    }
  }, [selectedRole, isEditOpen])

  // Reset forms when dialogs close
  useEffect(() => {
    if (!isCreateOpen) {
      setCreateForm({ name: '', description: '', permissions: [] })
      setShouldValidateCreate(false)
    }
  }, [isCreateOpen])

  useEffect(() => {
    if (!isEditOpen) {
      setEditForm({ name: '', description: '', permissions: [] })
      setShouldValidateEdit(false)
    }
  }, [isEditOpen])

  useEffect(() => {
    if (!isDuplicateOpen) {
      setDuplicateName('')
    }
  }, [isDuplicateOpen])

  const handleCreateSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    setShouldValidateCreate(true)
    
    if (Object.keys(createErrors).length === 0) {
      onCreateSubmit(createForm)
    }
  }, [createForm, createErrors, onCreateSubmit])

  const handleEditSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    setShouldValidateEdit(true)
    
    if (Object.keys(editErrors).length === 0) {
      onEditSubmit(editForm)
    }
  }, [editForm, editErrors, onEditSubmit])

  const handleDuplicateSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (duplicateName.trim()) {
      onDuplicateSubmit(duplicateName.trim())
    }
  }, [duplicateName, onDuplicateSubmit])

  const togglePermission = useCallback((permissionId: string, currentPermissions: string[]) => {
    if (currentPermissions.includes(permissionId)) {
      return currentPermissions.filter(p => p !== permissionId)
    } else {
      return [...currentPermissions, permissionId]
    }
  }, [])

  const handleCreatePermissionToggle = useCallback((permissionId: string) => {
    setShouldValidateCreate(true)
    setCreateForm(prev => ({
      ...prev,
      permissions: togglePermission(permissionId, prev.permissions)
    }))
  }, [togglePermission])

  const handleEditPermissionToggle = useCallback((permissionId: string) => {
    setShouldValidateEdit(true)
    setEditForm(prev => ({
      ...prev,
      permissions: togglePermission(permissionId, prev.permissions)
    }))
  }, [togglePermission])

  // Group permissions by category
  const groupedPermissions = permissions.reduce((acc, permission) => {
    const category = permission.category || 'Other'
    if (!acc[category]) acc[category] = []
    acc[category].push(permission)
    return acc
  }, {} as Record<string, Permission[]>)

  return (
    <>
      {/* Create Role Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={onCreateClose}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Role</DialogTitle>
            <DialogDescription>
              Create a new user role with specific permissions
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="create-role-name">Role Name *</Label>
                <Input
                  id="create-role-name"
                  value={createForm.name}
                  onChange={(e) => {
                    setCreateForm(prev => ({ ...prev, name: e.target.value }))
                    if (!shouldValidateCreate) setShouldValidateCreate(true)
                  }}
                  placeholder="Enter role name"
                  className={createErrors.name ? 'border-red-500' : ''}
                />
                {createErrors.name && <p className="text-sm text-red-500 mt-1">{createErrors.name}</p>}
              </div>
              
              <div>
                <Label htmlFor="create-role-description">Description *</Label>
                <Input
                  id="create-role-description"
                  value={createForm.description}
                  onChange={(e) => {
                    setCreateForm(prev => ({ ...prev, description: e.target.value }))
                    if (!shouldValidateCreate) setShouldValidateCreate(true)
                  }}
                  placeholder="Enter role description"
                  className={createErrors.description ? 'border-red-500' : ''}
                />
                {createErrors.description && <p className="text-sm text-red-500 mt-1">{createErrors.description}</p>}
              </div>

              <div>
                <Label>Permissions *</Label>
                {createErrors.permissions && <p className="text-sm text-red-500 mt-1">{createErrors.permissions}</p>}
                <div className="mt-2 space-y-4">
                  {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
                    <div key={category}>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">{category}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {categoryPermissions.map((permission) => (
                          <div key={permission.id} className="flex items-center space-x-2">
                            <Switch
                              id={`create-${permission.id}`}
                              checked={createForm.permissions.includes(permission.id)}
                              onCheckedChange={() => handleCreatePermissionToggle(permission.id)}
                            />
                            <Label htmlFor={`create-${permission.id}`} className="text-sm cursor-pointer">
                              <div>{permission.name}</div>
                              <div className="text-xs text-gray-500">{permission.description}</div>
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={onCreateClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Role'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={isEditOpen} onOpenChange={onEditClose}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Role: {selectedRole?.name}</DialogTitle>
            <DialogDescription>
              Update role details and permissions
            </DialogDescription>
          </DialogHeader>
          {selectedRole && (
            <form onSubmit={handleEditSubmit}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-role-name">Role Name *</Label>
                  <Input
                    id="edit-role-name"
                    value={editForm.name}
                    onChange={(e) => {
                      setEditForm(prev => ({ ...prev, name: e.target.value }))
                      if (!shouldValidateEdit) setShouldValidateEdit(true)
                    }}
                    className={editErrors.name ? 'border-red-500' : ''}
                    disabled={selectedRole.isDefault}
                  />
                  {editErrors.name && <p className="text-sm text-red-500 mt-1">{editErrors.name}</p>}
                </div>
                
                <div>
                  <Label htmlFor="edit-role-description">Description *</Label>
                  <Input
                    id="edit-role-description"
                    value={editForm.description}
                    onChange={(e) => {
                      setEditForm(prev => ({ ...prev, description: e.target.value }))
                      if (!shouldValidateEdit) setShouldValidateEdit(true)
                    }}
                    className={editErrors.description ? 'border-red-500' : ''}
                  />
                  {editErrors.description && <p className="text-sm text-red-500 mt-1">{editErrors.description}</p>}
                </div>

                <div>
                  <Label>Permissions *</Label>
                  {editErrors.permissions && <p className="text-sm text-red-500 mt-1">{editErrors.permissions}</p>}
                  <div className="mt-2 space-y-4">
                    {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
                      <div key={category}>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">{category}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {categoryPermissions.map((permission) => (
                            <div key={permission.id} className="flex items-center space-x-2">
                              <Switch
                                id={`edit-${permission.id}`}
                                checked={editForm.permissions.includes(permission.id)}
                                onCheckedChange={() => handleEditPermissionToggle(permission.id)}
                              />
                              <Label htmlFor={`edit-${permission.id}`} className="text-sm cursor-pointer">
                                <div>{permission.name}</div>
                                <div className="text-xs text-gray-500">{permission.description}</div>
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={onEditClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Updating...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* View Role Details Dialog */}
      <Dialog open={isViewOpen} onOpenChange={onViewClose}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Role Details: {selectedRoleForView?.name}</DialogTitle>
          </DialogHeader>
          {selectedRoleForView && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{selectedRoleForView.name}</h3>
                  <p className="text-gray-600">{selectedRoleForView.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Users with this role</label>
                  <p className="text-lg font-semibold">{selectedRoleForView.users.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Role Type</label>
                  <div className="mt-1">
                    {selectedRoleForView.isDefault ? (
                      <Badge className="bg-green-100 text-green-800">Default</Badge>
                    ) : (
                      <Badge variant="outline">Custom</Badge>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Created Date</label>
                  <p className="text-sm">{new Date(selectedRoleForView.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Total Permissions</label>
                  <p className="text-sm">{selectedRoleForView.permissions.length}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Permissions</label>
                <div className="mt-2 space-y-3">
                  {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => {
                    const rolePermissionsInCategory = categoryPermissions.filter(p => 
                      selectedRoleForView.permissions.includes(p.id)
                    )
                    
                    if (rolePermissionsInCategory.length === 0) return null
                    
                    return (
                      <div key={category}>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">{category}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {rolePermissionsInCategory.map((permission) => (
                            <div key={permission.id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <div>
                                <div className="text-sm font-medium">{permission.name}</div>
                                <div className="text-xs text-gray-500">{permission.description}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Quick Actions</label>
                <div className="flex space-x-2 mt-2">
                  <Button variant="outline" size="sm">
                    <Users className="mr-2 h-4 w-4" />
                    View Users ({selectedRoleForView.users})
                  </Button>
                  {!selectedRoleForView.isDefault && (
                    <Button variant="outline" size="sm">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Role
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Role Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={onDeleteClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Role</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the role "{selectedRoleForDelete?.name}"? 
              {selectedRoleForDelete?.users ? (
                <>
                  <br />
                  <span className="text-red-600 font-medium">
                    This role is assigned to {selectedRoleForDelete.users} user(s). 
                  </span>
                  They will lose access to associated permissions.
                </>
              ) : null}
              <br />
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={onDeleteClose}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={onDeleteConfirm} disabled={loading}>
              {loading ? 'Deleting...' : 'Delete Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Duplicate Role Dialog */}
      <Dialog open={isDuplicateOpen} onOpenChange={onDuplicateClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duplicate Role</DialogTitle>
            <DialogDescription>
              Create a copy of "{selectedRoleForDuplicate?.name}" with a new name.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleDuplicateSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="duplicate-name">New Role Name *</Label>
                <Input
                  id="duplicate-name"
                  value={duplicateName}
                  onChange={(e) => setDuplicateName(e.target.value)}
                  placeholder={`Copy of ${selectedRoleForDuplicate?.name}`}
                  required
                />
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={onDuplicateClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !duplicateName.trim()}>
                {loading ? 'Duplicating...' : 'Create Copy'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}