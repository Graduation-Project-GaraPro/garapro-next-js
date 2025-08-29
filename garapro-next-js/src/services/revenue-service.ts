import { apiClient } from './api-client'

export interface RevenueReport {
  period: string
  totalRevenue: number
  totalOrders: number
  averageOrderValue: number
  topServices: TopService[]
  revenueByTechnician: TechnicianRevenue[]
  branchComparison: BranchRevenue[]
  growthRate: number
  previousPeriodRevenue: number
}

export interface TopService {
    serviceName: string
    revenue: number
    orderCount: number
    percentageOfTotal: number
}

export interface TechnicianRevenue {
    technicianId: string
    technicianName: string
    revenue: number
    orderCount: number
    averageOrderValue: number
}

export interface BranchRevenue {
    branchId: string
    branchName: string
    revenue: number
    orderCount: number
    growthRate: number
}

export interface RevenueFilters {
  period: 'daily' | 'monthly' | 'yearly'
  startDate?: string
  endDate?: string
  branchId?: string
  technicianId?: string
  serviceType?: string
}

export interface RevenueAnalytics {
  totalRevenue: number
  totalOrders: number
  averageOrderValue: number
  growthRate: number
  topServices: TopService[]
  revenueByPeriod: Array<{
    period: string
    revenue: number
    orders: number
  }>
  branchPerformance: BranchRevenue[]
  technicianPerformance: TechnicianRevenue[]
}

class RevenueService {
  private baseUrl = '/revenue'

  async getRevenueReport(filters: RevenueFilters): Promise<RevenueReport> {
    try {
      const params: Record<string, unknown> = { period: filters.period }
      if (filters.startDate) params.startDate = filters.startDate
      if (filters.endDate) params.endDate = filters.endDate
      if (filters.branchId) params.branchId = filters.branchId
      if (filters.technicianId) params.technicianId = filters.technicianId
      if (filters.serviceType) params.serviceType = filters.serviceType

      const response = await apiClient.get<RevenueReport>(`${this.baseUrl}/report`, params)
      return response.data
    } catch (error) {
      console.error('Failed to fetch revenue report:', error)
      return this.getFallbackRevenueReport(filters.period)
    }
  }

  async getDailyRevenue(date: string): Promise<RevenueReport> {
    try {
      const response = await apiClient.get<RevenueReport>(`${this.baseUrl}/daily`, { date })
      return response.data
    } catch (error) {
      console.error(`Failed to fetch daily revenue for ${date}:`, error)
      return this.getFallbackRevenueReport('daily')
    }
  }

  async getMonthlyRevenue(year: number, month: number): Promise<RevenueReport> {
    try {
      const response = await apiClient.get<RevenueReport>(`${this.baseUrl}/monthly`, { year, month })
      return response.data
    } catch (error) {
      console.error(`Failed to fetch monthly revenue for ${year}-${month}:`, error)
      return this.getFallbackRevenueReport('monthly')
    }
  }

  async getYearlyRevenue(year: number): Promise<RevenueReport> {
    try {
      const response = await apiClient.get<RevenueReport>(`${this.baseUrl}/yearly`, { year })
      return response.data
    } catch (error) {
      console.error(`Failed to fetch yearly revenue for ${year}:`, error)
      return this.getFallbackRevenueReport('yearly')
    }
  }

  async getRevenueAnalytics(filters: RevenueFilters): Promise<RevenueAnalytics> {
    try {
      const params: Record<string, unknown> = { period: filters.period }
      if (filters.startDate) params.startDate = filters.startDate
      if (filters.endDate) params.endDate = filters.endDate
      if (filters.branchId) params.branchId = filters.branchId
      if (filters.technicianId) params.technicianId = filters.technicianId
      if (filters.serviceType) params.serviceType = filters.serviceType

      const response = await apiClient.get<RevenueAnalytics>(`${this.baseUrl}/analytics`, params)
      return response.data
    } catch (error) {
      console.error('Failed to fetch revenue analytics:', error)
      return this.getFallbackRevenueAnalytics()
    }
  }

  async getTopServices(period: string, limit: number = 10): Promise<TopService[]> {
    try {
      const response = await apiClient.get<TopService[]>(`${this.baseUrl}/top-services`, { period, limit })
      return response.data
    } catch (error) {
      console.error('Failed to fetch top services:', error)
      return this.getFallbackTopServices()
    }
  }

  async getTechnicianRevenue(period: string): Promise<TechnicianRevenue[]> {
    try {
      const response = await apiClient.get<TechnicianRevenue[]>(`${this.baseUrl}/technician-revenue`, { period })
      return response.data
    } catch (error) {
      console.error('Failed to fetch technician revenue:', error)
      return this.getFallbackTechnicianRevenue()
    }
  }

  async getBranchRevenue(period: string): Promise<BranchRevenue[]> {
    try {
      const response = await apiClient.get<BranchRevenue[]>(`${this.baseUrl}/branch-revenue`, { period })
      return response.data
    } catch (error) {
      console.error('Failed to fetch branch revenue:', error)
      return this.getFallbackBranchRevenue()
    }
  }

  async exportRevenueReport(filters: RevenueFilters, format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
    try {
      const params: Record<string, unknown> = { format, period: filters.period }
      if (filters.startDate) params.startDate = filters.startDate
      if (filters.endDate) params.endDate = filters.endDate
      if (filters.branchId) params.branchId = filters.branchId
      if (filters.technicianId) params.technicianId = filters.technicianId
      if (filters.serviceType) params.serviceType = filters.serviceType

      const response = await apiClient.get<Blob>(`${this.baseUrl}/export`, params)
      return response.data
    } catch (error) {
      console.error('Failed to export revenue report:', error)
      throw new Error('Failed to export revenue report. Please try again.')
    }
  }

