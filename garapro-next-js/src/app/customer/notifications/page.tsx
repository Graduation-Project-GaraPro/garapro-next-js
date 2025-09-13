"use client";

import { useState, useEffect } from 'react';
import { CheckCircle, FileText, AlertTriangle, Download, Info, Loader2, ArrowLeft } from 'lucide-react';
import { generatePdfFromHtml } from '@/utils/pdf';
import { useNotifications, Notification } from '@/hooks/customer/useNotifications';
// Xóa import react-hot-toast và sử dụng console.log tạm thời
// import { toast as showToast } from 'react-hot-toast';
import QuotationPdf from '@/components/customer/Quotationpdf';
import { renderToString } from 'react-dom/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Mở rộng interface Notification để hỗ trợ thêm thông tin báo giá
interface QuotationNotification extends Notification {
  quotation?: {
    vehicle: string;
    licensePlate: string;
    issue: string;
    partsCost: number;
    laborCost: number;
    totalCost: number;
  };
  confirmed?: boolean;
  date?: string;
}

export default function NotificationsPage() {
  const { notifications: allNotifications, loading, error, markAsRead } = useNotifications();
  const [toast, setToast] = useState('');
  
  // Chuyển đổi notifications từ hook sang định dạng cần thiết cho UI
  const adaptedNotifications: QuotationNotification[] = allNotifications.map(notification => ({
    ...notification,
    confirmed: notification.read,
    date: new Date(notification.timestamp).toISOString().split('T')[0],
    quotation: {
      vehicle: notification.title.split(' - ')[1] || 'Unknown Vehicle',
      licensePlate: notification.relatedId ? `${notification.relatedId}A-123.45` : 'Unknown',
      issue: notification.message,
      partsCost: 1500000,
      laborCost: 500000,
      totalCost: 2000000
    }
  }));

  const handleConfirm = async (id: number) => {
    try {
      await markAsRead(id);
      if (typeof window !== 'undefined') {
        const pendingCount = adaptedNotifications.filter(n => !n.read && n.id !== id).length;
        window.dispatchEvent(new CustomEvent('app:notificationConfirmed', { 
          detail: { id, pendingCount } 
        }));
      }
      setToast('Cảm ơn bạn đã xác nhận, chúng tôi sẽ tiến hành sửa chữa ngay.');
      setTimeout(() => setToast(''), 2000);
    } catch (error) {
      // showToast.error('Có lỗi khi xác nhận thông báo. Vui lòng thử lại.');
      console.error('Có lỗi khi xác nhận thông báo. Vui lòng thử lại.');
      console.error('Error confirming notification:', error);
    }
  };

  const handleDownloadPDF = async (id: number) => {
    try {
      const n = adaptedNotifications.find(x => x.id === id);
      if (!n?.quotation) return;
      const q = n.quotation;
      const html = buildQuotationHtml({
        brand: 'Garage PRO',
        contact: 'Hotline: 1900 123 456 • Email: support@garagepro.com',
        code: n.id,
        date: n.date || new Date().toISOString().split('T')[0],
        vehicle: q.vehicle,
        licensePlate: q.licensePlate,
        issue: q.issue,
        partsCost: q.partsCost,
        laborCost: q.laborCost,
        totalCost: q.totalCost
      });
      await generatePdfFromHtml(html, `bao_gia_${id}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      // showToast.error('Có lỗi khi tạo PDF. Vui lòng thử lại.');
      console.error('Có lỗi khi tạo PDF. Vui lòng thử lại.');
    }
  };

  // Hàm tạo HTML cho báo giá để xuất PDF
  const buildQuotationHtml = (notification: Notification) => {
    if (!notification.quotation) {
      throw new Error('Không có thông tin báo giá');
    }
    
    const quotationComponent = <QuotationPdf {...notification.quotation} />;
    return renderToString(quotationComponent);
  };

  const pending = adaptedNotifications.filter(n => !n.read);
  const confirmed = adaptedNotifications.filter(n => n.read);

  // Cập nhật pending_count mỗi lần danh sách đổi
  useEffect(() => {
    try {
      window.localStorage.setItem('pending_count', String(pending.length));
    } catch {}
  }, [pending.length]);
  
  // Hiển thị trạng thái loading
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 flex justify-center items-center min-h-[300px]">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
        <span className="ml-2 text-lg font-medium">Đang tải thông báo...</span>
      </div>
    );
  }
  
  // Hiển thị trạng thái lỗi
  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2" />
          <span>Có lỗi khi tải thông báo. Vui lòng thử lại sau.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Link href="/customer/dashboard" className="flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span>Quay lại Dashboard</span>
        </Link>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Thông báo</h1>
        <Badge variant="outline" className="px-3 py-1 text-sm">
          {pending.length} chưa đọc
        </Badge>
      </div>
      
      {toast && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
          <CheckCircle className="h-5 w-5 mr-2" />
          <span>{toast}</span>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm p-6 space-y-8">
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">Chờ xác nhận ({pending.length})</h3>
          {pending.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
              <Info className="h-10 w-10 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Không có báo giá đang chờ xác nhận.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {pending.map((n) => (
                <div key={n.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition bg-white">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 rounded-lg bg-blue-100">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{n.quotation?.vehicle}</h3>
                        <p className="text-sm text-gray-500">{n.quotation?.issue}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">{n.date}</Badge>
                  </div>
                  <div className="space-y-3 bg-gray-50 p-4 rounded-lg mb-4">
                    <p className="text-gray-700"><span className="font-medium">Biển số:</span> {n.quotation?.licensePlate}</p>
                    <p className="text-gray-700"><span className="font-medium">Chi phí phụ tùng:</span> {n.quotation?.partsCost.toLocaleString('vi-VN')} VNĐ</p>
                    <p className="text-gray-700"><span className="font-medium">Chi phí nhân công:</span> {n.quotation?.laborCost.toLocaleString('vi-VN')} VNĐ</p>
                    <p className="text-gray-700 font-bold"><span className="font-medium">Tổng chi phí:</span> {n.quotation?.totalCost.toLocaleString('vi-VN')} VNĐ</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Button onClick={() => handleConfirm(n.id)} className="bg-green-600 hover:bg-green-700">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Xác nhận báo giá
                    </Button>
                    <Button variant="outline" onClick={() => handleDownloadPDF(n.id)} className="border-blue-600 text-blue-600 hover:bg-blue-50">
                      <Download className="h-4 w-4 mr-2" /> Tải PDF
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">Đã xác nhận ({confirmed.length})</h3>
          {confirmed.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
              <Info className="h-10 w-10 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Chưa có báo giá nào được xác nhận.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {confirmed.map((n) => (
                <div key={`confirmed-${n.id}`} className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-sm transition">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-green-100">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{n.quotation?.vehicle}</p>
                        <p className="text-sm text-gray-600">{n.quotation?.issue}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Đã xác nhận</Badge>
                      <Button variant="outline" size="sm" onClick={() => handleDownloadPDF(n.id)} className="border-blue-600 text-blue-600 hover:bg-blue-50">
                        <Download className="h-4 w-4 mr-2" /> PDF
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}