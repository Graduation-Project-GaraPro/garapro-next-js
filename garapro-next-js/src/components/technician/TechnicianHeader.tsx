"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FaUserCircle, FaUser, FaCog, FaChartBar, FaSignOutAlt,
  FaBell, FaTimes, FaCheckCircle, FaCommentDots
} from "react-icons/fa";
import { authService } from "@/services/authService";

interface Notification {
  id: string;
  content: string;
  timeSent: string;
  type: 'message' | 'warning';
  isRead: boolean;
}

export default function TechnicianHeader() {
  const router = useRouter();
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      content: "Bạn có lịch sửa xe Toyota Camry lúc 14:30 hôm nay",
      timeSent: "2025-11-27 10:15",
      type: "message",
      isRead: false
    },
    {
      id: "2",
      content: "Cảnh báo: Phụ tùng xe Honda Civic hết hạn bảo hành",
      timeSent: "2025-11-27 09:45",
      type: "warning",
      isRead: true
    },
    {
      id: "3",
      content: "Khách hàng đã xác nhận đơn sửa chữa #RO-1234",
      timeSent: "2025-11-27 08:30",
      type: "message",
      isRead: false
    },
    {
      id: "4",
      content: "Cảnh báo: Kỹ thuật viên đang nghỉ phép - cần sắp xếp thay thế Cảnh báo: Phụ tùng xe Honda Civic hết hạn bảo hành",
      timeSent: "2025-11-27 07:20",
      type: "warning",
      isRead: false
    }
  ]);
  const [unreadCount, setUnreadCount] = useState(3);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) &&
        (accountRef.current && !accountRef.current.contains(event.target as Node))
      ) {
        setShowAccountMenu(false);
      }
      if (
        notificationRef.current && 
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotificationMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleAccountMenu = () => {
    setShowAccountMenu(!showAccountMenu);
  };

  const toggleNotificationMenu = () => {
    setShowNotificationMenu(!showNotificationMenu);
  };

  const handleNotificationClick = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, isRead: true }
          : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleDeleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    const deletedNotif = notifications.find(n => n.id === notificationId);
    if (deletedNotif && !deletedNotif.isRead) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const handleReadAll = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    );
    setUnreadCount(0);
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Vừa xong";
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} giờ trước`;
    return `${Math.floor(diffInMinutes / 1440)} ngày trước`;
  };

  const handleLogout = () => {
    authService.logout();
    setShowAccountMenu(false);
    router.push("/login");
  };

  return (
    <header className="bg-gradient-to-r from-blue-100 to-teal-100 shadow-sm border-b border-teal-200 p-4 w-full text-white">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-12">
          <div className="flex items-center space-x-2">
            <img
              src="/logo.png"
              alt="GaragePro Logo"
              className="w-10 h-10 object-contain"
            />
            <span className="text-xl font-bold text-gray-800">GaragePro</span>
          </div>
          <div className="h-8 w-px bg-gray-300" style={{ marginLeft: "58px" }}></div>
        </div>
        <div className="flex items-center space-x-4 bg-white/70 rounded-xl px-5">
          {/* Notification Menu */}
          <div className="relative" ref={notificationRef}>
            <button
              className="relative text-blue-600 hover:text-blue-800 transition-colors duration-200"
              onClick={toggleNotificationMenu}
            >
              <FaBell className="text-3xl text-gray-500 hover:text-gray-700" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            
            {showNotificationMenu && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-teal-50">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <FaBell className="text-3xl text-blue-600" />
                      <h3 className="text-sm font-bold text-gray-800">Notification</h3>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleReadAll}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
                      >
                        Đánh dấu tất cả đã đọc
                      </button>
                    )}
                  </div>
                </div>

                <div className="max-h-72 overflow-y-auto">
                  {/* Notification List - ĐÃ SỬA THEO YÊU CẦU MỚI */}
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-all cursor-pointer relative rounded-xl
                            ${!notification.isRead 
                              ? notification.type === 'message' 
                                ? 'bg-blue-200 border-l-4 border-l-blue-500' 
                                : 'bg-red-200 border-l-4 border-l-red-500'
                              : 'bg-gray-100 border-l-4 border-l-gray-500'
                            }`}
                          onClick={() => handleNotificationClick(notification.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 pr-10">
                              <p className={`text-sm leading-relaxed ${
                                !notification.isRead 
                                  ? 'font-semibold text-gray-900' 
                                  : 'text-gray-600'
                              }`}>
                                {notification.content}
                              </p>
                              <p className="text-xs text-gray-500 mt-1.5">
                                {formatTime(notification.timeSent)}
                              </p>
                            </div>

                            {/* Chấm xanh "chưa đọc" - giữ lại vì đẹp */}
                            {!notification.isRead && (
                              <FaCheckCircle className="text-green-500 text-lg flex-shrink-0" />
                            )}

                            {/* Nút xóa */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteNotification(notification.id);
                              }}
                              className="ml-3 text-gray-400 hover:text-red-600 transition"
                            >
                              <FaTimes className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  
                  {notifications.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                      <FaCommentDots className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                      <p className="text-sm">Không có thông báo nào</p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                  <div className="p-3 border-t border-gray-100 bg-gray-50">
                    
                  </div>
                )}
              </div>
            )}
          </div>
<div className="h-10 w-px bg-gray-400/50"></div>
          {/* Account Menu */}
          <div className="relative" ref={accountRef}>
            <button
              className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
              onClick={toggleAccountMenu}
            >
              <FaUserCircle className="text-3xl text-gray-500 hover:text-gray-700" />
            </button>
            {showAccountMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    {/* Avatar với chữ cái đầu của tên */}
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {typeof window !== "undefined" 
                        ? (localStorage.getItem("userFullName") || "U")
                            .split(" ")
                            .map(n => n.charAt(0).toUpperCase())
                            .slice(-2)
                            .join("")
                        : "U"}
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-bold text-gray-800">
                        {typeof window !== "undefined" 
                          ? localStorage.getItem("userFullName") || "User" 
                          : "User"}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {typeof window !== "undefined" 
                          ? localStorage.getItem("userEmail") || "user@example.com" 
                          : "user@example.com"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="py-2 px-2">
                  <button className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-blue-50 transition-colors duration-200 rounded-xl">
                    <FaUser className="text-gray-700" />
                    <span className="text-sm font-semibold">Profile</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-blue-100 transition-colors duration-200 rounded-xl">
                    <FaCog className="text-gray-700" />
                    <span className="text-sm font-semibold">Settings</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-blue-100 transition-colors duration-200 rounded-xl">
                    <FaChartBar className="text-gray-700" />
                    <span className="text-sm font-semibold">Analytics</span>
                  </button>
                  <div className="border-t border-gray-100 mt-2 pt-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors duration-200 rounded-xl"
                    >
                      <FaSignOutAlt className="text-red-700" />
                      <span className="text-sm font-bold">Log out</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}