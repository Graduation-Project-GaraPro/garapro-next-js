import * as signalR from "@microsoft/signalr";

export interface ReceiveNotificationData {
  notificationId: string;
  content: string;
  timeSent: string;
  notificationType: string;
  target?: string;
  title?: string;
  jobId?: string;
  jobName?: string;
  serviceName?: string;
  hoursRemaining?: number;
  hoursOverdue?: number;
  daysOverdue?: number;
  status: string;
}

export interface UnreadCountUpdatedData {
  userId: string;
  unreadCount: number;
  timestamp: string;
}

export interface NotificationReadData {
  notificationId: string;
  status: string;
}

export interface AllNotificationsReadData {
  userId: string;
  message: string;
  timestamp: string;
}

export interface NotificationDeletedData {
  notificationId: string;
  message: string;
  timestamp: string;
}

export type ReceiveNotificationCallback = (data: ReceiveNotificationData) => void;
export type UnreadCountUpdatedCallback = (data: UnreadCountUpdatedData) => void;
export type NotificationReadCallback = (data: NotificationReadData) => void;
export type AllNotificationsReadCallback = (data: AllNotificationsReadData) => void;
export type NotificationDeletedCallback = (data: NotificationDeletedData) => void;

class NotificationSignalRService {
  private connection: signalR.HubConnection | null = null;
  private isConnecting = false;
  private receiveNotificationCallbacks: ReceiveNotificationCallback[] = [];
  private unreadCountUpdatedCallbacks: UnreadCountUpdatedCallback[] = [];
  private notificationReadCallbacks: NotificationReadCallback[] = [];
  private allNotificationsReadCallbacks: AllNotificationsReadCallback[] = [];
  private notificationDeletedCallbacks: NotificationDeletedCallback[] = [];

  public async startConnection(): Promise<void> {
    if (this.connection || this.isConnecting) {
      console.log("NotificationSignalR: Already connected");
      return;
    }

    this.isConnecting = true;

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
      if (!token) {
        throw new Error("No authentication token found");
      }

      const API_URL = process.env.NEXT_PUBLIC_HUB_BASE_URL + "/notificationHub" || 'http://localhost:7113/notificationHub';

      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(API_URL, { 
          accessTokenFactory: () => token,
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000])
        .configureLogging(signalR.LogLevel.Warning)
        .build();

      this.setupConnectionEvents();

      await this.connection.start();
      console.log("NotificationSignalR: Connected successfully");

      // Join user group
      await this.connection.invoke("JoinMyGroup");
      console.log("NotificationSignalR: Joined user group");

    } catch (error) {
      console.error("NotificationSignalR: Connection failed", error);
      this.connection = null;
      throw error;
    } finally {
      this.isConnecting = false;
    }
  }

  private setupConnectionEvents(): void {
    if (!this.connection) return;

    this.connection.onreconnecting((error) => {
      console.warn("NotificationSignalR: Reconnecting...", error);
    });

    this.connection.onreconnected((connectionId) => {
      console.log("NotificationSignalR: Reconnected", connectionId);
    });

    this.connection.onclose((error) => {
      console.error("NotificationSignalR: Connection closed", error);
      this.connection = null;
      this.isConnecting = false;
    });

    // Setup event handlers với multiple callbacks
    this.connection.on("ReceiveNotification", (data: ReceiveNotificationData) => {
      console.log("NotificationSignalR: ReceiveNotification event", data);
      this.receiveNotificationCallbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error("Error in ReceiveNotification callback:", error);
        }
      });
    });

    this.connection.on("UnreadCountUpdated", (data: UnreadCountUpdatedData) => {
      console.log("NotificationSignalR: UnreadCountUpdated event", data);
      this.unreadCountUpdatedCallbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error("Error in UnreadCountUpdated callback:", error);
        }
      });
    });

    this.connection.on("NotificationRead", (data: NotificationReadData) => {
      console.log("NotificationSignalR: NotificationRead event", data);
      this.notificationReadCallbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error("Error in NotificationRead callback:", error);
        }
      });
    });

    this.connection.on("AllNotificationsRead", (data: AllNotificationsReadData) => {
      console.log("NotificationSignalR: AllNotificationsRead event", data);
      this.allNotificationsReadCallbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error("Error in AllNotificationsRead callback:", error);
        }
      });
    });

    this.connection.on("NotificationDeleted", (data: NotificationDeletedData) => {
      console.log("NotificationSignalR: NotificationDeleted event", data);
      this.notificationDeletedCallbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error("Error in NotificationDeleted callback:", error);
        }
      });
    });
  }

  public onReceiveNotification(callback: ReceiveNotificationCallback): void {
    this.receiveNotificationCallbacks.push(callback);
  }

  public onUnreadCountUpdated(callback: UnreadCountUpdatedCallback): void {
    this.unreadCountUpdatedCallbacks.push(callback);
  }

  public onNotificationRead(callback: NotificationReadCallback): void {
    this.notificationReadCallbacks.push(callback);
  }

  public onAllNotificationsRead(callback: AllNotificationsReadCallback): void {
    this.allNotificationsReadCallbacks.push(callback);
  }

  public onNotificationDeleted(callback: NotificationDeletedCallback): void {
    this.notificationDeletedCallbacks.push(callback);
  }

  public offReceiveNotification(callback: ReceiveNotificationCallback): void {
    this.receiveNotificationCallbacks = this.receiveNotificationCallbacks.filter(cb => cb !== callback);
  }

  public offUnreadCountUpdated(callback: UnreadCountUpdatedCallback): void {
    this.unreadCountUpdatedCallbacks = this.unreadCountUpdatedCallbacks.filter(cb => cb !== callback);
  }

  public offNotificationRead(callback: NotificationReadCallback): void {
    this.notificationReadCallbacks = this.notificationReadCallbacks.filter(cb => cb !== callback);
  }

  public offAllNotificationsRead(callback: AllNotificationsReadCallback): void {
    this.allNotificationsReadCallbacks = this.allNotificationsReadCallbacks.filter(cb => cb !== callback);
  }

  public offNotificationDeleted(callback: NotificationDeletedCallback): void {
    this.notificationDeletedCallbacks = this.notificationDeletedCallbacks.filter(cb => cb !== callback);
  }

  public offAllEvents(): void {
    this.receiveNotificationCallbacks = [];
    this.unreadCountUpdatedCallbacks = [];
    this.notificationReadCallbacks = [];
    this.allNotificationsReadCallbacks = [];
    this.notificationDeletedCallbacks = [];
  }

  public async stopConnection(): Promise<void> {
    if (!this.connection) return;

    try {
      await this.connection.stop();
      console.log("NotificationSignalR: Connection stopped");
    } catch (error) {
      console.error("NotificationSignalR: Error stopping connection", error);
    } finally {
      this.connection = null;
      this.isConnecting = false;
      this.offAllEvents();
    }
  }

  public getConnectionState(): signalR.HubConnectionState | null {
    return this.connection?.state ?? null;
  }
}

export const notificationSignalRService = new NotificationSignalRService();
export default notificationSignalRService;