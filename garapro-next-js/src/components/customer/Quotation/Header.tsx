// components/Header.tsx
import { ArrowLeft } from 'lucide-react';
import { QuotationStats } from '@/types/quotation';
import { formatCurrency } from '@/utils/quotationUtils';
import Link from "next/link";

interface HeaderProps {
  quotationStats: QuotationStats;
}

export default function Header({ quotationStats }: HeaderProps) {
  return (
    <div className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
             <Link
      href="/customer"
      className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
    >
      <ArrowLeft className="h-4 w-4 mr-1" />
      <span>Dashboard</span>
    </Link>
            <div className="h-6 w-px bg-gray-300"></div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Báo giá sửa chữa</h1>
              <p className="text-sm text-gray-500">Quản lý và xác nhận báo giá từ garage</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-600">{quotationStats.pending.length} Chờ phản hồi</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">{quotationStats.confirmed.length} Đã xác nhận</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Tổng giá trị</div>
              <div className="text-lg font-semibold text-blue-600">
                {formatCurrency(quotationStats.totalValue)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}