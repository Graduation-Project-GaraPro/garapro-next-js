"use client";

import { User, Mail, Phone, MapPin, Edit, Save, X } from 'lucide-react';

export default function ProfileTab({ isEditing, userData, formData, onChange, onSave, onCancel, onAvatarChange }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Thông tin cá nhân</h3>
        {!isEditing ? (
          <button 
            onClick={() => onChange({ type: 'toggleEdit', value: true })}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <Edit className="h-4 w-4 mr-1" />
            Chỉnh sửa
          </button>
        ) : (
          <div className="flex space-x-2">
            <button 
              onClick={onSave}
              className="flex items-center text-green-600 hover:text-green-800"
            >
              <Save className="h-4 w-4 mr-1" />
              Lưu
            </button>
            <button 
              onClick={onCancel}
              className="flex items-center text-red-600 hover:text-red-800"
            >
              <X className="h-4 w-4 mr-1" />
              Hủy
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-6">
        <div className="md:w-1/3 flex flex-col items-center">
          <div className="relative mb-4">
            <img 
              src={formData.avatar} 
              alt="Profile" 
              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg" 
            />
            {isEditing && (
              <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition">
                <Edit className="h-4 w-4" />
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={onAvatarChange}
                />
              </label>
            )}
          </div>
          <h4 className="text-xl font-semibold">{userData.name}</h4>
          <p className="text-gray-600">Khách hàng</p>
        </div>

        <div className="md:w-2/3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={(e) => onChange({ type: 'field', name: e.target.name, value: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span>{userData.name}</span>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={(e) => onChange({ type: 'field', name: e.target.name, value: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{userData.email}</span>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={(e) => onChange({ type: 'field', name: e.target.name, value: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{userData.phone}</span>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
              {isEditing ? (
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={(e) => onChange({ type: 'field', name: e.target.name, value: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>{userData.address}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200">
        <h4 className="font-semibold mb-4">Thống kê</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">
              {userData.totalServices}
            </div>
            <div className="text-sm text-blue-800">Dịch vụ đã sử dụng</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">
              {userData.totalSpent.toLocaleString('vi-VN')} VNĐ
            </div>
            <div className="text-sm text-green-800">Tổng chi phí</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-600">
              {(() => {
                const diffMs = new Date() - new Date(userData.joinDate);
                const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                return `${days} ngày ${hours} giờ`;
              })()}
            </div>
            <div className="text-sm text-purple-800">Thành viên</div>
          </div>
        </div>
      </div>
    </div>
  );
}


