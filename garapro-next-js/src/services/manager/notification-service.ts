// src/services/manager/notification-service.ts
import { apiClient } from './api-client';
import type { ApiResponse } from '@/types/manager/api';

export interface ManagerNotification {
  notificationID: string;
  content: string;
  type: "Message" | "Alert" | "Info" | "Warning";
  timeSent: string;
  status: "Read" | "Unread";
  target: string;
}

export interface UnreadCountResponse {
  unreadCount: number;
}

class ManagerNotificationService {
  private static instance: ManagerNotificationService;

  private constructor() {}

  public static getInstance(): ManagerNotificationService {
    if (!ManagerNotificationService.instance) {
      ManagerNotificationService.instance = new ManagerNotificationService();
    }
    return ManagerNotificationService.instance;
  }

  /**
   * Get unread notification count for badge/indicator
   * GET /api/notification/unread-count
   */
  public async getUnreadCount(): Promise<number> {
    try {
      const response: ApiResponse<UnreadCountResponse> = await apiClient.get('/notification/unread-count');
      return response.data?.unreadCount || 0;
    } catch (error) {
      console.error('Error fetching unread notification count:', error);
      return 0;
    }
  }

  /**
   * Get all notifications for notification list
   * GET /api/notification
   */
  public async getAllNotifications(): Promise<ManagerNotification[]> {
    try {
      const response: ApiResponse<ManagerNotification[]> = await apiClient.get('/notification');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  /**
   * Mark notification as read when manager clicks notification
   * PUT /api/notification/{notificationId}/read
   */
  public async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const response: ApiResponse<void> = await apiClient.put(`/notification/${notificationId}/read`);
      return response.success;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  /**
   * Mark all notifications as read
   * PUT /api/notification/read-all
   */
  public async markAllAsRead(): Promise<boolean> {
    try {
      const response: ApiResponse<void> = await apiClient.put('/notification/read-all');
      return response.success;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }

  /**
   * Delete a notification
   * DELETE /api/notification/{notificationId}
   */
  public async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      const response: ApiResponse<void> = await apiClient.delete(`/notification/${notificationId}`);
      return response.success;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  }
}

export const managerNotificationService = ManagerNotificationService.getInstance();