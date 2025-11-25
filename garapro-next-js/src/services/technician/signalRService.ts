import * as signalR from "@microsoft/signalr";

class SignalRService {
  private connection: signalR.HubConnection | null = null;
  private isConnecting = false;

  // Khởi tạo connection
  public async startConnection(): Promise<void> {
    if (this.connection || this.isConnecting) {
      console.log("SignalR: Already connected or connecting");
      return;
    }

    this.isConnecting = true;

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

      if (!token) {
        throw new Error("No authentication token found");
      }

      this.connection = new signalR.HubConnectionBuilder()
        .withUrl("https://localhost:7113/hubs/repair", {
          accessTokenFactory: () => token,
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000]) // Retry intervals
        .configureLogging(signalR.LogLevel.Information)
        .build();

      // Event handlers
      this.connection.onreconnecting((error) => {
        console.warn("SignalR: Reconnecting...", error);
      });

      this.connection.onreconnected((connectionId) => {
        console.log("SignalR: Reconnected successfully", connectionId);
      });

      this.connection.onclose((error) => {
        console.error("SignalR: Connection closed", error);
        this.connection = null;
        this.isConnecting = false;
      });

      await this.connection.start();
      console.log("SignalR: Connected successfully");
    } catch (error) {
      console.error("SignalR: Connection failed", error);
      this.connection = null;
      throw error;
    } finally {
      this.isConnecting = false;
    }
  }

  // Join vào RepairOrder group
  public async joinRepairOrderGroup(repairOrderId: string): Promise<void> {
    if (!this.connection) {
      throw new Error("SignalR connection not established");
    }

    try {
      await this.connection.invoke("JoinRepairOrderGroup", repairOrderId);
      console.log(`SignalR: Joined RepairOrder_${repairOrderId} group`);
    } catch (error) {
      console.error("SignalR: Failed to join group", error);
      throw error;
    }
  }

  // Leave RepairOrder group
  public async leaveRepairOrderGroup(repairOrderId: string): Promise<void> {
    if (!this.connection) return;

    try {
      await this.connection.invoke("LeaveRepairOrderGroup", repairOrderId);
      console.log(`SignalR: Left RepairOrder_${repairOrderId} group`);
    } catch (error) {
      console.error("SignalR: Failed to leave group", error);
    }
  }

  // Join Job group (optional)
  public async joinJobGroup(jobId: string): Promise<void> {
    if (!this.connection) {
      throw new Error("SignalR connection not established");
    }

    try {
      await this.connection.invoke("JoinJobGroup", jobId);
      console.log(`SignalR: Joined Job_${jobId} group`);
    } catch (error) {
      console.error("SignalR: Failed to join job group", error);
      throw error;
    }
  }

  // Subscribe to RepairCreated event
  public onRepairCreated(callback: (data: RepairCreatedEvent) => void): void {
    if (!this.connection) return;
    this.connection.on("RepairCreated", callback);
  }

  // Subscribe to RepairUpdated event
  public onRepairUpdated(callback: (data: RepairUpdatedEvent) => void): void {
    if (!this.connection) return;
    this.connection.on("RepairUpdated", callback);
  }

  // Subscribe to JobStatusChanged event
  public onJobStatusChanged(callback: (data: JobStatusChangedEvent) => void): void {
    if (!this.connection) return;
    this.connection.on("JobStatusChanged", callback);
  }

  // Subscribe to RepairOrderViewed event
  public onRepairOrderViewed(callback: (data: RepairOrderViewedEvent) => void): void {
    if (!this.connection) return;
    this.connection.on("RepairOrderViewed", callback);
  }

  // Unsubscribe from all events
  public offAllEvents(): void {
    if (!this.connection) return;
    this.connection.off("RepairCreated");
    this.connection.off("RepairUpdated");
    this.connection.off("JobStatusChanged");
    this.connection.off("RepairOrderViewed");
  }

  // Stop connection
  public async stopConnection(): Promise<void> {
    if (!this.connection) return;

    try {
      await this.connection.stop();
      console.log("SignalR: Connection stopped");
    } catch (error) {
      console.error("SignalR: Error stopping connection", error);
    } finally {
      this.connection = null;
      this.isConnecting = false;
    }
  }

  // Get connection state
  public getConnectionState(): signalR.HubConnectionState | null {
    return this.connection?.state ?? null;
  }
}

// Event interfaces
export interface RepairCreatedEvent {
  repairId: string;
  jobId: string;
  repairOrderId: string;
  description: string;
  notes: string;
  estimatedTime: string;
  startTime: string;
  jobStatus: string;
  message: string;
}

export interface RepairUpdatedEvent {
  repairId: string;
  jobId: string;
  repairOrderId: string;
  description: string;
  notes: string;
  oldDescription: string;
  oldNotes: string;
  updatedAt: string;
  message: string;
}

export interface JobStatusChangedEvent {
  jobId: string;
  status: string;
  message: string;
}

export interface RepairOrderViewedEvent {
  repairOrderId: string;
  technicianId: string;
  viewedAt: string;
  message: string;
}

// Singleton instance
const signalRService = new SignalRService();
export default signalRService;