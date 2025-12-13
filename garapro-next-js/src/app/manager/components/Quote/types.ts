// src/app/manager/components/Quote/types.ts
export interface ServiceItem {
  id: string
  name: string
  price: number
  isAdvanced?: boolean // Add isAdvanced attribute
  isRequired?: boolean // Add isRequired attribute for manager to mark services as required
}

export interface ServiceCategory {
  id: string
  name: string
  price?: number
  children?: ServiceItem[]
}

export interface CustomItem {
  id: string
  name: string
  price: number
  quantity?: number 
}

export interface Part {
  partId: string
  name: string
  price: number
  stock: number
}

// Use type alias instead of empty interface
export type PartWithRecommendation = Part;

export interface QuotationData {
  dateCreated: string
  customerName: string
  customerPhone: string
  validUntil: string
  selectedServices: string[]
  // recommendedServices: string[] - Removed recommendedServices property
  customItems: Record<string, CustomItem[]>
  totalPrice: number
  repairOrderId: string
  userId: string
  vehicleId: string
}