import { 
  LogEntry, 
  LogStats, 
  LogFilter, 
  LogConfig, 
  LogRetention, 
  LogAnalytics,
  LogExportOptions,
  LogImportOptions
} from '@/types/logs'

class LogService {
  private baseUrl = '/api/logs'

  // Log Retrieval
  async getLogs(filters?: LogFilter): Promise<LogEntry[]> {
    try {
      const params = new URLSearchParams()
      if (filters?.level) params.append('level', filters.level)
      if (filters?.source) params.append('source', filters.source)
      if (filters?.user) params.append('user', filters.user)
      if (filters?.search) params.append('search', filters.search)
      if (filters?.environment) params.append('environment', filters.environment)
      if (filters?.service) params.append('service', filters.service)
      if (filters?.dateRange) {
        params.append('startDate', filters.dateRange.start)
        params.append('endDate', filters.dateRange.end)
      }

      const response = await fetch(`${this.baseUrl}?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch logs')
      
      return await response.json()
    } catch (error) {
      console.error('Error fetching logs:', error)
      throw error
    }
  }

  async getLogStats(): Promise<LogStats> {
    try {
      const response = await fetch(`${this.baseUrl}/stats`)
      if (!response.ok) throw new Error('Failed to fetch log stats')
      
      return await response.json()
    } catch (error) {
      console.error('Error fetching log stats:', error)
      throw error
    }
  }

  async getLogById(id: string): Promise<LogEntry> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`)
      if (!response.ok) throw new Error('Failed to fetch log')
      
      return await response.json()
    } catch (error) {
      console.error('Error fetching log:', error)
      throw error
    }
  }

  // Log Analytics
  async getLogAnalytics(period: string = '24h'): Promise<LogAnalytics> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics?period=${period}`)
      if (!response.ok) throw new Error('Failed to fetch log analytics')
      
      return await response.json()
    } catch (error) {
      console.error('Error fetching log analytics:', error)
      throw error
    }
  }

  // Log Configuration Management
  async getLogConfigs(): Promise<LogConfig[]> {
    try {
      const response = await fetch(`${this.baseUrl}/configs`)
      if (!response.ok) throw new Error('Failed to fetch log configs')
      
      return await response.json()
    } catch (error) {
      console.error('Error fetching log configs:', error)
      throw error
    }
  }

  async createLogConfig(config: Omit<LogConfig, 'id' | 'lastModified'>): Promise<LogConfig> {
    try {
      const response = await fetch(`${this.baseUrl}/configs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      })
      
      if (!response.ok) throw new Error('Failed to create log config')
      
      return await response.json()
    } catch (error) {
      console.error('Error creating log config:', error)
      throw error
    }
  }

  async updateLogConfig(id: string, config: Partial<LogConfig>): Promise<LogConfig> {
    try {
      const response = await fetch(`${this.baseUrl}/configs/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      })
      
      if (!response.ok) throw new Error('Failed to update log config')
      
      return await response.json()
    } catch (error) {
      console.error('Error updating log config:', error)
      throw error
    }
  }

  async deleteLogConfig(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/configs/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) throw new Error('Failed to delete log config')
    } catch (error) {
      console.error('Error deleting log config:', error)
      throw error
    }
  }

  // Retention Policies
  async getRetentionPolicies(): Promise<LogRetention[]> {
    try {
      const response = await fetch(`${this.baseUrl}/retention`)
      if (!response.ok) throw new Error('Failed to fetch retention policies')
      
      return await response.json()
    } catch (error) {
      console.error('Error fetching retention policies:', error)
      throw error
    }
  }

  async createRetentionPolicy(policy: Omit<LogRetention, 'id'>): Promise<LogRetention> {
    try {
      const response = await fetch(`${this.baseUrl}/retention`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(policy),
      })
      
      if (!response.ok) throw new Error('Failed to create retention policy')
      
      return await response.json()
    } catch (error) {
      console.error('Error creating retention policy:', error)
      throw error
    }
  }

  async updateRetentionPolicy(id: string, policy: Partial<LogRetention>): Promise<LogRetention> {
    try {
      const response = await fetch(`${this.baseUrl}/retention/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(policy),
      })
      
      if (!response.ok) throw new Error('Failed to update retention policy')
      
      return await response.json()
    } catch (error) {
      console.error('Error updating retention policy:', error)
      throw error
    }
  }

  // Log Export/Import
  async exportLogs(options: LogExportOptions): Promise<Blob> {
    try {
      const response = await fetch(`${this.baseUrl}/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
      })
      
      if (!response.ok) throw new Error('Failed to export logs')
      
      return await response.blob()
    } catch (error) {
      console.error('Error exporting logs:', error)
      throw error
    }
  }

  async importLogs(options: LogImportOptions, file?: File): Promise<{
    imported: number
    errors: number
    message: string
  }> {
    try {
      const formData = new FormData()
      formData.append('options', JSON.stringify(options))
      if (file) {
        formData.append('file', file)
      }

      const response = await fetch(`${this.baseUrl}/import`, {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) throw new Error('Failed to import logs')
      
      return await response.json()
    } catch (error) {
      console.error('Error importing logs:', error)
      throw error
    }
  }

  // Log Cleanup
  async cleanupLogs(policyId: string): Promise<{
    cleaned: number
    freedSpace: string
    message: string
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/cleanup/${policyId}`, {
        method: 'POST',
      })
      
      if (!response.ok) throw new Error('Failed to cleanup logs')
      
      return await response.json()
    } catch (error) {
      console.error('Error cleaning up logs:', error)
      throw error
    }
  }

  // Real-time Log Streaming
  subscribeToLogs(callback: (log: LogEntry) => void): () => void {
    const ws = new WebSocket(`${this.baseUrl.replace('http', 'ws')}/stream`)
    
    ws.onmessage = (event) => {
      const log = JSON.parse(event.data)
      callback(log)
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    return () => {
      ws.close()
    }
  }

  // Log Search
  async searchLogs(query: string, filters?: LogFilter): Promise<LogEntry[]> {
    try {
      const params = new URLSearchParams()
      params.append('q', query)
      if (filters?.level) params.append('level', filters.level)
      if (filters?.source) params.append('source', filters.source)
      if (filters?.dateRange) {
        params.append('startDate', filters.dateRange.start)
        params.append('endDate', filters.dateRange.end)
      }

      const response = await fetch(`${this.baseUrl}/search?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to search logs')
      
      return await response.json()
    } catch (error) {
      console.error('Error searching logs:', error)
      throw error
    }
  }

  // Log Alerts
  async getLogAlerts(): Promise<Array<{
    id: string
    type: 'error' | 'warning' | 'info'
    message: string
    timestamp: string
    count: number
    resolved: boolean
  }>> {
    try {
      const response = await fetch(`${this.baseUrl}/alerts`)
      if (!response.ok) throw new Error('Failed to fetch log alerts')
      
      return await response.json()
    } catch (error) {
      console.error('Error fetching log alerts:', error)
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
}

export const logService = new LogService() 