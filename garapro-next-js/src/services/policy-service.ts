import { apiClient } from './api-client'

export interface Policy {
  id: number
  name: string
  description: string
  category: 'security' | 'privacy' | 'compliance' | 'operational' | 'financial'
  status: 'active' | 'inactive' | 'draft' | 'archived'
  priority: 'low' | 'medium' | 'high' | 'critical'
  version: string
  effectiveDate: string
  expiryDate?: string
  createdBy: string
  createdAt: string
  updatedBy: string
  updatedAt: string
  tags: string[]
  compliance: {
    gdpr: boolean
    hipaa: boolean
    sox: boolean
    pci: boolean
    iso27001: boolean
  }
  rules: PolicyRule[]
  exceptions: PolicyException[]
  auditLog: PolicyAuditLog[]
}

export interface PolicyRule {
  id: number
  name: string
  description: string
  condition: string
  action: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  enabled: boolean
}

export interface PolicyException {
  id: number
  reason: string
  requestedBy: string
  approvedBy?: string
  status: 'pending' | 'approved' | 'rejected'
  startDate: string
  endDate: string
  conditions: string
}

export interface PolicyAuditLog {
  id: number
  action: string
  userId: string
  timestamp: string
  details: string
  ipAddress: string
  userAgent: string
}

export interface PolicyFilters {
  search?: string
  category?: string
  status?: string
  priority?: string
  compliance?: string
  tags?: string[]
  dateRange?: {
    start: string
    end: string
  }
  page?: number
  limit?: number
}

export interface PolicyCreateData {
  name: string
  description: string
  category: 'security' | 'privacy' | 'compliance' | 'operational' | 'financial'
  priority: 'low' | 'medium' | 'high' | 'critical'
  effectiveDate: string
  expiryDate?: string
  tags: string[]
  compliance: {
    gdpr: boolean
    hipaa: boolean
    sox: boolean
    pci: boolean
    iso27001: boolean
  }
  rules: Omit<PolicyRule, 'id'>[]
}

export interface PolicyUpdateData {
  name?: string
  description?: string
  category?: 'security' | 'privacy' | 'compliance' | 'operational' | 'financial'
  priority?: 'low' | 'medium' | 'high' | 'critical'
  effectiveDate?: string
  expiryDate?: string
  tags?: string[]
  compliance?: {
    gdpr?: boolean
    hipaa?: boolean
    sox?: boolean
    pci?: boolean
    iso27001?: boolean
  }
  rules?: Omit<PolicyRule, 'id'>[]
}

