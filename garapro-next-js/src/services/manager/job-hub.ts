import { HubConnection, HubConnectionBuilder, LogLevel, HubConnectionState } from "@microsoft/signalr";

// Notification types for job status updates
export interface JobStatusUpdatedNotification {
  jobId: string;
  jobName: string;
  repairOrderId: string;
  technicianId: string;
  technicianName: string;
  oldStatus: string;
  newStatus: string;
  updatedAt: string;
  message: string;
}

export interface RepairCreatedNotification {
  jobId: string;
  jobName: string;
  technicianId: string;
  startTime: string;
  estimatedTime: number;
  message: string;
}

export interface RepairUpdatedNotification {
  repairId: string;
  jobId: string;
  jobName: string;
  technicianId: string;
  oldDescription: string;
  newDescription: string;
  message: string;
}

class JobHubService {
  private connection: HubConnection | null = null;
  private static instance: JobHubService;
  private isReconnecting = false;
  private listeners: {
    onJobStatusUpdated: Array<(notification: JobStatusUpdatedNotification) => void>;
    onRepairCreated: Array<(notification: RepairCreatedNotification) => void>;
    onRepairUpdated: Array<(notification: RepairUpdatedNotification) => void>;
    onConnectionStateChanged: Array<(state: HubConnectionState) => void>;
  } = {
    onJobStatusUpdated: [],
    onRepairCreated: [],
    onRepairUpdated: [],
    onConnectionStateChanged: [],
  };

  private constructor() {}

  public static getInstance(): JobHubService {
    if (!JobHubService.instance) {
      JobHubService.instance = new JobHubService();
    }
    return JobHubService.instance;
  }

  public async startConnection(): Promise<boolean> {
    // Prevent duplicate connections
    if (this.connection?.state === HubConnectionState.Connected) {
      console.log("✅ Already connected to JobHub");
      return true;
    }

    if (this.connection?.state === HubConnectionState.Connecting) {
      console.log("⏳ Connection already in progress...");
      return false;
    }

    try {
      const { getHubBaseUrl, HUB_CONNECTION_OPTIONS, HUB_ENDPOINTS } = await import('./hub-config');
      const hubUrl = `${getHubBaseUrl()}${HUB_ENDPOINTS.JOB}`;

      // Configure the connection with authentication
      this.connection = new HubConnectionBuilder()
        .withUrl(hubUrl, HUB_CONNECTION_OPTIONS)
        .configureLogging(LogLevel.Warning)
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
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
      
      this.notifyConnectionStateChanged(HubConnectionState.Connected);
      
      // Join the Managers group to receive job status updates
      await this.joinManagersGroup();
      
      return true;
    } catch (err) {
      console.error("❌ JobHub connection failed:", err);
      this.connection = null;
      this.notifyConnectionStateChanged(HubConnectionState.Disconnected);
      return false;
    }
  }

  private setupConnectionHandlers(): void {
    if (!this.connection) return;

    // Handle reconnecting state
    this.connection.onreconnecting((error) => {
      this.isReconnecting = true;
      this.notifyConnectionStateChanged(HubConnectionState.Reconnecting);
      if (error) {
        console.warn("JobHub reconnecting:", error.message);
      }
    });

    // Handle successful reconnection
    this.connection.onreconnected(async (connectionId) => {
      this.isReconnecting = false;
      this.notifyConnectionStateChanged(HubConnectionState.Connected);
      
      // Rejoin the Managers group after reconnection
      await this.joinManagersGroup();
    });

    // Handle connection closure
    this.connection.onclose(async (error) => {
      this.notifyConnectionStateChanged(HubConnectionState.Disconnected);
      
      if (error) {
        console.error("JobHub connection error:", error.message);
      }
    });
  }

  private registerEventListeners(): void {
    if (!this.connection) return;

    // Listen for job status updates (technician starts/finishes work)
    // SignalR .NET uses PascalCase by default
    this.connection.on("JobStatusUpdated", (data: JobStatusUpdatedNotification) => {
      this.listeners.onJobStatusUpdated.forEach(callback => {
        try {
          callback(data);
        } catch (err) {
          console.error("Error in JobStatusUpdated listener:", err);
        }
      });
    });

    // Listen for repair created (technician starts work)
    this.connection.on("RepairCreated", (data: RepairCreatedNotification) => {
      this.listeners.onRepairCreated.forEach(callback => {
        try {
          callback(data);
        } catch (err) {
          console.error("Error in RepairCreated listener:", err);
        }
      });
    });

    // Listen for repair updated
    this.connection.on("RepairUpdated", (data: RepairUpdatedNotification) => {
      this.listeners.onRepairUpdated.forEach(callback => {
        try {
          callback(data);
        } catch (err) {
          console.error("Error in RepairUpdated listener:", err);
        }
      });
    });
  }

  /**
   * Join the Managers group to receive job status updates
   * This ensures managers get real-time updates when technicians work
   */
  public async joinManagersGroup(): Promise<void> {
    if (this.connection?.state === HubConnectionState.Connected) {
      try {
        await this.connection.invoke("JoinManagersGroup");
      } catch (error) {
        console.error("Failed to join Managers group:", error);
      }
    }
  }

  public async stopConnection(): Promise<void> {
    if (this.connection) {
      try {
        await this.connection.stop();

      } catch (err) {
        console.warn("⚠️ Error stopping JobHub:", err);
      } finally {
        this.connection = null;
        this.notifyConnectionStateChanged(HubConnectionState.Disconnected);
      }
    }
  }

  // Listener management methods
  public addJobStatusUpdatedListener(callback: (notification: JobStatusUpdatedNotification) => void): void {
    this.listeners.onJobStatusUpdated.push(callback);
  }

  public removeJobStatusUpdatedListener(callback: (notification: JobStatusUpdatedNotification) => void): void {
    this.listeners.onJobStatusUpdated = this.listeners.onJobStatusUpdated.filter(listener => listener !== callback);
  }

  public addRepairCreatedListener(callback: (notification: RepairCreatedNotification) => void): void {
    this.listeners.onRepairCreated.push(callback);
  }

  public removeRepairCreatedListener(callback: (notification: RepairCreatedNotification) => void): void {
    this.listeners.onRepairCreated = this.listeners.onRepairCreated.filter(listener => listener !== callback);
  }

  public addRepairUpdatedListener(callback: (notification: RepairUpdatedNotification) => void): void {
    this.listeners.onRepairUpdated.push(callback);
  }

  public removeRepairUpdatedListener(callback: (notification: RepairUpdatedNotification) => void): void {
    this.listeners.onRepairUpdated = this.listeners.onRepairUpdated.filter(listener => listener !== callback);
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
}

export const jobHubService = JobHubService.getInstance();
