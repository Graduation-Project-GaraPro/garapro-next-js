export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface CreateOrderRequest {
  customerName: string
  deviceType: string
  issue: string
  priority: "low" | "medium" | "high"
  estimatedDelivery: string
  assignedTechnician?: string
}

export interface UpdateOrderRequest extends CreateOrderRequest {
  status: "waiting" | "in-progress" | "completed"
}

export interface OrderFilters {
  search?: string
  priority?: string
  status?: string
  technician?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
  page?: number
  limit?: number
}
