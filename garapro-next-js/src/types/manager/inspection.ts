// Inspection interface based on the API response
export interface InspectionDto {
  inspectionId: string;
  repairOrderId: string;
  technicianId: string | null;
  status: string;
  customerConcern: string | null;
  finding: string | null;
  issueRating: number;
  note: string | null;
  inspectionPrice: number;
  inspectionType: number;
  createdAt: string;
  updatedAt: string | null;
  technicianName: string | null;
  services: InspectionServiceDto[];
}

export interface InspectionServiceDto {
  serviceInspectionId: string;
  serviceId: string;
  serviceName: string;
  conditionStatus: number; // 0 = Good, 1 = Needs_Attention, 2 = Replace
  createdAt: string;
  description?: string; // Optional - may not be in API response
  price?: number; // Optional - may not be in API response
  estimatedDuration?: number; // Optional - may not be in API response
  parts: InspectionPartDto[];
}

// Condition Status enum
export enum ConditionStatus {
  Good = 0,
  Needs_Attention = 1,
  Replace = 2
}

export interface InspectionPartDto {
  partInspectionId: string;
  partId: string;
  partName: string;
  quantity: number;
  status: string | null;
  createdAt: string;
  name?: string; // Alias for partName
  price?: number; // Optional - may not be in API response
  totalPrice?: number; // Optional - may not be in API response
}

// Request interface for creating an inspection
export interface CreateInspectionRequest {
  repairOrderId: string;
  customerConcern: string;
}

// Inspection status enum to match the backend
export enum InspectionStatus {
  New = 0,
  Pending = 1,
  InProgress = 2,
  Completed = 3,
  Cancelled = 4
}
