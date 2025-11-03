export interface RepairOrder {
  repairOrderId: string
  receiveDate: string
  roType: number
  roTypeName: string
  estimatedCompletionDate: string | null
  completionDate: string | null
  cost: number
  estimatedAmount: number
  paidAmount: number
  paidStatus: PaidStatus
  estimatedRepairTime: number
  note: string
  createdAt: string
  updatedAt: string | null
  isArchived: boolean
  archivedAt: string | null
  archivedByUserId: string | null
  branchId: string
  statusId: string
  vehicleId: string
  userId: string
  repairRequestId: string
  customerName: string
  customerPhone: string
  technicianNames: string[]
  totalJobs: number
  completedJobs: number
  progressPercentage: number
}

// Add the PaidStatus enum
export enum PaidStatus {
  Unpaid = "Unpaid",
  Partial = "Partial",
  Paid = "Paid"
}

export interface CreateRepairOrderRequest {
  customerId: string
  vehicleId: string
  receiveDate: string
  roType: number
  estimatedCompletionDate: string
  note: string
  // Make these optional since they'll be calculated from services
  estimatedAmount?: number
  estimatedRepairTime?: number
  // Add selected service IDs
  selectedServiceIds?: string[]
}

export interface UpdateRepairOrderRequest extends Partial<CreateRepairOrderRequest> {
  repairOrderId: string
}