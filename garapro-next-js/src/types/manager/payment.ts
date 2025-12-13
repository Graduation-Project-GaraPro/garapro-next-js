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
  vehicleInfo: string;
  repairOrderCost: number; 
  totalDiscount: number; 
  amountToPay: number; 
  paidStatus: number;
  paymentHistory: PaymentHistoryItem[];
  totalAmount?: number;
  discountAmount?: number;
  paymentStatus?: 'Unpaid' | 'Paid'; 
}

export type PaymentMethod = 'Cash' | 'PayOs';

export enum PaymentMethodEnum {
    PayOs = 0,
    Cash = 1

}

export enum PaymentStatusEnum {
  Paid = 0,
  Unpaid = 1,
  Cancelled = 2,
  Failed = 3
}

// Helper functions to map enums to display names
export function getPaymentMethodName(method: string | number): string {
  if (typeof method === 'string') return method;
  
  switch (method) {
    case 1:
    case PaymentMethodEnum.Cash:
      return 'Cash';
    case 0:
    case PaymentMethodEnum.PayOs:
      return 'PayOs';
    default:
      return 'Unknown';
  }
}

export function getPaymentStatusName(status: string | number): string {
  if (typeof status === 'string') return status;
  
  switch (status) {
    case 0:
    case PaymentStatusEnum.Paid:
      return 'Paid';
    case 1:
    case PaymentStatusEnum.Unpaid:
      return 'Unpaid';
    case 2:
    case PaymentStatusEnum.Cancelled:
      return 'Cancelled';
    case 3:
    case PaymentStatusEnum.Failed:
      return 'Failed';
    default:
      return 'Unknown';
  }
}

// Helper function to get status badge color
export function getPaymentStatusColor(status: string | number): {
  bg: string;
  text: string;
} {
  const statusName = typeof status === 'string' ? status : getPaymentStatusName(status);
  
  switch (statusName) {
    case 'Paid':
      return { bg: 'bg-green-100', text: 'text-green-800' };
    case 'Unpaid':
      return { bg: 'bg-yellow-100', text: 'text-yellow-800' };
    case 'Cancelled':
      return { bg: 'bg-gray-100', text: 'text-gray-800' };
    case 'Failed':
      return { bg: 'bg-red-100', text: 'text-red-800' };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-600' };
  }
}

export interface CreatePaymentRequest {
  method: number;
  description: string;
}

export interface CreatePaymentResponse {
  message: string;
  paymentId: number;
  method: PaymentMethod | number; 
  amount: number;
  status: string | number; 
  qrCodeData: string | null;
}

// Generate QR Code Request
export interface GenerateQRCodeRequest {
  method: 'PayOs';
  description: string;
}

export interface GenerateQRCodeResponse {
  message: string;
  paymentId: number;
  orderCode: number;
  checkoutUrl: string;
  qrCodeUrl: string;
  qrCodeData?: string;
  repairOrderId?: string;
  amount?: number;
}

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
  discountAmount: number;
  totalAmount: number;
  customerName: string;
  vehicleInfo: string;
  services: PaymentPreviewService[];
  parts: PaymentPreviewPart[];
}

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
  discountAmount: number;
  totalAmount: number;
  services: PaymentService[];
  parts: PaymentPart[];
  quotations: PaymentQuotation[];
}
