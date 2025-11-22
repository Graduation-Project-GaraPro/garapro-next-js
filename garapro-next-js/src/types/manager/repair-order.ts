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
  serviceIds?: string[] // Optional array of service IDs
}

// Add the PaidStatus enum
export enum PaidStatus {
  Unpaid = "Unpaid",
  Partial = "Partial",
  Paid = "Paid"
}

// Interface for assigned labels
interface AssignedLabel {
  id?: string
  name?: string
  color?: string
  // Add other potential properties as needed
}

// API Response structure for repair orders
export interface RepairOrderApiResponse {
  repairOrderId: string
  repairOrderType: string | null
  receiveDate: string
  estimatedCompletionDate: string | null
  completionDate: string | null
  cost: number
  estimatedAmount: number
  paidAmount: number
  paidStatus: number
  estimatedRepairTime: number
  note: string
  createdAt: string
  updatedAt: string | null
  isArchived: boolean
  archivedAt: string | null
  archiveReason: string | null
  archivedBy: string | null
  statusId: number
  statusName: string
  vehicle: {
    vehicleId: string
    licensePlate: string
    vin: string
    brandName: string
    modelName: string
    colorName: string
  }
  customer: {
    userId: string
    firstName: string | null
    lastName: string | null
    birthday: string | null
    fullName: string
    email: string
    phoneNumber: string
  }
  branch: {
    branchId: string
    branchName: string
    address: string | null
    phoneNumber: string
  }
  assignedLabels: AssignedLabel[]
  orderIndex: number
  isOverdue: boolean
  completionPercentage: number
  daysInCurrentStatus: number
  isVehiclePickedUp: boolean
  vehiclePickupDate: string | null
  isFullyPaid: boolean
  fullPaymentDate: string | null
  canBeArchived: boolean
  completionSubStatus: string
}

// Function to map API response to RepairOrder interface
export function mapApiToRepairOrder(apiResponse: RepairOrderApiResponse): RepairOrder {
  console.log("Mapping API response to RepairOrder:", apiResponse);
  
  const mappedOrder: RepairOrder = {
    repairOrderId: apiResponse.repairOrderId,
    receiveDate: apiResponse.receiveDate,
    roType: 0, // Default value as API doesn't provide this
    roTypeName: apiResponse.statusName,
    estimatedCompletionDate: apiResponse.estimatedCompletionDate,
    completionDate: apiResponse.completionDate,
    cost: apiResponse.cost,
    estimatedAmount: apiResponse.estimatedAmount,
    paidAmount: apiResponse.paidAmount,
    paidStatus: apiResponse.paidStatus === 0 ? PaidStatus.Unpaid : 
                apiResponse.paidStatus === 1 ? PaidStatus.Partial : PaidStatus.Paid,
    estimatedRepairTime: apiResponse.estimatedRepairTime,
    note: apiResponse.note,
    createdAt: apiResponse.createdAt,
    updatedAt: apiResponse.updatedAt,
    isArchived: apiResponse.isArchived,
    archivedAt: apiResponse.archivedAt,
    archivedByUserId: apiResponse.archivedBy,
    branchId: apiResponse.branch.branchId,
    statusId: apiResponse.statusId.toString(),
    vehicleId: apiResponse.vehicle.vehicleId,
    userId: apiResponse.customer.userId,
    repairRequestId: "", // Default value as API doesn't provide this
    customerName: apiResponse.customer.fullName || `${apiResponse.customer.firstName || ''} ${apiResponse.customer.lastName || ''}`.trim() || apiResponse.customer.email,
    customerPhone: apiResponse.customer.phoneNumber,
    technicianNames: [], // Default value as API doesn't provide this
    totalJobs: 0, // Default value as API doesn't provide this
    completedJobs: 0, // Default value as API doesn't provide this
    progressPercentage: apiResponse.completionPercentage
  };
  
  console.log("Mapped repair order:", mappedOrder);
  return mappedOrder;
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

// New interface for the simplified PUT endpoint
export interface UpdateRepairOrderStatusRequest {
  statusId: number
  note?: string
  selectedServiceIds: string[]
  updatedAt?: string
}