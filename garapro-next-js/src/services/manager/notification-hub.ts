// src/services/manager/notification-hub.ts
import { HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { ManagerNotification } from './notification-service';

export interface NotificationReceivedEvent {
  notification: ManagerNotification;
}

export interface NotificationUpdatedEvent {
  notificationId: string;
  status: "Read" | "Unread";
}

class ManagerNotificationHubService {
  private connection: HubConnection | null = null;
  private static instance: ManagerNotificationHubService;
  private notificationReceivedListeners: Array<(event: NotificationReceivedEvent) => void> = [];
  private notificationUpdatedListeners: Array<(event: NotificationUpdatedEvent) => void> = [];
  private connectionId: string | null = null;

  private constructor() {}

  public static getInstance(): ManagerNotificationHubService {
    if (!ManagerNotificationHubService.instance) {
      ManagerNotificationHubService.instance = new ManagerNotificationHubService();
    }
    return ManagerNotificationHubService.instance;
  }

  public async startConnection(): Promise<boolean> {
    if (this.connection) {
      return true;
    }

    try {
      const { getHubBaseUrl, HUB_CONNECTION_OPTIONS, HUB_ENDPOINTS } = await import('./hub-config');
      const hubUrl = `${getHubBaseUrl()}${HUB_ENDPOINTS.NOTIFICATION}`;
      
      console.log("🔌 Connecting to NotificationHub:", hubUrl);
      
      this.connection = new HubConnectionBuilder()
        .withUrl(hubUrl, HUB_CONNECTION_OPTIONS)
        .configureLogging(LogLevel.Information)
        .withAutomaticReconnect()
        .build();

      // Set up event handlers before starting connection
      this.setupEventHandlers();

      await this.connection.start();
      this.connectionId = this.connection.connectionId || null;
      console.log("✅ NotificationHub SignalR Connected. Connection ID:", this.connectionId);

      return true;
    } catch (err) {
      console.error("❌ NotificationHub SignalR connection failed:", err);
      this.connection = null;
      return false;
    }
  }

  private fixTargetUrl(target: string): string {
    // Fix repair order URLs from backend format to frontend format
    if (target && target.includes('/manager/repair-orders/')) {
      const repairOrderId = target.split('/manager/repair-orders/')[1];
      return `/manager/repairOrderManagement/orders/${repairOrderId}`;
    }
    return target;
  }

  private setupEventHandlers(): void {
    if (!this.connection) return;

    // Listen for new notifications (generic)
    this.connection.on("NotificationReceived", (notification: ManagerNotification) => {
      console.log("🔔 New notification received:", notification);
      const event: NotificationReceivedEvent = { notification };
      this.notifyNotificationReceivedListeners(event);
    });

    // Listen for the specific backend event format
    this.connection.on("ReceiveNotification", (notification: any) => {
      console.log("🔔 Backend notification received:", notification);
      
      // Convert backend format to our format
      const managerNotification: ManagerNotification = {
        notificationID: notification.NotificationId || notification.notificationId || Date.now().toString(),
        content: notification.Content || notification.content || "",
        type: notification.Type || notification.type || "Message",
        timeSent: notification.TimeSent || notification.timeSent || new Date().toISOString(),
        status: "Unread",
        target: this.fixTargetUrl(notification.Target || notification.target || "#"),
        // Additional fields for repair order completion
        repairOrderId: notification.RepairOrderId || notification.repairOrderId,
        customerName: notification.CustomerName || notification.customerName,
        vehicleInfo: notification.VehicleInfo || notification.vehicleInfo,
        isAutoCompleted: notification.IsAutoCompleted || notification.isAutoCompleted,
        completionType: notification.CompletionType || notification.completionType,
        title: notification.Title || notification.title
      };

      const event: NotificationReceivedEvent = { notification: managerNotification };
      this.notifyNotificationReceivedListeners(event);
    });

    // Listen for notification status updates
    this.connection.on("NotificationUpdated", (notificationId: string, status: "Read" | "Unread") => {
      console.log("📝 Notification updated:", notificationId, status);
      const event: NotificationUpdatedEvent = { notificationId, status };
      this.notifyNotificationUpdatedListeners(event);
    });

    // Handle reconnection
    this.connection.onreconnecting((error) => {
      console.warn("NotificationHub reconnecting...", error);
    });

    this.connection.onreconnected((connectionId) => {
      console.log("NotificationHub reconnected. Connection ID:", connectionId);
      this.connectionId = connectionId || null;
      // Rejoin managers group after reconnection
      this.joinManagersGroup();
    });

    this.connection.onclose((error) => {
      console.warn("NotificationHub connection closed", error);
      this.connectionId = null;
    });
  }

  public async stopConnection(): Promise<void> {
    if (this.connection) {
      try {
        await this.connection.stop();
        console.log("NotificationHub SignalR Disconnected.");
      } catch (err) {
        console.warn("Error stopping NotificationHub SignalR connection:", err);
      } finally {
        this.connection = null;
        this.connectionId = null;
      }
    }
  }

  /**
   * Note: Your backend automatically adds managers to User_{managerId} groups
   * No manual group joining is needed - just connect and listen for notifications
   */
  public async joinManagersGroup(): Promise<void> {
    // No-op: Backend automatically adds managers to User_{managerId} groups
    console.log("ℹ️ Backend automatically handles group membership for User_{managerId}");
  }

  /**
   * Leave managers group - No-op since backend manages groups automatically
   */
  public async leaveManagersGroup(): Promise<void> {
    // No-op: Backend automatically manages group membership
    console.log("ℹ️ Backend automatically manages group membership");
  }

  /**
   * Join specific branch group - No-op since backend uses User_{managerId} groups
   */
  public async joinBranchGroup(branchId: string): Promise<void> {
    // No-op: Backend uses User_{managerId} groups, not branch groups
    console.log(`ℹ️ Backend uses User_{{managerId}} groups, not branch groups. Branch: ${branchId}`);
  }

  /**
   * Leave specific branch group - No-op since backend uses User_{managerId} groups
   */
  public async leaveBranchGroup(branchId: string): Promise<void> {
    // No-op: Backend uses User_{managerId} groups, not branch groups
    console.log(`ℹ️ Backend uses User_{{managerId}} groups, not branch groups. Branch: ${branchId}`);
  }

  // Event listeners for NotificationReceived
  public addNotificationReceivedListener(callback: (event: NotificationReceivedEvent) => void): void {
    this.notificationReceivedListeners.push(callback);
  }

  public removeNotificationReceivedListener(callback: (event: NotificationReceivedEvent) => void): void {
    this.notificationReceivedListeners = this.notificationReceivedListeners.filter(listener => listener !== callback);
  }

  private notifyNotificationReceivedListeners(event: NotificationReceivedEvent): void {
    this.notificationReceivedListeners.forEach(listener => listener(event));
  }

  // Event listeners for NotificationUpdated
  public addNotificationUpdatedListener(callback: (event: NotificationUpdatedEvent) => void): void {
    this.notificationUpdatedListeners.push(callback);
  }

  public removeNotificationUpdatedListener(callback: (event: NotificationUpdatedEvent) => void): void {
    this.notificationUpdatedListeners = this.notificationUpdatedListeners.filter(listener => listener !== callback);
  }

  private notifyNotificationUpdatedListeners(event: NotificationUpdatedEvent): void {
    this.notificationUpdatedListeners.forEach(listener => listener(event));
  }

  // Get connection status
  public isConnected(): boolean {
    return this.connection !== null && this.connection.state === "Connected";
  }

  public getConnectionId(): string | null {
    return this.connectionId;
  }
}

export const managerNotificationHubService = ManagerNotificationHubService.getInstance();