import { apiClient } from "./api-client";
import { authService } from "@/services/authService";
import { branchService } from "@/services/branch-service";
import type { ManagerRepairRequestDto, ManagerRepairRequest } from "@/types/manager/repair-request";
import type { RepairRequestFilter } from "@/types/manager/appointment";

// Re-export for backward compatibility
export type { RepairRequestFilter }

// Helper function to add display properties to repair request
const enrichRepairRequest = (request: ManagerRepairRequestDto): ManagerRepairRequest => {
  // Always use requestDate for display
  const timeSource = request.requestDate
  const dateSource = request.requestDate
  
  console.log(`[enrichRepairRequest] Request ID: ${request.requestID}`)
  console.log(`[enrichRepairRequest] requestDate: ${request.requestDate}`)
  console.log(`[enrichRepairRequest] Using timeSource: ${timeSource}`)
  
  // Extract date FIRST from the string before timezone conversion (to avoid timezone offset issues)
  // This ensures we get the date as it appears in the ISO string, not converted to local timezone
  const dateString = dateSource.split('T')[0]
  console.log(`[enrichRepairRequest] Extracted date string (before conversion): ${dateString}`)
  
  // Extract time from timeSource (ISO format: "2025-11-14T10:30:00" or "2025-11-14T10:30:00+00:00")
  // Parse the date string to get UTC time components directly
  // For strings like "2025-11-15T09:30:00+00:00", extract time directly from the string
  let timeString: string
  let timeDate: Date
  
  // Extract time directly from the ISO string to avoid timezone conversion
  const timeMatch = timeSource.match(/T(\d{2}):(\d{2}):(\d{2})/)
  if (timeMatch) {
    // Extract hours and minutes directly from the string (UTC time)
    const hours = parseInt(timeMatch[1], 10)
    const minutes = parseInt(timeMatch[2], 10)
    timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
    console.log(`[enrichRepairRequest] Extracted time directly from string: ${timeString}`)
    
    // Create date object for validation (but we already have the time from string)
    timeDate = new Date(timeSource)
  } else {
    // Fallback: parse as date if pattern doesn't match
    timeDate = new Date(timeSource)
    if (isNaN(timeDate.getTime())) {
      // If parsing fails, try adding Z for UTC
      timeDate = new Date(timeSource + 'Z')
    }
    const hours = timeDate.getUTCHours()
    const minutes = timeDate.getUTCMinutes()
    timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  }
  
  // Validate the date (timeString should already be set from above)
  if (isNaN(timeDate.getTime())) {
    console.warn(`[enrichRepairRequest] Invalid date for timeSource: ${timeSource}, falling back to requestDate`)
    const fallbackTimeMatch = request.requestDate.match(/T(\d{2}):(\d{2}):(\d{2})/)
    let fallbackTimeString: string
    const fallbackDateString = request.requestDate.split('T')[0]
    
    if (fallbackTimeMatch) {
      const hours = parseInt(fallbackTimeMatch[1], 10)
      const minutes = parseInt(fallbackTimeMatch[2], 10)
      fallbackTimeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
    } else {
      const fallbackDate = new Date(request.requestDate)
      const hours = fallbackDate.getUTCHours()
      const minutes = fallbackDate.getUTCMinutes()
      fallbackTimeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
    }
    
    console.log(`[enrichRepairRequest] Using fallback - time: ${fallbackTimeString}, date: ${fallbackDateString}`)
    
    // Calculate status and other properties for fallback
    // Use the status from the API if it exists, otherwise use the old logic
    let status: "pending" | "completed" | "cancelled" | "in-progress" | "confirmed" | "accept" | undefined = "pending"
    if ('status' in request && request.status) {
      // Normalize the status to lowercase and map to our expected values
      const apiStatus = (request.status as string).toLowerCase()
      switch (apiStatus) {
        case "completed":
          status = "completed"
          break
        case "cancelled":
        case "cancel":
          status = "cancelled"
          break
        case "in-progress":
        case "inprogress":
          status = "in-progress"
          break
        case "confirmed":
          status = "confirmed"
          break
        case "accept":
        case "accepted":
          status = "accept"
          break
        case "pending":
        default:
          status = "pending"
          break
      }
    } else {
      // Old logic for determining status
      if (request.isCompleted || request.completedDate) {
        status = "completed"
      } else if (request.description?.toLowerCase().includes("cancelled") || 
                 request.description?.toLowerCase().includes("cancel")) {
        status = "cancelled"
      }
    }
    
    const serviceName = request.services && request.services.length > 0
      ? request.services.map(s => s.serviceName).join(", ")
      : request.description || "Repair Service"
    
    const estimatedCost = request.services?.reduce((total, service) => {
      const partsCost = service.requestParts?.reduce((sum, part) => sum + part.unitPrice, 0) || 0
      return total + service.serviceFee + partsCost
    }, 0) || 0
    
    return {
      ...request,
      time: fallbackTimeString,
      date: fallbackDateString,
      status: status,
      displayService: serviceName,
      estimatedCost: estimatedCost,
    }
  }
  
  console.log(`[enrichRepairRequest] Final - time: ${timeString}, date: ${dateString}`)
  
  // Determine status based on API status field if it exists, otherwise use old logic
  let status: "pending" | "completed" | "cancelled" | "in-progress" | "confirmed" | "accept" | undefined = undefined
  if ('status' in request && request.status) {
    // Normalize the status to lowercase and map to our expected values
    const apiStatus = (request.status as string).toLowerCase()
    switch (apiStatus) {
      case "completed":
        status = "completed"
        break
      case "cancelled":
      case "cancel":
        status = "cancelled"
        break
      case "in-progress":
      case "inprogress":
        status = "in-progress"
        break
      case "confirmed":
        status = "confirmed"
        break
      case "accept":
      case "accepted":
        status = "accept"
        break
      case "pending":
      default:
        status = "pending"
        break
    }
  } else {
    // Old logic for determining status
    if (request.isCompleted || request.completedDate) {
      status = "completed"
    } else if (request.description?.toLowerCase().includes("cancelled") || 
               request.description?.toLowerCase().includes("cancel")) {
      status = "cancelled"
    } else {
      // Default to pending if no other conditions are met
      status = "pending"
    }
  }
  
  // Get service name from services array or use description
  const serviceName = request.services && request.services.length > 0
    ? request.services.map(s => s.serviceName).join(", ")
    : request.description || "Repair Service"
  
  // Calculate estimated cost from services
  const estimatedCost = request.services?.reduce((total, service) => {
    const partsCost = service.requestParts?.reduce((sum, part) => sum + part.unitPrice, 0) || 0
    return total + service.serviceFee + partsCost
  }, 0) || 0

  return {
    ...request,
    time: timeString,
    date: dateString,
    status: status,
    displayService: serviceName,
    estimatedCost: estimatedCost,
  }
}

