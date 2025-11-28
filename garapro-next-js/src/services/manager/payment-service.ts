import { apiClient } from './api-client';
import type {
  PaymentSummaryResponse,
  CreatePaymentRequest,
  CreatePaymentResponse,
  GenerateQRCodeRequest,
  GenerateQRCodeResponse,
  PaymentPreviewResponse,
} from '@/types/manager/payment';

export const paymentService = {
  /**
   * Get payment summary for a repair order
   * Returns customer info, vehicle details, payment history, and payment status
   */
  async getPaymentSummary(repairOrderId: string): Promise<PaymentSummaryResponse> {
    const response = await apiClient.get<PaymentSummaryResponse>(
      `/payments/summary/${repairOrderId}`
    );
    if (!response.data) {
      throw new Error('No payment summary data received');
    }
    return response.data;
  },

  /**
   * Create manual payment for a completed repair order
   * For cash payments, manager does not choose method - it's automatically set to Cash
   */
  async createPayment(
    repairOrderId: string,
    request: CreatePaymentRequest
  ): Promise<CreatePaymentResponse> {
    const response = await apiClient.post<CreatePaymentResponse>(
      `/payments/manager-create/${repairOrderId}`,
      request
    );
    if (!response.data) {
      throw new Error('No payment response data received');
    }
    return response.data;
  },

  /**
   * Generate QR code for PayOs payment
   */
  async generateQRCode(
    repairOrderId: string,
    request: GenerateQRCodeRequest
  ): Promise<GenerateQRCodeResponse> {
    const response = await apiClient.post<GenerateQRCodeResponse>(
      `/Payments/generate-qr/${repairOrderId}`,
      request
    );
    if (!response.data) {
      throw new Error('No QR code response data received');
    }
    return response.data;
  },

  /**
   * Get payment preview for a repair order
   * Shows detailed breakdown of services, parts, and costs before payment
   */
  async getPaymentPreview(repairOrderId: string): Promise<PaymentPreviewResponse> {
    const response = await apiClient.get<PaymentPreviewResponse>(
      `/Payments/preview/${repairOrderId}`
    );
    if (!response.data) {
      throw new Error('No payment preview data received');
    }
    return response.data;
  },
};
