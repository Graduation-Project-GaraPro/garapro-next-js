"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Clock, Car, MapPin, ArrowLeft, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

// Định nghĩa kiểu dữ liệu
interface Appointment {
  id: string;
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  vehicleId: string;
  vehicleName: string;
  vehicleDetails: string;
  branchId: string;
  branchName: string;
  branchAddress: string;
  branchPhone: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export default function AppointmentDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  
  // Dữ liệu mẫu cho chi tiết lịch hẹn
  const appointment: Appointment = {
    id: params.id,
    serviceId: '1',
    serviceName: 'Bảo dưỡng định kỳ',
    servicePrice: 800000,
    vehicleId: '1',
    vehicleName: 'Toyota Camry',
    vehicleDetails: 'Năm SX: 2019, Biển số: 29A-12345',
    branchId: '1',
    branchName: 'GaraPro Hà Nội',
    branchAddress: '123 Đường Láng, Đống Đa, Hà Nội',
    branchPhone: '024-1234-5678',
    date: '2023-06-15',
    time: '09:00',
    status: 'confirmed',
    notes: 'Kiểm tra dầu và lọc gió',
    createdAt: '2023-06-01T10:30:00Z'
  };
  
  // Format ngày tháng
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
  
  // Format giá tiền
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };
  
  // Hiển thị trạng thái lịch hẹn
  const getStatusInfo = (status: Appointment['status']) => {
    switch (status) {
      case 'pending':
        return {
          label: 'Chờ xác nhận',
          color: 'bg-yellow-100 text-yellow-800',
          icon: <Clock className="h-5 w-5 mr-2" />
        };
      case 'confirmed':
        return {
          label: 'Đã xác nhận',
          color: 'bg-blue-100 text-blue-800',
          icon: <CheckCircle className="h-5 w-5 mr-2" />
        };
      case 'completed':
        return {
          label: 'Hoàn thành',
          color: 'bg-green-100 text-green-800',
          icon: <CheckCircle className="h-5 w-5 mr-2" />
        };
      case 'cancelled':
        return {
          label: 'Đã hủy',
          color: 'bg-red-100 text-red-800',
          icon: <XCircle className="h-5 w-5 mr-2" />
        };
      default:
        return {
          label: 'Không xác định',
          color: 'bg-gray-100 text-gray-800',
          icon: <AlertCircle className="h-5 w-5 mr-2" />
        };
    }
  };
  
  // Xử lý hủy lịch hẹn
  const handleCancelAppointment = () => {
    setIsLoading(true);
    
    // Giả lập API call
    setTimeout(() => {
      setIsLoading(false);
      setShowCancelConfirm(false);
      // Chuyển hướng về trang danh sách lịch hẹn
      router.push('/customer/services/appointments');
    }, 1500);
  };
  
  // Kiểm tra xem có thể hủy lịch hẹn không
  const canCancel = () => {
    return appointment.status === 'pending' || appointment.status === 'confirmed';
  };
  
  const statusInfo = getStatusInfo(appointment.status);
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/customer/services/appointments" className="flex items-center text-blue-500 hover:text-blue-700">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Quay lại danh sách lịch hẹn
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-blue-500 text-white p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold">{appointment.serviceName}</h1>
              <p className="mt-2 opacity-90">
                Mã lịch hẹn: #{appointment.id}
              </p>
            </div>
            <div className={`px-3 py-2 rounded-lg flex items-center ${statusInfo.color}`}>
              {statusInfo.icon}
              <span className="font-medium">{statusInfo.label}</span>
            </div>
          </div>
        </div>
        
        {/* Nội dung chi tiết */}
        <div className="p-6 space-y-6">
          {/* Thông tin thời gian */}
          <div className="flex items-start">
            <Calendar className="h-5 w-5 text-blue-500 mr-4 mt-1" />
            <div>
              <h3 className="font-medium">Thời gian</h3>
              <p className="mt-1 text-gray-600">{formatDate(appointment.date)}</p>
              <p className="text-gray-600">{appointment.time}</p>
            </div>
          </div>
          
          {/* Thông tin phương tiện */}
          <div className="flex items-start">
            <Car className="h-5 w-5 text-blue-500 mr-4 mt-1" />
            <div>
              <h3 className="font-medium">Phương tiện</h3>
              <p className="mt-1 text-gray-600">{appointment.vehicleName}</p>
              <p className="text-gray-600">{appointment.vehicleDetails}</p>
            </div>
          </div>
          
          {/* Thông tin chi nhánh */}
          <div className="flex items-start">
            <MapPin className="h-5 w-5 text-blue-500 mr-4 mt-1" />
            <div>
              <h3 className="font-medium">Chi nhánh</h3>
              <p className="mt-1 text-gray-600">{appointment.branchName}</p>
              <p className="text-gray-600">{appointment.branchAddress}</p>
              <p className="text-gray-600">{appointment.branchPhone}</p>
            </div>
          </div>
          
          {/* Thông tin dịch vụ */}
          <div className="flex items-start">
            <div className="h-5 w-5 text-blue-500 mr-4 mt-1">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
              </svg>
            </div>
            <div>
              <h3 className="font-medium">Chi tiết dịch vụ</h3>
              <p className="mt-1 text-gray-600">{appointment.serviceName}</p>
              <p className="text-blue-500 font-medium">{formatPrice(appointment.servicePrice)}</p>
            </div>
          </div>
          
          {/* Ghi chú */}
          {appointment.notes && (
            <div className="border-t pt-6">
              <h3 className="font-medium">Ghi chú</h3>
              <p className="mt-2 text-gray-600">{appointment.notes}</p>
            </div>
          )}
          
          {/* Thông tin đặt lịch */}
          <div className="border-t pt-6 text-sm text-gray-500">
            <p>Đặt lịch vào: {new Date(appointment.createdAt).toLocaleString('vi-VN')}</p>
          </div>
        </div>
        
        {/* Footer với các nút hành động */}
        <div className="p-6 bg-gray-50 border-t">
          {canCancel() ? (
            <div className="flex justify-between">
              <Link 
                href={`/customer/services/appointments/create?service=${appointment.serviceId}`}
                className="px-4 py-2 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50"
              >
                Đặt lịch tương tự
              </Link>
              
              <button
                type="button"
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                onClick={() => setShowCancelConfirm(true)}
              >
                Hủy lịch hẹn
              </button>
            </div>
          ) : (
            <div className="flex justify-center">
              <Link 
                href={`/customer/services/appointments/create?service=${appointment.serviceId}`}
                className="px-4 py-2 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50"
              >
                Đặt lịch tương tự
              </Link>
            </div>
          )}
        </div>
      </div>
      
      {/* Thông tin hướng dẫn */}
      <div className="mt-6 bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start">
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
      
      {/* Modal xác nhận hủy lịch hẹn */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold">Xác nhận hủy lịch hẹn</h3>
            <p className="mt-2 text-gray-600">
              Bạn có chắc chắn muốn hủy lịch hẹn này không? Hành động này không thể hoàn tác.
            </p>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                onClick={() => setShowCancelConfirm(false)}
                disabled={isLoading}
              >
                Không, giữ lịch hẹn
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                onClick={handleCancelAppointment}
                disabled={isLoading}
              >
                {isLoading ? 'Đang xử lý...' : 'Có, hủy lịch hẹn'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}