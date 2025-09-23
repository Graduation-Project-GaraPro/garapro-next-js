// types/payment.ts
export interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  available: boolean;
}

export interface PaymentInfo {
  quotationId: number;
  totalAmount: number;
  customerInfo: {
    name: string;
    phone: string;
    email?: string;
  };
  vehicleInfo: {
    vehicle: string;
    licensePlate: string;
  };
  garageInfo: {
    name: string;
    address: string;
    phone: string;
  };
}

export interface VNPayPayment {
  amount: number;
  orderInfo: string;
  returnUrl: string;
  ipAddr: string;
}