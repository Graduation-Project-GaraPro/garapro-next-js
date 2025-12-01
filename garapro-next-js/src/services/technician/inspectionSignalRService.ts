import * as signalR from "@microsoft/signalr";

const API_URL = process.env.NEXT_PUBLIC_HUB_BASE_URL+ "/hubs/inspection" || 'http://localhost:7113/hubs/inspection';


 class InspectionSignalRService {
  private connection: signalR.HubConnection | null = null;
  private isConnecting = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  public async startConnection(): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      console.log("InspectionSignalR: Already connected");
      return;
    }

    if (this.isConnecting) {
      console.log("InspectionSignalR: Connection in progress");
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
              return null; 
            }
            return Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 30000);
          }
        })
        .configureLogging(signalR.LogLevel.Information)
        .build();

      this.connection.onreconnecting((error) => {
        console.warn("InspectionSignalR: Reconnecting...", error);
        this.reconnectAttempts++;
      });

      this.connection.onreconnected((connectionId) => {
        console.log("InspectionSignalR: Reconnected", connectionId);
        this.reconnectAttempts = 0;
      });

      this.connection.onclose((error) => {
        console.error("InspectionSignalR: Connection closed", error);
        this.connection = null;
        this.isConnecting = false;
      });

      await this.connection.start();
      console.log("InspectionSignalR: Connected successfully");
      this.reconnectAttempts = 0;
    } catch (error) {
      console.error("InspectionSignalR: Connection failed", error);
      this.connection = null;
      throw error;
    } finally {
      this.isConnecting = false;
    }
  }

  public isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected;
  }
  
  // ... rest of the code remains the same



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

  public onInspectionAssigned(callback: (data: InspectionAssignedEvent) => void): void {
    if (!this.connection) return;
    this.connection.on("InspectionAssigned", callback);
  }

  public offInspectionAssigned(): void {
    if (!this.connection) return;
    this.connection.off("InspectionAssigned");
  }

  public async stopConnection(): Promise<void> {
    if (!this.connection) return;

    try {
      await this.connection.stop();
      console.log("InspectionSignalR: Connection stopped");
    } catch (error) {
      console.error("InspectionSignalR: Error stopping connection", error);
    } finally {
      this.connection = null;
      this.isConnecting = false;
    }
  }

  public getConnectionState(): signalR.HubConnectionState | null {
    return this.connection?.state ?? null;
  }
}

export interface InspectionAssignedEvent {
  inspectionId: string;
  technicianId: string;
  repairOrderId: string;
  status: string;
  assignedAt: string;
  message: string;
}

const inspectionSignalRService = new InspectionSignalRService();
export default inspectionSignalRService;