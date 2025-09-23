// components/Toast.tsx
import { CheckCircle, XCircle, Info } from 'lucide-react';
import { ToastMessage } from '@/types/quotation';
import { getToastColor } from '@/utils/quotationUtils';

interface ToastProps {
  toast: ToastMessage;
}

export default function Toast({ toast }: ToastProps) {
  if (!toast.message) return null;

  const getIcon = () => {
    switch(toast.type) {
      case 'success': return <CheckCircle className="h-5 w-5 mr-2" />;
      case 'error': return <XCircle className="h-5 w-5 mr-2" />;
      case 'info': return <Info className="h-5 w-5 mr-2" />;
      default: return <Info className="h-5 w-5 mr-2" />;
    }
  };

  return (
    <div className={`mb-6 ${getToastColor(toast.type)} border px-4 py-3 rounded-lg flex items-center transition-all`}>
      {getIcon()}
      <span>{toast.message}</span>
    </div>
  );
}