// src/types/manager/quotation.ts
export interface CreateQuotationDto {
  repairOrderId: string; // guid (from RepairOrder)
  userId: string; // required
  vehicleId: string; // guid (auto-filled from RO)
  inspectionId?: string | null; // guid (optional, can be null)
  note?: string;
  quotationServices: QuotationServiceCreateDto[];
}

export interface QuotationServiceCreateDto {
  serviceId: string; // guid (required)
  isSelected: boolean;
  isRequired: boolean; // Add isRequired property
  isGood?: boolean; // ✅ NEW - optional for creation
  quotationServiceParts: QuotationServicePartCreateDto[];
}

export interface QuotationServicePartCreateDto {
  partId: string; // guid (required)
  isSelected: boolean;
  isRecommended: boolean;
  recommendationNote?: string;
  quantity: number;
}

export interface QuotationDto {
  quotationId: string;
  inspectionId: string;
  repairOrderId: string;
  userId: string;
  vehicleId: string;
  createdAt: string; // datetime
  sentToCustomerAt: string | null;
  customerResponseAt: string | null;
  status: "Pending" | "Sent" | "Approved" | "Rejected" | "Expired" | "Good"; // ✅ Added "Good" status
  totalAmount: number; // decimal
  discountAmount: number; // decimal
  inspectionFee: number; // ✅ NEW - inspection fee for the entire quotation
  note?: string;
  customerNote?: string | null;
  expiresAt: string | null;
  customerName: string;
  vehicleInfo: string | null;
  jobsCreated: boolean; // ✅ NEW - flag to track if jobs were created from this quotation
  jobsCreatedAt: string | null; // ✅ NEW - timestamp when jobs were created
  quotationServices: QuotationServiceDto[];
  quotationServiceParts: unknown | null;
  inspection: unknown | null;
  repairOrder: unknown | null;
}

export interface QuotationServiceDto {
  quotationServiceId: string;
  quotationId: string;
  serviceId: string;
  isSelected: boolean;
  isRequired: boolean; // Add isRequired property
  isGood: boolean; // ✅ NEW - true = view only, no repair needed
  price: number; // decimal
  quantity: number;
  totalPrice: number;
  createdAt: string;
  discountValue: number;
  finalPrice: number;
  appliedPromotionId: string | null;
  appliedPromotion: unknown | null;
  serviceName: string;
  serviceDescription: string;
  parts: QuotationServicePartDto[]; // Changed from quotationServiceParts to parts to match API response
}

export interface QuotationServicePartDto {
  quotationServicePartId: string;
  quotationServiceId: string;
  partId: string;
  isSelected: boolean;
  isRecommended: boolean;
  recommendationNote: string | null;
  price: number; // decimal
  quantity: number; // decimal
  totalPrice: number;
  createdAt: string;
  partName: string;
  partDescription: string;
}

// Frontend specific types
// Using type aliases instead of empty interfaces
export type QuotationService = QuotationServiceDto;

export type QuotationServicePart = QuotationServicePartDto;