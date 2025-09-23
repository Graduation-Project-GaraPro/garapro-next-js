// types/quotation.ts
export interface Part {
  id: number;
  name: string;
  price: number;
  quantity: number;
  category: string;
  condition: 'critical' | 'recommended';
  description: string;
  qualityLevel: 'premium' | 'standard' | 'economy';
  warranty?: string;
}

export interface QuotationDetail {
  id: number;
  vehicle: string;
  licensePlate: string;
  issue: string;
  inspectionDate: string;
  mechanicName: string;
  requiredParts: Part[];
  recommendedParts: Part[];
  laborCost: number;
  totalRequiredCost: number;
  totalRecommendedCost: number;
  totalCost: number;
  status: 'pending' | 'confirmed' | 'rejected' | 'partially_confirmed';
  date: string;
  notes: string;
  urgency: 'high' | 'medium' | 'low';
  estimatedTime?: string;
  customerPhone?: string;
}

export interface QualityOption {
  id: number;
  name: string;
  price: number;
  level: 'premium' | 'standard' | 'economy';
  warranty: string;
  description?: string;
}

export interface QuotationStats {
  pending: QuotationDetail[];
  confirmed: QuotationDetail[];
  rejected: QuotationDetail[];
  totalValue: number;
}

export interface ToastMessage {
  message: string;
  type: 'success' | 'error' | 'info';
}