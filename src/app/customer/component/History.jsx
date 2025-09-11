"use client";

import { useState, useEffect } from 'react';
import { History as HistoryIcon, Search, Filter, Download, Eye, Star, Calendar, Car, Wrench, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { generatePdfFromHtml, buildInvoiceHtml } from '../utils/pdf';

export default function History() {
  const [repairHistory, setRepairHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('all');

  useEffect(() => {
    // Simulate loading repair history
    setRepairHistory([
      {
        id: 1,
        vehicle: 'Honda Civic 2020',
        licensePlate: '59A-123.45',
        service: 'Bảo dưỡng định kỳ',
        date: '2025-01-10',
        status: 'completed',
        cost: 1500000,
        technician: 'Nguyễn Văn A',
        rating: 5,
        description: 'Thay dầu máy, lọc dầu, kiểm tra hệ thống phanh',
        parts: ['Dầu máy 5W-30', 'Lọc dầu', 'Lọc gió'],
        laborHours: 2
      },
      {
        id: 2,
        vehicle: 'Toyota Camry 2019',
        licensePlate: '51G-678.90',
        service: 'Sửa chữa phanh',
        date: '2025-01-08',
        status: 'completed',
        cost: 3200000,
        technician: 'Trần Thị B',
        rating: 4,
        description: 'Thay má phanh trước, kiểm tra dầu phanh, điều chỉnh phanh tay',
        parts: ['Má phanh trước', 'Dầu phanh DOT4', 'Dây phanh'],
        laborHours: 4
      },
      {
        id: 3,
        vehicle: 'BMW X5 2021',
        licensePlate: '30F-246.80',
        service: 'Kiểm tra động cơ',
        date: '2025-01-05',
        status: 'completed',
        cost: 2500000,
        technician: 'Lê Văn C',
        rating: 5,
        description: 'Chẩn đoán lỗi động cơ, thay bugi, kiểm tra hệ thống đánh lửa',
        parts: ['Bugi', 'Dây bugi', 'Bộ lọc nhiên liệu'],
        laborHours: 3
      },
      {
        id: 4,
        vehicle: 'Honda Civic 2020',
        licensePlate: '59A-123.45',
        service: 'Thay lốp',
        date: '2025-01-03',
        status: 'completed',
        cost: 800000,
        technician: 'Nguyễn Văn A',
        rating: 4,
        description: 'Thay 4 lốp mới, cân bằng bánh xe, kiểm tra áp suất',
        parts: ['Lốp 205/55R16 x4', 'Van lốp'],
        laborHours: 1
      },
      {
        id: 5,
        vehicle: 'Toyota Camry 2019',
        licensePlate: '51G-678.90',
        service: 'Sửa chữa điều hòa',
        date: '2024-12-28',
        status: 'completed',
        cost: 4500000,
        technician: 'Trần Thị B',
        rating: 5,
        description: 'Thay máy nén điều hòa, nạp gas, kiểm tra hệ thống làm mát',
        parts: ['Máy nén điều hòa', 'Gas R134a', 'Bộ lọc cabin'],
        laborHours: 5
      }
    ]);
  }, []);

  const filteredHistory = repairHistory.filter(item => {
    const matchesSearch = item.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.technician.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    
    const matchesDate = filterDate === 'all' || 
                       (filterDate === 'week' && isWithinWeek(item.date)) ||
                       (filterDate === 'month' && isWithinMonth(item.date)) ||
                       (filterDate === 'year' && isWithinYear(item.date));
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  function isWithinWeek(date) {
    const itemDate = new Date(date);
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return itemDate >= weekAgo;
  }

  function isWithinMonth(date) {
    const itemDate = new Date(date);
    const now = new Date();
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    return itemDate >= monthAgo;
  }

  function isWithinYear(date) {
    const itemDate = new Date(date);
    const now = new Date();
    return itemDate.getFullYear() === now.getFullYear();
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Hoàn thành';
      case 'in-progress': return 'Đang xử lý';
      case 'cancelled': return 'Đã hủy';
      default: return 'Không xác định';
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const handleDownloadInvoice = async (requestId) => {
    try {
      const target = repairHistory.find(h => h.id === requestId) || {};
      const invoiceData = {
        requestId,
        date: new Date().toLocaleDateString('vi-VN'),
        customer: 'Nguyễn Văn A',
        vehicle: target.vehicle || 'Không rõ',
        licensePlate: target.licensePlate || 'Không rõ',
        address: '123 Đường ABC, Quận 1, TP.HCM',
        phone: '0901234567',
        services: [
          { name: target.service || 'Dịch vụ sửa chữa', price: target.cost || 1500000, quantity: 1 },
        ],
        tax: 0.1,
        total: target.cost || 1500000
      };
      const html = buildInvoiceHtml({
        brand: 'Garage PRO',
        contact: 'Hotline: 1900 123 456 • Email: support@garagepro.com',
        code: invoiceData.requestId,
        date: invoiceData.date,
        customerName: invoiceData.customer,
        vehicle: invoiceData.vehicle,
        licensePlate: invoiceData.licensePlate,
        address: invoiceData.address,
        phone: invoiceData.phone,
        items: invoiceData.services,
        taxRate: invoiceData.tax,
        total: invoiceData.total
      });
      await generatePdfFromHtml(html, `hoa_don_${requestId}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Có lỗi khi tạo PDF. Vui lòng thử lại.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-purple-100 p-2 rounded-lg">
          <HistoryIcon className="h-6 w-6 text-purple-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Lịch sử sửa chữa</h2>
          <p className="text-gray-600">Xem lại tất cả các dịch vụ đã thực hiện</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm</label>
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm theo xe, dịch vụ, kỹ thuật viên..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả</option>
              <option value="completed">Hoàn thành</option>
              <option value="in-progress">Đang xử lý</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Thời gian</label>
            <select
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả</option>
              <option value="week">Tuần qua</option>
              <option value="month">Tháng qua</option>
              <option value="year">Năm nay</option>
            </select>
          </div>
        </div>
      </div>

      {/* History List */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Danh sách sửa chữa ({filteredHistory.length})</h3>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Xuất báo cáo
          </button>
        </div>
        
        <div className="space-y-4">
          {filteredHistory.map((item) => (
            <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <Car className="h-5 w-5 text-blue-600" />
                  <div>
                    <h4 className="font-semibold">{item.service}</h4>
                    <p className="text-sm text-gray-600">{item.vehicle} • {item.licensePlate}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(item.status)}`}>
                    {getStatusText(item.status)}
                  </span>
                  <div className="flex items-center">
                    {renderStars(item.rating)}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>{item.date}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Wrench className="h-4 w-4" />
                  <span>{item.technician}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>{item.laborHours}h công</span>
                </div>
                <div className="text-sm font-semibold text-green-600">
                  {item.cost.toLocaleString('vi-VN')} VNĐ
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">{item.description}</p>
              
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-700 mb-1">Phụ tùng đã sử dụng:</p>
                <div className="flex flex-wrap gap-1">
                  {item.parts.map((part, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      {part}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Link 
                  href={`/request-detail?requestId=${item.id}`}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Xem chi tiết
                </Link>
                <button 
                  onClick={() => handleDownloadInvoice(item.id)}
                  className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Tải hóa đơn
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {filteredHistory.length === 0 && (
          <div className="text-center py-8">
            <HistoryIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Không tìm thấy lịch sử sửa chữa nào</p>
          </div>
        )}
      </div>
    </div>
  );
}
