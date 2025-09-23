// components/PartSelection.tsx
import { CheckCircle } from 'lucide-react';
import { Part, QualityOption } from '@/types/quotation';
import { partQualityOptions } from '@/constants/partQualityOptions';
import { getQualityBadge, getQualityLabel, formatCurrency } from '@/utils/quotationUtils';

interface PartSelectionProps {
  part: Part;
  isRequired: boolean;
  isSelected?: boolean;
  onQualityChange: (partId: number, option: QualityOption, isRequired: boolean) => void;
  onSelectionChange?: (partId: number, selected: boolean) => void;
}

export default function PartSelection({
  part,
  isRequired,
  isSelected = true,
  onQualityChange,
  onSelectionChange
}: PartSelectionProps) {
  const borderColor = isRequired ? 'border-red-200' : 'border-blue-200';
  const bgColor = isRequired ? 'bg-red-50' : (isSelected ? 'bg-blue-50' : 'bg-blue-25');
  const selectedBorderColor = isRequired ? 'border-red-500' : 'border-blue-500';

  return (
    <div className={`border-2 rounded-lg p-6 transition-all duration-200 ${
      isSelected ? `${selectedBorderColor} ${bgColor}` : `${borderColor} ${bgColor}`
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            {!isRequired && onSelectionChange && (
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => onSelectionChange(part.id, e.target.checked)}
                  className="mr-3 h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                />
              </label>
            )}
            <h4 className="text-lg font-semibold text-gray-900">{part.name}</h4>
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getQualityBadge(part.qualityLevel)}`}>
              {getQualityLabel(part.qualityLevel)}
            </span>
            {part.warranty && (
              <span className="text-xs text-gray-600 bg-white px-2 py-1 rounded">
                BH: {part.warranty}
              </span>
            )}
          </div>
          <p className="text-gray-700 mb-4 bg-white p-3 rounded border">
            <strong>{isRequired ? 'Tình trạng:' : 'Khuyến cáo:'}</strong> {part.description}
          </p>
          
          <div className="space-y-3">
            <h5 className="font-medium text-gray-900">Chọn chất lượng phụ tùng:</h5>
            <div className="grid grid-cols-3 gap-3">
              {partQualityOptions[part.category]?.map((option) => (
                <button
                  key={option.id}
                  onClick={() => onQualityChange(part.id, option, isRequired)}
                  className={`p-4 border-2 rounded-lg text-left transition-all duration-200 ${
                    part.qualityLevel === option.level
                      ? `${selectedBorderColor} ${isRequired ? 'bg-red-100' : 'bg-blue-100'} shadow-md`
                      : `border-gray-200 hover:${isRequired ? 'border-red-300' : 'border-blue-300'} bg-white hover:shadow`
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getQualityBadge(option.level)}`}>
                      {getQualityLabel(option.level)}
                    </span>
                    {part.qualityLevel === option.level && (
                      <CheckCircle className={`h-4 w-4 ${isRequired ? 'text-red-500' : 'text-blue-500'}`} />
                    )}
                  </div>
                  <div className="font-medium text-sm mb-1">{option.name}</div>
                  <div className="text-xs text-gray-600 mb-2">{option.warranty}</div>
                  {option.description && (
                    <div className="text-xs text-gray-500 mb-2">{option.description}</div>
                  )}
                  <div className={`text-sm font-semibold ${isRequired ? 'text-red-600' : 'text-blue-600'}`}>
                    {formatCurrency(option.price)}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="text-right ml-6 min-w-[120px]">
          <div className={`text-2xl font-bold mb-1 ${
            isSelected 
              ? (isRequired ? 'text-red-600' : 'text-blue-600')
              : 'text-gray-400'
          }`}>
            {formatCurrency(part.price * part.quantity)}
          </div>
          <div className="text-sm text-gray-600">
            Số lượng: <span className="font-semibold">{part.quantity}</span>
          </div>
          <div className={`text-xs px-2 py-1 rounded mt-2 ${
            isRequired
              ? 'text-red-600 bg-red-100'
              : isSelected 
                ? 'text-blue-600 bg-blue-100' 
                : 'text-gray-500 bg-gray-100'
          }`}>
            {isRequired ? 'Bắt buộc' : isSelected ? 'Đã chọn' : 'Chưa chọn'}
          </div>
        </div>
      </div>
    </div>
  );
}