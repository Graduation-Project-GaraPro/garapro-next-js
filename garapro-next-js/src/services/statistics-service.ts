import { 
  MetricData, 
  ChartData, 
  SystemMetric, 
  RealTimeMetric, 
  LiveActivity, 
  GeographicData,
  PerformanceMetric,
  PerformanceAlert,
  PerformanceReport,
  StatisticsFilters,
  AnalyticsData
} from '@/types/statistics'
import { Users, DollarSign, Server } from 'lucide-react'
import { apiClient } from './api-client'

class StatisticsService {
  private baseUrl = '/statistics'

  // Overview Analytics
  async getOverviewAnalytics(filters?: StatisticsFilters): Promise<AnalyticsData> {
    try {
      const params: Record<string, unknown> = {}
      if (filters?.period) params.period = filters.period
      if (filters?.metric) params.metric = filters.metric
      if (filters?.category) params.category = filters.category
      if (filters?.dateRange) {
        params.startDate = filters.dateRange.start
        params.endDate = filters.dateRange.end
      }

      const response = await apiClient.get<AnalyticsData>(`${this.baseUrl}/overview`, params)
      return response.data
    } catch (error) {
      console.warn('Failed to fetch overview analytics from API, using fallback data:', error)
      return this.getFallbackOverviewAnalytics()
    }
  }

  async getMetrics(filters?: StatisticsFilters): Promise<MetricData[]> {
    try {
      const params: Record<string, unknown> = {}
      if (filters?.period) params.period = filters.period
      if (filters?.metric) params.metric = filters.metric
      if (filters?.category) params.category = filters.category
      if (filters?.dateRange) {
        params.startDate = filters.dateRange.start
        params.endDate = filters.dateRange.end
      }

      const response = await apiClient.get<MetricData[]>(`${this.baseUrl}/metrics`, params)
      return response.data
    } catch (error) {
      console.warn('Failed to fetch metrics from API, using fallback data:', error)
      return this.getFallbackMetrics()
    }
  }

  // Provide fallback metrics when API is not available
  private getFallbackMetrics(): MetricData[] {
    return [
      {
        id: 'total-users',
        title: 'Total Users',
        value: '2,847',
        change: '+12%',
        changeType: 'positive',
        icon: Users,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        trend: [2100, 2200, 2350, 2500, 2650, 2847],
        details: {
          activeUsers: '2,123',
          newThisMonth: '156',
          verifiedUsers: '2,456',
          pendingVerification: '391',
          topLocations: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'],
          growthRate: '12%',
          avgSessionDuration: '24m 32s',
          retentionRate: '78%'
        }
      },
      {
        id: 'total-revenue',
        title: 'Total Revenue',
        value: '$850,000',
        change: '+25%',
        changeType: 'positive',
        icon: DollarSign,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50',
        trend: [680000, 720000, 750000, 780000, 820000, 850000],
        details: {
          thisMonth: '$85,000',
          lastMonth: '$68,000',
          avgOrderValue: '$405',
          totalOrders: '2,100',
          conversionRate: '3.4%',
          recurringRevenue: '$234,000',
          topPayingCustomers: ['AutoFix Pro', 'QuickRepair', 'Elite Motors'],
          paymentMethods: 'Credit Card (78%), PayPal (15%), Bank Transfer (7%)'
        }
      },
      {
        id: 'system-performance',
        title: 'System Performance',
        value: '98.5%',
        change: '+2.1%',
        changeType: 'positive',
        icon: Server,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        trend: [95.2, 96.1, 96.8, 97.3, 98.1, 98.5],
        details: {
          uptime: '99.9%',
          avgResponseTime: '45ms',
          errorRate: '0.15%',
          activeConnections: '1,234',
          serverLoad: '67%',
          memoryUsage: '78%',
          diskUsage: '45%',
          lastMaintenance: '2 days ago'
        }
      }
    ]
  }

