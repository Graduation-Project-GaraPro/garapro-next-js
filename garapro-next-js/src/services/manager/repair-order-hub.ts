import { HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { apiClient } from "./api-client";
import type { ApiResponse } from "@/types/manager/api";
import type { RoBoardCardDto } from "@/types/manager/repair-order-hub";

export type { RoBoardCardDto }

class RepairOrderHubService {
  private connection: HubConnection | null = null;
  private isConnected: boolean = false;
  private isReconnecting: boolean = false;
  private initializationPromise: Promise<void> | null = null;
  private isInitializing: boolean = false;

  constructor() {

  }

  // Initialize the SignalR connection
  public async initialize(): Promise<void> {
    if (this.connection && this.isConnected) {
      return;
    }

    if (this.isInitializing && this.initializationPromise) {
      return this.initializationPromise;
    }

    this.isInitializing = true;
    this.initializationPromise = this._performInitialization();

    try {
      await this.initializationPromise;
    } finally {
      this.isInitializing = false;
      this.initializationPromise = null;
    }
  }

  private async _performInitialization(): Promise<void> {
    try {
      const { getHubBaseUrl, HUB_CONNECTION_OPTIONS, HUB_ENDPOINTS } = await import('./hub-config');
      const hubUrl = `${getHubBaseUrl()}${HUB_ENDPOINTS.REPAIR_ORDER}`;
      
      const builder = new HubConnectionBuilder()
        .withUrl(hubUrl, HUB_CONNECTION_OPTIONS)
        .withAutomaticReconnect([2000, 5000, 10000, 30000, 60000])
        .configureLogging(LogLevel.Error);

      this.connection = builder.build();

      this.setupConnectionHandlers();

      await this.connection.start();
      this.isConnected = true;
      console.log("✅ RepairOrderHub connected successfully");
      
    } catch (error) {
      console.error("❌ RepairOrderHub Connection Error:", error);
      this.isConnected = false;
      
      // Clean up failed connection
      if (this.connection) {
        try {
          await this.connection.stop();
        } catch{

        }      
        this.connection = null;
      }
      
      throw error;
    }
  }

  private setupConnectionHandlers(): void {
    if (!this.connection) return;

    // Handle reconnecting state
    this.connection.onreconnecting((error) => {
      this.isReconnecting = true;
      this.isConnected = false;
      if (error) {
        console.warn("RepairOrderHub reconnecting due to:", error.message);
      }
    });

    // Handle successful reconnection
    this.connection.onreconnected(async (connectionId) => {
      this.isReconnecting = false;
      this.isConnected = true;
      if (connectionId) {
        console.log("✅ RepairOrderHub reconnected");
      }
    });

    // Handle connection closure
    this.connection.onclose(async (error) => {
      this.isConnected = false;
      this.isReconnecting = false;
      
      if (error) {
        console.error("RepairOrderHub connection closed:", error.message);
      }
    });
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

  // Unregister event listeners (important for cleanup!)
  public offRepairOrderMoved(callback: (repairOrderId: string, newStatusId: string, updatedCard: RoBoardCardDto) => void): void {
    this.connection?.off("RepairOrderMoved", callback);
  }

  public offRepairOrderCreated(callback: (repairOrder: RoBoardCardDto) => void): void {
    this.connection?.off("RepairOrderCreated", callback);
  }

  public offRepairOrderUpdated(callback: (repairOrder: RoBoardCardDto) => void): void {
    this.connection?.off("RepairOrderUpdated", callback);
  }

  public offRepairOrderDeleted(callback: (repairOrderId: string) => void): void {
    this.connection?.off("RepairOrderDeleted", callback);
  }

  public offConnected(callback: (connectionId: string) => void): void {
    this.connection?.off("Connected", callback);
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
    // Prevent disconnect during initialization
    if (this.isInitializing) {
      console.warn("Cannot disconnect while initializing");
      return;
    }

    try {
      if (this.connection) {
        await this.connection.stop();
        this.connection = null;
      }
      this.isConnected = false;
      this.isReconnecting = false;
    } catch (error) {
      console.error("Error disconnecting from SignalR:", error);
    }
  }
}

// Export singleton instance
export const repairOrderHubService = new RepairOrderHubService();