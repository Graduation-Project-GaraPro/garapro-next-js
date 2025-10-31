/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  HubConnection,
  HubConnectionBuilder,
  LogLevel,
} from "@microsoft/signalr";
import { apiClient } from "./api-client";

export interface RoBoardCardDto {
  repairOrderId: string;
  receiveDate: string;
  roTypeName?: string;
  statusName: string;
  vehicleInfo: string;
  customerInfo: string;
  customerName?: string;
  customerPhone?: string;
  branchId?: string;
  estimatedRepairTime?: number;
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
  private isConnected = false;
  private reconnecting = false;

  private createdHandler?: (repairOrder: RoBoardCardDto) => void;
  private movedHandler?: (
    repairOrderId: string,
    newStatusId: string,
    updatedCard: RoBoardCardDto
  ) => void;
  private updatedHandler?: (repairOrder: RoBoardCardDto) => void;
  private deletedHandler?: (repairOrderId: string) => void;

  /** Initialize SignalR connection */
  public async initialize(): Promise<void> {
    if (this.connection && this.isConnected) {
      console.log("SignalR already initialized");
      return;
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7113";
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("authToken") || ""
        : "";

    this.connection = new HubConnectionBuilder()
      .withUrl(`${baseUrl}/api/repairorderhub`, {
        accessTokenFactory: () => token,
      })
      .configureLogging(LogLevel.Information)
      .withAutomaticReconnect()
      .build();

    // 🟩 Đăng ký handler NGAY SAU khi build
    this.connection.on("RepairOrderCreated", (order) => {
      console.log("📦 RepairOrderCreated received:", order);
      this.createdHandler?.(order);
    });

    this.connection.on("RepairOrderMoved", (id, statusId, card) => {
      console.log("📦 RepairOrderMoved:", id, statusId);
      this.movedHandler?.(id, statusId, card);
    });

    this.connection.on("RepairOrderUpdated", (order) => {
      console.log("📦 RepairOrderUpdated:", order);
      this.updatedHandler?.(order);
    });

    this.connection.on("RepairOrderDeleted", (id) => {
      console.log("📦 RepairOrderDeleted:", id);
      this.deletedHandler?.(id);
    });

    // 🟦 Sự kiện hệ thống
    this.registerDefaultEvents();

    try {
      await this.connection.start();
      this.isConnected = true;
      console.log("✅ SignalR Connected to RepairOrderHub");
    } catch (error) {
      console.error("❌ SignalR Connection Error:", error);
      this.isConnected = false;
      this.tryReconnect();
    }
  }

  /** Client-side listener registration */
  public onRepairOrderCreated(callback: (repairOrder: RoBoardCardDto) => void) {
    this.createdHandler = callback;
  }

  public onRepairOrderMoved(
    callback: (
      repairOrderId: string,
      newStatusId: string,
      updatedCard: RoBoardCardDto
    ) => void
  ) {
    this.movedHandler = callback;
  }

  public onRepairOrderUpdated(callback: (repairOrder: RoBoardCardDto) => void) {
    this.updatedHandler = callback;
  }

  public onRepairOrderDeleted(callback: (repairOrderId: string) => void) {
    this.deletedHandler = callback;
  }

  // 🔄 Hỗ trợ reconnect
  private async tryReconnect(): Promise<void> {
    if (this.reconnecting) return;
    this.reconnecting = true;

    for (let i = 0; i < 5 && !this.isConnected; i++) {
      try {
        console.log(`🔁 Trying to reconnect... (${i + 1}/5)`);
        await new Promise((resolve) => setTimeout(resolve, 4000));
        await this.connection?.start();
        this.isConnected = true;
        console.log("✅ SignalR Reconnected");
        break;
      } catch (error) {
        console.error(`Reconnect attempt ${i + 1} failed`, error);
      }
    }

    this.reconnecting = false;
  }

  public async disconnect(): Promise<void> {
    try {
      await this.connection?.stop();
      this.isConnected = false;
      console.log("🔌 SignalR Disconnected");
    } catch (error) {
      console.error("Error disconnecting SignalR:", error);
    }
  }

  /** Update repair order status (used in drag-drop UI) */
  public async updateRepairOrderStatus(
    repairOrderId: string,
    newStatusId: string
  ): Promise<boolean> {
    try {
      const response = await apiClient.post<unknown>(
        "/api/RepairOrder/status/update",
        { repairOrderId, newStatusId }
      );
      return (response as any)?.success ?? true;
    } catch (error) {
      console.error("Failed to update repair order status:", error);
      return false;
    }
  }

  private registerDefaultEvents(): void {
    if (!this.connection) return;

    this.connection.onclose(async (error) => {
      this.isConnected = false;
      console.warn("⚠️ SignalR Disconnected:", error?.message || error);
      await this.tryReconnect();
    });

    this.connection.onreconnecting(() => {
      console.log("🟡 SignalR reconnecting...");
      this.isConnected = false;
    });

    this.connection.onreconnected(() => {
      console.log("🟢 SignalR reconnected successfully");
      this.isConnected = true;
    });
  }
}

export const repairOrderHubService = new RepairOrderHubService();
