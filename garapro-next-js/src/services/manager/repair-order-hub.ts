import { HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { apiClient } from "./api-client";

// Define the structure for the card data used in real-time updates
export interface RoBoardCardDto {
  repairOrderId: string;
  receiveDate: string;
  statusName: string;
  vehicleInfo: string;
  customerInfo: string;
  serviceName: string;
  estimatedAmount: number;
  branchName: string;
  label: {
    labelId: number;
    labelName: string;
    color: string;
  } | null;
}

class RepairOrderHubService {
  private connection: HubConnection | null = null;
  private isConnected: boolean = false;

  constructor() {
    // Connection will be initialized when needed
  }

  // Initialize the SignalR connection
  public async initialize(): Promise<void> {
    if (this.connection) {
      return;
    }

    try {
      // Get the base URL from environment variables
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7113";
      
      this.connection = new HubConnectionBuilder()
        .withUrl(`${baseUrl}/api/repairorderhub`)
        .configureLogging(LogLevel.Information)
        .build();

      // Start the connection
      await this.connection.start();
      this.isConnected = true;
      console.log("SignalR Connected");

      // Handle reconnection
      this.connection.onclose(async () => {
        this.isConnected = false;
        console.log("SignalR Disconnected. Reconnecting...");
        await this.reconnect();
      });

      // Note: We don't invoke a "Connected" method on the server as it doesn't exist
      // The server will automatically send events to the client
    } catch (error) {
      console.error("SignalR Connection Error: ", error);
      this.isConnected = false;
    }
  }

  // Reconnect logic
  private async reconnect(): Promise<void> {
    let retryCount = 0;
    const maxRetries = 5;
    const retryInterval = 5000; // 5 seconds

    while (retryCount < maxRetries && !this.isConnected) {
      try {
        await new Promise(resolve => setTimeout(resolve, retryInterval));
        await this.connection?.start();
        this.isConnected = true;
        console.log("SignalR Reconnected");
        return;
      } catch (error) {
        console.error(`Reconnection attempt ${retryCount + 1} failed:`, error);
        retryCount++;
      }
    }

    console.error("Failed to reconnect to SignalR after maximum retries");
  }

  // Register event listeners
  public onRepairOrderMoved(callback: (repairOrderId: string, newStatusId: string, updatedCard: RoBoardCardDto) => void): void {
    this.connection?.on("RepairOrderMoved", callback);
  }

  public onRepairOrderCreated(callback: (repairOrder: RoBoardCardDto) => void): void {
    this.connection?.on("RepairOrderCreated", callback);
  }

  public onRepairOrderUpdated(callback: (repairOrder: RoBoardCardDto) => void): void {
    this.connection?.on("RepairOrderUpdated", callback);
  }

  public onRepairOrderDeleted(callback: (repairOrderId: string) => void): void {
    this.connection?.on("RepairOrderDeleted", callback);
  }

  public onConnected(callback: (connectionId: string) => void): void {
    this.connection?.on("Connected", callback);
  }

  // Update repair order status (for drag and drop)
  public async updateRepairOrderStatus(repairOrderId: string, newStatusId: string): Promise<boolean> {
    try {
      const response = await apiClient.post<unknown>("/api/RepairOrder/status/update", {
        repairOrderId: repairOrderId,
        newStatusId: newStatusId
      });

      return response.success;
    } catch (error) {
      console.error("Failed to update repair order status:", error);
      return false;
    }
  }

  // Batch update repair order statuses
  public async batchUpdateRepairOrderStatuses(updates: { repairOrderId: string; newStatusId: string }[]): Promise<boolean> {
    try {
      const response = await apiClient.post<unknown>("/api/RepairOrder/status/batch-update", updates);

      return response.success;
    } catch (error) {
      console.error("Failed to batch update repair order statuses:", error);
      return false;
    }
  }

  // Check if connected
  public get IsConnected(): boolean {
    return this.isConnected;
  }

  // Disconnect
  public async disconnect(): Promise<void> {
    try {
      await this.connection?.stop();
      this.isConnected = false;
      console.log("SignalR Disconnected");
    } catch (error) {
      console.error("Error disconnecting from SignalR:", error);
    }
  }
}

// Export singleton instance
export const repairOrderHubService = new RepairOrderHubService();