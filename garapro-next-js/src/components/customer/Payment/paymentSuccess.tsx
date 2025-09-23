// components/PaymentSuccess.tsx
import { useState, useEffect } from 'react';
import { CheckCircle, Home, Phone, Calendar, MapPin, Clock } from 'lucide-react';
import { PaymentInfo } from '@/types/payment';
import { formatCurrency } from '@/utils/quotationUtils';

interface PaymentSuccessProps {
  paymentInfo: PaymentInfo;
  paymentMethod: 'vnpay' | 'store';
  onBackToMenu: () => void;
}

export default function PaymentSuccess({ 
  paymentInfo, 
  paymentMethod, 
  onBackToMenu 
}: PaymentSuccessProps) {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (paymentMethod === 'store') {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            onBackToMenu();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [paymentMethod, onBackToMenu]);

  const getSuccessMessage = () => {
    if (paymentMethod === 'vnpay') {
      return {
        title: 'Thanh toán thành công!',
        subtitle: 'Đơn hàng của bạn đã được xác nhận',
        description: 'Cảm ơn bạn đã thanh toán qua VNPay. Garage sẽ bắt đầu sửa chữa xe và liên hệ khi hoàn thành.'
      };
    } else {
      return {
        title: 'Đặt lịch thành công!',
        subtitle: 'Yêu cầu sửa chữa đã được ghi nhận',
        description: 'Vui lòng đến garage vào thời gian đã hẹn để thanh toán và nhận xe. Garage sẽ liên hệ xác nhận thời gian cụ thể.'
      };
    }
  };

  const message = getSuccessMessage();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Success Icon */}
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>

          {/* Success Message */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{message.title}</h1>
          <p className="text-lg text-green-600 mb-4">{message.subtitle}</p>
          <p className="text-gray-600 mb-8 leading-relaxed">{message.description}</p>

          {/* Payment Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Mã đơn hàng:</span>
                <span className="font-semibold">#{paymentInfo.quotationId.toString().padStart(6, '0')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Xe:</span>
                <span className="font-medium">{paymentInfo.vehicleInfo.vehicle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Biển số:</span>
                <span className="font-medium">{paymentInfo.vehicleInfo.licensePlate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tổng tiền:</span>
                <span className="font-bold text-green-600">
                  {formatCurrency(paymentInfo.totalAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phương thức:</span>
                <span className="font-medium">
                  {paymentMethod === 'vnpay' ? 'VNPay - Đã thanh toán' : 'Thanh toán tại garage'}
                </span>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Bước tiếp theo:
            </h3>
            <div className="space-y-2 text-sm text-blue-800">
              {paymentMethod === 'vnpay' ? (
                <>
                  <div className="flex items-start space-x-2">
                    <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">1</span>
                    <span>Garage sẽ bắt đầu sửa chữa xe của bạn</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">2</span>
                    <span>Bạn sẽ nhận được thông báo khi xe sửa xong</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">3</span>
                    <span>Đến garage để nhận xe theo lịch hẹn</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start space-x-2">
                    <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">1</span>
                    <span>Garage sẽ gọi xác nhận thời gian sửa chữa</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">2</span>
                    <span>Đưa xe đến garage đúng giờ hẹn</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">3</span>
                    <span>Thanh toán và nhận xe khi hoàn thành</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              Thông tin liên hệ:
            </h3>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-blue-600" />
                <span>{paymentInfo.garageInfo.phone}</span>
              </div>
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-green-600 mt-0.5" />
                <span>{paymentInfo.garageInfo.address}</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          {paymentMethod === 'vnpay' ? (
            <button
              onClick={onBackToMenu}
              className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Home className="w-5 h-5 mr-2" />
              Về trang chủ
            </button>
          ) : (
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Tự động chuyển về menu trong {countdown}s...
              </p>
              <button
                onClick={onBackToMenu}
                className="w-full flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Home className="w-5 h-5 mr-2" />
                Về menu ngay
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}