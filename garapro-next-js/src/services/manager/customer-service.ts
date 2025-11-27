import { apiClient } from './api-client';
import type { Customer, CreateCustomerDto } from '@/types/manager/customer';

class CustomerService {
  private readonly baseUrl = '/Customer';

  async getAllCustomers(): Promise<Customer[]> {
    try {
      const response = await apiClient.get<Customer[]>(this.baseUrl);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      // Return empty array on error to prevent app crash
      return [];
    }
  }

  async searchCustomers(searchTerm: string): Promise<Customer[]> {
    try {
      const response = await apiClient.get<Customer[]>(`${this.baseUrl}?search=${encodeURIComponent(searchTerm)}`);
      return response.data;
    } catch (error) {
      console.error('Failed to search customers:', error);
      // Return empty array on error to prevent app crash
      return [];
    }
  }

  async getCustomerById(id: string): Promise<Customer> {
    try {
      const response = await apiClient.get<Customer>(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch customer with id ${id}:`, error);
      // Throw error to let caller handle it appropriately
      throw error;
    }
  }

  async createCustomer(customerData: CreateCustomerDto): Promise<Customer> {
    try {
      console.log('Sending customer data:', JSON.stringify(customerData, null, 2));
      const response = await apiClient.post<Customer>(this.baseUrl, customerData);
      console.log('Customer API response:', response);
      return response.data;
    } catch (error) {
      console.error('Failed to create customer - Error details:', error);
      
      // Try to get more details about the error response
      if (error && typeof error === 'object') {
        if ('status' in error) {
          console.error('Error status:', error.status);
        }
        if ('message' in error) {
          console.error('Error message:', error.message);
        }
      }
      
      // Re-throw the error with more details
      if (error instanceof Error) {
        throw new Error(`Failed to create customer: ${error.message}`);
      }
      throw error;
    }
  }
}

export const customerService = new CustomerService();