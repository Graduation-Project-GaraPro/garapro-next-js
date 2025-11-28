// Payment types for manager payment operations

// Payment Summary Response (GET /api/payments/summary/{repairOrderId})
export interface PaymentHistoryItem {
  paymentId: number;
  amount: number;
  method: string;
  status: string;
  createdAt: string;
  description?: string;
}

export interface PaymentSummaryResponse {
  repairOrderId: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  vehicleLicensePlate: string;
  totalAmount: number;
  discountAmount: number;
  amountToPay: number;
  paidAmount: number;
  balanceDue: number;
  paymentHistory: PaymentHistoryItem[];
  paymentStatus: 'Unpaid' | 'Partial' | 'Paid';
}

// Create Payment Request (POST /api/payments/manager-create/{repairOrderId})
export type PaymentMethod = 'Cash' | 'PayOs';

export interface CreatePaymentRequest {
  method: PaymentMethod;
  description: string;
}

export interface CreatePaymentResponse {
  message: string;
  paymentId: number;
  method: PaymentMethod;
  amount: number;
  status: string;
  qrCodeData: string | null;
}

// Generate QR Code Request
export interface GenerateQRCodeRequest {
  method: 'PayOs';
  description: string;
}

export interface GenerateQRCodeResponse {
  message: string;
  qrCodeData: string;
  repairOrderId: string;
  amount: number;
}

// Payment Preview Response (GET /api/Payments/preview/{repairOrderId})
export interface PaymentPreviewService {
  serviceId: string;
  serviceName: string;
  price: number;
  estimatedDuration: number;
}

export interface PaymentPreviewPart {
  partId: string;
  partName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface PaymentPreviewResponse {
  repairOrderId: string;
  repairOrderCost: number;
  estimatedAmount: number;
  paidAmount: number;
  discountAmount: number;
  totalAmount: number;
  customerName: string;
  vehicleInfo: string;
  services: PaymentPreviewService[];
  parts: PaymentPreviewPart[];
}

// Legacy types for backward compatibility
export interface PaymentService {
  serviceId: string;
  serviceName: string;
  price: number;
  estimatedDuration: number;
}

export interface PaymentPart {
  partId: string;
  partName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface PaymentQuotation {
  quotationId: string;
  totalAmount: number;
  discountAmount: number;
  status: string;
}

export interface RepairOrderPaymentSummary {
  repairOrderId: string;
  repairOrderCost: number;
  estimatedAmount: number;
  paidAmount: number;
  discountAmount: number;
  totalAmount: number;
  services: PaymentService[];
  parts: PaymentPart[];
  quotations: PaymentQuotation[];
}
