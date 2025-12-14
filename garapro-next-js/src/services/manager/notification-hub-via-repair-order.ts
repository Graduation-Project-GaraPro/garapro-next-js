// src/services/manager/notification-hub-via-repair-order.ts
// Alternative implementation that uses RepairOrderHub for notifications
import { HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { ManagerNotification } from './notification-service';

export interface NotificationReceivedEvent {
  notification: ManagerNotification;
}

export interface NotificationUpdatedEvent {
  notificationId: string;
  status: "Read" | "Unread";
}

class ManagerNotificationHubViaRepairOrderService {
  private connection: HubConnection | null = null;
  private static instance: ManagerNotificationHubViaRepairOrderService;
  private notificationReceivedListeners: Array<(event: NotificationReceivedEvent) => void> = [];
  private notificationUpdatedListeners: Array<(event: NotificationUpdatedEvent) => void> = [];
  private connectionId: string | null = null;

  private constructor() {}

  public static getInstance(): ManagerNotificationHubViaRepairOrderService {
    if (!ManagerNotificationHubViaRepairOrderService.instance) {
      ManagerNotificationHubViaRepairOrderService.instance = new ManagerNotificationHubViaRepairOrderService();
    }
    return ManagerNotificationHubViaRepairOrderService.instance;
  }

  public async startConnection(): Promise<boolean> {
    if (this.connection) {
      return true;
    }

    try {
      const { getHubBaseUrl, HUB_CONNECTION_OPTIONS, HUB_ENDPOINTS } = await import('./hub-config');
      const hubUrl = `${getHubBaseUrl()}${HUB_ENDPOINTS.REPAIR_ORDER}`;
      
      console.log("🔌 Connecting to RepairOrderHub for notifications:", hubUrl);
      
      this.connection = new HubConnectionBuilder()
        .withUrl(hubUrl, HUB_CONNECTION_OPTIONS)
        .configureLogging(LogLevel.Information)
        .withAutomaticReconnect()
        .build();

      // Set up event handlers before starting connection
      this.setupEventHandlers();

      await this.connection.start();
      this.connectionId = this.connection.connectionId || null;
      console.log("✅ RepairOrderHub SignalR Connected for notifications. Connection ID:", this.connectionId);

      return true;
    } catch (err) {
      console.error("❌ RepairOrderHub SignalR connection failed:", err);
      this.connection = null;
      return false;
    }
  }

  private setupEventHandlers(): void {
    if (!this.connection) return;

    // Listen for new notifications via RepairOrderHub
    this.connection.on("NotificationReceived", (notification: ManagerNotification) => {
      console.log("🔔 New notification received via RepairOrderHub:", notification);
      const event: NotificationReceivedEvent = { notification };
      this.notifyNotificationReceivedListeners(event);
    });

    // Listen for notification status updates via RepairOrderHub
    this.connection.on("NotificationUpdated", (notificationId: string, status: "Read" | "Unread") => {
      console.log("📝 Notification updated via RepairOrderHub:", notificationId, status);
      const event: NotificationUpdatedEvent = { notificationId, status };
      this.notifyNotificationUpdatedListeners(event);
    });

    // Alternative event names that might be used
    this.connection.on("ManagerNotificationReceived", (notification: ManagerNotification) => {
      console.log("🔔 Manager notification received:", notification);
      const event: NotificationReceivedEvent = { notification };
      this.notifyNotificationReceivedListeners(event);
    });

    // Handle reconnection
    this.connection.onreconnecting((error) => {
      console.warn("RepairOrderHub reconnecting...", error);
    });

    this.connection.onreconnected((connectionId) => {
      console.log("RepairOrderHub reconnected. Connection ID:", connectionId);
      this.connectionId = connectionId || null;
      // Rejoin managers group after reconnection
      this.joinManagersGroup();
    });

    this.connection.onclose((error) => {
      console.warn("RepairOrderHub connection closed", error);
      this.connectionId = null;
    });
  }

  public async stopConnection(): Promise<void> {
    if (this.connection) {
      try {
        await this.connection.stop();
        console.log("RepairOrderHub SignalR Disconnected.");
      } catch (err) {
        console.warn("Error stopping RepairOrderHub SignalR connection:", err);
      } finally {
        this.connection = null;
        this.connectionId = null;
      }
    }
  }

  /**
   * Join managers group to receive all manager notifications
   */
  public async joinManagersGroup(): Promise<void> {
    if (this.connection && this.connection.state === "Connected") {
      try {
        await this.connection.invoke("JoinManagersGroup");
        console.log("✅ Joined Managers group for notifications via RepairOrderHub");
      } catch (err) {
        console.error("❌ Error joining Managers group:", err);
      }
    }
  }

  /**
   * Leave managers group
   */
  public async leaveManagersGroup(): Promise<void> {
    if (this.connection && this.connection.state === "Connected") {
      try {
        await this.connection.invoke("LeaveManagersGroup");
        console.log("✅ Left Managers group");
      } catch (err) {
        console.error("❌ Error leaving Managers group:", err);
      }
    }
  }

  /**
   * Join specific branch group for branch-specific notifications
   */
  public async joinBranchGroup(branchId: string): Promise<void> {
    if (this.connection && this.connection.state === "Connected") {
      try {
        await this.connection.invoke("JoinBranchGroup", branchId);
        console.log(`✅ Joined branch group: Branch_${branchId}`);
      } catch (err) {
        console.error("❌ Error joining branch group:", err);
      }
    }
  }

  /**
   * Leave specific branch group
   */
  public async leaveBranchGroup(branchId: string): Promise<void> {
    if (this.connection && this.connection.state === "Connected") {
      try {
        await this.connection.invoke("LeaveBranchGroup", branchId);
        console.log(`Left branch group: Branch_${branchId}`);
      } catch (err) {
        console.error("Error leaving branch group:", err);
      }
    }
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

export const managerNotificationHubViaRepairOrderService = ManagerNotificationHubViaRepairOrderService.getInstance();