class RepairRequestService {
  private baseUrl = "/ManagerRepairRequest"

  /** 
   * Fetch all repair requests for the current user's branch
   */
  private async getRepairRequestsByBranch(): Promise<ManagerRepairRequestDto[]> {
    try {
      // Get current user ID
      const currentUser = authService.getCurrentUser()
      const userId = currentUser.userId
      
      if (!userId) {
        console.error("User not authenticated")
        return []
      }
      
      // Get the user's branch
      const userBranch = await branchService.getCurrentUserBranch(userId)
      console.log("User branch:", userBranch)
      if (!userBranch) {
        console.error("Unable to determine user's branch")
        return []
      }
      
      // Call the branch-specific endpoint
      const endpoint = `${this.baseUrl}/branch/${userBranch.branchId}`
      console.log("[RepairRequestService] Calling API endpoint:", endpoint)
      const response = await apiClient.get<ManagerRepairRequestDto[]>(endpoint)
      console.log("[RepairRequestService] API response:", response)
      console.log("[RepairRequestService] Response type:", typeof response)
      console.log("[RepairRequestService] Response.data:", response.data)
      console.log("[RepairRequestService] Is response.data an array?", Array.isArray(response.data))
      
      // The API returns an array directly, but apiClient wraps it in response.data
      if (Array.isArray(response.data)) {
        console.log("[RepairRequestService] Returning response.data array with", response.data.length, "items")
        return response.data
      }
      
      // Handle edge cases - sometimes API might return array directly
      if (Array.isArray(response)) {
        console.log("[RepairRequestService] Response itself is an array with", response.length, "items")
        return response as ManagerRepairRequestDto[]
      }
      
      // Check if response has a different structure
      if (response && typeof response === 'object' && !Array.isArray(response)) {
        console.log("[RepairRequestService] Response keys:", Object.keys(response))
        // Some APIs might wrap in a different property
        if ('data' in response && response.data && typeof response.data === 'object') {
          const dataObj = response.data as Record<string, unknown>
          if ('items' in dataObj && Array.isArray(dataObj.items)) {
            console.log("[RepairRequestService] Found items array")
            return dataObj.items as ManagerRepairRequestDto[]
          }
          if ('results' in dataObj && Array.isArray(dataObj.results)) {
            console.log("[RepairRequestService] Found results array")
            return dataObj.results as ManagerRepairRequestDto[]
          }
        }
      }

      console.warn("[RepairRequestService] No valid array found in response, returning empty array")
      return []
    } catch (error) {
      console.error("[RepairRequestService] Failed to fetch repair requests:", error)
      if (error instanceof Error) {
        console.error("[RepairRequestService] Error message:", error.message)
        console.error("[RepairRequestService] Error stack:", error.stack)
      } else {
        console.error("[RepairRequestService] Error object:", JSON.stringify(error, null, 2))
      }
      return []
    }
  }

