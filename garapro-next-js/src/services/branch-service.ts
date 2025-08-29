import { apiClient } from './api-client'

export interface GarageBranch {
  id: string
  name: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  phone: string
  email: string
  managerId: string
  managerName: string
  services: BranchServiceType[]
  staff: BranchStaff[]
  operatingHours: OperatingHours
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface BranchServiceType {
  id: string
  name: string
  description: string
  price: number
  duration: number
  isAvailable: boolean
}

export interface BranchStaff {
  id: string
  name: string
  role: 'technician' | 'receptionist' | 'manager'
  email: string
  phone: string
  isActive: boolean
}

export interface OperatingHours {
  monday: DaySchedule
  tuesday: DaySchedule
  wednesday: DaySchedule
  thursday: DaySchedule
  friday: DaySchedule
  saturday: DaySchedule
  sunday: DaySchedule
}

export interface DaySchedule {
  isOpen: boolean
  openTime: string
  closeTime: string
}

export interface CreateBranchRequest {
  name: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  phone: string
  email: string
  managerId: string
  services: Omit<BranchServiceType, 'id'>[]
  staff: Omit<BranchStaff, 'id'>[]
  operatingHours: OperatingHours
}

export interface UpdateBranchRequest extends Partial<CreateBranchRequest> {
  isActive?: boolean
}

export interface BranchFilters {
  isActive?: boolean
  city?: string
  state?: string
  search?: string
  page?: number
  limit?: number
}

export interface BranchResponse {
  branches: GarageBranch[]
  total: number
  page: number
  limit: number
  totalPages: number
}

class BranchService {
  private baseUrl = '/branches'
  private storageKey = 'mock.branches'

  private readCache(): GarageBranch[] {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem(this.storageKey) : null
      if (raw) return JSON.parse(raw)
    } catch {}
    return this.getFallbackBranches().branches
  }

