import { useState, useEffect } from 'react';

/**
 * Hook quản lý thông báo trong ứng dụng
 * @param {Array} initialNotifications - Danh sách thông báo ban đầu
 * @returns {Object} - Các phương thức và trạng thái để quản lý thông báo
 */
export default function useNotifications(initialNotifications = []) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(0);

  // Cập nhật số lượng thông báo chưa đọc khi danh sách thông báo thay đổi
  useEffect(() => {
    const count = notifications.filter(notification => !notification.read).length;
    setUnreadCount(count);
  }, [notifications]);

  /**
   * Đánh dấu thông báo đã đọc
   * @param {number} id - ID của thông báo
   */
  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );

    // Kích hoạt sự kiện để cập nhật UI ở các component khác
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('app:notificationConfirmed', {
        detail: { id, pendingCount: unreadCount - 1 }
      }));
    }
  };

  /**
   * Đánh dấu tất cả thông báo đã đọc
   */
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );

    // Kích hoạt sự kiện để cập nhật UI ở các component khác
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('app:notificationConfirmed', {
        detail: { pendingCount: 0 }
      }));
    }
  };

  /**
   * Thêm thông báo mới
   * @param {Object} notification - Thông tin thông báo mới
   */
  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      read: false,
      time: 'Vừa xong',
      ...notification
    };

    setNotifications(prev => [newNotification, ...prev]);
  };

  /**
   * Xóa thông báo
   * @param {number} id - ID của thông báo cần xóa
   */
  const removeNotification = (id) => {
    const notification = notifications.find(n => n.id === id);
    const wasUnread = notification && !notification.read;
    
    setNotifications(prev => prev.filter(notification => notification.id !== id));
    
    // Nếu thông báo chưa đọc, cập nhật số lượng thông báo chưa đọc
    if (wasUnread && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('app:notificationConfirmed', {
        detail: { id, pendingCount: unreadCount - 1 }
      }));
    }
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    addNotification,
    removeNotification
  };
}