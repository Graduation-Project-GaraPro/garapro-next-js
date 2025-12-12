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
  price: number;
  stock: number
}

export interface PartCategory {
  partCategoryId: string;
  categoryName: string;
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

  // Get service details with part categories
  async getServiceDetails(serviceId: string): Promise<ServiceDetailsResponse> {
    try {
      const response = await apiClient.get<ServiceDetailsResponse>(`${this.baseUrl}/service/${serviceId}`);
      if (!response.data) {
        throw new Error('No data received from API');
      }
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch service details ${serviceId}:`, error);
      throw error;
    }
  }

  // Get parts by category ID
  async getPartsByCategory(categoryId: string): Promise<PartItem[]> {
    try {
      // Define the API response type that includes stockQuantity
      interface ApiPartItem {
        partId: string;
        name: string;
        price: number;
        stockQuantity: number;
        description?: string;
        partCategoryId?: string;
      }
      
      const response = await apiClient.get<ApiPartItem[]>(`${this.baseUrl}/parts/category/${categoryId}`);
      if (!response.data) {
        throw new Error('No data received from API');
      }
      
      // Map API response to PartItem interface
      return response.data.map(part => ({
        partId: part.partId,
        name: part.name,
        price: part.price,
        stock: part.stockQuantity // Map stockQuantity to stock
      }));
    } catch (error) {
      console.error(`Failed to fetch parts for category ${categoryId}:`, error);
      throw error;
    }
  }
}

export const quotationTreeService = new QuotationTreeService();
