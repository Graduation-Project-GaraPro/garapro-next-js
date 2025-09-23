// utils/quotationUtils.ts

export const getQualityBadge = (level: string) => {
  switch(level) {
    case 'premium': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'standard': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'economy': return 'bg-green-100 text-green-800 border-green-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getQualityLabel = (level: string) => {
  switch(level) {
    case 'premium': return 'Cao cấp';
    case 'standard': return 'Tiêu chuẩn';
    case 'economy': return 'Tiết kiệm';
    default: return 'Khác';
  }
};

export const getUrgencyColor = (urgency: string) => {
  switch(urgency) {
    case 'high': return 'bg-red-100 text-red-800 border-red-200';
    case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'low': return 'bg-green-100 text-green-800 border-green-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getToastColor = (type: string) => {
  switch(type) {
    case 'success': return 'bg-green-50 border-green-200 text-green-700';
    case 'error': return 'bg-red-50 border-red-200 text-red-700';
    case 'info': return 'bg-blue-50 border-blue-200 text-blue-700';
    default: return 'bg-gray-50 border-gray-200 text-gray-700';
  }
};

export const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('vi-VN') + 'đ';
};