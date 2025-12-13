import { apiClient } from './api-client'
import type {
  PartCategory,
  Part,
  CreatePartCategoryRequest,
  UpdatePartCategoryRequest,
  CreatePartRequest,
  UpdatePartRequest,
  PartCategoryApiResponse,
  PartEditResponse,
  PaginationParams,
  SearchParams,
  PaginatedResponse
} from '@/types/manager/part-category'

export class PartCategoryService {
  // Part Categories CRUD
  static async getAllCategories(): Promise<PartCategory[]> {
    const response = await apiClient.get('/PartCategories')
    const apiData = response.data as PartCategoryApiResponse[]
    
    // Map API response to our internal format
    return apiData.map(category => ({
      id: category.laborCategoryId,
      name: category.categoryName,
      description: category.description,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt
    }))
  }

  static async getCategoriesPaged(params: PaginationParams): Promise<PaginatedResponse<PartCategory>> {
    const queryParams = new URLSearchParams({
      page: params.page.toString(),
      pageSize: params.pageSize.toString()
    })
    
    const response = await apiClient.get(`/Partcategories/paged?${queryParams}`)
    const apiData = response.data as PaginatedResponse<PartCategoryApiResponse>
    
    return {
      ...apiData,
      items: apiData.items.map(category => ({
        id: category.laborCategoryId,
        name: category.categoryName,
        description: category.description,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt
      }))
    }
  }

  static async searchCategories(params: SearchParams): Promise<PaginatedResponse<PartCategory>> {
    const queryParams = new URLSearchParams({
      page: params.page.toString(),
      pageSize: params.pageSize.toString(),
      ...(params.searchTerm && { searchTerm: params.searchTerm }),
      ...(params.sortBy && { sortBy: params.sortBy }),
      ...(params.sortOrder && { sortOrder: params.sortOrder })
    })
    
    const response = await apiClient.get(`/Partcategories/search?${queryParams}`)
    const apiData = response.data as PaginatedResponse<PartCategoryApiResponse>
    
    return {
      ...apiData,
      items: apiData.items.map(category => ({
        id: category.laborCategoryId,
        name: category.categoryName,
        description: category.description,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt
      }))
    }
  }

  static async getCategoryById(id: string): Promise<PartCategory> {
    const response = await apiClient.get(`/PartCategories/${id}`)
    const apiData = response.data as PartCategoryApiResponse
    
    // Map API response to our internal format
    return {
      id: apiData.laborCategoryId,
      name: apiData.categoryName,
      description: apiData.description,
      createdAt: apiData.createdAt,
      updatedAt: apiData.updatedAt
    }
  }

  static async createCategory(data: CreatePartCategoryRequest): Promise<PartCategory> {
    // Map our internal format to API format
    const apiData = {
      categoryName: data.name,
      description: data.description || ''
    }
    
    const response = await apiClient.post('/PartCategories', apiData)
    const responseData = response.data as PartCategoryApiResponse
    
    // Map API response back to our internal format
    return {
      id: responseData.laborCategoryId,
      name: responseData.categoryName,
      description: responseData.description,
      createdAt: responseData.createdAt,
      updatedAt: responseData.updatedAt
    }
  }

  static async updateCategory(id: string, data: UpdatePartCategoryRequest): Promise<PartCategory> {
    // Map our internal format to API format
    const apiData = {
      categoryName: data.name,
      description: data.description || ''
    }
    
    const response = await apiClient.put(`/PartCategories/${id}`, apiData)
    const responseData = response.data as PartCategoryApiResponse
    
    // Map API response back to our internal format
    return {
      id: responseData.laborCategoryId,
      name: responseData.categoryName,
      description: responseData.description,
      createdAt: responseData.createdAt,
      updatedAt: responseData.updatedAt
    }
  }

  static async deleteCategory(id: string): Promise<void> {
    await apiClient.delete(`/PartCategories/${id}`)
  }

  // Parts CRUD
  static async getAllParts(): Promise<Part[]> {
    const response = await apiClient.get('/Parts')
    const apiData = response.data as any[]
    
    console.log('Parts API response:', apiData) // Debug log
    
    // Map API response to our internal format
    return apiData.map(part => ({
      id: part.partId || part.id, // Handle both possible field names
      name: part.name,
      partCategoryId: part.partCategoryId,
      categoryName: part.partCategoryName || part.categoryName,
      branchId: part.branchId || '',
      price: part.price,
      stock: part.stock,
      createdAt: part.createdAt,
      updatedAt: part.updatedAt
    }))
  }

  static async getPartsByBranchPaged(branchId: string, params: PaginationParams): Promise<PaginatedResponse<Part>> {
    const queryParams = new URLSearchParams({
      page: params.page.toString(),
      pageSize: params.pageSize.toString()
    })
    
    const response = await apiClient.get(`/Parts/branch/${branchId}/paged?${queryParams}`)
    const apiData = response.data as PaginatedResponse<any>
    
    return {
      ...apiData,
      items: apiData.items.map(part => ({
        id: part.partId || part.id,
        name: part.name,
        partCategoryId: part.partCategoryId,
        categoryName: part.partCategoryName || part.categoryName,
        branchId: part.branchId || branchId,
        price: part.price,
        stock: part.stock,
        createdAt: part.createdAt,
        updatedAt: part.updatedAt
      }))
    }
  }

  static async searchParts(params: SearchParams): Promise<PaginatedResponse<Part>> {
    const queryParams = new URLSearchParams({
      page: params.page.toString(),
      pageSize: params.pageSize.toString(),
      ...(params.searchTerm && { searchTerm: params.searchTerm })
    })
    
    const response = await apiClient.get(`/Parts/search?${queryParams}`)
    const apiData = response.data as PaginatedResponse<any>
    
    return {
      ...apiData,
      items: apiData.items.map(part => ({
        id: part.partId || part.id,
        name: part.name,
        partCategoryId: part.partCategoryId,
        categoryName: part.partCategoryName || part.categoryName,
        branchId: part.branchId || '',
        price: part.price,
        stock: part.stock,
        createdAt: part.createdAt,
        updatedAt: part.updatedAt
      }))
    }
  }

  static async getPartById(id: string): Promise<Part> {
    const response = await apiClient.get(`/Parts/${id}/edit`)
    const apiData = response.data as PartEditResponse
    
    // Map API response to our internal format
    return {
      id: apiData.partId,
      name: apiData.name,
      partCategoryId: apiData.partCategoryId,
      categoryName: apiData.partCategoryName,
      branchId: '',
      price: apiData.price,
      stock: apiData.stock,
      createdAt: apiData.createdAt,
      updatedAt: apiData.updatedAt
    }
  }

  static async createPart(data: CreatePartRequest): Promise<Part> {
    const response = await apiClient.post('/Parts', data)
    return response.data as Part
  }

  static async updatePart(id: string, data: UpdatePartRequest): Promise<Part> {
    // Note: Update API doesn't include branchId - it cannot be changed
    const response = await apiClient.put(`/Parts/${id}`, data)
    return response.data as Part
  }

  static async deletePart(id: string): Promise<void> {
    await apiClient.delete(`/Parts/${id}`)
  }


}