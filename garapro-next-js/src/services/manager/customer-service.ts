import { apiClient } from './api-client';
import type { Customer, CreateCustomerDto } from '@/types/manager/customer';

class CustomerService {
  private readonly baseUrl = '/Customer';

  async getAllCustomers(): Promise<Customer[]> {
    try {
      const response = await apiClient.get<Customer[]>(this.baseUrl);
      return response.data ?? [];
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      return [];
    }
  }

  async searchCustomers(searchTerm: string): Promise<Customer[]> {
    try {
      const response = await apiClient.get<Customer[]>(`${this.baseUrl}?search=${encodeURIComponent(searchTerm)}`);
      return response.data ?? [];
    } catch (error) {
      console.error('Failed to search customers:', error);
      return [];
    }
  }

  async getCustomerById(id: string): Promise<Customer> {
    try {
      const response = await apiClient.get<Customer>(`${this.baseUrl}/${id}`);
      if (!response.data) {
        throw new Error('No customer data returned from API');
      }
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch customer with id ${id}:`, error);
      throw error;
    }
  }

  async createCustomer(customerData: CreateCustomerDto): Promise<Customer> {
    const response = await apiClient.post<Customer>(this.baseUrl, customerData);
    
    if (response.data) {
      return response.data;
    }
    
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

    if (response.data) {
      return response.data;
    }
    
    if (response && 'userId' in response) {
      return response as unknown as Customer;
    }
    
    throw new Error('No data returned from API');
  }
}

export const customerService = new CustomerService();