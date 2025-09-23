// components/ConfirmedQuotation.tsx
import { CheckCircle2, Eye, Download } from 'lucide-react';
import { QuotationDetail } from '@/types/quotation';
import { formatCurrency } from '@/utils/quotationUtils';

interface ConfirmedQuotationProps {
  quotation: QuotationDetail;
}

export default function ConfirmedQuotation({ quotation }: ConfirmedQuotationProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-50 rounded-lg">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{quotation.vehicle}</h3>
            <div className="text-sm text-gray-600 mt-1">
              <span>{quotation.issue}</span>
              <span className="mx-2">•</span>
              <span>{quotation.licensePlate}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-lg font-semibold text-green-600">
              {formatCurrency(quotation.totalCost)}
            </div>
            <div className="text-xs text-gray-500">
              Xác nhận {quotation.date}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
              <Eye className="h-4 w-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-green-600 transition-colors">
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}