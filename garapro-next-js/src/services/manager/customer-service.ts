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
    const response = await apiClient.post<Customer>(this.baseUrl, customerData);
    
    // The API client returns { data, status, success }
    // Check if we have data or if the response itself is the customer object
    if (response.data) {
      return response.data;
    }
    
    // Some APIs return the data directly in the response
    if (response && 'userId' in response) {
      return response as unknown as Customer;
    }
    
    throw new Error('No data returned from API');
  }

  async quickCreateCustomer(customerData: { 
    firstName: string; 
    lastName: string; 
    phoneNumber: string;
    email?: string;
  }): Promise<Customer> {
    const response = await apiClient.post<Customer>(`${this.baseUrl}/quick`, customerData);
    
    // The API client returns { data, status, success }
    // Check if we have data or if the response itself is the customer object
    if (response.data) {
      return response.data;
    }
    
    // Some APIs return the data directly in the response
    if (response && 'userId' in response) {
      return response as unknown as Customer;
    }
    
    throw new Error('No data returned from API');
  }
}

export const customerService = new CustomerService();