export interface PolicyResponse {
  policies: Policy[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ComplianceReport {
  policyId: number
  policyName: string
  complianceScore: number
  violations: number
  lastAudit: string
  nextAudit: string
  recommendations: string[]
}

class PolicyService {
  private baseUrl = '/policies'

  // Get all policies with filters and pagination
  async getPolicies(filters?: PolicyFilters): Promise<PolicyResponse> {
    try {
      const params: Record<string, unknown> = {}
      if (filters?.search) params.search = filters.search
      if (filters?.category) params.category = filters.category
      if (filters?.status) params.status = filters.status
      if (filters?.priority) params.priority = filters.priority
      if (filters?.compliance) params.compliance = filters.compliance
      if (filters?.tags) params.tags = filters.tags.join(',')
      if (filters?.dateRange) {
        params.startDate = filters.dateRange.start
        params.endDate = filters.dateRange.end
      }
      if (filters?.page) params.page = filters.page
      if (filters?.limit) params.limit = filters.limit

      const response = await apiClient.get<PolicyResponse>(this.baseUrl, params)
      return response.data
    } catch (error) {
      console.error('Failed to fetch policies:', error)
      throw new Error('Failed to fetch policies. Please try again.')
    }
  }

  // Get policy by ID
  async getPolicyById(id: number): Promise<Policy> {
    try {
      const response = await apiClient.get<Policy>(`${this.baseUrl}/${id}`)
      return response.data
    } catch (error) {
      console.error(`Failed to fetch policy ${id}:`, error)
      throw new Error('Failed to fetch policy details. Please try again.')
    }
  }

  // Create new policy
  async createPolicy(policyData: PolicyCreateData): Promise<Policy> {
    try {
      const response = await apiClient.post<Policy>(this.baseUrl, policyData)
      return response.data
    } catch (error) {
      console.error('Failed to create policy:', error)
      throw new Error('Failed to create policy. Please check your input and try again.')
    }
  }

  // Update policy
  async updatePolicy(id: number, policyData: PolicyUpdateData): Promise<Policy> {
    try {
      const response = await apiClient.put<Policy>(`${this.baseUrl}/${id}`, policyData)
      return response.data
    } catch (error) {
      console.error(`Failed to update policy ${id}:`, error)
      throw new Error('Failed to update policy. Please try again.')
    }
  }

  // Delete policy
  async deletePolicy(id: number): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/${id}`)
    } catch (error) {
      console.error(`Failed to delete policy ${id}:`, error)
      throw new Error('Failed to delete policy. Please try again.')
    }
  }

  // Activate policy
  async activatePolicy(id: number): Promise<void> {
    try {
      await apiClient.patch(`${this.baseUrl}/${id}/activate`)
    } catch (error) {
      console.error(`Failed to activate policy ${id}:`, error)
      throw new Error('Failed to activate policy. Please try again.')
    }
  }

  // Deactivate policy
  async deactivatePolicy(id: number): Promise<void> {
    try {
      await apiClient.patch(`${this.baseUrl}/${id}/deactivate`)
    } catch (error) {
      console.error(`Failed to deactivate policy ${id}:`, error)
      throw new Error('Failed to deactivate policy. Please try again.')
    }
  }

  // Archive policy
  async archivePolicy(id: number): Promise<void> {
    try {
      await apiClient.patch(`${this.baseUrl}/${id}/archive`)
    } catch (error) {
      console.error(`Failed to archive policy ${id}:`, error)
      throw new Error('Failed to archive policy. Please try again.')
    }
  }

  // Get policy compliance report
  async getPolicyCompliance(policyId: number): Promise<ComplianceReport> {
    try {
      const response = await apiClient.get<ComplianceReport>(`${this.baseUrl}/${policyId}/compliance`)
      return response.data
    } catch (error) {
      console.error(`Failed to fetch compliance for policy ${policyId}:`, error)
      throw new Error('Failed to fetch policy compliance. Please try again.')
    }
    }

  // Get all compliance reports
  async getAllComplianceReports(): Promise<ComplianceReport[]> {
    try {
      const response = await apiClient.get<ComplianceReport[]>(`${this.baseUrl}/compliance/reports`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch compliance reports:', error)
      throw new Error('Failed to fetch compliance reports. Please try again.')
    }
  }

  // Get policy statistics
  async getPolicyStatistics(): Promise<{
    totalPolicies: number
    activePolicies: number
    draftPolicies: number
    archivedPolicies: number
    complianceScore: number
    violationsThisMonth: number
    policiesByCategory: Record<string, number>
    policiesByPriority: Record<string, number>
  }> {
    try {
      const response = await apiClient.get<{
        totalPolicies: number
        activePolicies: number
        draftPolicies: number
        archivedPolicies: number
        complianceScore: number
        violationsThisMonth: number
        policiesByCategory: Record<string, number>
        policiesByPriority: Record<string, number>
      }>(`${this.baseUrl}/statistics`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch policy statistics:', error)
      throw new Error('Failed to fetch policy statistics. Please try again.')
    }
  }

  // Export policies
  async exportPolicies(filters?: PolicyFilters, format: 'csv' | 'excel' | 'pdf' = 'csv'): Promise<Blob> {
    try {
      const params: Record<string, unknown> = { format }
      if (filters?.search) params.search = filters.search
      if (filters?.category) params.category = filters.category
      if (filters?.status) params.status = filters.status
      if (filters?.priority) params.priority = filters.priority
      if (filters?.compliance) params.compliance = filters.compliance
      if (filters?.tags) params.tags = filters.tags.join(',')
      if (filters?.dateRange) {
        params.startDate = filters.dateRange.start
        params.endDate = filters.dateRange.end
      }

      const response = await apiClient.get<Blob>(`${this.baseUrl}/export`, params)
      return response.data
    } catch (error) {
      console.error('Failed to export policies:', error)
      throw new Error('Failed to export policies. Please try again.')
    }
  }

  // Bulk operations
  async bulkUpdatePolicies(policyIds: number[], updates: Partial<PolicyUpdateData>): Promise<void> {
    try {
      await apiClient.patch(`${this.baseUrl}/bulk-update`, { policyIds, updates })
    } catch (error) {
      console.error('Failed to bulk update policies:', error)
      throw new Error('Failed to bulk update policies. Please try again.')
    }
  }

  async bulkDeletePolicies(policyIds: number[]): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/bulk-delete`, { body: { policyIds } })
    } catch (error) {
      console.error('Failed to bulk delete policies:', error)
      throw new Error('Failed to bulk delete policies. Please try again.')
    }
  }

  async bulkActivatePolicies(policyIds: number[]): Promise<void> {
    try {
      await apiClient.patch(`${this.baseUrl}/bulk-activate`, { policyIds })
    } catch (error) {
      console.error('Failed to bulk activate policies:', error)
      throw new Error('Failed to bulk activate policies. Please try again.')
    }
  }

  async bulkDeactivatePolicies(policyIds: number[]): Promise<void> {
    try {
      await apiClient.patch(`${this.baseUrl}/bulk-deactivate`, { policyIds })
    } catch (error) {
      console.error('Failed to bulk deactivate policies:', error)
      throw new Error('Failed to bulk deactivate policies. Please try again.')
    }
  }

  // Search policies
  async searchPolicies(query: string, filters?: Omit<PolicyFilters, 'search'>): Promise<PolicyResponse> {
    try {
      const params: Record<string, unknown> = { search: query }
      if (filters?.category) params.category = filters.category
      if (filters?.status) params.status = filters.status
      if (filters?.priority) params.priority = filters.priority
      if (filters?.compliance) params.compliance = filters.compliance
      if (filters?.tags) params.tags = filters.tags.join(',')
      if (filters?.dateRange) {
        params.startDate = filters.dateRange.start
        params.endDate = filters.dateRange.end
      }
      if (filters?.page) params.page = filters.page
      if (filters?.limit) params.limit = filters.limit

      const response = await apiClient.get<PolicyResponse>(`${this.baseUrl}/search`, params)
      return response.data
    } catch (error) {
      console.error('Failed to search policies:', error)
      throw new Error('Failed to search policies. Please try again.')
    }
  }

  // Get policy audit log
  async getPolicyAuditLog(policyId: number, page: number = 1, limit: number = 50): Promise<{
    logs: PolicyAuditLog[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    try {
      const response = await apiClient.get<{
        logs: PolicyAuditLog[]
        total: number
        page: number
        limit: number
        totalPages: number
      }>(`${this.baseUrl}/${policyId}/audit-log`, { page, limit })
      return response.data
    } catch (error) {
      console.error(`Failed to fetch audit log for policy ${policyId}:`, error)
      throw new Error('Failed to fetch policy audit log. Please try again.')
    }
  }

  // Create policy exception
  async createPolicyException(policyId: number, exceptionData: Omit<PolicyException, 'id' | 'status'>): Promise<PolicyException> {
    try {
      const response = await apiClient.post<PolicyException>(`${this.baseUrl}/${policyId}/exceptions`, exceptionData)
      return response.data
    } catch (error) {
      console.error(`Failed to create exception for policy ${policyId}:`, error)
      throw new Error('Failed to create policy exception. Please try again.')
    }
  }

  // Approve policy exception
  async approvePolicyException(policyId: number, exceptionId: number): Promise<void> {
    try {
      await apiClient.patch(`${this.baseUrl}/${policyId}/exceptions/${exceptionId}/approve`)
    } catch (error) {
      console.error(`Failed to approve exception ${exceptionId} for policy ${policyId}:`, error)
      throw new Error('Failed to approve policy exception. Please try again.')
    }
  }

  // Reject policy exception
  async rejectPolicyException(policyId: number, exceptionId: number, reason: string): Promise<void> {
    try {
      await apiClient.patch(`${this.baseUrl}/${policyId}/exceptions/${exceptionId}/reject`, { reason })
    } catch (error) {
      console.error(`Failed to reject exception ${exceptionId} for policy ${policyId}:`, error)
      throw new Error('Failed to reject policy exception. Please try again.')
    }
  }

  // Get policy violations
  async getPolicyViolations(policyId: number, period: string = '30d'): Promise<Array<{
    id: number
    userId: string
    userName: string
    violation: string
    timestamp: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    status: 'open' | 'resolved' | 'ignored'
    details: string
  }>> {
    try {
      const response = await apiClient.get<Array<{
        id: number
        userId: string
        userName: string
        violation: string
        timestamp: string
        severity: 'low' | 'medium' | 'high' | 'critical'
        status: 'open' | 'resolved' | 'ignored'
        details: string
      }>>(`${this.baseUrl}/${policyId}/violations`, { period })
      return response.data
    } catch (error) {
      console.error(`Failed to fetch violations for policy ${policyId}:`, error)
      throw new Error('Failed to fetch policy violations. Please try again.')
    }
  }

  // Resolve policy violation
  async resolvePolicyViolation(policyId: number, violationId: number, resolution: string): Promise<void> {
    try {
      await apiClient.patch(`${this.baseUrl}/${policyId}/violations/${violationId}/resolve`, { resolution })
    } catch (error) {
      console.error(`Failed to resolve violation ${violationId} for policy ${policyId}:`, error)
      throw new Error('Failed to resolve policy violation. Please try again.')
    }
  }

  // Get available policy categories
  async getPolicyCategories(): Promise<string[]> {
    try {
      const response = await apiClient.get<string[]>(`${this.baseUrl}/categories`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch policy categories:', error)
      throw new Error('Failed to fetch policy categories. Please try again.')
    }
  }

  // Get available policy tags
  async getPolicyTags(): Promise<string[]> {
    try {
      const response = await apiClient.get<string[]>(`${this.baseUrl}/tags`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch policy tags:', error)
      throw new Error('Failed to fetch policy tags. Please try again.')
    }
  }
}

export const policyService = new PolicyService() 