  // Provide fallback overview analytics when API is not available
  private getFallbackOverviewAnalytics(): AnalyticsData {
    return {
      overview: {
        totalRevenue: 850000,
        activeUsers: 2123,
        totalOrders: 2100,
        conversionRate: 3.4
      },
      trends: {
        revenue: [680000, 720000, 750000, 780000, 820000, 850000],
        users: [2100, 2200, 2350, 2500, 2650, 2847],
        orders: [1800, 1900, 2000, 2050, 2080, 2100],
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
      },
      topPerformers: [
        { name: 'AutoFix Pro', value: 125000, change: 12, category: 'Garage' },
        { name: 'QuickRepair', value: 98000, change: 8, category: 'Garage' },
        { name: 'Elite Motors', value: 87000, change: 15, category: 'Garage' }
      ],
      geographicData: [
        { country: 'USA', users: 1500, revenue: 500000, growth: 15 },
        { country: 'Canada', users: 300, revenue: 120000, growth: 8 },
        { country: 'UK', users: 200, revenue: 80000, growth: 12 }
      ],
      performanceMetrics: [
        {
          id: 'uptime',
          name: 'System Uptime',
          current: 99.9,
          average: 99.7,
          peak: 100,
          status: 'excellent',
          trend: [99.5, 99.6, 99.7, 99.8, 99.9, 99.9],
          description: 'System availability and reliability'
        }
      ]
    }
  }

  // Real-time Analytics
  async getRealTimeMetrics(): Promise<RealTimeMetric[]> {
    try {
      const response = await apiClient.get<RealTimeMetric[]>(`${this.baseUrl}/realtime/metrics`)
      return response.data
    } catch (error) {
      console.error('Error fetching real-time metrics:', error)
      throw error
    }
  }

  async getLiveActivities(): Promise<LiveActivity[]> {
    try {
      const response = await apiClient.get<LiveActivity[]>(`${this.baseUrl}/realtime/activities`)
      return response.data
    } catch (error) {
      console.error('Error fetching live activities:', error)
      throw error
    }
  }

  async getGeographicData(): Promise<GeographicData[]> {
    try {
      const response = await apiClient.get<GeographicData[]>(`${this.baseUrl}/realtime/geographic`)
      return response.data
    } catch (error) {
      console.error('Error fetching geographic data:', error)
      throw error
    }
  }

  // Performance Analytics
  async getPerformanceMetrics(): Promise<PerformanceMetric[]> {
    try {
      const response = await apiClient.get<PerformanceMetric[]>(`${this.baseUrl}/performance/metrics`)
      return response.data
    } catch (error) {
      console.error('Error fetching performance metrics:', error)
      throw error
    }
  }

  async getPerformanceAlerts(): Promise<PerformanceAlert[]> {
    try {
      const response = await apiClient.get<PerformanceAlert[]>(`${this.baseUrl}/performance/alerts`)
      return response.data
    } catch (error) {
      console.error('Error fetching performance alerts:', error)
      throw error
    }
  }

  async getPerformanceReports(): Promise<PerformanceReport[]> {
    try {
      const response = await apiClient.get<PerformanceReport[]>(`${this.baseUrl}/performance/reports`)
      return response.data
    } catch (error) {
      console.error('Error fetching performance reports:', error)
      throw error
    }
  }

  async getSlowQueries(): Promise<Array<{
    query: string
    avgTime: number
    count: number
    impact: 'low' | 'medium' | 'high'
  }>> {
    try {
      const response = await apiClient.get<Array<{
        query: string
        avgTime: number
        count: number
        impact: 'low' | 'medium' | 'high'
      }>>(`${this.baseUrl}/performance/slow-queries`)
      return response.data
    } catch (error) {
      console.error('Error fetching slow queries:', error)
      throw error
    }
  }

  // System Metrics
  async getSystemMetrics(): Promise<SystemMetric[]> {
    try {
      const response = await apiClient.get<SystemMetric[]>(`${this.baseUrl}/system/metrics`)
      return response.data
    } catch (error) {
      console.error('Error fetching system metrics:', error)
      throw error
    }
  }

  // Charts and Visualizations
  async getChartData(chartType: string, filters?: StatisticsFilters): Promise<ChartData> {
    try {
      const params: Record<string, unknown> = { type: chartType }
      if (filters?.period) params.period = filters.period
      if (filters?.dateRange) {
        params.startDate = filters.dateRange.start
        params.endDate = filters.dateRange.end
      }

      const response = await apiClient.get<ChartData>(`${this.baseUrl}/charts`, params)
      return response.data
    } catch (error) {
      console.error('Error fetching chart data:', error)
      throw error
    }
  }

