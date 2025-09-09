'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Plus } from 'lucide-react'
import { toast } from 'sonner'

// Import components and hooks
import { RoleTable } from '@/components/admin/roles/RoleTables'
import { RoleDialogs } from '@/components/admin/roles/RoleDialogs'
import { useRoles, usePermissions, useRoleOperations, useDebounce } from '@/hooks/admin/roles/useRoles'
import { Role } from '@/services/role-service'

export function UserRolesManagement() {
  // Search state
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  // Dialog states
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [selectedRoleForView, setSelectedRoleForView] = useState<Role | null>(null)
  const [selectedRoleForDelete, setSelectedRoleForDelete] = useState<Role | null>(null)
  const [selectedRoleForDuplicate, setSelectedRoleForDuplicate] = useState<Role | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isViewDetailsDialogOpen, setIsViewDetailsDialogOpen] = useState(false)
  const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false)

  // Data hooks
  const { roles, loading, refetch } = useRoles({ 
    search: debouncedSearchTerm,
    limit: 50 
  })
  const { permissions, loading: permissionsLoading } = usePermissions()
  const { loading: operationLoading, createRole, updateRole, deleteRole, duplicateRole } = useRoleOperations()

  // Handlers
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }, [])

  const handleCreateRole = useCallback(() => {
    setIsCreateDialogOpen(true)
  }, [])

  const handleEditRole = useCallback((role: Role) => {
    setSelectedRole(role)
    setIsEditDialogOpen(true)
  }, [])

  const handleDeleteRole = useCallback((role: Role) => {
    setSelectedRoleForDelete(role)
    setIsDeleteDialogOpen(true)
  }, [])

  const handleViewDetails = useCallback((role: Role) => {
    setSelectedRoleForView(role)
    setIsViewDetailsDialogOpen(true)
  }, [])

  const handleDuplicateRole = useCallback((role: Role) => {
    setSelectedRoleForDuplicate(role)
    setIsDuplicateDialogOpen(true)
  }, [])

  // Dialog actions
  const handleCreateSubmit = useCallback(async (roleData: {
    name: string
    description: string
    permissions: string[]
  }) => {
    try {
      await createRole(roleData)
      toast.success('Role created successfully')
      setIsCreateDialogOpen(false)
      refetch()
    } catch (error) {
      // Error is handled by the useRoleOperations hook
    }
  }, [createRole, refetch])

  const handleEditSubmit = useCallback(async (roleData: {
    name: string
    description: string
    permissions: string[]
  }) => {
    if (!selectedRole) return
    
    try {
      await updateRole(selectedRole.id, roleData)
      toast.success('Role updated successfully')
      setIsEditDialogOpen(false)
      setSelectedRole(null)
      refetch()
    } catch (error) {
      // Error is handled by the useRoleOperations hook
    }
  }, [selectedRole, updateRole, refetch])

  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedRoleForDelete) return
    
    try {
      await deleteRole(selectedRoleForDelete.id)
      toast.success('Role deleted successfully')
      setIsDeleteDialogOpen(false)
      setSelectedRoleForDelete(null)
      refetch()
    } catch (error) {
      // Error is handled by the useRoleOperations hook
    }
  }, [selectedRoleForDelete, deleteRole, refetch])

  const handleDuplicateSubmit = useCallback(async (newName: string) => {
    if (!selectedRoleForDuplicate) return
    
    try {
      await duplicateRole(selectedRoleForDuplicate.id, newName)
      toast.success('Role duplicated successfully')
      setIsDuplicateDialogOpen(false)
      setSelectedRoleForDuplicate(null)
      refetch()
    } catch (error) {
      // Error is handled by the useRoleOperations hook
    }
  }, [selectedRoleForDuplicate, duplicateRole, refetch])

  // Close handlers
  const handleCreateClose = useCallback(() => {
    setIsCreateDialogOpen(false)
  }, [])

  const handleEditClose = useCallback(() => {
    setIsEditDialogOpen(false)
    setSelectedRole(null)
  }, [])

  const handleDeleteClose = useCallback(() => {
    setIsDeleteDialogOpen(false)
    setSelectedRoleForDelete(null)
  }, [])

  const handleViewClose = useCallback(() => {
    setIsViewDetailsDialogOpen(false)
    setSelectedRoleForView(null)
  }, [])

  const handleDuplicateClose = useCallback(() => {
    setIsDuplicateDialogOpen(false)
    setSelectedRoleForDuplicate(null)
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Roles Management</h1>
          <p className="text-muted-foreground">
            Manage user roles and permissions across the system
          </p>
        </div>
        <Button onClick={handleCreateRole}>
          <Plus className="mr-2 h-4 w-4" />
          Create Role
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Roles</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search roles..."
                className="pl-8"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <RoleTable
            roles={roles}
            loading={loading}
            onEdit={handleEditRole}
            onView={handleViewDetails}
            onDelete={handleDeleteRole}
            onDuplicate={handleDuplicateRole}
          />
        </CardContent>
      </Card>

      <RoleDialogs
        // Create dialog
        isCreateOpen={isCreateDialogOpen}
        onCreateClose={handleCreateClose}
        onCreateSubmit={handleCreateSubmit}
        
        // Edit dialog
        isEditOpen={isEditDialogOpen}
        selectedRole={selectedRole}
        onEditClose={handleEditClose}
        onEditSubmit={handleEditSubmit}
        
        // View dialog
        isViewOpen={isViewDetailsDialogOpen}
        selectedRoleForView={selectedRoleForView}
        onViewClose={handleViewClose}
        
        // Delete dialog
        isDeleteOpen={isDeleteDialogOpen}
        selectedRoleForDelete={selectedRoleForDelete}
        onDeleteClose={handleDeleteClose}
        onDeleteConfirm={handleDeleteConfirm}
        
        // Duplicate dialog
        isDuplicateOpen={isDuplicateDialogOpen}
        selectedRoleForDuplicate={selectedRoleForDuplicate}
        onDuplicateClose={handleDuplicateClose}
        onDuplicateSubmit={handleDuplicateSubmit}
        
        // Data
        permissions={permissions}
        loading={operationLoading || permissionsLoading}
      />
    </div>
  )
}