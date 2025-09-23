// components/PaymentPage.tsx
import { useState } from 'react';
import { 
  ArrowLeft, 
  CreditCard, 
  Store, 
  CheckCircle, 
  Clock, 
  MapPin,
  Phone,
  Car,
  User,
  Mail,
  Loader2,
  AlertTriangle,
  Calendar
} from 'lucide-react';
import { PaymentInfo, PaymentMethod } from '@/types/payment';
import { formatCurrency } from '@/utils/quotationUtils';

interface PaymentPageProps {
  paymentInfo: PaymentInfo;
  onBack: () => void;
  onPaymentComplete: (method: string) => void;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'vnpay',
    name: 'Thanh toán Online',
    description: 'Thanh toán ngay qua VNPay (ATM, Visa, MasterCard)',
    icon: 'credit-card',
    available: true
  },
  {
    id: 'store',
    name: 'Thanh toán tại cửa hàng',
    description: 'Thanh toán khi nhận xe tại garage',
    icon: 'store',
    available: true
  }
];

export default function PaymentPage({ paymentInfo, onBack, onPaymentComplete }: PaymentPageProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: paymentInfo.customerInfo.name,
    email: paymentInfo.customerInfo.email || '',
    phone: paymentInfo.customerInfo.phone
  });

  const handlePayment = async () => {
    if (!selectedMethod) return;

    setIsProcessing(true);

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (selectedMethod === 'vnpay') {
      // Simulate VNPay redirect
      const vnpayData = {
        amount: paymentInfo.totalAmount,
        orderInfo: `Thanh toan bao gia ${paymentInfo.quotationId} - ${paymentInfo.vehicleInfo.licensePlate}`,
        returnUrl: window.location.origin + '/payment-success',
        ipAddr: '127.0.0.1'
      };
      
      // In real implementation, you would redirect to VNPay
      console.log('VNPay payment data:', vnpayData);
      
      // Simulate successful payment
      setIsProcessing(false);
      onPaymentComplete('vnpay');
    } else if (selectedMethod === 'store') {
      setIsProcessing(false);
      onPaymentComplete('store');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <button 
              onClick={onBack}
              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span>Quay lại</span>
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Thanh toán</h1>
              <p className="text-sm text-gray-500">Chọn phương thức thanh toán</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Payment Methods */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Chọn phương thức thanh toán</h2>
                
                <div className="space-y-4">
                  {paymentMethods.map((method) => (
                    <div key={method.id} className="relative">
                      <input
                        type="radio"
                        id={method.id}
                        name="payment-method"
                        value={method.id}
                        checked={selectedMethod === method.id}
                        onChange={(e) => setSelectedMethod(e.target.value)}
                        className="sr-only"
                      />
                      <label
                        htmlFor={method.id}
                        className={`block cursor-pointer rounded-lg border-2 p-4 transition-all ${
                          selectedMethod === method.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`p-3 rounded-lg ${
                            method.id === 'vnpay' ? 'bg-red-50' : 'bg-green-50'
                          }`}>
                            {method.id === 'vnpay' ? (
                              <CreditCard className={`h-6 w-6 ${
                                method.id === 'vnpay' ? 'text-red-600' : 'text-green-600'
                              }`} />
                            ) : (
                              <Store className="h-6 w-6 text-green-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{method.name}</h3>
                            <p className="text-sm text-gray-600 mt-1">{method.description}</p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 ${
                            selectedMethod === method.id
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-gray-300'
                          }`}>
                            {selectedMethod === method.id && (
                              <CheckCircle className="w-5 h-5 text-white" />
                            )}
                          </div>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>

                {/* Customer Info for VNPay */}
                {selectedMethod === 'vnpay' && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-4">Thông tin thanh toán</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Họ và tên
                        </label>
                        <input
                          type="text"
                          value={customerInfo.name}
                          onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Số điện thoại
                        </label>
                        <input
                          type="tel"
                          value={customerInfo.phone}
                          onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email (tùy chọn)
                        </label>
                        <input
                          type="email"
                          value={customerInfo.email}
                          onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Store Payment Info */}
                {selectedMethod === 'store' && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                        Lưu ý quan trọng
                      </h3>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Vui lòng thanh toán khi nhận xe tại garage</li>
                        <li>• Mang theo giấy tờ tuỳ thân để xác nhận</li>
                        <li>• Garage sẽ liên hệ khi xe sửa xong</li>
                        <li>• Thời gian sửa chữa dự kiến: {paymentInfo.garageInfo.name}</li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* Payment Button */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={handlePayment}
                    disabled={!selectedMethod || isProcessing}
                    className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Đang xử lý...
                      </>
                    ) : selectedMethod === 'vnpay' ? (
                      <>
                        <CreditCard className="h-5 w-5 mr-2" />
                        Thanh toán ngay {formatCurrency(paymentInfo.totalAmount)}
                      </>
                    ) : selectedMethod === 'store' ? (
                      <>
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Xác nhận đặt lịch sửa chữa
                      </>
                    ) : (
                      'Chọn phương thức thanh toán'
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Chi tiết đơn hàng</h2>
                
                {/* Vehicle Info */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center space-x-3">
                    <Car className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">{paymentInfo.vehicleInfo.vehicle}</p>
                      <p className="text-sm text-gray-600">Biển số: {paymentInfo.vehicleInfo.licensePlate}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Khách hàng</p>
                      <p className="font-medium text-gray-900">{paymentInfo.customerInfo.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="text-sm text-gray-600">Liên hệ</p>
                      <p className="font-medium text-gray-900">{paymentInfo.customerInfo.phone}</p>
                    </div>
                  </div>
                </div>

                {/* Garage Info */}
                <div className="border-t border-gray-200 pt-4 mb-6">
                  <h3 className="font-medium text-gray-900 mb-3">Thông tin garage</h3>
                  <div className="space-y-2">
                    <div className="flex items-start space-x-3">
                      <Store className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{paymentInfo.garageInfo.name}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <MapPin className="h-4 w-4 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">{paymentInfo.garageInfo.address}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="h-4 w-4 text-orange-600" />
                      <div>
                        <p className="text-sm text-gray-600">{paymentInfo.garageInfo.phone}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Total */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Tổng cộng:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {formatCurrency(paymentInfo.totalAmount)}
                    </span>
                  </div>
                </div>

                {/* Security Info */}
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-700 font-medium">Thanh toán an toàn</span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    Thông tin được mã hóa và bảo mật 100%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}