"use client";

export default function SettingsTab() {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-6">Cài đặt chung</h3>
      <div className="space-y-6">
        <div className="p-4 border border-gray-200 rounded-lg">
          <h4 className="font-medium mb-3">Ngôn ngữ</h4>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="vi">Tiếng Việt</option>
            <option value="en">English</option>
          </select>
        </div>

        <div className="p-4 border border-gray-200 rounded-lg">
          <h4 className="font-medium mb-3">Múi giờ</h4>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="Asia/Ho_Chi_Minh">Hồ Chí Minh (GMT+7)</option>
            <option value="Asia/Bangkok">Bangkok (GMT+7)</option>
            <option value="Asia/Singapore">Singapore (GMT+8)</option>
            <option value="Asia/Tokyo">Tokyo (GMT+9)</option>
          </select>
        </div>

        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="font-medium text-red-800 mb-2">Xóa tài khoản</h4>
          <p className="text-sm text-red-700 mb-3">Thao tác này sẽ xóa vĩnh viễn tài khoản và tất cả dữ liệu của bạn</p>
          <button onClick={() => alert('Tính năng này chưa được kích hoạt')} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">
            Xóa tài khoản
          </button>
        </div>
      </div>
    </div>
  );
}


