"use client";

import { useState } from 'react';
import useAppointmentsQuery from '@/hooks/useAppointmentsQuery';
import { Calendar, Clock, Edit, Trash2, CheckCircle, XCircle, Car, User, Phone } from 'lucide-react';

export default function Appointments() {
  const { data: appointments, loading, error } = useAppointmentsQuery({ useMock: true });
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    service: '',
    vehicle: '',
    customerName: '',
    phone: '',
    notes: ''
  });

  // Data được lấy bởi hook; khi nối API .NET chỉ cần set useMock: false và cấu hình baseURL

  const handleSubmit = (e) => {
    e.preventDefault();
    // Khách hàng không được tự tạo/chỉnh sửa
    setShowForm(false);
    setEditingId(null);
    setFormData({
      date: '',
      time: '',
      service: '',
      vehicle: '',
      customerName: '',
      phone: '',
      notes: ''
    });
  };

  const handleEdit = (appointment) => {
    // Mở form chỉ-đọc để xem chi tiết
    setFormData(appointment);
    setShowForm(true);
  };

  const handleDelete = () => {
    alert('Bạn không thể xóa lịch hẹn. Vui lòng liên hệ garage.');
  };

  const handleStatusChange = () => {
    alert('Trạng thái lịch hẹn do garage cập nhật.');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed': return 'Đã xác nhận';
      case 'pending': return 'Chờ xác nhận';
      case 'completed': return 'Hoàn thành';
      case 'cancelled': return 'Đã hủy';
      default: return 'Không xác định';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Lịch hẹn của bạn</h2>
        <span className="text-sm text-gray-500">Lịch hẹn do garage tạo và xác nhận</span>
      </div>

      {/* Appointment Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">
            Chi tiết lịch hẹn
          </h3>
          {/** Chế độ chỉ đọc cho khách hàng */}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Biển số</label>
              <input
                type="text"
                value={formData.licensePlate || ''}
                onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700"
                readOnly
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ngày</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700"
                readOnly
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Giờ</label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700"
                readOnly
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dịch vụ</label>
              <input
                type="text"
                value={formData.service}
                onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                placeholder="VD: Bảo dưỡng định kỳ"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700"
                readOnly
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Xe</label>
              <input
                type="text"
                value={formData.vehicle}
                onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
                placeholder="VD: Honda Civic 2020"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700"
                readOnly
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tên khách hàng</label>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                placeholder="Tên đầy đủ"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700"
                readOnly
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="0901234567"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700"
                readOnly
                disabled
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows="3"
                placeholder="Ghi chú thêm về lịch hẹn..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700"
                readOnly
                disabled
              />
            </div>
            <div className="md:col-span-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                Đóng
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Appointments List */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Danh sách lịch hẹn</h3>
        {loading && <div className="text-gray-500">Đang tải...</div>}
        {error && <div className="text-red-600">Không tải được dữ liệu.</div>}
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <div>
                    <h4 className="font-semibold">{appointment.service}</h4>
                    <p className="text-sm text-gray-600">{appointment.vehicle}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(appointment.status)}`}>
                  {getStatusText(appointment.status)}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>{appointment.date} - {appointment.time}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Car className="h-4 w-4" />
                  <span>BS: {appointment.licensePlate}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>{appointment.customerName}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>{appointment.phone}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Car className="h-4 w-4" />
                  <span>{appointment.vehicle}</span>
                </div>
              </div>
              
              {appointment.notes && (
                <p className="text-sm text-gray-600 mb-3">{appointment.notes}</p>
              )}
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEdit(appointment)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Xem
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}