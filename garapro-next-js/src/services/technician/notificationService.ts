
import axios from "axios";
import { handleApiError } from "@/utils/authUtils";
const API_URL = process.env.NEXT_PUBLIC_BASE_URL+ "/api/Notification" || 'https://localhost:7113/api/Notification';

export interface NotificationDto {
  notificationID: string;
  content: string;
  type: number | string;
  timeSent: string;
  status: number | string; 
  target: string;
  userID: string;
}

export const getAllNotifications = async (): Promise<NotificationDto[]> => {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (!token) {
      throw new Error("Missing authentication token");
    }

    console.log("Calling API: GET", API_URL);
    console.log("Token:", token ? "exists" : "missing");

    const response = await axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("API Response Status:", response.status);
    console.log("API Response Data:", response.data);
    console.log("Response Type:", typeof response.data);
    console.log("Is Array:", Array.isArray(response.data));
    
    return response.data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    if (axios.isAxiosError(error)) {
      console.error("Response status:", error.response?.status);
      console.error("Response data:", error.response?.data);
      console.error("Request config:", error.config);
    }
    return handleApiError(error);
  }
};

export const getUnreadNotifications = async (): Promise<NotificationDto[]> => {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (!token) {
      throw new Error("Missing authentication token");
    }

    const response = await axios.get(`${API_URL}/unread`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("API Response for Unread Notifications:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching unread notifications:", error);
    return handleApiError(error);
  }
};

export const getUnreadCount = async (): Promise<number> => {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (!token) {
      throw new Error("Missing authentication token");
    }

    const response = await axios.get(`${API_URL}/unread-count`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("API Response for Unread Count:", response.data);
    return response.data.unreadCount || 0;
  } catch (error) {
    console.error("Error fetching unread count:", error);
    return handleApiError(error);
  }
};

export const markAsRead = async (notificationId: string): Promise<void> => {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (!token) {
      throw new Error("Missing authentication token");
    }

    await axios.put(
      `${API_URL}/${notificationId}/read`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log(`Notification ${notificationId} marked as read`);
  } catch (error) {
    console.error("Error marking notification as read:", error);
   return handleApiError(error);
  }
};

export const markAllAsRead = async (): Promise<void> => {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (!token) {
      throw new Error("Missing authentication token");
    }

    await axios.put(
      `${API_URL}/read-all`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("All notifications marked as read");
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return handleApiError(error);
  }
};

export const deleteNotification = async (notificationId: string): Promise<void> => {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (!token) {
      throw new Error("Missing authentication token");
    }

    await axios.delete(`${API_URL}/${notificationId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(`Notification ${notificationId} deleted`);
  } catch (error) {
    console.error("Error deleting notification:", error);
    return handleApiError(error);
  }
};