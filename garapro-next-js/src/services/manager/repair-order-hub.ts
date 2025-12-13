import { HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { apiClient } from "./api-client";
import type { ApiResponse } from "@/types/manager/api";
import type { RoBoardCardDto } from "@/types/manager/repair-order-hub";

// Re-export for backward compatibility
export type { RoBoardCardDto }



class RepairOrderHubService {
  private connection: HubConnection | null = null;
  private isConnected: boolean = false;
  private isReconnecting: boolean = false;

  constructor() {
    // Connection will be initialized when needed
  }

  // Initialize the SignalR connection
  public async initialize(): Promise<void> {
    if (this.connection && this.isConnected) {
      return;
    }

    try {
      const { getHubBaseUrl, HUB_CONNECTION_OPTIONS, HUB_ENDPOINTS } = await import('./hub-config');
      const hubUrl = `${getHubBaseUrl()}${HUB_ENDPOINTS.REPAIR_ORDER}`;
      
      // Configure the connection with authentication and automatic reconnection
      const builder = new HubConnectionBuilder()
        .withUrl(hubUrl, HUB_CONNECTION_OPTIONS)
        .withAutomaticReconnect([2000, 5000, 10000, 30000, 60000]) // Less aggressive: 2s, 5s, 10s, 30s, 60s
        .configureLogging(LogLevel.Error); // Only log errors to reduce noise

      this.connection = builder.build();

      // Setup connection handlers
      this.setupConnectionHandlers();

      // Start the connection
      await this.connection.start();
      this.isConnected = true;
      
      // The server will automatically send events to the client
    } catch (error) {
      console.error("❌ RepairOrderHub Connection Error:", error);
      this.isConnected = false;
      this.connection = null;
    }
  }

  private setupConnectionHandlers(): void {
    if (!this.connection) return;

    // Handle reconnecting state
    this.connection.onreconnecting((error) => {
      this.isReconnecting = true;
      this.isConnected = false;
      // Only log if there's an actual error
      if (error) {
        console.warn("RepairOrderHub reconnecting due to:", error.message);
      }
    });

    // Handle successful reconnection
    this.connection.onreconnected(async (connectionId) => {
      this.isReconnecting = false;
      this.isConnected = true;
      // Only log reconnection, not initial connection
      if (connectionId) {
        console.log("✅ RepairOrderHub reconnected");
      }
    });

    // Handle connection closure
    this.connection.onclose(async (error) => {
      this.isConnected = false;
      this.isReconnecting = false;
      
      // Only log errors, not normal disconnections
      if (error) {
        console.error("RepairOrderHub connection error:", error.message);
      }
    });
  }



  // Register event listeners
  // SignalR .NET uses PascalCase by default
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
    return this.isConnected && this.connection?.state === "Connected";
  }

  // Check if reconnecting
  public get IsReconnecting(): boolean {
    return this.isReconnecting;
  }

  // Get connection state
  public getConnectionState(): string {
    return this.connection?.state || "Disconnected";
  }

  // Disconnect
  public async disconnect(): Promise<void> {
    try {
      if (this.connection) {
        await this.connection.stop();
        this.connection = null;
      }
      this.isConnected = false;
    } catch (error) {
      console.error("Error disconnecting from SignalR:", error);
    }
  }
}

// Export singleton instance
export const repairOrderHubService = new RepairOrderHubService();