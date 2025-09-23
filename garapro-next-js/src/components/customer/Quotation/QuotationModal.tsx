// components/QuotationModal.tsx - Updated with Payment Integration
import { useState } from 'react';
import { 
  X, 
  Car, 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  Calculator,
  CheckCircle,
  XCircle,
  Loader2,
  CreditCard
} from 'lucide-react';
import { QuotationDetail, QualityOption } from '@/types/quotation';
import { PaymentInfo } from '@/types/payment';
import { formatCurrency } from '@/utils/quotationUtils';
import PartSelection from './PartSelection';

interface QuotationModalProps {
  quotation: QuotationDetail;
  editedQuotation: QuotationDetail;
  selectedParts: { [key: number]: boolean };
  selectedPartsCost: number;
  finalTotal: number;
  isLoading: boolean;
  onClose: () => void;
  onPartQualityChange: (partId: number, option: QualityOption, isRequired: boolean) => void;
  onPartSelection: (partId: number, selected: boolean) => void;
  onConfirm: () => void;
  onReject: () => void;
  onProceedToPayment: (paymentInfo: PaymentInfo) => void; // Payment redirect handler
}

export default function QuotationModal({
  quotation,
  editedQuotation,
  selectedParts,
  selectedPartsCost,
  finalTotal,
  isLoading,
  onClose,
  onPartQualityChange,
  onPartSelection,
  onConfirm,
  onReject,
  onProceedToPayment
}: QuotationModalProps) {
  const [processingPayment, setProcessingPayment] = useState(false);

  const handleAcceptAndProceedToPayment = async () => {
    setProcessingPayment(true);
    
    try {
      // First confirm the quotation
      await onConfirm();
      
      // Prepare payment info
      const paymentInfo: PaymentInfo = {
        quotationId: quotation.id,
        totalAmount: finalTotal,
        status: 'accepted',
        customerInfo: {
          name: "Nguyễn Văn A", // In real app, get from user profile/input
          phone: quotation.customerPhone || "0987654321",
          email: "customer@email.com" // Optional, can be collected in payment form
        },
        vehicleInfo: {
          vehicle: quotation.vehicle,
          licensePlate: quotation.licensePlate
        },
        garageInfo: {
          name: "AutoCare Garage Đà Nẵng",
          address: "123 Đường 2/9, Hải Châu, Đà Nẵng",
          phone: "0236.123.4567"
        },
        serviceDetails: {
          requiredParts: editedQuotation.requiredParts,
          selectedRecommendedParts: editedQuotation.recommendedParts.filter(
            part => selectedParts[part.id]
          ),
          laborCost: editedQuotation.laborCost,
          estimatedTime: editedQuotation.estimatedTime
        }
      };
      
      // Redirect to payment page
      onProceedToPayment(paymentInfo);
      
    } catch (error) {
      console.error('Error processing quotation:', error);
      // Handle error (show notification, etc.)
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleRejectAndProceedToPayment = async () => {
    setProcessingPayment(true);
    
    try {
      // Reject the quotation
      await onReject();
      
      // Prepare payment info for rejection (might include consultation fees, inspection costs, etc.)
      const paymentInfo: PaymentInfo = {
        quotationId: quotation.id,
        totalAmount: 0, // No payment for rejection, or minimal consultation fee
        status: 'rejected',
        customerInfo: {
          name: "Nguyễn Văn A",
          phone: quotation.customerPhone || "0987654321",
          email: "customer@email.com"
        },
        vehicleInfo: {
          vehicle: quotation.vehicle,
          licensePlate: quotation.licensePlate
        },
        garageInfo: {
          name: "AutoCare Garage Đà Nẵng",
          address: "123 Đường 2/9, Hải Châu, Đà Nẵng",
          phone: "0236.123.4567"
        },
        serviceDetails: {
          requiredParts: [],
          selectedRecommendedParts: [],
          laborCost: 0,
          estimatedTime: quotation.estimatedTime,
          rejectionReason: "Khách hàng từ chối báo giá"
        }
      };
      
      // Redirect to payment/summary page
      onProceedToPayment(paymentInfo);
      
    } catch (error) {
      console.error('Error processing quotation rejection:', error);
    } finally {
      setProcessingPayment(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <Car className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{quotation.vehicle}</h2>
                <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                  <span>Biển số: {quotation.licensePlate}</span>
                  <span>•</span>
                  <span>{quotation.date}</span>
                  <span>•</span>
                  <span>Thợ: {quotation.mechanicName}</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(editedQuotation.totalRequiredCost)}
              </div>
              <div className="text-sm text-gray-600">Bắt buộc</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(selectedPartsCost)}
              </div>
              <div className="text-sm text-gray-600">Đã chọn</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(editedQuotation.laborCost)}
              </div>
              <div className="text-sm text-gray-600">Nhân công</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                {formatCurrency(finalTotal)}
              </div>
              <div className="text-sm text-gray-600">Tổng cuối</div>
            </div>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-8 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Vehicle Info & Notes */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
              Tình trạng xe & Ghi chú
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-700"><strong>Vấn đề:</strong> {quotation.issue}</p>
                <p className="text-sm text-gray-700 mt-1"><strong>Thời gian ước tính:</strong> {quotation.estimatedTime}</p>
              </div>
              <div>
                <p className="text-sm text-gray-700"><strong>Liên hệ:</strong> {quotation.customerPhone}</p>
                <p className="text-sm text-gray-700 mt-1"><strong>Ngày kiểm tra:</strong> {quotation.inspectionDate}</p>
              </div>
            </div>
            {quotation.notes && (
              <div className="mt-3 p-3 bg-white rounded border">
                <p className="text-sm text-gray-700"><strong>Ghi chú:</strong> {quotation.notes}</p>
              </div>
            )}
          </div>

          {/* Required Parts */}
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <AlertCircle className="h-6 w-6 text-red-500" />
              <h3 className="text-xl font-semibold text-gray-900">Phụ tùng bắt buộc thay</h3>
              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                Cần thiết cho an toàn
              </span>
            </div>
            
            <div className="space-y-6">
              {editedQuotation.requiredParts.map((part) => (
                <PartSelection
                  key={part.id}
                  part={part}
                  isRequired={true}
                  onQualityChange={onPartQualityChange}
                />
              ))}
            </div>
          </div>

          {/* Recommended Parts */}
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <Info className="h-6 w-6 text-blue-500" />
              <h3 className="text-xl font-semibold text-gray-900">Phụ tùng đề xuất thay</h3>
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                Tùy chọn để xe hoạt động tốt hơn
              </span>
            </div>
            
            <div className="space-y-6">
              {editedQuotation.recommendedParts.map((part) => (
                <PartSelection
                  key={part.id}
                  part={part}
                  isRequired={false}
                  isSelected={selectedParts[part.id] || false}
                  onQualityChange={onPartQualityChange}
                  onSelectionChange={onPartSelection}
                />
              ))}
            </div>
          </div>

          {/* Enhanced Final Summary */}
          <div className="bg-gradient-to-r from-gray-100 to-blue-100 rounded-xl p-6 border-2 border-blue-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Calculator className="h-5 w-5 mr-2" />
              Tổng kết báo giá cuối cùng
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between py-2">
                  <span className="text-gray-700">Phụ tùng bắt buộc:</span>
                  <span className="font-semibold text-red-600">
                    {formatCurrency(editedQuotation.totalRequiredCost)}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-700">Phụ tùng đã chọn:</span>
                  <span className="font-semibold text-blue-600">
                    {formatCurrency(selectedPartsCost)}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-700">Chi phí nhân công:</span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(editedQuotation.laborCost)}
                  </span>
                </div>
                <div className="border-t border-gray-300 pt-2">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-gray-900">Tổng cộng:</span>
                    <span className="text-2xl font-bold text-gray-900">
                      {formatCurrency(finalTotal)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border">
                <h4 className="font-medium text-gray-900 mb-2">Thông tin bổ sung:</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>• Bảo hành theo từng sản phẩm</div>
                  <div>• Thời gian sửa chữa: {editedQuotation.estimatedTime}</div>
                  <div>• Thanh toán khi hoàn thành</div>
                  <div>• Hỗ trợ tư vấn 24/7</div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions with Payment Integration */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Thợ máy:</strong> {quotation.mechanicName}</p>
              <p><strong>Ngày kiểm tra:</strong> {quotation.inspectionDate}</p>
              <p><strong>Liên hệ:</strong> {quotation.customerPhone}</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRejectAndProceedToPayment}
                disabled={isLoading || processingPayment}
                className="flex items-center px-6 py-3 text-red-600 border-2 border-red-300 rounded-lg hover:bg-red-50 transition-all duration-200 disabled:opacity-50"
              >
                {processingPayment ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 mr-2" />
                    Từ chối báo giá
                  </>
                )}
              </button>
              <button
                onClick={handleAcceptAndProceedToPayment}
                disabled={isLoading || processingPayment}
                className="flex items-center px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 min-w-[220px] justify-center"
              >
                {processingPayment ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5 mr-2" />
                    Xác nhận & Thanh toán
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}