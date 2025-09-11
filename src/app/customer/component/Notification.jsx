"use client";

import { useEffect, useState } from 'react';
import { CheckCircle, FileText, AlertTriangle, Download, Info } from 'lucide-react';
import { generatePdfFromHtml, buildQuotationHtml } from '../utils/pdf';

export default function Quotation() {
  // Seed defaults if localStorage empty
  const defaultNotifs = [
    {
      id: 1,
      type: 'warning',
      title: 'Báo giá sửa chữa - Honda Civic 2020',
      message: 'Động cơ kêu lạ, vui lòng xác nhận để tiến hành.',
      date: '2024-09-10',
      confirmed: false,
      read: false,
      quotation: { vehicle: 'Honda Civic 2020', licensePlate: '59A-123.45', issue: 'Động cơ kêu lạ', partsCost: 1500000, laborCost: 500000, totalCost: 2000000 }
    },
    {
      id: 2,
      type: 'warning',
      title: 'Báo giá sửa chữa - Toyota Camry 2019',
      message: 'Phanh kêu rít, vui lòng xác nhận để tiến hành.',
      date: '2024-09-11',
      confirmed: false,
      read: false,
      quotation: { vehicle: 'Toyota Camry 2019', licensePlate: '51G-678.90', issue: 'Phanh kêu rít', partsCost: 900000, laborCost: 400000, totalCost: 1300000 }
    },
    {
      id: 3,
      type: 'warning',
      title: 'Báo giá sửa chữa - BMW X5 2021',
      message: 'Điều hòa yếu, vui lòng xác nhận để tiến hành.',
      date: '2024-09-12',
      confirmed: false,
      read: false,
      quotation: { vehicle: 'BMW X5 2021', licensePlate: '30F-246.80', issue: 'Điều hòa yếu', partsCost: 1800000, laborCost: 700000, totalCost: 2500000 }
    }
  ];

  const [notifications, setNotifications] = useState(defaultNotifs);
  const [toast, setToast] = useState('');

  // Khởi tạo dữ liệu mặc định (không đọc trạng thái cũ) và đồng bộ pending_count
  useEffect(() => {
    setNotifications(defaultNotifs);
    try { window.localStorage.setItem('pending_count', String(defaultNotifs.filter(n => !n.confirmed).length)); } catch {}
  }, []);

  const save = (next) => {
    setNotifications(next);
    try {
      const pending = next.filter(n => !n.confirmed).length;
      window.localStorage.setItem('pending_count', String(pending));
    } catch {}
  };

  const handleConfirm = (id) => {
    const next = notifications.map(n => n.id === id ? { ...n, confirmed: true, read: true } : n);
    const pendingCount = next.filter(n => !n.confirmed).length;
    save(next);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('app:notificationConfirmed', { detail: { id, pendingCount } }));
    }
    setToast('Cảm ơn bạn đã xác nhận, chúng tôi sẽ tiến hành sửa chữa ngay.');
    setTimeout(() => setToast(''), 2000);
  };

  const handleDownloadPDF = async (id) => {
    try {
      const n = notifications.find(x => x.id === id);
      if (!n?.quotation) return;
      const q = n.quotation;
      const html = buildQuotationHtml({
        brand: 'Garage PRO',
        contact: 'Hotline: 1900 123 456 • Email: support@garagepro.com',
        code: n.id,
        date: n.date,
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
      alert('Có lỗi khi tạo PDF. Vui lòng thử lại.');
    }
  };

  const pending = notifications.filter(n => !n.confirmed);
  const confirmed = notifications.filter(n => n.confirmed);

  // Cập nhật pending_count mỗi lần danh sách đổi
  useEffect(() => {
    try {
      window.localStorage.setItem('pending_count', String(pending.length));
    } catch {}
  }, [pending.length]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Thông báo</h2>
      {toast && (
        <div className="mb-4 bg-green-600 text-white px-4 py-2 rounded-lg">{toast}</div>
      )}

      <div className="space-y-8">
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Chờ xác nhận ({pending.length})</h3>
          {pending.length === 0 ? (
            <p className="text-gray-600">Không có báo giá đang chờ.</p>
      ) : (
        <div className="space-y-6">
              {pending.map((n) => (
                <div key={n.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <FileText className="h-6 w-6 text-blue-600" />
                  <div>
                        <h3 className="text-lg font-semibold">{n.quotation.vehicle}</h3>
                        <p className="text-sm text-gray-500">{n.quotation.issue}</p>
                  </div>
                </div>
                    <span className="text-sm text-gray-500">{n.date}</span>
              </div>
              <div className="space-y-3">
                    <p className="text-gray-700"><span className="font-medium">Biển số:</span> {n.quotation.licensePlate}</p>
                    <p className="text-gray-700"><span className="font-medium">Chi phí phụ tùng:</span> {n.quotation.partsCost.toLocaleString('vi-VN')} VNĐ</p>
                    <p className="text-gray-700"><span className="font-medium">Chi phí nhân công:</span> {n.quotation.laborCost.toLocaleString('vi-VN')} VNĐ</p>
                    <p className="text-gray-700 font-bold"><span className="font-medium">Tổng chi phí:</span> {n.quotation.totalCost.toLocaleString('vi-VN')} VNĐ</p>
              </div>
              <div className="mt-4 flex items-center space-x-4">
                    <button onClick={() => handleConfirm(n.id)} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Xác nhận báo giá
                  </button>
                    <button onClick={() => handleDownloadPDF(n.id)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center">
                      <Download className="h-4 w-4 mr-2" /> Tải PDF
                    </button>
                  </div>
                </div>
              ))}
                  </div>
                )}
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Đã xác nhận ({confirmed.length})</h3>
          {confirmed.length === 0 ? (
            <p className="text-gray-500">Chưa có báo giá nào được xác nhận.</p>
          ) : (
            <div className="space-y-4">
              {confirmed.map((n) => (
                <div key={`confirmed-${n.id}`} className="border border-green-200 rounded-lg p-4 bg-green-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium text-gray-900">{n.quotation.vehicle}</p>
                        <p className="text-sm text-gray-600">{n.quotation.issue}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-green-700 bg-white border border-green-300 rounded-full px-2 py-1">ĐÃ XÁC NHẬN</span>
                      <button onClick={() => handleDownloadPDF(n.id)} className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 flex items-center">
                        <Download className="h-4 w-4 mr-2" /> Tải PDF
                  </button>
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