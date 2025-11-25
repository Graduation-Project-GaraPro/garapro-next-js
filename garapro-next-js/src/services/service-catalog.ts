import { apiClient } from './api-client'
import { 
  CreateQuotationDto,
  QuotationDto
} from '@/types/manager/quotation'

// Updated interfaces to match the actual API response structure
export interface GarageServiceCatalogItem {
  serviceId: string
  serviceCategoryId: string
  serviceName: string
  description: string
  price: number
  estimatedDuration: number
  isActive: boolean
  isAdvanced: boolean
  createdAt: string
  updatedAt: string
}

export interface ServiceCategory {
  serviceCategoryId: string
  categoryName: string
  description: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Part {
  partId: string
  name: string
  price: number
  stock: number
}

export interface PartCategory {
  laborCategoryId: string
  categoryName: string
  parts: Part[]
}

export interface ServiceCatalogFilters {
  searchTerm?: string
  status?: boolean
  serviceTypeId?: string
  pageNumber?: number
  pageSize?: number
}

// Define the type for the create data parameter
type CreateServiceData = Omit<GarageServiceCatalogItem, 'serviceId' | 'isActive' | 'isAdvanced' | 'createdAt' | 'updatedAt'> & { 
  isActive?: boolean 
}

// Type guard to check if serviceCategoryId exists in data
function hasServiceCategoryId(data: Partial<CreateServiceData>): data is CreateServiceData & { serviceCategoryId: string } {
  return 'serviceCategoryId' in data && typeof data['serviceCategoryId'] === 'string';
}

// Updated service to use the correct API endpoints
class ServiceCatalogService {
  private servicesBaseUrl = '/Services'
  private categoriesBaseUrl = '/ServiceCategories'
  private partsBaseUrl = '/PartCategories'
  private quotationsBaseUrl = '/Quotations' // Add quotations endpoint
  private storageKey = 'mock.serviceCatalog'

  private readCache(): GarageServiceCatalogItem[] {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem(this.storageKey) : null
      if (raw) return JSON.parse(raw)
    } catch {}
    return this.getFallback()
  }

