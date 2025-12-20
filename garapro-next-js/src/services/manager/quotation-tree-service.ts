// src/services/manager/quotation-tree-service.ts
import { apiClient } from './api-client';

export interface BreadcrumbItem {
  categoryId: string | null;
  categoryName: string;
}

export interface Breadcrumb {
  items: BreadcrumbItem[];
}

export interface ServiceCategory {
  serviceCategoryId: string;
  categoryName: string;
  parentCategoryId: string | null;
}

export interface ServiceItem {
  serviceId: string;
  serviceName: string;
  price: number;
}

export interface PartItem {
  partId: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  warrantyMonths?: number;
  partCategoryId: string;
  modelId?: string;
  modelName?: string;
  brandName?: string;
}

export interface PartCategory {
  partCategoryId: string;
  categoryName: string;
  modelId?: string;
  modelName?: string;
  brandName?: string;
  parts: PartItem[];
}

export interface TreeRootResponse {
  childCategories: ServiceCategory[];
  services: ServiceItem[];
  breadcrumb: Breadcrumb;
}

export interface CategoryResponse {
  currentCategoryId: string;
  currentCategoryName: string;
  childCategories: ServiceCategory[];
  services: ServiceItem[];
  breadcrumb: Breadcrumb;
}

export interface ServiceDetailsResponse {
  serviceId: string;
  serviceName: string;
  price: number;
  partCategories: PartCategory[];
}

class QuotationTreeService {
  private readonly baseUrl = '/QuotationTreeSelection';

  // Load root categories
  async getRoot(): Promise<TreeRootResponse> {
    try {
      const response = await apiClient.get<TreeRootResponse>(`${this.baseUrl}/root`);
      if (!response.data) {
        throw new Error('No data received from API');
      }
      return response.data;
    } catch (error) {
      console.error('Failed to fetch root categories:', error);
      throw error;
    }
  }

  // Drill down into a category
  async getCategory(categoryId: string): Promise<CategoryResponse> {
    try {
      const response = await apiClient.get<CategoryResponse>(`${this.baseUrl}/category/${categoryId}`);
      if (!response.data) {
        throw new Error('No data received from API');
      }
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch category ${categoryId}:`, error);
      throw error;
    }
  }

  // Get service details with part categories (with optional model filtering)
  async getServiceDetails(serviceId: string, modelId?: string): Promise<ServiceDetailsResponse> {
    try {
      const url = modelId 
        ? `${this.baseUrl}/service/${serviceId}?modelId=${modelId}`
        : `${this.baseUrl}/service/${serviceId}`;
      
      const response = await apiClient.get<ServiceDetailsResponse>(url);
      if (!response.data) {
        throw new Error('No data received from API');
      }
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch service details ${serviceId}${modelId ? ` for model ${modelId}` : ''}:`, error);
      throw error;
    }
  }

  // Get parts by category ID (with optional model filtering)
  async getPartsByCategory(categoryId: string, modelId?: string): Promise<PartItem[]> {
    try {
      // Define the API response type with enhanced fields
      interface ApiPartItem {
        partId: string;
        name: string;
        description: string;
        price: number;
        stockQuantity: number;
        warrantyMonths?: number;
        partCategoryId: string;
        modelId?: string;
        modelName?: string;
        brandName?: string;
      }
      
      const url = modelId 
        ? `${this.baseUrl}/parts/category/${categoryId}?modelId=${modelId}`
        : `${this.baseUrl}/parts/category/${categoryId}`;
      
      const response = await apiClient.get<ApiPartItem[]>(url);
      if (!response.data) {
        throw new Error('No data received from API');
      }
      
      // Map API response to PartItem interface
      return response.data.map(part => ({
        partId: part.partId,
        name: part.name,
        description: part.description,
        price: part.price,
        stock: part.stockQuantity,
        warrantyMonths: part.warrantyMonths,
        partCategoryId: part.partCategoryId,
        modelId: part.modelId,
        modelName: part.modelName,
        brandName: part.brandName
      }));
    } catch (error) {
      console.error(`Failed to fetch parts for category ${categoryId}${modelId ? ` for model ${modelId}` : ''}:`, error);
      throw error;
    }
  }

  // NEW: Get parts by model ID and category name
  async getPartsByModelAndCategory(modelId: string, categoryName: string): Promise<PartItem[]> {
    try {
      // Define the API response type with enhanced fields
      interface ApiPartItem {
        partId: string;
        name: string;
        description: string;
        price: number;
        stockQuantity: number;
        warrantyMonths?: number;
        partCategoryId: string;
        modelId: string;
        modelName: string;
        brandName: string;
      }
      
      const response = await apiClient.get<ApiPartItem[]>(`${this.baseUrl}/parts/model/${modelId}/category/${encodeURIComponent(categoryName)}`);
      if (!response.data) {
        throw new Error('No data received from API');
      }
      
      // Map API response to PartItem interface
      return response.data.map(part => ({
        partId: part.partId,
        name: part.name,
        description: part.description,
        price: part.price,
        stock: part.stockQuantity,
        warrantyMonths: part.warrantyMonths,
        partCategoryId: part.partCategoryId,
        modelId: part.modelId,
        modelName: part.modelName,
        brandName: part.brandName
      }));
    } catch (error) {
      console.error(`Failed to fetch parts for model ${modelId} and category ${categoryName}:`, error);
      throw error;
    }
  }
}

export const quotationTreeService = new QuotationTreeService();
