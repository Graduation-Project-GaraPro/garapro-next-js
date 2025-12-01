import { HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { apiClient } from "./api-client";
import type { ApiResponse } from "@/types/manager/api";
import type { RoBoardCardDto } from "@/types/manager/repair-order-hub";

// Re-export for backward compatibility
export type { RoBoardCardDto }

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
      const { getHubBaseUrl, HUB_CONNECTION_OPTIONS, HUB_ENDPOINTS } = await import('./hub-config');
      const hubUrl = `${getHubBaseUrl()}${HUB_ENDPOINTS.REPAIR_ORDER}`;
      
      console.log("🔌 Connecting to RepairOrderHub:", hubUrl);
      
      // Configure the connection with authentication
      const builder = new HubConnectionBuilder()
        .withUrl(hubUrl, HUB_CONNECTION_OPTIONS)
        .configureLogging(LogLevel.Information);

      this.connection = builder.build();

      // Start
      await this.connection.start();
      this.isConnected = true;
      console.log("✅ RepairOrderHub Connected");

      // Handle
      this.connection.onclose(async () => {
        this.isConnected = false;
        console.log("SignalR Disconnected. Reconnecting...");
        await this.reconnect();
      });
      
      // The server will automatically send events to the client
    } catch (error) {
      console.error("❌ RepairOrderHub Connection Error:", error);
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
        
        // Check if connection still exists before attempting to start
        if (!this.connection) {
          console.warn("⚠️ Connection object is null, cannot reconnect");
          break;
        }
        
        await this.connection.start();
        this.isConnected = true;
        console.log("✅ RepairOrderHub Reconnected");
        return;
      } catch (error) {
        console.error(`❌ Reconnection attempt ${retryCount + 1} failed:`, error);
        retryCount++;
      }
    }

    console.error("❌ Failed to reconnect to RepairOrderHub after maximum retries");
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
  public async updateRepairOrderStatus(repairOrderId: string, newStatusId: string): Promise<ApiResponse<unknown>> {
    try {
      const response = await apiClient.post<unknown>("/RepairOrder/status/update", {
        repairOrderId: repairOrderId,
        newStatusId: newStatusId
      });

      return response;
    } catch (error) {
      console.error("Failed to update repair order status:", error);
      // Extract error message if available
      let message = "Failed to update repair order status";
      if (error && typeof error === 'object' && 'message' in error) {
        message = error.message as string;
      }
      return { 
        success: false, 
        message,
        status: error && typeof error === 'object' && 'status' in error ? (error.status as number) : 0,
        data: null
      };
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