  // Get all repair requests from API with optional filtering
  async getRepairRequests(filter?: RepairRequestFilter): Promise<ManagerRepairRequest[]> {
    try {
      console.log("[RepairRequestService] Fetching repair requests...")
      // Fetch repair requests from API
      const repairRequests = await this.getRepairRequestsByBranch()
      console.log("[RepairRequestService] Raw repair requests:", repairRequests)
      console.log("[RepairRequestService] Number of repair requests:", repairRequests.length)
      
      // Enrich with display properties
      let enrichedRequests = repairRequests.map(enrichRepairRequest)
      console.log("[RepairRequestService] Enriched repair requests:", enrichedRequests)
      console.log("[RepairRequestService] Number of enriched requests:", enrichedRequests.length)
      
      // Apply filters if provided
    if (filter) {
      if (filter.status) {
          enrichedRequests = enrichedRequests.filter(
            req => req.status === filter.status
          )
      }
      if (filter.service) {
          enrichedRequests = enrichedRequests.filter(
            req => req.displayService?.toLowerCase().includes(filter.service!.toLowerCase())
          )
      }
      if (filter.dateRange) {
          enrichedRequests = enrichedRequests.filter(req => {
            if (!req.date) return false
            const reqDate = new Date(req.date)
            return reqDate >= filter.dateRange!.start && reqDate <= filter.dateRange!.end
          })
        }
      }
      
      console.log("[RepairRequestService] Returning", enrichedRequests.length, "repair requests")
      return enrichedRequests
    } catch (error) {
      console.error("[RepairRequestService] Failed to fetch repair requests:", error)
      if (error instanceof Error) {
        console.error("[RepairRequestService] Error message:", error.message)
        console.error("[RepairRequestService] Error stack:", error.stack)
      }
      return []
    }
  }

  // Get repair requests for a specific date
  async getRepairRequestsByDate(date: string): Promise<ManagerRepairRequest[]> {
    const allRequests = await this.getRepairRequests()
    return allRequests.filter(req => req.date === date)
  }

  // Get a specific repair request by ID (enriched with display properties)
  async getRepairRequestById(id: string): Promise<ManagerRepairRequest | null> {
    try {
      const response = await apiClient.get<ManagerRepairRequestDto>(`${this.baseUrl}/${id}`)
      if (response.data) {
        return enrichRepairRequest(response.data)
      }
      return null
    } catch (error) {
      console.error(`Failed to fetch repair request ${id}:`, error)
      return null
    }
  }

  // Cancel a repair request on behalf of customer
  async cancelRepairRequest(requestId: string): Promise<boolean> {
    try {
      const endpoint = `${this.baseUrl}/${requestId}/cancel-on-behalf`;
      const response = await apiClient.post(endpoint);
      return response.success;
    } catch (error) {
      console.error(`Failed to cancel repair request ${requestId}:`, error);
      return false;
    }
  }

  // Convert repair request to repair order
  async convertToRepairOrder(requestId: string, data: {
    note: string;
    selectedServiceIds: string[];
  }): Promise<boolean> {
    try {
      const endpoint = `${this.baseUrl}/${requestId}/convert-to-ro`;
      const response = await apiClient.post(endpoint, data);
      return response.success;
    } catch (error) {
      console.error(`Failed to convert repair request ${requestId} to repair order:`, error);
      return false;
    }
  }
}

export const repairRequestService = new RepairRequestService()
// Keep old export name for backward compatibility
export const managerAppointmentService = repairRequestService