  // Export and Reports
  async exportStatistics(type: string, filters?: StatisticsFilters): Promise<Blob> {
    try {
      const params: Record<string, unknown> = { type }
      if (filters?.period) params.period = filters.period
      if (filters?.dateRange) {
        params.startDate = filters.dateRange.start
        params.endDate = filters.dateRange.end
      }

      const response = await apiClient.get<Blob>(`${this.baseUrl}/export`, params)
      return response.data
    } catch (error) {
      console.error('Error exporting statistics:', error)
      throw error
    }
  }

  async generateReport(reportType: string, filters?: StatisticsFilters): Promise<{
    reportId: string
    downloadUrl: string
    expiresAt: string
  }> {
    try {
      const params: Record<string, unknown> = { type: reportType }
      if (filters?.period) params.period = filters.period
      if (filters?.dateRange) {
        params.startDate = filters.dateRange.start
        params.endDate = filters.dateRange.end
      }

      const response = await apiClient.post<{
        reportId: string
        downloadUrl: string
        expiresAt: string
      }>(`${this.baseUrl}/reports`, { filters })
      
      return response.data
    } catch (error) {
      console.error('Error generating report:', error)
      throw error
    }
  }

  // Alerts and Notifications
  async getAlerts(): Promise<PerformanceAlert[]> {
    try {
      const response = await apiClient.get<PerformanceAlert[]>(`${this.baseUrl}/alerts`)
      return response.data
    } catch (error) {
      console.error('Error fetching performance alerts:', error)
      throw error
    }
  }

  async resolveAlert(alertId: string): Promise<void> {
    try {
      await apiClient.patch(`${this.baseUrl}/alerts/${alertId}/resolve`)
    } catch (error) {
      console.error('Error resolving alert:', error)
      throw error
    }
  }

  // WebSocket for Real-time Updates
  subscribeToRealTimeUpdates(callback: (data: any) => void): () => void {
    try {
      const wsUrl = `${this.baseUrl.replace('http', 'ws')}/realtime`
      const ws = new WebSocket(wsUrl)
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          callback(data)
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
      }

      ws.onclose = () => {
        console.log('WebSocket connection closed')
      }

      return () => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close()
        }
      }
    } catch (error) {
      console.warn('WebSocket not available, falling back to polling:', error)
      
      // Fallback to polling if WebSocket is not available
      const interval = setInterval(() => {
        this.getRealTimeMetrics()
          .then(metrics => callback({ type: 'metrics_update', metrics }))
          .catch(error => console.warn('Polling fallback failed:', error))
      }, 30000) // Poll every 30 seconds

      return () => clearInterval(interval)
    }
  }

  // Analytics Dashboard
  async getDashboardData(): Promise<{
    overview: AnalyticsData['overview']
    trends: AnalyticsData['trends']
    topPerformers: AnalyticsData['topPerformers']
    recentActivity: LiveActivity[]
  }> {
    try {
      const response = await apiClient.get<{
        overview: AnalyticsData['overview']
        trends: AnalyticsData['trends']
        topPerformers: AnalyticsData['topPerformers']
        recentActivity: LiveActivity[]
      }>(`${this.baseUrl}/dashboard`)
      return response.data
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      throw error
    }
  }

  // Performance Monitoring
  async getPerformanceTrends(metric: string, period: string): Promise<{
    labels: string[]
    data: number[]
    thresholds: {
      warning: number
      critical: number
    }
  }> {
    try {
      const response = await apiClient.get<{
        labels: string[]
        data: number[]
        thresholds: {
          warning: number
          critical: number
        }
      }>(`${this.baseUrl}/performance/trends`, { metric, period })
      return response.data
    } catch (error) {
      console.error('Error fetching performance trends:', error)
      throw error
    }
  }

  // Custom Analytics
  async getCustomAnalytics(query: string, filters?: StatisticsFilters): Promise<any> {
    try {
      const response = await apiClient.post<any>(`${this.baseUrl}/custom`, { query, filters })
      return response.data
    } catch (error) {
      console.error('Error fetching custom analytics:', error)
      throw error
    }
  }
}

export const statisticsService = new StatisticsService() 