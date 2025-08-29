import { apiClient } from './api-client'

export interface User {
  id: number
  name: string
  email: string
  phone: string
  role: 'user' | 'admin' | 'manager'
  status: 'active' | 'inactive' | 'banned' | 'pending'
  joinedDate: string
  lastLogin: string
  avatar: string
  location: string
  verified: boolean
  totalOrders: number
  totalSpent: number
  details: {
    address: string
    dateOfBirth: string
    emergencyContact: string
    preferences: {
      notifications: boolean
      marketing: boolean
      twoFactor: boolean
    }
    devices: string[]
    lastIpAddress: string
    userAgent: string
    accountHistory: Array<{
      action: string
      date: string
      ip: string
    }>
    orders: Array<{
      id: string
      amount: number
      status: string
      date: string
    }>
  }
}

export interface UserFilters {
  search?: string
  role?: string
  status?: string
  dateRange?: {
    start: string
    end: string
  }
  verified?: boolean
  page?: number
  limit?: number
}

export interface UserCreateData {
  name: string
  email: string
  phone: string
  role: 'user' | 'admin' | 'manager'
  password: string
  location: string
}

export interface UserUpdateData {
  name?: string
  phone?: string
  role?: 'user' | 'admin' | 'manager'
  location?: string
  preferences?: {
    notifications?: boolean
    marketing?: boolean
    twoFactor?: boolean
  }
}

export interface UserResponse {
  users: User[]
  total: number
  page: number
  limit: number
  totalPages: number
}

class UserService {
  private baseUrl = '/users'
  private storageKey = 'mock.users'

