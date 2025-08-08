import { Policy, ComplianceStandard, AuditLog, PolicyFilters, ComplianceFilters, AuditFilters } from '@/types/policy'

class PolicyService {
  private baseUrl = '/api/policies'

  // Policy Management
  async getPolicies(filters?: PolicyFilters): Promise<Policy[]> {
    try {
      const params = new URLSearchParams()
      if (filters?.search) params.append('search', filters.search)
      if (filters?.category) params.append('category', filters.category)
      if (filters?.status) params.append('status', filters.status)
      if (filters?.priority) params.append('priority', filters.priority)
      if (filters?.scope) params.append('scope', filters.scope)

      const response = await fetch(`${this.baseUrl}?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch policies')
      
      return await response.json()
    } catch (error) {
      console.error('Error fetching policies:', error)
      throw error
    }
  }

  async getPolicy(id: string): Promise<Policy> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`)
      if (!response.ok) throw new Error('Failed to fetch policy')
      
      return await response.json()
    } catch (error) {
      console.error('Error fetching policy:', error)
      throw error
    }
  }

  async createPolicy(policy: Omit<Policy, 'id' | 'createdAt' | 'updatedAt'>): Promise<Policy> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(policy),
      })
      
      if (!response.ok) throw new Error('Failed to create policy')
      
      return await response.json()
    } catch (error) {
      console.error('Error creating policy:', error)
      throw error
    }
  }

  async updatePolicy(id: string, policy: Partial<Policy>): Promise<Policy> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(policy),
      })
      
      if (!response.ok) throw new Error('Failed to update policy')
      
      return await response.json()
    } catch (error) {
      console.error('Error updating policy:', error)
      throw error
    }
  }

  async deletePolicy(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) throw new Error('Failed to delete policy')
    } catch (error) {
      console.error('Error deleting policy:', error)
      throw error
    }
  }

  // Compliance Management
  async getComplianceStandards(filters?: ComplianceFilters): Promise<ComplianceStandard[]> {
    try {
      const params = new URLSearchParams()
      if (filters?.standard) params.append('standard', filters.standard)
      if (filters?.status) params.append('status', filters.status)
      if (filters?.priority) params.append('priority', filters.priority)

      const response = await fetch(`${this.baseUrl}/compliance?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch compliance standards')
      
      return await response.json()
    } catch (error) {
      console.error('Error fetching compliance standards:', error)
      throw error
    }
  }

  async updateComplianceStatus(standardId: string, status: string): Promise<ComplianceStandard> {
    try {
      const response = await fetch(`${this.baseUrl}/compliance/${standardId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })
      
      if (!response.ok) throw new Error('Failed to update compliance status')
      
      return await response.json()
    } catch (error) {
      console.error('Error updating compliance status:', error)
      throw error
    }
  }

  // Audit Logs
  async getAuditLogs(filters?: AuditFilters): Promise<AuditLog[]> {
    try {
      const params = new URLSearchParams()
      if (filters?.search) params.append('search', filters.search)
      if (filters?.status) params.append('status', filters.status)
      if (filters?.category) params.append('category', filters.category)
      if (filters?.severity) params.append('severity', filters.severity)
      if (filters?.dateRange) {
        params.append('startDate', filters.dateRange.start)
        params.append('endDate', filters.dateRange.end)
      }

      const response = await fetch(`${this.baseUrl}/audit?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch audit logs')
      
      return await response.json()
    } catch (error) {
      console.error('Error fetching audit logs:', error)
      throw error
    }
  }

  async exportAuditLogs(filters?: AuditFilters): Promise<Blob> {
    try {
      const params = new URLSearchParams()
      if (filters?.search) params.append('search', filters.search)
      if (filters?.status) params.append('status', filters.status)
      if (filters?.category) params.append('category', filters.category)
      if (filters?.severity) params.append('severity', filters.severity)
      if (filters?.dateRange) {
        params.append('startDate', filters.dateRange.start)
        params.append('endDate', filters.dateRange.end)
      }

      const response = await fetch(`${this.baseUrl}/audit/export?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to export audit logs')
      
      return await response.blob()
    } catch (error) {
      console.error('Error exporting audit logs:', error)
      throw error
    }
  }

  // Policy Templates
  async getPolicyTemplates(): Promise<Policy[]> {
    try {
      const response = await fetch(`${this.baseUrl}/templates`)
      if (!response.ok) throw new Error('Failed to fetch policy templates')
      
      return await response.json()
    } catch (error) {
      console.error('Error fetching policy templates:', error)
      throw error
    }
  }

  async createPolicyFromTemplate(templateId: string, customizations: Partial<Policy>): Promise<Policy> {
    try {
      const response = await fetch(`${this.baseUrl}/templates/${templateId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customizations),
      })
      
      if (!response.ok) throw new Error('Failed to create policy from template')
      
      return await response.json()
    } catch (error) {
      console.error('Error creating policy from template:', error)
      throw error
    }
  }

  // Policy Validation
  async validatePolicy(policy: Partial<Policy>): Promise<{ isValid: boolean; errors: string[] }> {
    try {
      const response = await fetch(`${this.baseUrl}/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(policy),
      })
      
      if (!response.ok) throw new Error('Failed to validate policy')
      
      return await response.json()
    } catch (error) {
      console.error('Error validating policy:', error)
      throw error
    }
  }

  // Policy Deployment
  async deployPolicy(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}/deploy`, {
        method: 'POST',
      })
      
      if (!response.ok) throw new Error('Failed to deploy policy')
      
      return await response.json()
    } catch (error) {
      console.error('Error deploying policy:', error)
      throw error
    }
  }

  async rollbackPolicy(id: string, version: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}/rollback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ version }),
      })
      
      if (!response.ok) throw new Error('Failed to rollback policy')
      
      return await response.json()
    } catch (error) {
      console.error('Error rolling back policy:', error)
      throw error
    }
  }

  // Policy Analytics
  async getPolicyAnalytics(): Promise<{
    totalPolicies: number
    activePolicies: number
    complianceRate: number
    recentChanges: number
    topCategories: Array<{ category: string; count: number }>
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics`)
      if (!response.ok) throw new Error('Failed to fetch policy analytics')
      
      return await response.json()
    } catch (error) {
      console.error('Error fetching policy analytics:', error)
      throw error
    }
  }
}

export const policyService = new PolicyService() 