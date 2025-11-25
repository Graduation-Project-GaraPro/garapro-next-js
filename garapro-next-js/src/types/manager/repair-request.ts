export interface RequestPart {
  requestPartId: string;
  partId: string;
  partName: string;
  unitPrice: number;
}

export interface RequestService {
  requestServiceId: string;
  serviceId: string;
  serviceName: string;
  serviceFee: number;
  requestParts: RequestPart[];
}

export interface ManagerRepairRequestDto {
  requestID: string;
  vehicleID: string;
  customerID: string;
  customerName: string;
  vehicleInfo: string;
  description: string;
  requestDate: string;
  arrivalWindowStart?: string;
  completedDate: string | null;
  isCompleted?: boolean;
  imageUrls: string[];
  services: RequestService[];
  parts?: RequestPart[] | null;
  createdAt: string;
  updatedAt: string;
}

// Extended interface with computed display properties for calendar
export interface ManagerRepairRequest extends ManagerRepairRequestDto {
  // Computed properties for display
  time?: string; // Extracted from arrivalWindowStart or requestDate (HH:MM format)
  date?: string; // Extracted from arrivalWindowStart or requestDate (YYYY-MM-DD format)
  status?: "pending" | "completed" | "cancelled" | "in-progress" | "confirmed" | "accept";
  displayService?: string; // Service name(s) for display
  estimatedCost?: number; // Calculated from services and parts
}