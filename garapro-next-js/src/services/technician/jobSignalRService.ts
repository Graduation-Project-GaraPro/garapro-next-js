import * as signalR from "@microsoft/signalr";

const API_URL = process.env.NEXT_PUBLIC_HUB_BASE_URL+ "/hubs/job" || 'http://localhost:7113/hubs/job';

class JobSignalRService {
  private connection: signalR.HubConnection | null = null;
  private isConnecting = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  public async startConnection(): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      console.log("JobSignalR: Already connected");
      return;
    }

    if (this.isConnecting) {
      console.log("JobSignalR: Connection in progress");
      return;
    }

    this.isConnecting = true;

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

      if (!token) {
        throw new Error("No authentication token found");
      }

      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(API_URL, {
          accessTokenFactory: () => token,
          skipNegotiation: true,
          transport: signalR.HttpTransportType.WebSockets,
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            if (retryContext.previousRetryCount >= this.maxReconnectAttempts) {
              return null; // Stop reconnecting
            }
            return Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 30000);
          }
        })
        .configureLogging(signalR.LogLevel.Information)
        .build();

      this.connection.onreconnecting((error) => {
        console.warn("JobSignalR: Reconnecting...", error);
        this.reconnectAttempts++;
      });

      this.connection.onreconnected((connectionId) => {
        console.log("JobSignalR: Reconnected", connectionId);
        this.reconnectAttempts = 0;
      });

      this.connection.onclose((error) => {
        console.error("JobSignalR: Connection closed", error);
        this.connection = null;
        this.isConnecting = false;
      });

      await this.connection.start();
      console.log("JobSignalR: Connected successfully");
      this.reconnectAttempts = 0;
    } catch (error) {
      console.error("JobSignalR: Connection failed", error);
      this.connection = null;
      throw error;
    } finally {
      this.isConnecting = false;
    }
  }

  public isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected;
  }

  public async joinTechnicianGroup(technicianId: string): Promise<void> {
    if (!this.connection) {
      throw new Error("SignalR connection not established");
    }
    try {
      await this.connection.invoke("JoinTechnicianGroup", technicianId);
      console.log(`Joined Technician_${technicianId} group`);
    } catch (error) {
      console.error("Failed to join technician group", error);
      throw error;
    }
  }

  public async leaveTechnicianGroup(technicianId: string): Promise<void> {
    if (!this.connection) return;
    try {
      await this.connection.invoke("LeaveTechnicianGroup", technicianId);
      console.log(`Left Technician_${technicianId} group`);
    } catch (error) {
      console.error("Failed to leave technician group", error);
    }
  }

  public async joinJobGroup(jobId: string): Promise<void> {
    if (!this.connection) {
      throw new Error("SignalR connection not established");
    }
    try {
      await this.connection.invoke("JoinJobGroup", jobId);
      console.log(`Joined Job_${jobId} group`);
    } catch (error) {
      console.error("Failed to join job group", error);
      throw error;
    }
  }

  public async leaveJobGroup(jobId: string): Promise<void> {
    if (!this.connection) return;
    try {
      await this.connection.invoke("LeaveJobGroup", jobId);
      console.log(`Left Job_${jobId} group`);
    } catch (error) {
      console.error("Failed to leave job group", error);
    }
  }

  public onJobAssigned(callback: (data: JobAssignedEvent) => void): void {
    if (!this.connection) return;
    this.connection.on("JobAssigned", callback);
  }

  public onJobStatusUpdated(callback: (data: JobStatusUpdatedEvent) => void): void {
    if (!this.connection) return;
    this.connection.on("JobStatusUpdated", callback);
  }

  public offAllEvents(): void {
    if (!this.connection) return;
    this.connection.off("JobAssigned");
    this.connection.off("JobReassigned");
    this.connection.off("JobStatusUpdated");
  }

  public async stopConnection(): Promise<void> {
    if (!this.connection) return;

    try {
      await this.connection.stop();
      console.log("JobSignalR: Connection stopped");
    } catch (error) {
      console.error("JobSignalR: Error stopping connection", error);
    } finally {
      this.connection = null;
      this.isConnecting = false;
    }
  }

  public getConnectionState(): signalR.HubConnectionState | null {
    return this.connection?.state ?? null;
  }
}

export interface JobAssignedEvent {
  jobId: string;
  technicianId: string;
  jobName: string;
  serviceName: string;
  repairOrderId: string;
  status: string;
  assignedAt: string;
  message: string;
}

export interface JobReassignedEvent {
  jobId: string;
  technicianId: string;
  jobName: string;
  serviceName: string;
  repairOrderId: string;
  status: string;
  reassignedAt: string;
  message: string;
}

export interface JobStatusUpdatedEvent {
  jobId: string;
  oldStatus: string;
  newStatus: string;
  updatedAt: string;
  message: string;
}

const jobSignalRService = new JobSignalRService();
export default jobSignalRService;