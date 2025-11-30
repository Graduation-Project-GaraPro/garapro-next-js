// src/services/manager/quotation-service.ts
import { apiClient } from './api-client';
import { 
  CreateQuotationDto, 
  QuotationDto 
} from '@/types/manager/quotation';

class QuotationService {
  private readonly baseUrl = '/Quotations';

  // Get all quotations
  async getAllQuotations(): Promise<QuotationDto[]> {
    try {
      const response = await apiClient.get<QuotationDto[]>(this.baseUrl);
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch quotations:', error);
      throw error;
    }
  }

  // Get quotation by ID
  async getQuotationById(id: string): Promise<QuotationDto> {
    try {
      const response = await apiClient.get<QuotationDto>(`${this.baseUrl}/${id}`);
      if (!response.data) {
        throw new Error('Quotation not found');
      }
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch quotation with id ${id}:`, error);
      throw error;
    }
  }

  // Get quotations linked to an inspection/RO
  async getQuotationsByInspectionId(inspectionId: string): Promise<QuotationDto[]> {
    try {
      const response = await apiClient.get<QuotationDto[]>(`${this.baseUrl}/inspection/${inspectionId}`);
      return response.data || [];
    } catch (error) {
      console.error(`Failed to fetch quotations for inspection ${inspectionId}:`, error);
      throw error;
    }
  }

  // Get quotations linked to a repair order
  async getQuotationsByRepairOrderId(repairOrderId: string): Promise<QuotationDto[]> {
    try {
      const response = await apiClient.get<QuotationDto[]>(`${this.baseUrl}/repair-order/${repairOrderId}`);
      return response.data || [];
    } catch (error) {
      console.error(`Failed to fetch quotations for repair order ${repairOrderId}:`, error);
      throw error;
    }
  }

  // Get quotations for current logged-in user
  async getQuotationsForUser(): Promise<QuotationDto[]> {
    try {
      const response = await apiClient.get<QuotationDto[]>(`${this.baseUrl}/user`);
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch quotations for user:', error);
      throw error;
    }
  }

  // Create a new quotation
  async createQuotation(data: CreateQuotationDto): Promise<QuotationDto> {
    try {
      const response = await apiClient.post<QuotationDto>(this.baseUrl, data);
      if (!response.data) {
        throw new Error('Failed to create quotation');
      }
      return response.data;
    } catch (error) {
      console.error('Failed to create quotation:', error);
      // Log the request data for debugging
      console.error('Request data:', data);
      throw error;
    }
  }

  // Update quotation details
  async updateQuotation(id: string, data: Partial<CreateQuotationDto>): Promise<QuotationDto> {
    try {
      const response = await apiClient.put<QuotationDto>(`${this.baseUrl}/${id}`, data);
      if (!response.data) {
        throw new Error('Failed to update quotation');
      }
      return response.data;
    } catch (error) {
      console.error(`Failed to update quotation ${id}:`, error);
      throw error;
    }
  }

  // Update quotation status
  async updateQuotationStatus(id: string, status: string): Promise<QuotationDto> {
    try {
      const response = await apiClient.put<QuotationDto>(`${this.baseUrl}/${id}/status`, { status });
      if (!response.data) {
        throw new Error('Failed to update quotation status');
      }
      return response.data;
    } catch (error) {
      console.error(`Failed to update quotation status ${id}:`, error);
      throw error;
    }
  }

  // Process customer response (approve/reject)
  async processCustomerResponse(id: string, action: 'approve' | 'reject'): Promise<QuotationDto> {
    try {
      const response = await apiClient.put<QuotationDto>(`${this.baseUrl}/${id}/customer-response`, { action });
      if (!response.data) {
        throw new Error('Failed to process customer response');
      }
      return response.data;
    } catch (error) {
      console.error(`Failed to process customer response for quotation ${id}:`, error);
      throw error;
    }
  }

  // Delete quotation
  async deleteQuotation(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error(`Failed to delete quotation ${id}:`, error);
      throw error;
    }
  }

  // Convert inspection to quotation
  async convertInspectionToQuotation(inspectionId: string, note?: string): Promise<QuotationDto> {
    try {
      const response = await apiClient.post<QuotationDto>('/Inspection/convert-to-quotation', {
        inspectionId,
        note: note || undefined
      });
      if (!response.data) {
        throw new Error('Failed to convert inspection to quotation');
      }
      return response.data;
    } catch (error: any) {
      console.error(`Failed to convert inspection ${inspectionId} to quotation:`, error);
      
      // Extract error message from API response
      let errorMessage = 'Failed to convert inspection to quotation';
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      throw new Error(errorMessage);
    }
  }

  // Copy quotation to jobs
  async copyQuotationToJobs(id: string): Promise<void> {
    try {
      await apiClient.post(`${this.baseUrl}/${id}/copy-to-jobs`);
    } catch (error: any) {
      console.error(`Failed to copy quotation ${id} to jobs:`, error);
      
      // Extract error message from API response
      let errorMessage = 'Failed to copy quotation to jobs';
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      // Throw a new error with the extracted message
      throw new Error(errorMessage);
    }
  }
  
  // Get quotation details (full info with services and parts)
  async getQuotationDetails(id: string): Promise<QuotationDto> {
    try {
      const response = await apiClient.get<QuotationDto>(`${this.baseUrl}/${id}/details`);
      if (!response.data) {
        throw new Error('Quotation details not found');
      }
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch quotation details for ${id}:`, error);
      throw error;
    }
  }
}

export const quotationService = new QuotationService();