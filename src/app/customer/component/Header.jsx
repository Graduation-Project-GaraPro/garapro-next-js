"use client";
import { useState } from 'react';
import { Car, Bell, X, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Header() {
  const [showNotifications, setShowNotifications] = useState(false);
  const router = useRouter();
  
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'success',
      title: 'Xe Honda Civic đã hoàn thành sửa chữa',
      message: 'Dịch vụ bảo dưỡng định kỳ đã hoàn thành. Bạn có thể đến lấy xe.',
      time: '2 giờ trước',
      read: false,
      target: '/request-detail?requestId=1'
    },
    {
      id: 2,
      type: 'info',
      title: 'Có lịch hẹn vào ngày mai',
      message: 'Lịch hẹn sửa chữa phanh lúc 9:00 sáng ngày mai.',
      time: '1 ngày trước',
      read: false,
      target: '/appointments'
    },
    {
      id: 3,
      type: 'warning',
      title: 'Báo giá sửa chữa đã được gửi',
      message: 'Báo giá cho dịch vụ sửa chữa điều hòa đã được gửi qua email.',
      time: '3 giờ trước',
      read: false,
      target: '/notifications'
    },
    {
      id: 4,
      type: 'success',
      title: 'Thanh toán thành công',
      message: 'Thanh toán cho dịch vụ thay lốp đã được xử lý thành công.',
      time: '1 tuần trước',
      read: true,
      target: '/history'
    }
  ]);

  const unread = notifications.filter(n => !n.read);
  const read = notifications.filter(n => n.read);
  const unreadCount = unread.length;

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info': return <Info className="h-5 w-5 text-blue-500" />;
      default: return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationBg = (type) => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'info': return 'bg-blue-50 border-blue-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };
  // cập nhật avatar realtime
  if (typeof window !== 'undefined' && !window.__avatarListenerBound) {
    window.addEventListener('app:avatarUpdated', (e) => {
      const url = e?.detail?.url;
      const img = document.getElementById('app-header-avatar');
      if (img && url) img.src = url;
    });
    window.__avatarListenerBound = true;
  }

  const handleNotificationClick = (notification) => {
    setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read: true } : n));
    setShowNotifications(false);
    if (notification.target) {
      router.push(notification.target);
    }
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Car className="h-8 w-8 text-blue-500" />
            <h1 className="text-xl font-bold text-white">Garage Pro</h1>
          </div>
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-300 hover:text-white transition"
              >
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Thông báo</h3>
                      <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">{unreadCount} chưa đọc</span>
                      <button
                        onClick={() => setShowNotifications(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="max-h-[28rem] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        Không có thông báo nào
                      </div>
                    ) : (
                      <>
                        {unread.length > 0 && (
                          <div className="px-4 pt-3 pb-1 text-xs font-semibold text-gray-500 uppercase">Chưa đọc ({unread.length})</div>
                        )}
                        {unread.map((notification) => (
                          <div
                            key={`unread-${notification.id}`}
                            className={`p-3 border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer bg-blue-50`}
                            onClick={() => handleNotificationClick(notification)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleNotificationClick(notification); }}
                          >
                            <div className="flex items-start space-x-3">
                              {getNotificationIcon(notification.type)}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 leading-snug">{notification.title}</p>
                                <p className="text-sm text-gray-600 mt-1 leading-snug">{notification.message}</p>
                                <p className="text-xs text-gray-400 mt-2">{notification.time}</p>
                              </div>
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                            </div>
                          </div>
                        ))}

                        {read.length > 0 && (
                          <div className="px-4 pt-3 pb-1 text-xs font-semibold text-gray-500 uppercase">Đã đọc ({read.length})</div>
                        )}
                        {read.map((notification) => (
                          <div
                            key={`read-${notification.id}`}
                            className={`p-3 border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer`}
                            onClick={() => handleNotificationClick(notification)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleNotificationClick(notification); }}
                          >
                            <div className="flex items-start space-x-3">
                              {getNotificationIcon(notification.type)}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 leading-snug">{notification.title}</p>
                                <p className="text-sm text-gray-600 mt-1 leading-snug">{notification.message}</p>
                                <p className="text-xs text-gray-400 mt-2">{notification.time}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                  
                  <div className="p-4 border-t border-gray-200">
                    <Link
                      href="/notifications"
                      className="block text-center text-blue-600 hover:text-blue-800 font-medium"
                      onClick={() => setShowNotifications(false)}
                    >
                      Xem tất cả thông báo
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => router.push('/account')}
                className="flex items-center space-x-2"
                title="Tài khoản"
              >
                <img
                  id="app-header-avatar"
                  src={typeof window !== 'undefined' && window.localStorage.getItem('user_avatar') ? window.localStorage.getItem('user_avatar') : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'}
                  alt="Profile"
                  className="h-8 w-8 rounded-full object-cover"
                />
                <span className="text-slate-200 font-medium">Nguyễn Văn A</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}