  private writeCache(branches: GarageBranch[]): void {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(this.storageKey, JSON.stringify(branches))
      }
    } catch {}
  }

  async getBranches(page = 1, limit = 10, filters?: BranchFilters): Promise<BranchResponse> {
    try {
      const params: Record<string, unknown> = {
        page: page.toString(),
        limit: limit.toString(),
      }
      if (filters?.isActive !== undefined) params.isActive = filters.isActive
      if (filters?.city) params.city = filters.city
      if (filters?.state) params.state = filters.state
      if (filters?.search) params.search = filters.search
      const response = await apiClient.get<BranchResponse>(this.baseUrl, params)
      return response.data
    } catch (error) {
      let branches = this.readCache()
      if (filters?.isActive !== undefined) branches = branches.filter(b => b.isActive === filters.isActive)
      if (filters?.city) branches = branches.filter(b => b.city === filters.city)
      if (filters?.state) branches = branches.filter(b => b.state === filters.state)
      if (filters?.search) {
        const q = filters.search.toLowerCase()
        branches = branches.filter(b =>
          b.name.toLowerCase().includes(q) ||
          b.address.toLowerCase().includes(q) ||
          b.managerName.toLowerCase().includes(q)
        )
      }
      const total = branches.length
      const totalPages = Math.max(1, Math.ceil(total / limit))
      const startIndex = (page - 1) * limit
      const pageItems = branches.slice(startIndex, startIndex + limit)
      return { branches: pageItems, total, page, limit, totalPages }
    }
  }

  async getBranchById(id: string): Promise<GarageBranch> {
    try {
      const response = await apiClient.get<GarageBranch>(`${this.baseUrl}/${id}`)
      return response.data
    } catch (error) {
      const list = this.readCache()
      const found = list.find(b => b.id === id)
      if (!found) throw new Error('Branch not found')
      return found
    }
  }

  async createBranch(branch: CreateBranchRequest): Promise<GarageBranch> {
    try {
      const response = await apiClient.post<GarageBranch>(this.baseUrl, branch)
      return response.data
    } catch (error) {
      const branches = this.readCache()
      const nowIso = new Date().toISOString()
      const newBranch: GarageBranch = {
        id: Date.now().toString(),
        isActive: true,
        createdAt: nowIso,
        updatedAt: nowIso,
        managerName: 'Unassigned',
        ...branch,
      }
      branches.unshift(newBranch)
      this.writeCache(branches)
      return newBranch
    }
  }

  async updateBranch(id: string, branch: UpdateBranchRequest): Promise<GarageBranch> {
    try {
      const response = await apiClient.put<GarageBranch>(`${this.baseUrl}/${id}`, branch)
      return response.data
    } catch (error) {
      const branches = this.readCache()
      const index = branches.findIndex(b => b.id === id)
      if (index === -1) throw new Error('Branch not found')
      const updated: GarageBranch = {
        ...branches[index],
        ...branch,
        updatedAt: new Date().toISOString(),
      }
      branches[index] = updated
      this.writeCache(branches)
      return updated
    }
  }

  async deleteBranch(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/${id}`)
    } catch (error) {
      const branches = this.readCache().filter(b => b.id !== id)
      this.writeCache(branches)
    }
  }

  async toggleBranchStatus(id: string, isActive: boolean): Promise<GarageBranch> {
    try {
      const response = await apiClient.patch<GarageBranch>(`${this.baseUrl}/${id}/status`, { isActive })
      return response.data
    } catch (error) {
      return this.updateBranch(id, { isActive })
    }
  }

  async getActiveBranches(): Promise<GarageBranch[]> {
    try {
      const response = await this.getBranches(1, 100, { isActive: true })
      return response.branches
    } catch (error) {
      console.error('Failed to fetch active branches:', error)
      return []
    }
  }

  async getBranchesByLocation(city?: string, state?: string): Promise<GarageBranch[]> {
    try {
      const response = await this.getBranches(1, 100, { city, state })
      return response.branches
    } catch (error) {
      console.error('Failed to fetch branches by location:', error)
      return []
    }
  }

  async getBranchServices(branchId: string): Promise<BranchServiceType[]> {
    try {
      const response = await apiClient.get<BranchServiceType[]>(`${this.baseUrl}/${branchId}/services`)
      return response.data
    } catch (error) {
      console.error(`Failed to fetch services for branch ${branchId}:`, error)
      return []
    }
  }

  async updateBranchServices(
    branchId: string,
    services: Omit<BranchServiceType, 'id'>[]
  ): Promise<void> {
    try {
      await apiClient.put(`${this.baseUrl}/${branchId}/services`, { services })
    } catch (error) {
      const branches = this.readCache()
      const index = branches.findIndex(b => b.id === branchId)
      if (index === -1) throw new Error('Branch not found')
      branches[index].services = services as BranchServiceType[]
      branches[index].updatedAt = new Date().toISOString()
      this.writeCache(branches)
    }
  }

  async getBranchStaff(branchId: string): Promise<BranchStaff[]> {
    try {
      const response = await apiClient.get<BranchStaff[]>(`${this.baseUrl}/${branchId}/staff`)
      return response.data
    } catch (error) {
      const branch = this.readCache().find(b => b.id === branchId)
      return branch?.staff ?? []
    }
  }

  async addStaffMember(
    branchId: string,
    staff: Omit<BranchStaff, 'id' | 'isActive'>
  ): Promise<BranchStaff> {
    try {
      const response = await apiClient.post<BranchStaff>(`${this.baseUrl}/${branchId}/staff`, staff)
      return response.data
    } catch (error) {
      const branches = this.readCache()
      const index = branches.findIndex(b => b.id === branchId)
      if (index === -1) throw new Error('Branch not found')
      const newMember: BranchStaff = { ...staff, id: Date.now().toString(), isActive: true }
      branches[index].staff.push(newMember)
      branches[index].updatedAt = new Date().toISOString()
      this.writeCache(branches)
      return newMember
    }
  }

  async updateStaffMember(
    branchId: string,
    staffId: string,
    updates: Partial<Omit<BranchStaff, 'id'>>
  ): Promise<void> {
    try {
      await apiClient.patch(`${this.baseUrl}/${branchId}/staff/${staffId}`, updates)
    } catch (error) {
      const branches = this.readCache()
      const index = branches.findIndex(b => b.id === branchId)
      if (index === -1) throw new Error('Branch not found')
      branches[index].staff = branches[index].staff.map(s => s.id === staffId ? { ...s, ...updates } as BranchStaff : s)
      branches[index].updatedAt = new Date().toISOString()
      this.writeCache(branches)
    }
  }

  async removeStaffMember(branchId: string, staffId: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/${branchId}/staff/${staffId}`)
    } catch (error) {
      const branches = this.readCache()
      const index = branches.findIndex(b => b.id === branchId)
      if (index === -1) throw new Error('Branch not found')
      branches[index].staff = branches[index].staff.filter(s => s.id !== staffId)
      branches[index].updatedAt = new Date().toISOString()
      this.writeCache(branches)
    }
  }

  async getBranchOperatingHours(branchId: string): Promise<OperatingHours> {
    try {
      const response = await apiClient.get<OperatingHours>(`${this.baseUrl}/${branchId}/operating-hours`)
      return response.data
    } catch (error) {
      const branch = this.readCache().find(b => b.id === branchId)
      return branch?.operatingHours ?? this.getDefaultOperatingHours()
    }
  }

  async updateBranchOperatingHours(
    branchId: string,
    operatingHours: OperatingHours
  ): Promise<void> {
    try {
      await apiClient.put(`${this.baseUrl}/${branchId}/operating-hours`, { operatingHours })
    } catch (error) {
      const branches = this.readCache()
      const index = branches.findIndex(b => b.id === branchId)
      if (index === -1) throw new Error('Branch not found')
      branches[index].operatingHours = operatingHours
      branches[index].updatedAt = new Date().toISOString()
      this.writeCache(branches)
    }
  }

  async getBranchAnalytics(branchId: string): Promise<{
    totalRevenue: number
    totalOrders: number
    averageOrderValue: number
    topServices: Array<{ serviceName: string; revenue: number; orderCount: number }>
    staffPerformance: Array<{ staffId: string; staffName: string; revenue: number; orderCount: number }>
  }> {
    try {
      const response = await apiClient.get<{
        totalRevenue: number
        totalOrders: number
        averageOrderValue: number
        topServices: Array<{ serviceName: string; revenue: number; orderCount: number }>
        staffPerformance: Array<{ staffId: string; staffName: string; revenue: number; orderCount: number }>
      }>(`${this.baseUrl}/${branchId}/analytics`)
      return response.data
    } catch (error) {
      console.error(`Failed to fetch analytics for branch ${branchId}:`, error)
      return this.getFallbackAnalytics()
    }
  }

  // Export branches
  async exportBranches(filters?: BranchFilters, format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
    try {
      const params: Record<string, unknown> = { format }
      if (filters?.isActive !== undefined) params.isActive = filters.isActive
      if (filters?.city) params.city = filters.city
      if (filters?.state) params.state = filters.state
      if (filters?.search) params.search = filters.search
      const response = await apiClient.get<Blob>(`${this.baseUrl}/export`, params)
      return response.data
    } catch (error) {
      console.error('Failed to export branches:', error)
      throw new Error('Failed to export branches. Please try again.')
    }
  }

  // Bulk operations
  async bulkUpdateBranches(branchIds: string[], updates: Partial<UpdateBranchRequest>): Promise<void> {
    try {
      await apiClient.patch(`${this.baseUrl}/bulk-update`, { branchIds, updates })
    } catch (error) {
      console.error('Failed to bulk update branches:', error)
      throw new Error('Failed to bulk update branches. Please try again.')
    }
  }

  async bulkDeleteBranches(branchIds: string[]): Promise<void> {
    try {
      // Use POST or PATCH for bulk delete with body, or if API supports body in DELETE, use fetch directly
      // Here, fallback to POST to /bulk-delete for demo/mock
      await apiClient.post(`${this.baseUrl}/bulk-delete`, { branchIds })
    } catch (error) {
      console.error('Failed to bulk delete branches:', error)
      throw new Error('Failed to bulk delete branches. Please try again.')
    }
  }

  async bulkActivateBranches(branchIds: string[]): Promise<void> {
    try {
      await apiClient.patch(`${this.baseUrl}/bulk-activate`, { branchIds })
    } catch (error) {
      console.error('Failed to bulk activate branches:', error)
      throw new Error('Failed to bulk activate branches. Please try again.')
    }
  }

  async bulkDeactivateBranches(branchIds: string[]): Promise<void> {
    try {
      await apiClient.patch(`${this.baseUrl}/bulk-deactivate`, { branchIds })
    } catch (error) {
      console.error('Failed to bulk deactivate branches:', error)
      throw new Error('Failed to bulk deactivate branches. Please try again.')
    }
  }

  // Search branches
  async searchBranches(query: string, filters?: Omit<BranchFilters, 'search'>): Promise<BranchResponse> {
    try {
      const params: Record<string, unknown> = { search: query }
      if (filters?.isActive !== undefined) params.isActive = filters.isActive
      if (filters?.city) params.city = filters.city
      if (filters?.state) params.state = filters.state
      if (filters?.page) params.page = filters.page
      if (filters?.limit) params.limit = filters.limit
      const response = await apiClient.get<BranchResponse>(`${this.baseUrl}/search`, params)
      return response.data
    } catch (error) {
      console.error('Failed to search branches:', error)
      throw new Error('Failed to search branches. Please try again.')
    }
  }

  // Fallback data methods
  private getFallbackBranches(): BranchResponse {
    return {
      branches: [
        {
          id: '1',
          name: 'Downtown Branch',
          address: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA',
          phone: '+1-555-0101',
          email: 'downtown@garage.com',
          managerId: 'mgr1',
          managerName: 'John Smith',
          services: [
            { id: 's1', name: 'Oil Change', description: 'Full synthetic oil change', price: 45, duration: 30, isAvailable: true },
            { id: 's2', name: 'Brake Service', description: 'Brake pad replacement', price: 120, duration: 90, isAvailable: true }
          ],
          staff: [
            { id: 'st1', name: 'John Smith', role: 'manager', email: 'john@garage.com', phone: '+1-555-0101', isActive: true },
            { id: 'st2', name: 'Mike Johnson', role: 'technician', email: 'mike@garage.com', phone: '+1-555-0102', isActive: true }
          ],
          operatingHours: this.getDefaultOperatingHours(),
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        {
          id: '2',
          name: 'Uptown Branch',
          address: '456 Oak Ave',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90210',
          country: 'USA',
          phone: '+1-555-0202',
          email: 'uptown@garage.com',
          managerId: 'mgr2',
          managerName: 'Sarah Wilson',
          services: [
            { id: 's3', name: 'Tire Service', description: 'Tire rotation and balancing', price: 35, duration: 45, isAvailable: true },
            { id: 's4', name: 'Engine Repair', description: 'Engine diagnostics and repair', price: 200, duration: 120, isAvailable: true }
          ],
          staff: [
            { id: 'st3', name: 'Sarah Wilson', role: 'manager', email: 'sarah@garage.com', phone: '+1-555-0202', isActive: true },
            { id: 'st4', name: 'Tom Davis', role: 'technician', email: 'tom@garage.com', phone: '+1-555-0203', isActive: true }
          ],
          operatingHours: this.getDefaultOperatingHours(),
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }
      ],
      total: 2,
      page: 1,
      limit: 10,
      totalPages: 1
    }
  }

  private getDefaultOperatingHours(): OperatingHours {
    return {
      monday: { isOpen: true, openTime: '08:00', closeTime: '18:00' },
      tuesday: { isOpen: true, openTime: '08:00', closeTime: '18:00' },
      wednesday: { isOpen: true, openTime: '08:00', closeTime: '18:00' },
      thursday: { isOpen: true, openTime: '08:00', closeTime: '18:00' },
      friday: { isOpen: true, openTime: '08:00', closeTime: '18:00' },
      saturday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
      sunday: { isOpen: false, openTime: '00:00', closeTime: '00:00' }
    }
  }

  private getFallbackAnalytics(): {
    totalRevenue: number
    totalOrders: number
    averageOrderValue: number
    topServices: Array<{ serviceName: string; revenue: number; orderCount: number }>
    staffPerformance: Array<{ staffId: string; staffName: string; revenue: number; orderCount: number }>
  } {
    return {
      totalRevenue: 15000,
      totalOrders: 45,
      averageOrderValue: 333.33,
      topServices: [
        { serviceName: 'Oil Change', revenue: 5000, orderCount: 20 },
        { serviceName: 'Brake Service', revenue: 4000, orderCount: 8 }
      ],
      staffPerformance: [
        { staffId: 'st1', staffName: 'John Smith', revenue: 8000, orderCount: 25 },
        { staffId: 'st2', staffName: 'Mike Johnson', revenue: 7000, orderCount: 20 }
      ]
    }
  }
}

export const branchService = new BranchService()
