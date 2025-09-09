import { useState, useEffect, useMemo } from 'react'
import { roleService, Role, Permission, RoleFilters, RoleStatistics } from '@/services/role-service'

// Debounce hook
export const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Role data loading hook
export const useRoles = (filters?: RoleFilters) => {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1
  })

  const loadRoles = async (newFilters?: RoleFilters) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await roleService.getRoles(newFilters || filters)
      setRoles(response.roles)
      setPagination({
        total: response.total,
        page: response.page,
        limit: response.limit,
        totalPages: response.totalPages
      })
    } catch (err) {
      console.error('Failed to load roles:', err)
      setError(err instanceof Error ? err.message : 'Failed to load roles')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRoles()
  }, [])

  return {
    roles,
    loading,
    error,
    pagination,
    loadRoles,
    refetch: () => loadRoles(filters)
  }
}

// Permissions loading hook
export const usePermissions = () => {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadPermissions = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const data = await roleService.getPermissions()
        
        if (isMounted) {
          setPermissions(data)
        }
      } catch (err) {
        console.error('Failed to load permissions:', err)
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load permissions')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadPermissions()

    return () => {
      isMounted = false
    }
  }, [])

  return { permissions, loading, error }
}

// Role statistics hook
export const useRoleStatistics = () => {
  const [statistics, setStatistics] = useState<RoleStatistics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadStatistics = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const data = await roleService.getRoleStatistics()
        
        if (isMounted) {
          setStatistics(data)
        }
      } catch (err) {
        console.error('Failed to load role statistics:', err)
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load statistics')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadStatistics()

    return () => {
      isMounted = false
    }
  }, [])

  return { statistics, loading, error }
}

// Role form validation hook
export const useRoleValidation = (role: { name: string; description: string; permissions: string[] }, validateOnMount: boolean = false) => {
  return useMemo(() => {
    if (!validateOnMount) return {}
    
    const errors: Record<string, string> = {}

    if (!role.name.trim()) {
      errors.name = 'Role name is required'
    } else if (role.name.trim().length < 3) {
      errors.name = 'Role name must be at least 3 characters'
    }

    if (!role.description.trim()) {
      errors.description = 'Description is required'
    } else if (role.description.trim().length < 10) {
      errors.description = 'Description must be at least 10 characters'
    }

    if (role.permissions.length === 0) {
      errors.permissions = 'At least one permission is required'
    }

    return errors
  }, [role, validateOnMount])
}

// Role management operations hook
export const useRoleOperations = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createRole = async (roleData: { name: string; description: string; permissions: string[]; isDefault?: boolean }) => {
    try {
      setLoading(true)
      setError(null)
      
      const newRole = await roleService.createRole(roleData)
      return newRole
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create role'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const updateRole = async (id: number, roleData: { name?: string; description?: string; permissions?: string[] }) => {
    try {
      setLoading(true)
      setError(null)
      
      const updatedRole = await roleService.updateRole(id, roleData)
      return updatedRole
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update role'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const deleteRole = async (id: number) => {
    try {
      setLoading(true)
      setError(null)
      
      await roleService.deleteRole(id)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete role'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const duplicateRole = async (id: number, newName: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const duplicatedRole = await roleService.duplicateRole(id, newName)
      return duplicatedRole
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to duplicate role'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    createRole,
    updateRole,
    deleteRole,
    duplicateRole
  }
}