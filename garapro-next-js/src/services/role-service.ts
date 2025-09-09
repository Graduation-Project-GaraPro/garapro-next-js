import { apiClient } from './api-client'

export interface Role {
  id: number
  name: string
  description: string
  users: number
  permissions: string[]
  isDefault: boolean
  createdAt: string
  updatedAt?: string
}

export interface Permission {
  id: string
  name: string
  description: string
  category?: string
}

export interface RoleFilters {
  search?: string
  isDefault?: boolean
  permissions?: string[]
  page?: number
  limit?: number
}

export interface RoleCreateData {
  name: string
  description: string
  permissions: string[]
  isDefault?: boolean
}

export interface RoleUpdateData {
  name?: string
  description?: string
  permissions?: string[]
  isDefault?: boolean
}

export interface RoleResponse {
  roles: Role[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface RoleStatistics {
  totalRoles: number
  customRoles: number
  defaultRoles: number
  mostUsedRole: string
  averagePermissionsPerRole: number
  roleDistribution: Array<{
    roleName: string
    userCount: number
    percentage: number
  }>
}

class RoleService {
  private baseUrl = '/roles'
  private memoryCache: Role[] | null = null
  private permissionsCache: Permission[] | null = null

  private readCache(): Role[] {
    if (this.memoryCache === null) {
      this.memoryCache = this.getFallbackRoles().roles
    }
    return [...this.memoryCache]
  }

  private writeCache(roles: Role[]): void {
    this.memoryCache = [...roles]
  }

  private initializeCache(): void {
    if (this.memoryCache === null) {
      this.memoryCache = this.getFallbackRoles().roles
    }
  }

  // Get all roles with filters and pagination
  async getRoles(filters?: RoleFilters): Promise<RoleResponse> {
    try {
      const params: Record<string, unknown> = {}
      if (filters?.search) params.search = filters.search
      if (filters?.isDefault !== undefined) params.isDefault = filters.isDefault
      if (filters?.permissions) params.permissions = filters.permissions.join(',')
      if (filters?.page) params.page = filters.page
      if (filters?.limit) params.limit = filters.limit

      const response = await apiClient.get<RoleResponse>(this.baseUrl, params)
      return response.data
    } catch (error) {
      console.log('API failed, using mock data')
      this.initializeCache()
      let roles = this.readCache()

      // Apply filters
      if (filters?.search) {
        const q = filters.search.toLowerCase()
        roles = roles.filter(r => 
          r.name.toLowerCase().includes(q) || 
          r.description.toLowerCase().includes(q)
        )
      }
      
      if (filters?.isDefault !== undefined) {
        roles = roles.filter(r => r.isDefault === filters.isDefault)
      }
      
      if (filters?.permissions && filters.permissions.length > 0) {
        roles = roles.filter(r => 
          filters.permissions!.every(p => r.permissions.includes(p))
        )
      }

      // Apply pagination
      const page = filters?.page ?? 1
      const limit = filters?.limit ?? 10
      const total = roles.length
      const totalPages = Math.max(1, Math.ceil(total / limit))
      const startIndex = (page - 1) * limit
      const pageItems = roles.slice(startIndex, startIndex + limit)
      
      return { roles: pageItems, total, page, limit, totalPages }
    }
  }

  // Get role by ID
  async getRoleById(id: number): Promise<Role> {
    try {
      const response = await apiClient.get<Role>(`${this.baseUrl}/${id}`)
      return response.data
    } catch (error) {
      this.initializeCache()
      const found = this.readCache().find(r => r.id === id)
      if (!found) throw new Error(`Role with ID ${id} not found`)
      return found
    }
  }

  // Create new role
  async createRole(roleData: RoleCreateData): Promise<Role> {
    try {
      const response = await apiClient.post<Role>(this.baseUrl, roleData)
      return response.data
    } catch (error) {
      this.initializeCache()
      const roles = this.readCache()
      const now = new Date().toISOString()
      
      // Check for duplicate name
      if (roles.some(r => r.name.toLowerCase() === roleData.name.toLowerCase())) {
        throw new Error('Role name already exists')
      }

      const newRole: Role = {
        id: Math.max(0, ...roles.map(r => r.id)) + 1,
        name: roleData.name,
        description: roleData.description,
        permissions: roleData.permissions,
        isDefault: roleData.isDefault || false,
        users: 0,
        createdAt: now,
        updatedAt: now
      }
      
      roles.unshift(newRole)
      this.writeCache(roles)
      return newRole
    }
  }

  // Update role
  async updateRole(id: number, roleData: RoleUpdateData): Promise<Role> {
    try {
      const response = await apiClient.put<Role>(`${this.baseUrl}/${id}`, roleData)
      return response.data
    } catch (error) {
      this.initializeCache()
      const roles = this.readCache()
      const index = roles.findIndex(r => r.id === id)
      if (index === -1) throw new Error(`Role with ID ${id} not found`)
      
      // Check for duplicate name if name is being updated
      if (roleData.name && roleData.name !== roles[index].name) {
        if (roles.some(r => r.id !== id && r.name.toLowerCase() === roleData.name!.toLowerCase())) {
          throw new Error('Role name already exists')
        }
      }
      
      const updatedRole = { 
        ...roles[index], 
        ...roleData,
        updatedAt: new Date().toISOString()
      }
      
      roles[index] = updatedRole
      this.writeCache(roles)
      return updatedRole
    }
  }

  // Delete role
  async deleteRole(id: number): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/${id}`)
    } catch (error) {
      this.initializeCache()
      const roles = this.readCache()
      const role = roles.find(r => r.id === id)
      
      if (!role) throw new Error(`Role with ID ${id} not found`)
      if (role.isDefault) throw new Error('Cannot delete default role')
      if (role.users > 0) throw new Error('Cannot delete role with assigned users')
      
      const filteredRoles = roles.filter(r => r.id !== id)
      this.writeCache(filteredRoles)
    }
  }

  // Duplicate role
  async duplicateRole(id: number, newName: string): Promise<Role> {
    try {
      const response = await apiClient.post<Role>(`${this.baseUrl}/${id}/duplicate`, { name: newName })
      return response.data
    } catch (error) {
      this.initializeCache()
      const roles = this.readCache()
      const originalRole = roles.find(r => r.id === id)
      
      if (!originalRole) throw new Error(`Role with ID ${id} not found`)
      if (roles.some(r => r.name.toLowerCase() === newName.toLowerCase())) {
        throw new Error('Role name already exists')
      }

      const duplicatedRole: Role = {
        id: Math.max(0, ...roles.map(r => r.id)) + 1,
        name: newName,
        description: `Copy of ${originalRole.description}`,
        permissions: [...originalRole.permissions],
        isDefault: false,
        users: 0,
        createdAt: new Date().toISOString()
      }
      
      roles.unshift(duplicatedRole)
      this.writeCache(roles)
      return duplicatedRole
    }
  }

  // Get all available permissions
  async getPermissions(): Promise<Permission[]> {
    try {
      const response = await apiClient.get<Permission[]>(`${this.baseUrl}/permissions`)
      this.permissionsCache = response.data
      return response.data
    } catch (error) {
      if (this.permissionsCache) return this.permissionsCache
      
      const permissions = this.getFallbackPermissions()
      this.permissionsCache = permissions
      return permissions
    }
  }

  // Get role statistics
  async getRoleStatistics(): Promise<RoleStatistics> {
    try {
      const response = await apiClient.get<RoleStatistics>(`${this.baseUrl}/statistics`)
      return response.data
    } catch (error) {
      this.initializeCache()
      const roles = this.readCache()
      
      const totalRoles = roles.length
      const customRoles = roles.filter(r => !r.isDefault).length
      const defaultRoles = roles.filter(r => r.isDefault).length
      const mostUsedRole = roles.reduce((prev, current) => 
        (prev.users > current.users) ? prev : current
      ).name
      
      const totalPermissions = roles.reduce((sum, role) => sum + role.permissions.length, 0)
      const averagePermissionsPerRole = totalRoles > 0 ? Math.round(totalPermissions / totalRoles) : 0
      
      const roleDistribution = roles.map(role => ({
        roleName: role.name,
        userCount: role.users,
        percentage: totalRoles > 0 ? Math.round((role.users / roles.reduce((sum, r) => sum + r.users, 0)) * 100) : 0
      }))
      
      return {
        totalRoles,
        customRoles,
        defaultRoles,
        mostUsedRole,
        averagePermissionsPerRole,
        roleDistribution
      }
    }
  }

  // Assign role to users
  async assignRoleToUsers(roleId: number, userIds: number[]): Promise<void> {
    try {
      await apiClient.post(`${this.baseUrl}/${roleId}/assign`, { userIds })
    } catch (error) {
      console.error(`Failed to assign role ${roleId} to users:`, error)
      
      // Update user count locally
      this.initializeCache()
      const roles = this.readCache()
      const roleIndex = roles.findIndex(r => r.id === roleId)
      if (roleIndex !== -1) {
        roles[roleIndex].users += userIds.length
        this.writeCache(roles)
      }
    }
  }

  // Remove role from users
  async removeRoleFromUsers(roleId: number, userIds: number[]): Promise<void> {
    try {
      await apiClient.post(`${this.baseUrl}/${roleId}/remove`, { userIds })
    } catch (error) {
      console.error(`Failed to remove role ${roleId} from users:`, error)
      
      // Update user count locally
      this.initializeCache()
      const roles = this.readCache()
      const roleIndex = roles.findIndex(r => r.id === roleId)
      if (roleIndex !== -1) {
        roles[roleIndex].users = Math.max(0, roles[roleIndex].users - userIds.length)
        this.writeCache(roles)
      }
    }
  }

  // Get users with specific role
  async getUsersByRole(roleId: number): Promise<Array<{
    id: number
    name: string
    email: string
    assignedAt: string
  }>> {
    try {
      const response = await apiClient.get<Array<{
        id: number
        name: string
        email: string
        assignedAt: string
      }>>(`${this.baseUrl}/${roleId}/users`)
      return response.data
    } catch (error) {
      console.error(`Failed to fetch users for role ${roleId}:`, error)
      
      // Return mock data
      return [
        { id: 1, name: 'John Doe', email: 'john@example.com', assignedAt: '2024-01-01T00:00:00Z' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', assignedAt: '2024-01-02T00:00:00Z' }
      ]
    }
  }

  // Export roles
  async exportRoles(filters?: RoleFilters, format: 'csv' | 'excel' | 'json' = 'csv'): Promise<Blob> {
    try {
      const params: Record<string, unknown> = { format }
      if (filters?.search) params.search = filters.search
      if (filters?.isDefault !== undefined) params.isDefault = filters.isDefault

      const response = await apiClient.get<Blob>(`${this.baseUrl}/export`, params)
      return response.data
    } catch (error) {
      console.error('Failed to export roles:', error)
      
      const roles = (await this.getRoles(filters)).roles
      
      if (format === 'json') {
        return new Blob([JSON.stringify(roles, null, 2)], { type: 'application/json' })
      }
      
      const header = 'id,name,description,users,permissions,isDefault,createdAt\n'
      const rows = roles.map(r => 
        `${r.id},"${r.name}","${r.description}",${r.users},"${r.permissions.join(';')}",${r.isDefault},${r.createdAt}`
      ).join('\n')
      const csv = header + rows
      
      const mimeType = format === 'excel' ? 'application/vnd.ms-excel' : 'text/csv;charset=utf-8;'
      return new Blob([csv], { type: mimeType })
    }
  }

  // Clear cache
  clearCache(): void {
    this.memoryCache = null
    this.permissionsCache = null
  }

  // Private methods for fallback data
  private getFallbackRoles(): RoleResponse {
    const roles: Role[] = [
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
        createdAt: '2024-01-01T00:00:00Z'
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
        createdAt: '2024-01-15T00:00:00Z'
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
        createdAt: '2024-02-01T00:00:00Z'
      },
      {
        id: 4,
        name: 'User',
        description: 'Standard user access',
        users: 2847,
        permissions: ['basic_access'],
        isDefault: true,
        createdAt: '2024-01-01T00:00:00Z'
      }
    ]
    
    return { roles, total: roles.length, page: 1, limit: roles.length, totalPages: 1 }
  }

  private getFallbackPermissions(): Permission[] {
    return [
      { id: 'user_management', name: 'User Management', description: 'Manage user accounts', category: 'Users' },
      { id: 'garage_management', name: 'Garage Management', description: 'Manage garage accounts', category: 'Garages' },
      { id: 'system_settings', name: 'System Settings', description: 'Configure system settings', category: 'System' },
      { id: 'security_policies', name: 'Security Policies', description: 'Manage security policies', category: 'Security' },
      { id: 'statistics_view', name: 'View Statistics', description: 'Access system statistics', category: 'Analytics' },
      { id: 'logs_view', name: 'View Logs', description: 'Access system logs', category: 'Analytics' },
      { id: 'role_management', name: 'Role Management', description: 'Manage user roles', category: 'Users' },
      { id: 'content_moderation', name: 'Content Moderation', description: 'Moderate content', category: 'Moderation' },
      { id: 'support_tickets', name: 'Support Tickets', description: 'Handle support tickets', category: 'Support' },
      { id: 'basic_access', name: 'Basic Access', description: 'Basic user access', category: 'Basic' }
    ]
  }
}

export const roleService = new RoleService()