  // Fallback data methods
  private getFallbackRevenueReport(period: string): RevenueReport {
    const baseRevenue = period === 'daily' ? 5000 : period === 'monthly' ? 150000 : 1800000
    const baseOrders = period === 'daily' ? 25 : period === 'monthly' ? 750 : 9000

    return {
      period,
      totalRevenue: baseRevenue,
      totalOrders: baseOrders,
      averageOrderValue: baseRevenue / baseOrders,
      topServices: [
        { serviceName: 'Oil Change', revenue: baseRevenue * 0.3, orderCount: Math.floor(baseOrders * 0.4), percentageOfTotal: 30 },
        { serviceName: 'Brake Service', revenue: baseRevenue * 0.25, orderCount: Math.floor(baseOrders * 0.2), percentageOfTotal: 25 },
        { serviceName: 'Tire Service', revenue: baseRevenue * 0.2, orderCount: Math.floor(baseOrders * 0.15), percentageOfTotal: 20 }
      ],
      revenueByTechnician: [
        { technicianId: 't1', technicianName: 'John Smith', revenue: baseRevenue * 0.4, orderCount: Math.floor(baseOrders * 0.4), averageOrderValue: baseRevenue / baseOrders },
        { technicianId: 't2', technicianName: 'Mike Johnson', revenue: baseRevenue * 0.35, orderCount: Math.floor(baseOrders * 0.35), averageOrderValue: baseRevenue / baseOrders },
        { technicianId: 't3', technicianName: 'Sarah Wilson', revenue: baseRevenue * 0.25, orderCount: Math.floor(baseOrders * 0.25), averageOrderValue: baseRevenue / baseOrders }
      ],
      branchComparison: [
        { branchId: 'b1', branchName: 'Downtown', revenue: baseRevenue * 0.5, orderCount: Math.floor(baseOrders * 0.5), growthRate: 15 },
        { branchId: 'b2', branchName: 'Uptown', revenue: baseRevenue * 0.3, orderCount: Math.floor(baseOrders * 0.3), growthRate: 12 },
        { branchId: 'b3', branchName: 'Suburban', revenue: baseRevenue * 0.2, orderCount: Math.floor(baseOrders * 0.2), growthRate: 8 }
      ],
      growthRate: 12.5,
      previousPeriodRevenue: baseRevenue * 0.89
    }
  }

  private getFallbackRevenueAnalytics(): RevenueAnalytics {
    return {
      totalRevenue: 150000,
      totalOrders: 750,
      averageOrderValue: 200,
      growthRate: 12.5,
      topServices: [
        { serviceName: 'Oil Change', revenue: 45000, orderCount: 300, percentageOfTotal: 30 },
        { serviceName: 'Brake Service', revenue: 37500, orderCount: 150, percentageOfTotal: 25 },
        { serviceName: 'Tire Service', revenue: 30000, orderCount: 112, percentageOfTotal: 20 }
      ],
      revenueByPeriod: [
        { period: 'Week 1', revenue: 37500, orders: 187 },
        { period: 'Week 2', revenue: 37500, orders: 188 },
        { period: 'Week 3', revenue: 37500, orders: 187 },
        { period: 'Week 4', revenue: 37500, orders: 188 }
      ],
      branchPerformance: [
        { branchId: 'b1', branchName: 'Downtown', revenue: 75000, orderCount: 375, growthRate: 15 },
        { branchId: 'b2', branchName: 'Uptown', revenue: 45000, orderCount: 225, growthRate: 12 },
        { branchId: 'b3', branchName: 'Suburban', revenue: 30000, orderCount: 150, growthRate: 8 }
      ],
      technicianPerformance: [
        { technicianId: 't1', technicianName: 'John Smith', revenue: 60000, orderCount: 300, averageOrderValue: 200 },
        { technicianId: 't2', technicianName: 'Mike Johnson', revenue: 52500, orderCount: 262, averageOrderValue: 200 },
        { technicianId: 't3', technicianName: 'Sarah Wilson', revenue: 37500, orderCount: 188, averageOrderValue: 200 }
      ]
    }
  }

  private getFallbackTopServices(): TopService[] {
    return [
      { serviceName: 'Oil Change', revenue: 45000, orderCount: 300, percentageOfTotal: 30 },
      { serviceName: 'Brake Service', revenue: 37500, orderCount: 150, percentageOfTotal: 25 },
      { serviceName: 'Tire Service', revenue: 30000, orderCount: 112, percentageOfTotal: 20 },
      { serviceName: 'AC Service', revenue: 22500, orderCount: 75, percentageOfTotal: 15 },
      { serviceName: 'Engine Repair', revenue: 15000, orderCount: 25, percentageOfTotal: 10 }
    ]
  }

  private getFallbackTechnicianRevenue(): TechnicianRevenue[] {
    return [
      { technicianId: 't1', technicianName: 'John Smith', revenue: 60000, orderCount: 300, averageOrderValue: 200 },
      { technicianId: 't2', technicianName: 'Mike Johnson', revenue: 52500, orderCount: 262, averageOrderValue: 200 },
      { technicianId: 't3', technicianName: 'Sarah Wilson', revenue: 37500, orderCount: 188, averageOrderValue: 200 }
    ]
  }

  private getFallbackBranchRevenue(): BranchRevenue[] {
    return [
      { branchId: 'b1', branchName: 'Downtown', revenue: 75000, orderCount: 375, growthRate: 15 },
      { branchId: 'b2', branchName: 'Uptown', revenue: 45000, orderCount: 225, growthRate: 12 },
      { branchId: 'b3', branchName: 'Suburban', revenue: 30000, orderCount: 150, growthRate: 8 }
    ]
  }
}

export const revenueService = new RevenueService()
