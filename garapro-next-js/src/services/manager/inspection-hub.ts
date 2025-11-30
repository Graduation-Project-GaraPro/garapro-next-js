import { HubConnection, HubConnectionBuilder, LogLevel, HubConnectionState } from "@microsoft/signalr";
import type { InspectionDto } from "@/types/manager/inspection";

// Notification types for inspection retrieval events
export interface InspectionsRetrievedNotification {
  technicianId: string;
  inspectionCount: number;
  inspections: InspectionDto[];
  timestamp: string;
}

export interface InspectionRetrievedNotification {
  inspectionId: string;
  technicianId: string;
  inspection: InspectionDto;
  timestamp: string;
}

// Notification types for manager events
export interface InspectionStatusUpdatedNotification {
  inspectionId: string;
  technicianId: string;
  technicianName: string;
  oldStatus: string;
  newStatus: string;
  repairOrderId: string;
  customerConcern: string | null;
  finding: string | null;
  issueRating: number;
  inspection: InspectionDto;
  message: string;
  updatedAt: string;
}

export interface InspectionStartedNotification {
  inspectionId: string;
  repairOrderId: string;
  technicianId: string;
  technicianName: string;
  customerConcern: string | null;
  startedAt: string;
  message: string;
}

export interface InspectionCompletedNotification {
  inspectionId: string;
  repairOrderId: string;
  technicianId: string;
  technicianName: string;
  customerConcern: string | null;
  finding: string | null;
  issueRating: number;
  serviceCount: number;
  partCount: number;
  completedAt: string;
  inspectionDetails: InspectionDto;
  message: string;
}

class InspectionHubService {
  private connection: HubConnection | null = null;
  private static instance: InspectionHubService;
  private isReconnecting = false;
  private listeners: {
    onInspectionsRetrieved: Array<(notification: InspectionsRetrievedNotification) => void>;
    onInspectionRetrieved: Array<(notification: InspectionRetrievedNotification) => void>;
    onInspectionStatusUpdated: Array<(notification: InspectionStatusUpdatedNotification) => void>;
    onInspectionStarted: Array<(notification: InspectionStartedNotification) => void>;
    onInspectionCompleted: Array<(notification: InspectionCompletedNotification) => void>;
    onConnectionStateChanged: Array<(state: HubConnectionState) => void>;
  } = {
    onInspectionsRetrieved: [],
    onInspectionRetrieved: [],
    onInspectionStatusUpdated: [],
    onInspectionStarted: [],
    onInspectionCompleted: [],
    onConnectionStateChanged: [],
  };

  private constructor() {}

  public static getInstance(): InspectionHubService {
    if (!InspectionHubService.instance) {
      InspectionHubService.instance = new InspectionHubService();
    }
    return InspectionHubService.instance;
  }

