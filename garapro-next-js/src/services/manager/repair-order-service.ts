import { apiClient } from "./api-client"
import type { RepairOrder, CreateRepairOrderRequest, UpdateRepairOrderRequest, RepairOrderApiResponse, UpdateRepairOrderStatusRequest, CancelRepairOrderDto, ArchiveRepairOrderDto, CustomerVehicleInfo } from "@/types/manager/repair-order"
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
        const mappedOrders = response.data.map(mapApiToRepairOrder);
        // Log progress info for debugging
        mappedOrders.forEach(order => {
          console.log(`RO ${order.repairOrderId.substring(0, 4)}: Progress=${order.progressPercentage}%, Jobs=${order.completedJobs}/${order.totalJobs}`);
        });
        return mappedOrders;
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
      // First, try to get basic info to check if archived
      const response = await apiClient.get<any>(`${this.baseUrl}/${id}`)
      const data = response.data
      
      if (!data) return null
      
      // If archived, use the dedicated archived endpoint for complete details
      if (data.isArchived) {
        try {
          const archivedResponse = await apiClient.get<any>(`${this.baseUrl}/archived/${id}`)
          const archivedData = archivedResponse.data
          
          if (archivedData) {
            // Map archived response to RepairOrder format
            return {
              repairOrderId: archivedData.repairOrderId,
              receiveDate: archivedData.receiveDate,
              roType: archivedData.roType,
              roTypeName: archivedData.roTypeName,
              estimatedCompletionDate: archivedData.estimatedCompletionDate,
              completionDate: archivedData.completionDate,
              cost: archivedData.cost,
              estimatedAmount: archivedData.estimatedAmount,
              paidAmount: archivedData.paidAmount,
              paidStatus: archivedData.paidStatus === 0 ? "Unpaid" as any : "Paid" as any,
              estimatedRepairTime: archivedData.estimatedRepairTime || 0,
              note: archivedData.note || archivedData.archiveReason || "",
              createdAt: archivedData.createdAt,
              updatedAt: archivedData.updatedAt,
              isArchived: archivedData.isArchived,
              archivedAt: archivedData.archivedAt,
              archivedByUserId: archivedData.archivedByUserId,
              branchId: archivedData.branchId || "",
              statusId: archivedData.statusId?.toString() || "3",
              vehicleId: archivedData.vehicle?.vehicleId || "",
              userId: archivedData.userId || "",
              repairRequestId: archivedData.repairRequestId || "",
              customerName: archivedData.customerName,
              customerPhone: archivedData.customerPhone,
              technicianNames: archivedData.technicianNames || [],
              totalJobs: archivedData.totalJobs || 0,
              completedJobs: archivedData.completedJobs || 0,
              progressPercentage: archivedData.progressPercentage || 100,
              isCancelled: archivedData.isCancelled || false,
              cancelReason: archivedData.cancelReason,
              cancelledAt: archivedData.cancelledAt,
              assignedLabels: archivedData.labels || archivedData.assignedLabels || [],
              inOdometer: archivedData.inOdometer,
              outOdometer: archivedData.outOdometer
            }
          }
        } catch (archivedError) {
          console.warn(`Failed to fetch from archived endpoint, falling back to regular data:`, archivedError)
          // Fall through to use regular data
        }
      }
      
      // Map the regular response to RepairOrder format
      const repairOrder: RepairOrder = {
        repairOrderId: data.repairOrderId,
        receiveDate: data.receiveDate,
        roType: data.roType,
        roTypeName: data.roTypeName,
        estimatedCompletionDate: data.estimatedCompletionDate,
        completionDate: data.completionDate,
        cost: data.cost,
        estimatedAmount: data.estimatedAmount,
        paidAmount: data.paidAmount,
        paidStatus: data.paidStatus === 0 ? "Unpaid" as any : "Paid" as any,
        estimatedRepairTime: data.estimatedRepairTime,
        note: data.note,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        isArchived: data.isArchived,
        archivedAt: data.archivedAt,
        archivedByUserId: data.archivedByUserId,
        branchId: data.branchId,
        statusId: data.statusId?.toString() || "1",
        vehicleId: data.vehicleId,
        userId: data.userId,
        repairRequestId: data.repairRequestId || "",
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        technicianNames: data.technicianNames || [],
        totalJobs: data.totalJobs || 0,
        completedJobs: data.completedJobs || 0,
        progressPercentage: data.progressPercentage || 0,
        isCancelled: data.isCancelled || false,
        cancelReason: data.cancelReason,
        cancelledAt: data.cancelledAt,
        assignedLabels: data.labels || data.assignedLabels || [],
        inOdometer: data.inOdometer,
        outOdometer: data.outOdometer
      }
      
      return repairOrder
    } catch (error) {
      console.error(`Failed to fetch repair order ${id}:`, error)
      return null
    }
  }

  /**
   * Fetch customer and vehicle information for repair order
   */
  async getCustomerVehicleInfo(id: string): Promise<CustomerVehicleInfo | null> {
    try {
      const response = await apiClient.get<CustomerVehicleInfo>(`${this.baseUrl}/${id}/customer-vehicle-info`)
      return response.data || null
    } catch (error) {
      console.error(`Failed to fetch customer and vehicle info for RO ${id}:`, error)
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

  /**
   * Fetch repair orders for list view with pagination
   */
  async getRepairOrdersListView(
    page: number = 1,
    pageSize: number = 50,
    sortBy: string = 'ReceiveDate',
    sortOrder: 'Asc' | 'Desc' = 'Desc'
  ): Promise<{ items: RepairOrder[], totalPages: number, totalCount: number, currentPage: number, pageSize: number }> {
    try {
      // Build query parameters
      const params = {
        page,
        pageSize,
        sortBy,
        sortOrder
      };

      // Call the list view endpoint
      const response = await apiClient.get<{ 
        items: RepairOrderApiResponse[], 
        pagination: { 
          totalPages: number, 
          totalCount: number, 
          currentPage: number, 
          pageSize: number 
        } 
      }>(`${this.baseUrl}/listview`, params);
      
      console.log("List view API response:", response);
      
      // Check if response has the expected structure
      if (response.data && response.data.items && Array.isArray(response.data.items)) {
        return {
          items: response.data.items.map(mapApiToRepairOrder),
          totalPages: response.data.pagination?.totalPages || 1,
          totalCount: response.data.pagination?.totalCount || response.data.items.length,
          currentPage: response.data.pagination?.currentPage || page,
          pageSize: response.data.pagination?.pageSize || pageSize
        };
      }
      
      // Fallback for unexpected structure
      console.warn("List view response has unexpected structure:", response.data);
      return {
        items: [],
        totalPages: 1,
        totalCount: 0,
        currentPage: page,
        pageSize: pageSize
      };
    } catch (error) {
      console.error("Failed to fetch repair orders list view:", error)
      return {
        items: [],
        totalPages: 1,
        totalCount: 0,
        currentPage: page,
        pageSize: pageSize
      };
    }
  }

  /**
   * Fetch all archived repair orders for a specific branch
   */
  async getArchivedRepairOrders(
    branchId?: string,
    page: number = 1,
    pageSize: number = 50,
    sortBy: string = 'ArchivedAt',
    sortOrder: 'Asc' | 'Desc' = 'Desc'
  ): Promise<RepairOrder[]> {
    try {
      // Get current user's branch if not provided
      let targetBranchId = branchId;
      if (!targetBranchId) {
        const currentUser = authService.getCurrentUser();
        const userId = currentUser.userId;
        
        if (userId) {
          const userBranch = await branchService.getCurrentUserBranch(userId);
          if (userBranch) {
            targetBranchId = userBranch.branchId;
          }
        }
      }

      if (!targetBranchId) {
        console.error("Unable to determine branch ID for archived repair orders");
        return [];
      }

      // Build query parameters
      const params = {
        branchId: targetBranchId,
        page,
        pageSize,
        sortBy,
        sortOrder
      };

      // The API returns a paginated response with structure: { items: [], pagination: {}, ... }
      const response = await apiClient.get<{ items: RepairOrderApiResponse[] }>(`${this.baseUrl}/archived`, params);
      console.log("Archived repair orders API response:", response);
      
      // Check if response.data.items exists and is an array
      if (response.data && response.data.items && Array.isArray(response.data.items)) {
        return response.data.items.map(mapApiToRepairOrder);
      }
      
      // Fallback: check if response.data itself is an array (for backward compatibility)
      if (response.data && Array.isArray(response.data)) {
        return response.data.map(mapApiToRepairOrder);
      }
      
      // If neither structure matches, log warning and return empty array
      console.warn("Archived repair orders response has unexpected structure:", response.data);
      return [];
    } catch (error) {
      console.error("Failed to fetch archived repair orders:", error)
      return []
    }
  }
}

export const repairOrderService = new RepairOrderService()