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

class StatisticsService {
  private baseUrl = '/api/statistics'

  // Overview Analytics
  async getOverviewAnalytics(filters?: StatisticsFilters): Promise<AnalyticsData> {
    try {
      const params = new URLSearchParams()
      if (filters?.period) params.append('period', filters.period)
      if (filters?.metric) params.append('metric', filters.metric)
      if (filters?.category) params.append('category', filters.category)
      if (filters?.dateRange) {
        params.append('startDate', filters.dateRange.start)
        params.append('endDate', filters.dateRange.end)
      }

      const response = await fetch(`${this.baseUrl}/overview?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch overview analytics')
      
      return await response.json()
    } catch (error) {
      console.error('Error fetching overview analytics:', error)
      throw error
    }
  }

  async getMetrics(filters?: StatisticsFilters): Promise<MetricData[]> {
    try {
      const params = new URLSearchParams()
      if (filters?.period) params.append('period', filters.period)
      if (filters?.metric) params.append('metric', filters.metric)
      if (filters?.category) params.append('category', filters.category)
      if (filters?.dateRange) {
        params.append('startDate', filters.dateRange.start)
        params.append('endDate', filters.dateRange.end)
      }

      const response = await fetch(`${this.baseUrl}/metrics?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch metrics')
      
      return await response.json()
    } catch (error) {
      console.error('Error fetching metrics:', error)
      throw error
    }
  }

  // Real-time Analytics
  async getRealTimeMetrics(): Promise<RealTimeMetric[]> {
    try {
      const response = await fetch(`${this.baseUrl}/realtime/metrics`)
      if (!response.ok) throw new Error('Failed to fetch real-time metrics')
      
      return await response.json()
    } catch (error) {
      console.error('Error fetching real-time metrics:', error)
      throw error
    }
  }

  async getLiveActivities(): Promise<LiveActivity[]> {
    try {
      const response = await fetch(`${this.baseUrl}/realtime/activities`)
      if (!response.ok) throw new Error('Failed to fetch live activities')
      
      return await response.json()
    } catch (error) {
      console.error('Error fetching live activities:', error)
      throw error
    }
  }

  async getGeographicData(): Promise<GeographicData[]> {
    try {
      const response = await fetch(`${this.baseUrl}/realtime/geographic`)
      if (!response.ok) throw new Error('Failed to fetch geographic data')
      
      return await response.json()
    } catch (error) {
      console.error('Error fetching geographic data:', error)
      throw error
    }
  }

  // Performance Analytics
  async getPerformanceMetrics(): Promise<PerformanceMetric[]> {
    try {
      const response = await fetch(`${this.baseUrl}/performance/metrics`)
      if (!response.ok) throw new Error('Failed to fetch performance metrics')
      
      return await response.json()
    } catch (error) {
      console.error('Error fetching performance metrics:', error)
      throw error
    }
  }

  async getPerformanceAlerts(): Promise<PerformanceAlert[]> {
    try {
      const response = await fetch(`${this.baseUrl}/performance/alerts`)
      if (!response.ok) throw new Error('Failed to fetch performance alerts')
      
      return await response.json()
    } catch (error) {
      console.error('Error fetching performance alerts:', error)
      throw error
    }
  }

  async getPerformanceReports(): Promise<PerformanceReport[]> {
    try {
      const response = await fetch(`${this.baseUrl}/performance/reports`)
      if (!response.ok) throw new Error('Failed to fetch performance reports')
      
      return await response.json()
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
      const response = await fetch(`${this.baseUrl}/performance/slow-queries`)
      if (!response.ok) throw new Error('Failed to fetch slow queries')
      
      return await response.json()
    } catch (error) {
      console.error('Error fetching slow queries:', error)
      throw error
    }
  }

  // System Metrics
  async getSystemMetrics(): Promise<SystemMetric[]> {
    try {
      const response = await fetch(`${this.baseUrl}/system/metrics`)
      if (!response.ok) throw new Error('Failed to fetch system metrics')
      
      return await response.json()
    } catch (error) {
      console.error('Error fetching system metrics:', error)
      throw error
    }
  }

  // Charts and Visualizations
  async getChartData(chartType: string, filters?: StatisticsFilters): Promise<ChartData> {
    try {
      const params = new URLSearchParams()
      params.append('type', chartType)
      if (filters?.period) params.append('period', filters.period)
      if (filters?.dateRange) {
        params.append('startDate', filters.dateRange.start)
        params.append('endDate', filters.dateRange.end)
      }

      const response = await fetch(`${this.baseUrl}/charts?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch chart data')
      
      return await response.json()
    } catch (error) {
      console.error('Error fetching chart data:', error)
      throw error
    }
  }

  // Export and Reports
  async exportStatistics(type: string, filters?: StatisticsFilters): Promise<Blob> {
    try {
      const params = new URLSearchParams()
      params.append('type', type)
      if (filters?.period) params.append('period', filters.period)
      if (filters?.dateRange) {
        params.append('startDate', filters.dateRange.start)
        params.append('endDate', filters.dateRange.end)
      }

      const response = await fetch(`${this.baseUrl}/export?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to export statistics')
      
      return await response.blob()
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
      const params = new URLSearchParams()
      params.append('type', reportType)
      if (filters?.period) params.append('period', filters.period)
      if (filters?.dateRange) {
        params.append('startDate', filters.dateRange.start)
        params.append('endDate', filters.dateRange.end)
      }

      const response = await fetch(`${this.baseUrl}/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filters }),
      })
      
      if (!response.ok) throw new Error('Failed to generate report')
      
      return await response.json()
    } catch (error) {
      console.error('Error generating report:', error)
      throw error
    }
  }

  // Alerts and Notifications
  async getPerformanceAlerts(): Promise<PerformanceAlert[]> {
    try {
      const response = await fetch(`${this.baseUrl}/alerts`)
      if (!response.ok) throw new Error('Failed to fetch performance alerts')
      
      return await response.json()
    } catch (error) {
      console.error('Error fetching performance alerts:', error)
      throw error
    }
  }

  async resolveAlert(alertId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/alerts/${alertId}/resolve`, {
        method: 'PATCH',
      })
      
      if (!response.ok) throw new Error('Failed to resolve alert')
    } catch (error) {
      console.error('Error resolving alert:', error)
      throw error
    }
  }

  // WebSocket for Real-time Updates
  subscribeToRealTimeUpdates(callback: (data: any) => void): () => void {
    const ws = new WebSocket(`${this.baseUrl.replace('http', 'ws')}/realtime`)
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      callback(data)
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    return () => {
      ws.close()
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
      const response = await fetch(`${this.baseUrl}/dashboard`)
      if (!response.ok) throw new Error('Failed to fetch dashboard data')
      
      return await response.json()
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
      const response = await fetch(`${this.baseUrl}/performance/trends?metric=${metric}&period=${period}`)
      if (!response.ok) throw new Error('Failed to fetch performance trends')
      
      return await response.json()
    } catch (error) {
      console.error('Error fetching performance trends:', error)
      throw error
    }
  }

  // Custom Analytics
  async getCustomAnalytics(query: string, filters?: StatisticsFilters): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/custom`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, filters }),
      })
      
      if (!response.ok) throw new Error('Failed to fetch custom analytics')
      
      return await response.json()
    } catch (error) {
      console.error('Error fetching custom analytics:', error)
      throw error
    }
  }
}

export const statisticsService = new StatisticsService() 