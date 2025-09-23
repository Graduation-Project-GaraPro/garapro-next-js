// components/QuotationCard.tsx
import { Car, AlertTriangle, Eye, Wrench, Calculator, Info, AlertCircle } from 'lucide-react';
import { QuotationDetail } from '@/types/quotation';
import { getUrgencyColor, formatCurrency } from '@/utils/quotationUtils';

interface QuotationCardProps {
  quotation: QuotationDetail;
  onViewDetails: (quotation: QuotationDetail) => void;
}

export default function QuotationCard({ quotation, onViewDetails }: QuotationCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Car className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{quotation.vehicle}</h3>
              <div className="grid grid-cols-2 gap-4 mt-2 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Biển số:</span> {quotation.licensePlate}
                </div>
                <div>
                  <span className="font-medium">SĐT:</span> {quotation.customerPhone}
                </div>
                <div className="col-span-2">
                  <span className="font-medium">Vấn đề:</span> {quotation.issue}
                </div>
                <div>
                  <span className="font-medium">Thời gian:</span> {quotation.estimatedTime}
                </div>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(quotation.urgency)} mb-2`}>
              {quotation.urgency === 'high' && <AlertTriangle className="w-3 h-3 mr-1" />}
              {quotation.urgency === 'high' ? 'Khẩn cấp' : quotation.urgency === 'medium' ? 'Trung bình' : 'Không gấp'}
            </div>
            <p className="text-sm text-gray-500">{quotation.date}</p>
          </div>
        </div>

        {/* Cost Summary */}
        <div className="grid grid-cols-4 gap-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg mb-4">
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1 flex items-center justify-center">
              <AlertCircle className="w-3 h-3 mr-1" />
              Bắt buộc
            </div>
            <div className="text-lg font-semibold text-red-600">
              {formatCurrency(quotation.totalRequiredCost)}
            </div>
            <div className="text-xs text-gray-500">{quotation.requiredParts.length} món</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1 flex items-center justify-center">
              <Info className="w-3 h-3 mr-1" />
              Đề xuất
            </div>
            <div className="text-lg font-semibold text-blue-600">
              {formatCurrency(quotation.totalRecommendedCost)}
            </div>
            <div className="text-xs text-gray-500">{quotation.recommendedParts.length} món</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1 flex items-center justify-center">
              <Wrench className="w-3 h-3 mr-1" />
              Nhân công
            </div>
            <div className="text-lg font-semibold text-green-600">
              {formatCurrency(quotation.laborCost)}
            </div>
            <div className="text-xs text-gray-500">{quotation.estimatedTime}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1 flex items-center justify-center">
              <Calculator className="w-3 h-3 mr-1" />
              Tổng cộng
            </div>
            <div className="text-xl font-bold text-gray-900">
              {formatCurrency(quotation.totalCost)}
            </div>
            <div className="text-xs text-green-600">Có thể tùy chọn</div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <div>
                <span className="font-medium">Thợ máy:</span> {quotation.mechanicName}
              </div>
              <div>
                <span className="font-medium">Kiểm tra:</span> {quotation.inspectionDate}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onViewDetails(quotation)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow"
            >
              <Eye className="h-4 w-4 mr-2" />
              Xem chi tiết & Chọn
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}