"use client";
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Car,
  Calendar,
  Clock,
  MessageCircle,
  History,
  Star,
  Bell,
  User,
  AlertTriangle,
  Plus,
} from 'lucide-react';
import Link from 'next/link';

export default function Sidebar() {
  const defaultNotifs = [
    { id: 1, message: 'Xe Honda Civic đã hoàn thành sửa chữa', time: '2 giờ trước', type: 'success', read: false },
    { id: 2, message: 'Có lịch hẹn vào ngày mai lúc 9:00', time: '1 ngày trước', type: 'info', read: false },
    { id: 3, message: 'Báo giá sửa chữa đã được gửi', time: '3 giờ trước', type: 'warning', read: false },
  ];
  const [notificationsCount, setNotificationsCount] = useState(defaultNotifs.length);

  // Lắng nghe sự kiện xác nhận để giảm số badge (không dùng localStorage để tránh lệch)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Luôn khởi tạo lại theo mặc định khi F5
    setNotificationsCount(defaultNotifs.length);

    const handler = (e) => {
      const id = e?.detail?.id;
      const pendingCount = e?.detail?.pendingCount;
      if (!id) return;
      if (typeof pendingCount === 'number' && pendingCount >= 0) {
        setNotificationsCount(pendingCount);
      } else {
        setNotificationsCount((prev) => Math.max(0, prev - 1));
      }
    };
    window.addEventListener('app:notificationConfirmed', handler);
    return () => window.removeEventListener('app:notificationConfirmed', handler);
  }, []);

  const pathname = usePathname();

  const navItems = [
    { id: 'dashboard', label: 'Tổng quan', icon: Car, path: '/' },
    { id: 'submit-request', label: 'Gửi yêu cầu', icon: Plus, path: '/submit-request' },
    { id: 'progress', label: 'Tiến độ', icon: Clock, path: '/progress' },
    { id: 'ai-chat', label: 'AI Chẩn đoán', icon: MessageCircle, path: '/ai-chat' },
    { id: 'appointments', label: 'Lịch hẹn', icon: Calendar, path: '/appointments' },
    { id: 'history', label: 'Lịch sử', icon: History, path: '/history' },
    { id: 'reviews', label: 'Đánh giá', icon: Star, path: '/reviews' },
    { id: 'emergency', label: 'Cứu hộ', icon: AlertTriangle, path: '/emergency' },
    { id: 'notifications', label: 'Thông báo', icon: Bell, path: '/notifications' },
    { id: 'account', label: 'Tài khoản', icon: User, path: '/account' },
  ];

  return (
    <div className="w-64 bg-slate-900 h-screen sticky top-0 border-r border-slate-800">
      <nav className="mt-8 px-4">
        <div className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                href={item.path}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  pathname === item.path
                    ? 'bg-slate-800 text-white border-l-2 border-blue-500'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className={`h-5 w-5 ${pathname === item.path ? 'text-blue-400' : 'text-slate-300'}`} />
                <span className="font-medium">{item.label}</span>
                {item.id === 'notifications' && (
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notificationsCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}