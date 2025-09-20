"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Calendar, Clock, Car, MapPin, Plus, Search, Filter, ChevronRight, AlertCircle } from 'lucide-react';

// Định nghĩa kiểu dữ liệu
interface Appointment {
  id: string;
  serviceId: string;
  serviceName: string;
  vehicleId: string;
  vehicleName: string;
  branchId: string;
  branchName: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
}

export default function AppointmentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Dữ liệu mẫu cho các lịch hẹn
  const appointments: Appointment[] = [
    {
      id: '1',
      serviceId: '1',
      serviceName: 'Bảo dưỡng định kỳ',
      vehicleId: '1',
      vehicleName: 'Toyota Camry - 29A-12345',
      branchId: '1',
      branchName: 'GaraPro Hà Nội',
      date: '2023-06-15',
      time: '09:00',
      status: 'confirmed',
      notes: 'Kiểm tra dầu và lọc gió'
    },
    {
      id: '2',
      serviceId: '2',
      serviceName: 'Thay dầu động cơ',
      vehicleId: '2',
      vehicleName: 'Honda Civic - 30A-54321',
      branchId: '2',
      branchName: 'GaraPro Hồ Chí Minh',
      date: '2023-06-20',
      time: '14:30',
      status: 'pending',
    },
    {
      id: '3',
      serviceId: '3',
      serviceName: 'Kiểm tra và sửa chữa phanh',
      vehicleId: '1',
      vehicleName: 'Toyota Camry - 29A-12345',
      branchId: '1',
      branchName: 'GaraPro Hà Nội',
      date: '2023-05-10',
      time: '10:00',
      status: 'completed',
    },
    {
      id: '4',
      serviceId: '4',
      serviceName: 'Cân chỉnh bánh xe',
      vehicleId: '3',
      vehicleName: 'Ford Ranger - 29B-67890',
      branchId: '3',
      branchName: 'GaraPro Đà Nẵng',
      date: '2023-05-05',
      time: '08:00',
      status: 'cancelled',
      notes: 'Hủy do lịch trình thay đổi'
    },
  ];
  
  // Lọc lịch hẹn theo từ khóa tìm kiếm và trạng thái
  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = 
      appointment.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.vehicleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.branchName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Sắp xếp lịch hẹn theo ngày (mới nhất lên đầu)
  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  // Format ngày tháng
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Hiển thị trạng thái lịch hẹn
  const getStatusBadge = (status: Appointment['status']) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Chờ xác nhận
          </span>
        );
      case 'confirmed':
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Đã xác nhận
          </span>
        );
      case 'completed':
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Hoàn thành
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Đã hủy
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Lịch hẹn dịch vụ</h1>
        <Link 
          href="/customer/services/appointments/create" 
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Đặt lịch hẹn mới
        </Link>
      </div>

      {/* Thanh tìm kiếm và lọc */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Tìm kiếm lịch hẹn..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select
          className="px-4 py-2 border border-gray-200 rounded-lg bg-white"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="pending">Chờ xác nhận</option>
          <option value="confirmed">Đã xác nhận</option>
          <option value="completed">Hoàn thành</option>
          <option value="cancelled">Đã hủy</option>
        </select>
      </div>

      {/* Danh sách lịch hẹn */}
      <div className="space-y-4">
        {sortedAppointments.length > 0 ? (
          sortedAppointments.map((appointment) => (
            <Link 
              key={appointment.id} 
              href={`/customer/services/appointments/${appointment.id}`}
              className="block"
            >
              <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{appointment.serviceName}</h3>
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>{formatDate(appointment.date)} - {appointment.time}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Car className="h-4 w-4 mr-2" />
                          <span>{appointment.vehicleName}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span>{appointment.branchName}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      {getStatusBadge(appointment.status)}
                      <ChevronRight className="h-5 w-5 text-gray-400 mt-4" />
                    </div>
                  </div>
                  
                  {appointment.notes && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Ghi chú:</span> {appointment.notes}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Không có lịch hẹn nào</h3>
            <p className="mt-2 text-gray-500">
              {searchTerm || statusFilter !== 'all' ? 
                'Không tìm thấy lịch hẹn nào phù hợp với bộ lọc của bạn.' : 
                'Bạn chưa có lịch hẹn nào. Hãy đặt lịch hẹn mới để sử dụng dịch vụ của chúng tôi.'}
            </p>
            {(searchTerm || statusFilter !== 'all') && (
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
                className="mt-4 text-blue-500 hover:text-blue-700"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        )}
      </div>

      {/* Thông tin hướng dẫn */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start">
        <AlertCircle className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="font-medium text-blue-800">Lưu ý về lịch hẹn</h4>
          <ul className="mt-2 text-sm text-blue-700 space-y-1">
            <li>• Vui lòng đến đúng giờ đã đặt lịch.</li>
            <li>• Bạn có thể hủy hoặc thay đổi lịch hẹn trước 24 giờ.</li>
            <li>• Nếu cần hỗ trợ, vui lòng liên hệ với chúng tôi qua hotline: 1900-1234.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}