  private readCache(): User[] {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem(this.storageKey) : null
      if (raw) return JSON.parse(raw)
    } catch {}
    return this.getFallbackUsers().users
  }

  private writeCache(users: User[]): void {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(this.storageKey, JSON.stringify(users))
      }
    } catch {}
  }

  // Get all users with filters and pagination
  async getUsers(filters?: UserFilters): Promise<UserResponse> {
    try {
      const params: Record<string, unknown> = {}
      if (filters?.search) params.search = filters.search
      if (filters?.role) params.role = filters.role
      if (filters?.status) params.status = filters.status
      if (filters?.verified !== undefined) params.verified = filters.verified
      if (filters?.dateRange) {
        params.startDate = filters.dateRange.start
        params.endDate = filters.dateRange.end
      }
      if (filters?.page) params.page = filters.page
      if (filters?.limit) params.limit = filters.limit

      console.log(params)
      const response = await apiClient.get<UserResponse>(this.baseUrl, params)
      return response.data
    } catch (error) {
      let users = this.readCache()
      if (filters?.search) {
        const q = filters.search.toLowerCase()
        users = users.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
      }
      if (filters?.role) users = users.filter(u => u.role === filters.role)
      if (filters?.status) users = users.filter(u => u.status === filters.status)
      if (filters?.verified) users = users.filter(u => u.verified === filters.verified)

      const page = filters?.page ?? 1
      const limit = filters?.limit ?? 10
      const total = users.length
      const totalPages = Math.max(1, Math.ceil(total / limit))
      const startIndex = (page - 1) * limit
      const pageItems = users.slice(startIndex, startIndex + limit)
      return { users: pageItems, total, page, limit, totalPages }
    }
  }

  // Get user by ID
  async getUserById(id: number): Promise<User> {
    try {
      const response = await apiClient.get<User>(`${this.baseUrl}/${id}`)
      return response.data
    } catch (error) {
      const found = this.readCache().find(u => u.id === id)
      if (!found) throw new Error('User not found')
      return found
    }
  }

  // Create new user
  async createUser(userData: UserCreateData): Promise<User> {
    try {
      const response = await apiClient.post<User>(this.baseUrl, userData)
      return response.data
    } catch (error) {
      const users = this.readCache()
      const now = new Date().toISOString()
      const newUser: User = {
        id: Math.max(0, ...users.map(u => u.id)) + 1,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        role: userData.role,
        status: 'active',
        joinedDate: now,
        lastLogin: now,
        avatar: '',
        location: userData.location,
        verified: true,
        totalOrders: 0,
        totalSpent: 0,
        details: {
          address: '',
          dateOfBirth: '',
          emergencyContact: '',
          preferences: { notifications: true, marketing: false, twoFactor: false },
          devices: [],
          lastIpAddress: '127.0.0.1',
          userAgent: 'Mock',
          accountHistory: [],
          orders: []
        }
      }
      users.unshift(newUser)
      this.writeCache(users)
      return newUser
    }
  }

  // Update user
  async updateUser(id: number, userData: UserUpdateData): Promise<User> {
    try {
      const response = await apiClient.put<User>(`${this.baseUrl}/${id}`, userData)
      return response.data
    } catch (error) {
      const users = this.readCache()
      const index = users.findIndex(u => u.id === id)
      if (index === -1) throw new Error('User not found')
      users[index] = { ...users[index], ...userData }
      this.writeCache(users)
      return users[index]
    }
  }

  // Delete user
  async deleteUser(id: number): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/${id}`)
    } catch (error) {
      const users = this.readCache().filter(u => u.id !== id)
      this.writeCache(users)
    }
  }

  // Ban user
  async banUser(id: number, reason: string): Promise<void> {
    try {
      await apiClient.patch(`${this.baseUrl}/${id}/ban`, { reason })
    } catch (error) {
      console.error(`Failed to ban user ${id}:`, error)
      throw new Error('Failed to ban user. Please try again.')
    }
  }

  // Unban user
  async unbanUser(id: number): Promise<void> {
    try {
      await apiClient.patch(`${this.baseUrl}/${id}/unban`)
    } catch (error) {
      console.error(`Failed to unban user ${id}:`, error)
      throw new Error('Failed to unban user. Please try again.')
    }
  }

  // Change user role
  async changeUserRole(id: number, role: 'user' | 'admin' | 'manager'): Promise<void> {
    try {
      await apiClient.patch(`${this.baseUrl}/${id}/role`, { role })
    } catch (error) {
      console.error(`Failed to change role for user ${id}:`, error)
      throw new Error('Failed to change user role. Please try again.')
    }
  }

  // Verify user
  async verifyUser(id: number): Promise<void> {
    try {
      await apiClient.patch(`${this.baseUrl}/${id}/verify`)
    } catch (error) {
      console.error(`Failed to verify user ${id}:`, error)
      throw new Error('Failed to verify user. Please try again.')
    }
  }

  // Get user statistics
  async getUserStatistics(): Promise<{
    totalUsers: number
    activeUsers: number
    newUsersThisMonth: number
    bannedUsers: number
    pendingVerification: number
    userGrowth: number[]
    roleDistribution: Record<string, number>
  }> {
    try {
      const response = await apiClient.get<{
        totalUsers: number
        activeUsers: number
        newUsersThisMonth: number
        bannedUsers: number
        pendingVerification: number
        userGrowth: number[]
        roleDistribution: Record<string, number>
      }>(`${this.baseUrl}/statistics`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch user statistics:', error)
      const users = this.readCache()
      const totalUsers = users.length
      const activeUsers = users.filter(u => u.status === 'active').length
      const newUsersThisMonth = Math.min(25, totalUsers)
      const bannedUsers = users.filter(u => u.status === 'banned').length
      const pendingVerification = users.filter(u => u.status === 'pending').length
      const roleDistribution: Record<string, number> = users.reduce((acc, u) => {
        acc[u.role] = (acc[u.role] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      return { totalUsers, activeUsers, newUsersThisMonth, bannedUsers, pendingVerification, userGrowth: [10,12,14,16,18,20], roleDistribution }
    }
  }

  // Export users
  async exportUsers(filters?: UserFilters, format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
    try {
      const params: Record<string, unknown> = { format }
      if (filters?.search) params.search = filters.search
      if (filters?.role) params.role = filters.role
      if (filters?.status) params.status = filters.status
      if (filters?.dateRange) {
        params.startDate = filters.dateRange.start
        params.endDate = filters.dateRange.end
      }

      const response = await apiClient.get<Blob>(`${this.baseUrl}/export`, params)
      return response.data
    } catch (error) {
      console.error('Failed to export users:', error)
      const users = (await this.getUsers(filters)).users
      const header = 'id,name,email,phone,role,status\n'
      const rows = users.map(u => `${u.id},${u.name},${u.email},${u.phone},${u.role},${u.status}`).join('\n')
      const csv = header + rows
      return new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    }
  }

  // Bulk operations
  async bulkUpdateUsers(userIds: number[], updates: Partial<UserUpdateData>): Promise<void> {
    try {
      await apiClient.patch(`${this.baseUrl}/bulk-update`, { userIds, updates })
    } catch (error) {
      console.error('Failed to bulk update users:', error)
      throw new Error('Failed to bulk update users. Please try again.')
    }
  }

  async bulkDeleteUsers(userIds: number[]): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/bulk-delete`, { body: { userIds } })
    } catch (error) {
      console.error('Failed to bulk delete users:', error)
      throw new Error('Failed to bulk delete users. Please try again.')
    }
  }

  // Search users
  async searchUsers(query: string, filters?: Omit<UserFilters, 'search'>): Promise<UserResponse> {
    try {
      const params: Record<string, unknown> = { search: query }
      if (filters?.role) params.role = filters.role
      if (filters?.status) params.status = filters.status
      if (filters?.dateRange) {
        params.startDate = filters.dateRange.start
        params.endDate = filters.dateRange.end
      }
      if (filters?.page) params.page = filters.page
      if (filters?.limit) params.limit = filters.limit

      const response = await apiClient.get<UserResponse>(`${this.baseUrl}/search`, params)
      return response.data
    } catch (error) {
      console.error('Failed to search users:', error)
      return this.getUsers({ ...filters, search: query })
    }
  }

  // Get user activity
  async getUserActivity(userId: number, period: string = '30d'): Promise<Array<{
    action: string
    timestamp: string
    ip: string
    userAgent: string
    details: any
  }>> {
    try {
      const response = await apiClient.get<Array<{
        action: string
        timestamp: string
        ip: string
        userAgent: string
        details: any
      }>>(`${this.baseUrl}/${userId}/activity`)
      return response.data
    } catch (error) {
      console.error(`Failed to fetch activity for user ${userId}:`, error)
      throw new Error('Failed to fetch user activity. Please try again.')
    }
  }

  // Send notification to user
  async sendNotification(userId: number, message: string, type: 'info' | 'warning' | 'error' = 'info'): Promise<void> {
    try {
      await apiClient.post(`${this.baseUrl}/${userId}/notifications`, { message, type })
    } catch (error) {
      console.error(`Failed to send notification to user ${userId}:`, error)
      throw new Error('Failed to send notification. Please try again.')
    }
  }

  // Helpers for roles
  async getManagers(): Promise<User[]> {
    const res = await this.getUsers({ role: 'manager', limit: 100 })
    return res.users
  }

  async getDrivers(): Promise<User[]> {
    // Treat 'user' role as drivers in this mock
    const res = await this.getUsers({ role: 'user', limit: 200 })
    return res.users
  }

  private getFallbackUsers(): UserResponse {
    const users: User[] = [
      { id: 1, name: 'John Smith', email: 'john@garage.com', phone: '+1-555-0101', role: 'manager', status: 'active', joinedDate: '2024-01-01', lastLogin: '2024-03-10', avatar: '', location: 'New York', verified: true, totalOrders: 12, totalSpent: 1500, details: { address: '123 Main St', dateOfBirth: '1990-01-01', emergencyContact: 'Jane Smith', preferences: { notifications: true, marketing: false, twoFactor: false }, devices: [], lastIpAddress: '127.0.0.1', userAgent: 'Mock', accountHistory: [], orders: [] } },
      { id: 2, name: 'Sarah Wilson', email: 'sarah@garage.com', phone: '+1-555-0202', role: 'manager', status: 'active', joinedDate: '2024-01-05', lastLogin: '2024-03-11', avatar: '', location: 'Los Angeles', verified: true, totalOrders: 8, totalSpent: 980, details: { address: '456 Oak Ave', dateOfBirth: '1992-02-02', emergencyContact: 'Tom Davis', preferences: { notifications: true, marketing: true, twoFactor: true }, devices: [], lastIpAddress: '127.0.0.1', userAgent: 'Mock', accountHistory: [], orders: [] } },
      { id: 3, name: 'Tom Davis', email: 'tom@garage.com', phone: '+1-555-0303', role: 'user', status: 'active', joinedDate: '2024-01-10', lastLogin: '2024-03-09', avatar: '', location: 'New York', verified: true, totalOrders: 4, totalSpent: 350, details: { address: '789 Pine Rd', dateOfBirth: '1995-03-03', emergencyContact: 'Sarah Wilson', preferences: { notifications: true, marketing: false, twoFactor: false }, devices: [], lastIpAddress: '127.0.0.1', userAgent: 'Mock', accountHistory: [], orders: [] } },
      { id: 4, name: 'Mike Johnson', email: 'mike@garage.com', phone: '+1-555-0404', role: 'user', status: 'active', joinedDate: '2024-02-01', lastLogin: '2024-03-08', avatar: '', location: 'Los Angeles', verified: true, totalOrders: 6, totalSpent: 520, details: { address: '321 Cedar St', dateOfBirth: '1993-04-04', emergencyContact: 'John Smith', preferences: { notifications: true, marketing: false, twoFactor: false }, devices: [], lastIpAddress: '127.0.0.1', userAgent: 'Mock', accountHistory: [], orders: [] } },
    ]
    return { users, total: users.length, page: 1, limit: users.length, totalPages: 1 }
  }
}

export const userService = new UserService()
