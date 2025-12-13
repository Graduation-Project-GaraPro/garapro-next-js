import { apiClient } from "./api-client"
import { serviceCatalog } from "@/services/service-catalog"
import type { ServiceCategory, GarageServiceCatalogItem } from "@/services/service-catalog"
import type { 
  InspectionDto, 
  InspectionServiceDto, 
  InspectionPartDto, 
  CreateInspectionRequest,
  CreateManagerInspectionRequest,
  AvailableServiceDto
} from "@/types/manager/inspection"
import { InspectionStatus } from "@/types/manager/inspection"

// Re-export for backward compatibility
export type { 
  InspectionDto, 
  InspectionServiceDto, 
  InspectionPartDto, 
  CreateInspectionRequest,
  CreateManagerInspectionRequest,
  AvailableServiceDto
}
export { InspectionStatus }

class InspectionService {
  private baseUrl = "/Inspection"
  private categoriesBaseUrl = "/ServiceCategories"

  /*
   Fetch all inspections for a specific repair order
   */
  async getInspectionsByRepairOrderId(repairOrderId: string): Promise<InspectionDto[]> {
    try {
      const endpoint = `${this.baseUrl}/repairorder/${repairOrderId}`
      const response = await apiClient.get<InspectionDto[]>(endpoint)
      return response.data || []
    } catch (error) {
      console.error(`Failed to fetch inspections for repair order ${repairOrderId}:`, error)
      throw error
    }
  }

  /*
    Fetch a specific inspection by ID
   */
  async getInspectionById(inspectionId: string): Promise<InspectionDto> {
    try {
      const endpoint = `${this.baseUrl}/${inspectionId}`
      const response = await apiClient.get<InspectionDto>(endpoint)
      if (!response.data) {
        throw new Error("Failed to fetch inspection: No data returned")
      }
      return response.data
    } catch (error) {
      console.error(`Failed to fetch inspection with id ${inspectionId}:`, error)
      throw error
    }
  }

  /*
    Create a new inspection for a repair order
   */
  async createInspection(request: CreateInspectionRequest): Promise<InspectionDto> {
    try {
      const response = await apiClient.post<InspectionDto>(this.baseUrl, request)
      if (!response.data) {
        throw new Error("Failed to create inspection: No data returned")
      }
      return response.data
    } catch (error) {
      console.error("Failed to create inspection:", error)
      throw error
    }
  }

  /*
   Get available services for a repair order (excludes completed inspection services)
   */
  async getAvailableServices(repairOrderId: string): Promise<AvailableServiceDto[]> {
    try {
      const endpoint = `${this.baseUrl}/available-services/${repairOrderId}`
      const response = await apiClient.get<AvailableServiceDto[]>(endpoint)
      return response.data || []
    } catch (error) {
      console.error(`Failed to fetch available services for repair order ${repairOrderId}:`, error)
      throw error
    }
  }

  /*
    Create a manager inspection with optional services
   */
  async createManagerInspection(request: CreateManagerInspectionRequest): Promise<InspectionDto> {
    try {
      const endpoint = `${this.baseUrl}/manager`
      const response = await apiClient.post<InspectionDto>(endpoint, request)
      if (!response.data) {
        throw new Error("Failed to create manager inspection: No data returned")
      }
      return response.data
    } catch (error) {
      console.error("Failed to create manager inspection:", error)
      throw error
    }
  }

  /*
    Assign a technician to an inspection
   */
  async assignTechnician(inspectionId: string, technicianId: string): Promise<void> {
    try {
      const endpoint = `${this.baseUrl}/${inspectionId}/assign/${technicianId}`
      await apiClient.put(endpoint)
      console.log(`Successfully assigned technician ${technicianId} to inspection ${inspectionId}`)
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'status' in error && error.status === 404) {
        console.warn(`Received 404 for assign technician API call, but assignment may have succeeded`)
        return
      }
      console.error(`Failed to assign technician ${technicianId} to inspection ${inspectionId}:`, error)
      throw error
    }
  }

  /*
   Get inspection status display name
   */
  getStatusDisplayName(status: InspectionStatus): string {
    switch (status) {
      case InspectionStatus.New:
        return "New"
      case InspectionStatus.Pending:
        return "Pending"
      case InspectionStatus.InProgress:
        return "In Progress"
      case InspectionStatus.Completed:
        return "Completed"
      default:
        return "Unknown"
    }
  }

  /*
    Get status badge class based on inspection status
   */
  getStatusBadgeClass(status: InspectionStatus): string {
    switch (status) {
      case InspectionStatus.New:
        return "bg-blue-100 text-blue-800"
      case InspectionStatus.Pending:
        return "bg-yellow-100 text-yellow-800"
      case InspectionStatus.InProgress:
        return "bg-purple-100 text-purple-800"
      case InspectionStatus.Completed:
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  /*
    Get service categories
   */
  async getServiceCategories(): Promise<ServiceCategory[]> {
    try {
      return await serviceCatalog.getCategories()
    } catch (error) {
      console.error("Failed to fetch service categories:", error)
      throw error
    }
  }

  /*
    Get inspection service category by name
   */
  async getInspectionCategory(): Promise<ServiceCategory | null> {
    try {
      // First try to get category by name "Inspection"
      const response = await apiClient.get<ServiceCategory[]>(this.categoriesBaseUrl, { name: "Inspection" })
      if (response.data && response.data.length > 0) {
        return response.data[0]
      }
      
      const categories = await serviceCatalog.getCategories()
      const inspectionCategory = categories.find(
        category => category.categoryName.toLowerCase().includes("inspection")
      )
      
      return inspectionCategory || null
    } catch (error) {
      console.error("Failed to fetch inspection category:", error)
      try {
        const categories = await serviceCatalog.getCategories()
        const inspectionCategory = categories.find(
          category => category.categoryName.toLowerCase().includes("inspection")
        )
        return inspectionCategory || null
      } catch (fallbackError) {
        console.error("Fallback failed to fetch categories:", fallbackError)
        return null
      }
    }
  }

  /*
    Get services by category ID
   */
  async getServicesByCategoryId(categoryId: string): Promise<GarageServiceCatalogItem[]> {
    try {
      return await serviceCatalog.getServicesByCategoryId(categoryId)
    } catch (error) {
      console.error(`Failed to fetch services for category ${categoryId}:`, error)
      throw error
    }
  }

  /*
    Get inspection services only
   */
  async getInspectionServices(): Promise<GarageServiceCatalogItem[]> {
    try {
      const inspectionCategory = await this.getInspectionCategory()
      if (!inspectionCategory) {
        console.warn("Inspection category not found")
        return []
      }
      
      return await this.getServicesByCategoryId(inspectionCategory.serviceCategoryId)
    } catch (error) {
      console.error("Failed to fetch inspection services:", error)
      return []
    }
  }
}

export const inspectionService = new InspectionService()