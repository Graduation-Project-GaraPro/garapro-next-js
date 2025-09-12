"use client";

import { Shield, Bell } from 'lucide-react';

export default function SecurityTab({ securitySettings, onToggleTwoFactor, onToggleLoginAlerts, onChangeSessionTimeout, onOpenChangePassword }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-6">Cài đặt bảo mật</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <Shield className="h-5 w-5 text-blue-600" />
            <div>
              <h4 className="font-medium">Xác thực hai yếu tố</h4>
              <p className="text-sm text-gray-600">Bảo mật tài khoản với xác thực hai lớp</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={securitySettings.twoFactor} onChange={onToggleTwoFactor} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <Bell className="h-5 w-5 text-orange-600" />
            <div>
              <h4 className="font-medium">Thông báo đăng nhập</h4>
              <p className="text-sm text-gray-600">Nhận thông báo khi có đăng nhập mới</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={securitySettings.loginAlerts} onChange={onToggleLoginAlerts} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="p-4 border border-gray-200 rounded-lg">
          <h4 className="font-medium mb-2">Thời gian hết phiên (phút)</h4>
          <select
            value={securitySettings.sessionTimeout}
            onChange={(e) => onChangeSessionTimeout(parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value={15}>15 phút</option>
            <option value={30}>30 phút</option>
            <option value={60}>1 giờ</option>
            <option value={120}>2 giờ</option>
          </select>
        </div>

        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-medium text-yellow-800 mb-2">Đổi mật khẩu</h4>
          <p className="text-sm text-yellow-700 mb-3">Thay đổi mật khẩu định kỳ giúp tăng cường bảo mật tài khoản</p>
          <button onClick={onOpenChangePassword} className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition">
            Đổi mật khẩu
          </button>
        </div>
      </div>
    </div>
  );
}


