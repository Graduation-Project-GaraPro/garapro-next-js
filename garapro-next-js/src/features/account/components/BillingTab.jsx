"use client";

import { CreditCard } from 'lucide-react';
import { isValidDate } from '@/utils/validate';

export default function BillingTab() {

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-6">Thông tin thanh toán</h3>
      <div className="space-y-6">
        <div className="p-4 border border-gray-200 rounded-lg">
          <h4 className="font-medium mb-3">Phương thức thanh toán</h4>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <CreditCard className="h-6 w-6 text-blue-600" />
            <div>
              <div className="font-medium">Visa **** 4589</div>
              <div className="text-sm text-gray-600">Hết hạn: 12/2025</div>
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">+ Thêm phương thức mới</button>
          </div>
        </div>

        <div className="p-4 border border-gray-200 rounded-lg">
          <h4 className="font-medium mb-3">Lịch sử thanh toán</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium">Bảo dưỡng định kỳ</div>
                <div className="text-sm text-gray-600">
                  {(() => {
                    const date = new Date('2025-01-15');
                    return isValidDate('2025-01-15') ? 
                      `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}` : 
                      '15/01/2025';
                  })()}
                </div>
              </div>
              <div className="font-medium text-green-600">1,500,000 VNĐ</div>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium">Thay lốp xe</div>
                <div className="text-sm text-gray-600">
                  {(() => {
                    const date = new Date('2025-01-05');
                    return isValidDate('2025-01-05') ? 
                      `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}` : 
                      '05/01/2025';
                  })()}
                </div>
              </div>
              <div className="font-medium text-green-600">2,800,000 VNĐ</div>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium">Sửa chữa phanh</div>
                <div className="text-sm text-gray-600">
                  {(() => {
                    const date = new Date('2024-12-20');
                    return isValidDate('2024-12-20') ? 
                      `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}` : 
                      '20/12/2024';
                  })()}
                </div>
              </div>
              <div className="font-medium text-green-600">1,200,000 VNĐ</div>
            </div>
          </div>
          <div className="mt-3 flex justify-center">
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Xem tất cả lịch sử</button>
          </div>
        </div>
      </div>
    </div>
  );
}


