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
  paidStatus: string
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

export interface CreateRepairOrderRequest {
  customerId: string
  vehicleId: string
  receiveDate: string
  roType: number
  estimatedCompletionDate: string
  estimatedAmount: number
  note: string
  estimatedRepairTime: number
}

export interface UpdateRepairOrderRequest extends Partial<CreateRepairOrderRequest> {
  repairOrderId: string
}