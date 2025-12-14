// src/types/manager/quotation.ts
export interface CreateQuotationDto {
  repairOrderId: string;
  userId: string; 
  vehicleId: string; 
  inspectionId?: string | null; 
  note?: string;
  quotationServices: QuotationServiceCreateDto[];
}

export interface QuotationServiceCreateDto {
  serviceId: string;
  isSelected: boolean;
  isRequired: boolean; 
  isGood?: boolean; 
  quotationServiceParts: QuotationServicePartCreateDto[];
}

export interface QuotationServicePartCreateDto {
  partId: string; 
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
  createdAt: string; 
  sentToCustomerAt: string | null;
  customerResponseAt: string | null;
  status: "Pending" | "Sent" | "Approved" | "Rejected" | "Expired" | "Good";
  totalAmount: number; // decimal
  discountAmount: number; // decimal
  inspectionFee: number; 
  note?: string;
  customerNote?: string | null;
  expiresAt: string | null;
  customerName: string;
  vehicleInfo: string | null;
  jobsCreated: boolean; 
  jobsCreatedAt: string | null;
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
  isRequired: boolean; 
  isGood: boolean; 
  price: number; 
  quantity: number;
  totalPrice: number;
  createdAt: string;
  discountValue: number;
  finalPrice: number;
  appliedPromotionId: string | null;
  appliedPromotion: unknown | null;
  serviceName: string;
  serviceDescription: string;
  parts: QuotationServicePartDto[];
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
export type QuotationService = QuotationServiceDto;

export type QuotationServicePart = QuotationServicePartDto;