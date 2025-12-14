// src/hooks/use-manager-notifications.ts
import { useState, useEffect, useCallback } from 'react';
import { managerNotificationService, ManagerNotification } from '@/services/manager/notification-service';
import { managerNotificationHubService, NotificationReceivedEvent, NotificationUpdatedEvent } from '@/services/manager/notification-hub';
// Alternative hub service that uses RepairOrderHub
import { managerNotificationHubViaRepairOrderService } from '@/services/manager/notification-hub-via-repair-order';

export interface UseManagerNotificationsReturn {
  notifications: ManagerNotification[];
  unreadCount: number;
  isLoading: boolean;
  isConnected: boolean;
  refreshNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
}

export interface UseManagerNotificationsOptions {
  branchId?: string;
  useRepairOrderHub?: boolean; // Option to use RepairOrderHub instead of NotificationHub
}

export function useManagerNotifications(options?: UseManagerNotificationsOptions | string): UseManagerNotificationsReturn {
  // Handle backward compatibility - if string is passed, treat it as branchId
  const config = typeof options === 'string' ? { branchId: options } : (options || {});
  const { branchId, useRepairOrderHub = false } = config;
  const [notifications, setNotifications] = useState<ManagerNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  // Refresh notifications from API
  const refreshNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const [notificationsData, unreadCountData] = await Promise.all([
        managerNotificationService.getAllNotifications(),
        managerNotificationService.getUnreadCount()
      ]);
      
      setNotifications(notificationsData);
      setUnreadCount(unreadCountData);
    } catch (error) {
      console.error('Error refreshing notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    const success = await managerNotificationService.markAsRead(notificationId);
    if (success) {
      setNotifications(prev => 
        prev.map(notification => 
          notification.notificationID === notificationId 
            ? { ...notification, status: 'Read' as const }
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    const success = await managerNotificationService.markAllAsRead();
    if (success) {
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, status: 'Read' as const }))
      );
      setUnreadCount(0);
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    const success = await managerNotificationService.deleteNotification(notificationId);
    if (success) {
      setNotifications(prev => {
        const notification = prev.find(n => n.notificationID === notificationId);
        const filtered = prev.filter(n => n.notificationID !== notificationId);
        
        // Update unread count if deleted notification was unread
        if (notification?.status === 'Unread') {
          setUnreadCount(prevCount => Math.max(0, prevCount - 1));
        }
        
        return filtered;
      });
    }
  }, []);

  // Handle new notification received via SignalR
  const handleNotificationReceived = useCallback((event: NotificationReceivedEvent) => {
    const { notification } = event;
    
    setNotifications(prev => {
      // Check if notification already exists to avoid duplicates
      const exists = prev.some(n => n.notificationID === notification.notificationID);
      if (exists) return prev;
      
      return [notification, ...prev];
    });
    
    // Update unread count if new notification is unread
    if (notification.status === 'Unread') {
      setUnreadCount(prev => prev + 1);
    }
  }, []);

  // Handle notification status update via SignalR
  const handleNotificationUpdated = useCallback((event: NotificationUpdatedEvent) => {
    const { notificationId, status } = event;
    
    setNotifications(prev => 
      prev.map(notification => 
        notification.notificationID === notificationId 
          ? { ...notification, status }
          : notification
      )
    );
    
    // Update unread count based on status change
    if (status === 'Read') {
      setUnreadCount(prev => Math.max(0, prev - 1));
    } else if (status === 'Unread') {
      setUnreadCount(prev => prev + 1);
    }
  }, []);

  // Initialize SignalR connection and load initial data
  useEffect(() => {
    let mounted = true;

    const initializeNotifications = async () => {
      try {
        // Choose which hub service to use
        const hubService = useRepairOrderHub ? managerNotificationHubViaRepairOrderService : managerNotificationHubService;
        
        // Start SignalR connection
        const connected = await hubService.startConnection();
        if (mounted) {
          setIsConnected(connected);
        }

        if (connected) {
          // Set up event listeners first
          hubService.addNotificationReceivedListener(handleNotificationReceived);
          hubService.addNotificationUpdatedListener(handleNotificationUpdated);

          // Note: Your backend automatically adds managers to User_{managerId} groups
          // No manual group joining needed - just connect and listen
          console.log("✅ Connected to NotificationHub - backend will automatically add to User_{managerId} group");
        }

        // Load initial notifications
        if (mounted) {
          await refreshNotifications();
        }
      } catch (error) {
        console.error('Error initializing notifications:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeNotifications();

    return () => {
      mounted = false;
      
      // Choose which hub service to use for cleanup
      const hubService = useRepairOrderHub ? managerNotificationHubViaRepairOrderService : managerNotificationHubService;
      
      // Clean up event listeners
      hubService.removeNotificationReceivedListener(handleNotificationReceived);
      hubService.removeNotificationUpdatedListener(handleNotificationUpdated);
      
      // Note: No need to leave groups - backend manages User_{managerId} groups automatically
    };
  }, [branchId, useRepairOrderHub, handleNotificationReceived, handleNotificationUpdated, refreshNotifications]);

  // Monitor connection status
  useEffect(() => {
    const checkConnection = () => {
      const hubService = useRepairOrderHub ? managerNotificationHubViaRepairOrderService : managerNotificationHubService;
      setIsConnected(hubService.isConnected());
    };

    const interval = setInterval(checkConnection, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, [useRepairOrderHub]);

  return {
    notifications,
    unreadCount,
    isLoading,
    isConnected,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  };
}