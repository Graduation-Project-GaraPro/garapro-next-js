import { apiClient } from "./api-client"
import type { RepairOrder, CreateRepairOrderRequest, UpdateRepairOrderRequest, RepairOrderApiResponse, UpdateRepairOrderStatusRequest, CancelRepairOrderDto, ArchiveRepairOrderDto } from "@/types/manager/repair-order"
import type { OrderStatus, OrderStatusResponse } from "@/types/manager/order-status"
import { authService } from "@/services/authService"
import { branchService } from "@/services/branch-service"
import { mapApiToRepairOrder } from "@/types/manager/repair-order"

class RepairOrderService {
  private baseUrl = "/RepairOrder"
  private orderStatusBaseUrl = "/OrderStatus"

  /**
   * Fetch all repair orders for the current user's branch
   */
  async getAllRepairOrders(): Promise<RepairOrder[]> {
    try {
      // Get current user ID
      const currentUser = authService.getCurrentUser();
      const userId = currentUser.userId;
      
      if (!userId) {
        console.error("User not authenticated");
        return [];
      }
      
      // Get the user's branch
      const userBranch = await branchService.getCurrentUserBranch(userId);
      console.log("User branch:", userBranch);
      if (!userBranch) {
        console.error("Unable to determine user's branch");
        return [];
      }
      
      // Call the branch-specific endpoint with the actual branch ID
      const response = await apiClient.get<RepairOrderApiResponse[]>(`${this.baseUrl}/branch/${userBranch.branchId}`)
      console.log("Repair orders API response:", response);
      
      // Map API response to RepairOrder interface
      if (response.data) {
        return response.data.map(mapApiToRepairOrder);
      }
      
      return [];
    } catch (error) {
      console.error("Failed to fetch repair orders:", error)
      return []
    }
  }

  /**
   * Fetch repair order by ID
   */
  async getRepairOrderById(id: string): Promise<RepairOrder | null> {
    try {
      const response = await apiClient.get<RepairOrder>(`${this.baseUrl}/${id}`)
      return response.data || null
    } catch (error) {
      console.error(`Failed to fetch repair order ${id}:`, error)
      return null
    }
  }

  /**
   * Create a new repair order
   */
  async createRepairOrder(repairOrder: CreateRepairOrderRequest): Promise<RepairOrder | null> {
    try {
      console.log('Sending repair order data:', JSON.stringify(repairOrder, null, 2));
      const response = await apiClient.post<RepairOrder>(this.baseUrl, repairOrder);
      console.log('Repair order API response:', response);
      return response.data || null;
    } catch (error) {
      console.error('Failed to create repair order - Error details:', error);
      
      // Try to get more details about the error response
      if (error && typeof error === 'object') {
        if ('status' in error) {
          console.error('Error status:', error.status);
        }
        if ('message' in error) {
          console.error('Error message:', error.message);
        }
        // Log the full error object for debugging
        console.error('Full error object:', JSON.stringify(error, null, 2));
      }
      
      // Re-throw the error with more details
      if (error instanceof Error) {
        throw new Error(`Failed to create repair order: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Update an existing repair order
   */
  async updateRepairOrder(repairOrder: UpdateRepairOrderRequest): Promise<RepairOrder | null> {
    try {
      const response = await apiClient.put<RepairOrder>(`${this.baseUrl}/${repairOrder.repairOrderId}`, repairOrder)
      return response.data || null
    } catch (error) {
      console.error(`Failed to update repair order ${repairOrder.repairOrderId}:`, error)
      return null
    }
  }

  /**
   * Update repair order status, note, and services (simplified PUT endpoint)
   */
  async updateRepairOrderStatus(id: string, updateData: UpdateRepairOrderStatusRequest): Promise<RepairOrder | null> {
    try {
      const response = await apiClient.put<RepairOrder>(`${this.baseUrl}/${id}`, updateData)
      return response.data || null
    } catch (error) {
      console.error(`Failed to update repair order status ${id}:`, error)
      throw error
    }
  }

  /**
   * Delete a repair order
   */
  async deleteRepairOrder(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`${this.baseUrl}/${id}`)
      return true
    } catch (error) {
      console.error(`Failed to delete repair order ${id}:`, error)
      return false
    }
  }

  /**
   * Fetch repair orders by status
   */
  async getRepairOrdersByStatus(statusId: string): Promise<RepairOrder[]> {
    try {
      const response = await apiClient.get<RepairOrder[]>(`${this.baseUrl}/status/${statusId}`)
      return response.data || []
    } catch (error) {
      console.error(`Failed to fetch repair orders for status ${statusId}:`, error)
      return []
    }
  }

  /**
   * Fetch order statuses for the kanban board
   */
  async fetchOrderStatuses(): Promise<OrderStatus[]> {
    try {
      const response = await apiClient.get<OrderStatusResponse>(`${this.orderStatusBaseUrl}/columns`)
      
      // Check if response data exists
      if (!response.data) {
        return []
      }
      
      // Flatten the response structure to get all statuses in one array
      const statuses: OrderStatus[] = [
        ...(response.data.pending || []),
        ...(response.data.inProgress || []),
        ...(response.data.completed || [])
      ]
      
      return statuses
    } catch (error) {
      console.error("Failed to fetch order statuses:", error)
      // Return empty array as fallback
      return []
    }
  }

  /**
   * Cancel a repair order
   */
  async cancelRepairOrder(cancelData: CancelRepairOrderDto): Promise<boolean> {
    try {
      await apiClient.post(`${this.baseUrl}/cancel`, cancelData)
      return true
    } catch (error) {
      console.error(`Failed to cancel repair order ${cancelData.repairOrderId}:`, error)
      throw error
    }
  }

  /**
   * Archive a repair order
   */
  async archiveRepairOrder(archiveData: ArchiveRepairOrderDto): Promise<boolean> {
    try {
      await apiClient.post(`${this.baseUrl}/archive`, archiveData)
      return true
    } catch (error) {
      console.error(`Failed to archive repair order ${archiveData.repairOrderId}:`, error)
      throw error
    }
  }
}

export const repairOrderService = new RepairOrderService()