  public async startConnection(): Promise<boolean> {
    // Prevent duplicate connections
    if (this.connection?.state === HubConnectionState.Connected) {
      console.log("✅ Already connected to InspectionHub");
      return true;
    }

    if (this.connection?.state === HubConnectionState.Connecting) {
      console.log("⏳ Connection already in progress...");
      return false;
    }

    try {
      // Get the base URL from environment variables
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://localhost:7113/api";
      // Remove /api suffix and construct hub URL
      const hubBaseUrl = baseUrl.replace(/\/api\/?$/, '');
      const hubUrl = `${hubBaseUrl}/hubs/inspection`;
      
      console.log("🔌 Connecting to InspectionHub:", hubUrl);
      
      // Get the authentication token from localStorage
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      
      if (!token) {
        console.warn("⚠️ No auth token found - connection may fail");
      }

      // Configure the connection with authentication
      this.connection = new HubConnectionBuilder()
        .withUrl(hubUrl, {
          accessTokenFactory: () => token || "",
          withCredentials: true, // Important for CORS with credentials
        })
        .configureLogging(LogLevel.Information)
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            // Exponential backoff: 0s, 2s, 10s, 30s, then 30s
            if (retryContext.previousRetryCount === 0) return 0;
            if (retryContext.previousRetryCount === 1) return 2000;
            if (retryContext.previousRetryCount === 2) return 10000;
            return 30000;
          }
        })
        .build();

      // Setup event handlers BEFORE starting connection
      this.setupConnectionHandlers();
      this.registerEventListeners();

      await this.connection.start();
      
      console.log("✅ InspectionHub Connected Successfully");
      this.notifyConnectionStateChanged(HubConnectionState.Connected);
      
      return true;
    } catch (err) {
      console.error("❌ InspectionHub connection failed:", err);
      this.connection = null;
      this.notifyConnectionStateChanged(HubConnectionState.Disconnected);
      return false;
    }
  }

  private setupConnectionHandlers(): void {
    if (!this.connection) return;

    // Handle reconnecting state
    this.connection.onreconnecting((error) => {
      console.log("🔄 InspectionHub reconnecting...", error);
      this.isReconnecting = true;
      this.notifyConnectionStateChanged(HubConnectionState.Reconnecting);
    });

    // Handle successful reconnection
    this.connection.onreconnected(async (connectionId) => {
      console.log("✅ InspectionHub reconnected:", connectionId);
      this.isReconnecting = false;
      this.notifyConnectionStateChanged(HubConnectionState.Connected);
      
      // Important: Re-join groups after reconnection
      await this.rejoinGroups();
    });

    // Handle connection closure
    this.connection.onclose(async (error) => {
      console.log("🔌 InspectionHub disconnected", error);
      this.notifyConnectionStateChanged(HubConnectionState.Disconnected);
      
      // Automatic reconnect will handle this, but log it
      if (error) {
        console.error("Connection closed with error:", error);
      }
    });
  }

  private registerEventListeners(): void {
    if (!this.connection) return;

    // Listen for multiple inspections retrieved notification
    this.connection.on("InspectionsRetrieved", (
      technicianId: string, 
      inspectionCount: number, 
      inspections: InspectionDto[], 
      timestamp: string
    ) => {
      console.log("📋 Inspections retrieved:", { technicianId, inspectionCount });
      const notification: InspectionsRetrievedNotification = { 
        technicianId, 
        inspectionCount, 
        inspections, 
        timestamp 
      };
      this.listeners.onInspectionsRetrieved.forEach(callback => {
        try {
          callback(notification);
        } catch (err) {
          console.error("Error in InspectionsRetrieved listener:", err);
        }
      });
    });

    // Listen for single inspection retrieved notification
    this.connection.on("InspectionRetrieved", (
      inspectionId: string,
      technicianId: string,
      inspection: InspectionDto,
      timestamp: string
    ) => {
      console.log("📄 Inspection retrieved:", { inspectionId, technicianId });
      const notification: InspectionRetrievedNotification = { 
        inspectionId, 
        technicianId, 
        inspection, 
        timestamp 
      };
      this.listeners.onInspectionRetrieved.forEach(callback => {
        try {
          callback(notification);
        } catch (err) {
          console.error("Error in InspectionRetrieved listener:", err);
        }
      });
    });

    // Listen for inspection status updates (for managers)
    this.connection.on("InspectionStatusUpdated", (data: InspectionStatusUpdatedNotification) => {
      console.log("🔄 Inspection status updated:", {
        id: data.inspectionId,
        status: `${data.oldStatus} → ${data.newStatus}`
      });
      this.listeners.onInspectionStatusUpdated.forEach(callback => {
        try {
          callback(data);
        } catch (err) {
          console.error("Error in InspectionStatusUpdated listener:", err);
        }
      });
    });

    // Listen for inspection started (for managers)
    this.connection.on("InspectionStarted", (data: InspectionStartedNotification) => {
      console.log("🚀 Inspection started:", {
        id: data.inspectionId,
        technician: data.technicianName
      });
      this.listeners.onInspectionStarted.forEach(callback => {
        try {
          callback(data);
        } catch (err) {
          console.error("Error in InspectionStarted listener:", err);
        }
      });
    });

    // Listen for inspection completed (for managers)
    this.connection.on("InspectionCompleted", (data: InspectionCompletedNotification) => {
      console.log("✅ Inspection completed:", {
        id: data.inspectionId,
        technician: data.technicianName,
        services: data.serviceCount,
        parts: data.partCount
      });
      this.listeners.onInspectionCompleted.forEach(callback => {
        try {
          callback(data);
        } catch (err) {
          console.error("Error in InspectionCompleted listener:", err);
        }
      });
    });
  }

  // Track joined groups for rejoin after reconnection
  private joinedGroups: Set<string> = new Set();

  /**
   * Ensure the connection is in Connected state before invoking methods
   */
  private ensureConnected(): boolean {
    if (!this.connection) {
      console.warn("⚠️ Cannot perform action: Connection not initialized");
      return false;
    }

    if (this.connection.state !== HubConnectionState.Connected) {
      console.warn("⚠️ Cannot perform action: Connection not in Connected state. Current state:", this.connection.state);
      return false;
    }

    return true;
  }

  private async rejoinGroups(): Promise<void> {
    console.log("🔄 Rejoining groups after reconnection...");
    const groupsToRejoin = Array.from(this.joinedGroups);
    
    for (const group of groupsToRejoin) {
      try {
        if (group === "Managers") {
          await this.joinManagersGroup();
        } else if (group.startsWith("Technician_")) {
          const techId = group.replace("Technician_", "");
          await this.joinTechnicianGroup(techId);
        } else if (group.startsWith("Inspection_")) {
          const inspId = group.replace("Inspection_", "");
          await this.joinInspectionGroup(inspId);
        }
      } catch (error) {
        console.error(`Failed to rejoin group ${group}:`, error);
      }
    }
  }

  public async stopConnection(): Promise<void> {
    if (this.connection) {
      try {
        await this.connection.stop();
        console.log("🔌 InspectionHub disconnected");
        this.joinedGroups.clear();
      } catch (err) {
        console.warn("⚠️ Error stopping InspectionHub:", err);
      } finally {
        this.connection = null;
        this.notifyConnectionStateChanged(HubConnectionState.Disconnected);
      }
    }
  }

  /**
   * Join the managers group to receive all inspection updates
   */
  public async joinManagersGroup(): Promise<void> {
    if (!this.ensureConnected()) return;

    try {
      await this.connection!.invoke("JoinManagersGroup");
      this.joinedGroups.add("Managers");
      console.log("✅ Joined Managers group");
    } catch (error) {
      console.error("❌ Failed to join managers group:", error);
      throw error;
    }
  }

  /**
   * Leave the managers group
   */
  public async leaveManagersGroup(): Promise<void> {
    if (!this.ensureConnected()) return;

    try {
      await this.connection!.invoke("LeaveManagersGroup");
      this.joinedGroups.delete("Managers");
      console.log("✅ Left Managers group");
    } catch (error) {
      console.error("❌ Failed to leave managers group:", error);
      throw error;
    }
  }

  /**
   * Join a technician group to receive notifications for that specific technician
   */
  public async joinTechnicianGroup(technicianId: string): Promise<void> {
    if (!this.ensureConnected()) return;

    try {
      await this.connection!.invoke("JoinTechnicianGroup", technicianId);
      this.joinedGroups.add(`Technician_${technicianId}`);
      console.log(`✅ Joined technician group: Technician_${technicianId}`);
    } catch (error) {
      console.error(`❌ Failed to join technician group ${technicianId}:`, error);
      throw error;
    }
  }

  /**
   * Leave a technician group
   */
  public async leaveTechnicianGroup(technicianId: string): Promise<void> {
    if (!this.ensureConnected()) return;

    try {
      await this.connection!.invoke("LeaveTechnicianGroup", technicianId);
      this.joinedGroups.delete(`Technician_${technicianId}`);
      console.log(`✅ Left technician group: Technician_${technicianId}`);
    } catch (error) {
      console.error(`❌ Failed to leave technician group ${technicianId}:`, error);
      throw error;
    }
  }

  /**
   * Join an inspection-specific group to receive updates for that inspection
   */
  public async joinInspectionGroup(inspectionId: string): Promise<void> {
    if (!this.ensureConnected()) return;

    try {
      await this.connection!.invoke("JoinInspectionGroup", inspectionId);
      this.joinedGroups.add(`Inspection_${inspectionId}`);
      console.log(`✅ Joined inspection group: Inspection_${inspectionId}`);
    } catch (error) {
      console.error(`❌ Failed to join inspection group ${inspectionId}:`, error);
      throw error;
    }
  }

  /**
   * Leave an inspection-specific group
   */
  public async leaveInspectionGroup(inspectionId: string): Promise<void> {
    if (!this.ensureConnected()) return;

    try {
      await this.connection!.invoke("LeaveInspectionGroup", inspectionId);
      this.joinedGroups.delete(`Inspection_${inspectionId}`);
      console.log(`✅ Left inspection group: Inspection_${inspectionId}`);
    } catch (error) {
      console.error(`❌ Failed to leave inspection group ${inspectionId}:`, error);
      throw error;
    }
  }

  // Listener management methods
  public addInspectionsRetrievedListener(callback: (notification: InspectionsRetrievedNotification) => void): void {
    this.listeners.onInspectionsRetrieved.push(callback);
  }

  public removeInspectionsRetrievedListener(callback: (notification: InspectionsRetrievedNotification) => void): void {
    this.listeners.onInspectionsRetrieved = this.listeners.onInspectionsRetrieved.filter(listener => listener !== callback);
  }

  public addInspectionRetrievedListener(callback: (notification: InspectionRetrievedNotification) => void): void {
    this.listeners.onInspectionRetrieved.push(callback);
  }

  public removeInspectionRetrievedListener(callback: (notification: InspectionRetrievedNotification) => void): void {
    this.listeners.onInspectionRetrieved = this.listeners.onInspectionRetrieved.filter(listener => listener !== callback);
  }

  public addInspectionStatusUpdatedListener(callback: (notification: InspectionStatusUpdatedNotification) => void): void {
    this.listeners.onInspectionStatusUpdated.push(callback);
  }

  public removeInspectionStatusUpdatedListener(callback: (notification: InspectionStatusUpdatedNotification) => void): void {
    this.listeners.onInspectionStatusUpdated = this.listeners.onInspectionStatusUpdated.filter(listener => listener !== callback);
  }

  public addInspectionStartedListener(callback: (notification: InspectionStartedNotification) => void): void {
    this.listeners.onInspectionStarted.push(callback);
  }

  public removeInspectionStartedListener(callback: (notification: InspectionStartedNotification) => void): void {
    this.listeners.onInspectionStarted = this.listeners.onInspectionStarted.filter(listener => listener !== callback);
  }

  public addInspectionCompletedListener(callback: (notification: InspectionCompletedNotification) => void): void {
    this.listeners.onInspectionCompleted.push(callback);
  }

  public removeInspectionCompletedListener(callback: (notification: InspectionCompletedNotification) => void): void {
    this.listeners.onInspectionCompleted = this.listeners.onInspectionCompleted.filter(listener => listener !== callback);
  }

  public addConnectionStateChangedListener(callback: (state: HubConnectionState) => void): void {
    this.listeners.onConnectionStateChanged.push(callback);
  }

  public removeConnectionStateChangedListener(callback: (state: HubConnectionState) => void): void {
    this.listeners.onConnectionStateChanged = this.listeners.onConnectionStateChanged.filter(listener => listener !== callback);
  }

  private notifyConnectionStateChanged(state: HubConnectionState): void {
    this.listeners.onConnectionStateChanged.forEach(callback => {
      try {
        callback(state);
      } catch (err) {
        console.error("Error in ConnectionStateChanged listener:", err);
      }
    });
  }

  // Check if connected
  public get isConnected(): boolean {
    return this.connection !== null && this.connection.state === HubConnectionState.Connected;
  }

  public get connectionState(): HubConnectionState {
    return this.connection?.state ?? HubConnectionState.Disconnected;
  }

  // Get current joined groups (useful for debugging)
  public getJoinedGroups(): string[] {
    return Array.from(this.joinedGroups);
  }
}

export const inspectionHubService = InspectionHubService.getInstance();