  private writeCache(items: GarageServiceCatalogItem[]): void {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(this.storageKey, JSON.stringify(items))
      }
    } catch {}
  }

  // Updated to use the correct API endpoint with proper filtering
  async list(filters?: ServiceCatalogFilters): Promise<GarageServiceCatalogItem[]> {
    try {
      // Use the paged endpoint for better performance with filtering
      const params: Record<string, string | number | boolean> = {
        pageNumber: filters?.pageNumber || 1,
        pageSize: filters?.pageSize || 100 // Large page size to get all services
      }
      
      if (filters?.searchTerm) params.searchTerm = filters.searchTerm
      if (filters?.status !== undefined) params.status = filters.status
      if (filters?.serviceTypeId) params.serviceTypeId = filters.serviceTypeId
      
      const response = await apiClient.get<{ data: GarageServiceCatalogItem[] }>(`${this.servicesBaseUrl}/paged`, params)
      return response.data?.data || []
    } catch {
      let items = this.readCache()
      if (filters?.searchTerm) {
        const q = filters.searchTerm.toLowerCase()
        items = items.filter(i => 
          i.serviceName.toLowerCase().includes(q) || 
          i.description.toLowerCase().includes(q)
        )
      }
      if (filters?.status !== undefined) items = items.filter(i => i.isActive === filters.status)
      if (filters?.serviceTypeId) items = items.filter(i => i.serviceCategoryId === filters.serviceTypeId)
      return items
    }
  }

  // New method to get service categories
  async getCategories(): Promise<ServiceCategory[]> {
    try {
      const response = await apiClient.get<ServiceCategory[]>(this.categoriesBaseUrl)
      return response.data || []
    } catch (error) {
      console.error('Failed to fetch service categories:', error)
      return []
    }
  }

  // New method to get part categories with parts
  async getPartCategories(): Promise<PartCategory[]> {
    try {
      const response = await apiClient.get<PartCategory[]>(this.partsBaseUrl)
      return response.data || []
    } catch (error) {
      console.error('Failed to fetch part categories:', error)
      return []
    }
  }

  // New method to get services by category ID
  async getServicesByCategoryId(categoryId: string): Promise<GarageServiceCatalogItem[]> {
    try {
      return await this.list({ serviceTypeId: categoryId });
    } catch (error) {
      console.error(`Failed to fetch services for category ${categoryId}:`, error);
      return [];
    }
  }

  // New method to get parts by service ID
  async getPartsByServiceId(serviceId: string): Promise<Part[]> {
    try {
      const response = await apiClient.get<Part[]>(`/Parts/service/${serviceId}`);
      return response.data || [];
    } catch (error) {
      console.error(`Failed to fetch parts for service ${serviceId}:`, error);
      return [];
    }
  }

  async create(data: CreateServiceData): Promise<GarageServiceCatalogItem> {
    try {
      // Extract serviceCategoryId if present
      const serviceCategoryId = hasServiceCategoryId(data) ? data.serviceCategoryId : undefined;
      // Create a new object without the serviceCategoryId property if it exists
      const restData: Partial<CreateServiceData> = { ...data };
      if (hasServiceCategoryId(data)) {
        delete (restData as Partial<CreateServiceData>)['serviceCategoryId'];
      }
      
      // Build request data without duplicating serviceCategoryId
      const requestData = {
        ...restData,
        serviceCategoryId: serviceCategoryId || 'default',
        isActive: true,
        isAdvanced: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const response = await apiClient.post<GarageServiceCatalogItem>(this.servicesBaseUrl, requestData)
      if (!response.data) {
        throw new Error('Failed to create service');
      }
      return response.data
    } catch {
      const items = this.readCache()
      const serviceCategoryId = hasServiceCategoryId(data) ? data.serviceCategoryId : undefined;
      // Create the new item without duplicating serviceCategoryId
      const newItemData = { ...data };
      if (hasServiceCategoryId(data)) {
        delete (newItemData as Partial<CreateServiceData>)['serviceCategoryId'];
      }
      
      // Build new item data without duplicating serviceCategoryId
      const newItem: GarageServiceCatalogItem = Object.assign(
        {
          serviceId: Date.now().toString(), 
          serviceCategoryId: serviceCategoryId || 'default',
          isActive: true, 
          isAdvanced: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        newItemData
      );
      
      items.unshift(newItem)
      this.writeCache(items)
      return newItem
    }
  }

  async update(id: string, updates: Partial<GarageServiceCatalogItem>): Promise<GarageServiceCatalogItem> {
    try {
      const response = await apiClient.put<GarageServiceCatalogItem>(`${this.servicesBaseUrl}/${id}`, updates)
      if (!response.data) {
        throw new Error('Failed to update service');
      }
      return response.data
    } catch {
      const items = this.readCache()
      const index = items.findIndex(i => i.serviceId === id)
      if (index === -1) throw new Error('Service not found')
      items[index] = { ...items[index], ...updates }
      this.writeCache(items)
      return items[index]
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.servicesBaseUrl}/${id}`)
    } catch {
      const items = this.readCache().filter(i => i.serviceId !== id)
      this.writeCache(items)
    }
  }

  // New method to create a quotation
  async createQuotation(data: CreateQuotationDto): Promise<QuotationDto> {
    try {
      const response = await apiClient.post<QuotationDto>(this.quotationsBaseUrl, data)
      if (!response.data) {
        throw new Error('Failed to create quotation');
      }
      return response.data
    } catch (error) {
      console.error('Failed to create quotation:', error)
      throw error
    }
  }

  private getFallback(): GarageServiceCatalogItem[] {
    return [
      { 
        serviceId: '62821c3e-b3dd-40fe-a7f6-04995c68b2d5', // Valid GUID matching your API example
        serviceCategoryId: 'c1',
        serviceName: 'Brake Repair', // Match your API example
        description: 'This is Brake Repair', // Match your API example
        price: 1200000, // Match your API example (1,200,000)
        estimatedDuration: 90, 
        isActive: true,
        isAdvanced: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      { 
        serviceId: '12345678-1234-1234-1234-123456789012', // Valid GUID format
        serviceCategoryId: 'c2',
        serviceName: 'Oil Change', 
        description: 'Full synthetic oil change', 
        price: 45, 
        estimatedDuration: 30, 
        isActive: true,
        isAdvanced: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      { 
        serviceId: '23456789-2345-2345-2345-234567890123', // Valid GUID format
        serviceCategoryId: 'c1',
        serviceName: 'Tire Rotation', 
        description: 'Rotation and balancing', 
        price: 35, 
        estimatedDuration: 45, 
        isActive: true,
        isAdvanced: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      { 
        serviceId: '34567890-3456-3456-3456-345678901234', // Valid GUID format
        serviceCategoryId: 'c3',
        serviceName: 'Engine Diagnostics', 
        description: 'Engine diagnostics and scan', 
        price: 80, 
        estimatedDuration: 60, 
        isActive: true,
        isAdvanced: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
    ]
  }
}

export const serviceCatalog = new ServiceCatalogService()