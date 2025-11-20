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
  serviceId: string;
  serviceName: string;
  description: string;
  price: number;
  estimatedDuration: number;
  parts: InspectionPartDto[];
}

export interface InspectionPartDto {
  partId: string;
  name: string;
  price: number;
  quantity: number;
  totalPrice: number;
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
