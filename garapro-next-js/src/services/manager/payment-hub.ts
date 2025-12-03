// src/services/manager/payment-hub.ts
// NOTE: This service uses RepairOrderHub for payment events
// The backend sends payment events through RepairOrderHub, not a separate PaymentHub
import { HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { PaymentSummaryResponse } from "@/types/manager/payment";

// Event types for payment updates (sent via RepairOrderHub)
export interface PaymentReceivedEvent {
  repairOrderId: string;
  paymentId: number;
  amount: number;
  method: string;
  customerName: string;
  vehicleInfo: string;
  createdAt: string;
  description?: string;
}

export interface PaymentConfirmedEvent {
  repairOrderId: string;
  paymentId: number;
  amount: number;
  customerName: string;
  vehicleInfo: string;
  confirmedAt: string;
}

export interface RepairOrderPaidEvent {
  repairOrderId: string;
  totalAmount: number;
  paidAt: string;
}

// Legacy event types for backward compatibility
export interface PaymentCreatedEvent extends PaymentReceivedEvent {
  status: string;
}

export interface PaymentStatusUpdatedEvent {
  paymentId: number;
  repairOrderId: string;
  status: string;
  updatedAt: string;
}

export interface PaymentCompletedEvent {
  repairOrderId: string;
  paymentSummary: PaymentSummaryResponse;
  completedAt: string;
}

class PaymentHubService {
  private connection: HubConnection | null = null;
  private static instance: PaymentHubService;
  private paymentReceivedListeners: Array<(event: PaymentReceivedEvent) => void> = [];
  private paymentConfirmedListeners: Array<(event: PaymentConfirmedEvent) => void> = [];
  private repairOrderPaidListeners: Array<(event: RepairOrderPaidEvent) => void> = [];
  // Legacy listeners for backward compatibility
  private paymentCreatedListeners: Array<(event: PaymentCreatedEvent) => void> = [];
  private paymentStatusListeners: Array<(event: PaymentStatusUpdatedEvent) => void> = [];
  private paymentCompletedListeners: Array<(event: PaymentCompletedEvent) => void> = [];
  private connectionId: string | null = null;

  private constructor() {}

  public static getInstance(): PaymentHubService {
    if (!PaymentHubService.instance) {
      PaymentHubService.instance = new PaymentHubService();
    }
    return PaymentHubService.instance;
  }

  public async startConnection(): Promise<boolean> {
    if (this.connection) {
      return true;
    }

    try {
      const { getHubBaseUrl, HUB_CONNECTION_OPTIONS, HUB_ENDPOINTS } = await import('./hub-config');
      const hubUrl = `${getHubBaseUrl()}${HUB_ENDPOINTS.REPAIR_ORDER}`;
      
      console.log("🔌 Connecting to RepairOrderHub for payment events:", hubUrl);
      
      this.connection = new HubConnectionBuilder()
        .withUrl(hubUrl, HUB_CONNECTION_OPTIONS)
        .configureLogging(LogLevel.Information)
        .withAutomaticReconnect()
        .build();

      // Set up event handlers before starting connection
      this.setupEventHandlers();

      await this.connection.start();
      this.connectionId = this.connection.connectionId || null;
      console.log("✅ RepairOrderHub SignalR Connected for payment events. Connection ID:", this.connectionId);

      return true;
    } catch (err) {
      console.error("❌ RepairOrderHub SignalR connection failed:", err);
      this.connection = null;
      return false;
    }
  }

  private setupEventHandlers(): void {
    if (!this.connection) return;

    // Listen for PaymentReceived events (cash payment recorded by manager)
    this.connection.on("PaymentReceived", (event: PaymentReceivedEvent) => {
      console.log("💰 Payment received:", event);
      this.notifyPaymentReceivedListeners(event);
      // Also notify legacy listeners
      const legacyEvent: PaymentCreatedEvent = {
        ...event,
        status: "Paid"
      };
      this.notifyPaymentCreatedListeners(legacyEvent);
    });

    // Listen for PaymentConfirmed events (PayOS payment confirmed)
    this.connection.on("PaymentConfirmed", (event: PaymentConfirmedEvent) => {
      console.log("✅ Payment confirmed:", event);
      this.notifyPaymentConfirmedListeners(event);
    });

    // Listen for RepairOrderPaid events (repair order fully paid)
    this.connection.on("RepairOrderPaid", (repairOrderId: string) => {
      console.log("🎉 Repair order fully paid:", repairOrderId);
      const event: RepairOrderPaidEvent = {
        repairOrderId,
        totalAmount: 0, // Backend doesn't send this in the simple event
        paidAt: new Date().toISOString()
      };
      this.notifyRepairOrderPaidListeners(event);
      // Also notify legacy completed listeners
      const legacyEvent: PaymentCompletedEvent = {
        repairOrderId,
        paymentSummary: {} as PaymentSummaryResponse, // Will be fetched by component
        completedAt: event.paidAt
      };
      this.notifyPaymentCompletedListeners(legacyEvent);
    });

    // Handle reconnection
    this.connection.onreconnecting((error) => {
      console.warn("RepairOrderHub reconnecting...", error);
    });

    this.connection.onreconnected((connectionId) => {
      console.log("RepairOrderHub reconnected. Connection ID:", connectionId);
      this.connectionId = connectionId || null;
    });

    this.connection.onclose((error) => {
      console.warn("RepairOrderHub connection closed", error);
      this.connectionId = null;
    });
  }

  public async stopConnection(): Promise<void> {
    if (this.connection) {
      try {
        await this.connection.stop();
        console.log("RepairOrderHub SignalR Disconnected.");
      } catch (err) {
        console.warn("Error stopping RepairOrderHub SignalR connection:", err);
      } finally {
        this.connection = null;
        this.connectionId = null;
      }
    }
  }

  // Join managers group to monitor all payment activities
  public async joinManagersGroup(): Promise<void> {
    if (this.connection && this.connection.state === "Connected") {
      try {
        await this.connection.invoke("JoinManagersGroup");
        console.log("✅ Joined Managers group for payment updates");
      } catch (err) {
        console.error("❌ Error joining Managers group:", err);
      }
    }
  }

  public async leaveManagersGroup(): Promise<void> {
    if (this.connection && this.connection.state === "Connected") {
      try {
        await this.connection.invoke("LeaveManagersGroup");
        console.log("✅ Left Managers group");
      } catch (err) {
        console.error("❌ Error leaving Managers group:", err);
      }
    }
  }

  // Join specific repair order payment group
  public async joinRepairOrderPaymentGroup(repairOrderId: string): Promise<void> {
    if (this.connection && this.connection.state === "Connected") {
      try {
        await this.connection.invoke("JoinRepairOrderPaymentGroup", repairOrderId);
        console.log(`✅ Joined payment group: Payment_${repairOrderId}`);
      } catch (err) {
        console.error("❌ Error joining repair order payment group:", err);
      }
    }
  }

  public async leaveRepairOrderPaymentGroup(repairOrderId: string): Promise<void> {
    if (this.connection && this.connection.state === "Connected") {
      try {
        await this.connection.invoke("LeaveRepairOrderPaymentGroup", repairOrderId);
        console.log(`Left payment group: Payment_${repairOrderId}`);
      } catch (err) {
        console.error("Error leaving repair order payment group:", err);
      }
    }
  }

  // Join customer payment group (for customer-specific updates)
  public async joinCustomerPaymentGroup(userId: string): Promise<void> {
    if (this.connection && this.connection.state === "Connected") {
      try {
        await this.connection.invoke("JoinCustomerPaymentGroup", userId);
        console.log(`✅ Joined customer payment group: CustomerPayment_${userId}`);
      } catch (err) {
        console.error("❌ Error joining customer payment group:", err);
      }
    }
  }

  public async leaveCustomerPaymentGroup(userId: string): Promise<void> {
    if (this.connection && this.connection.state === "Connected") {
      try {
        await this.connection.invoke("LeaveCustomerPaymentGroup", userId);
        console.log(`Left customer payment group: CustomerPayment_${userId}`);
      } catch (err) {
        console.error("Error leaving customer payment group:", err);
      }
    }
  }

  // Join branch-specific payment group (for branch managers)
  public async joinBranchPaymentGroup(branchId: string): Promise<void> {
    if (this.connection && this.connection.state === "Connected") {
      try {
        await this.connection.invoke("JoinBranchPaymentGroup", branchId);
        console.log(`✅ Joined branch payment group: BranchPayment_${branchId}`);
      } catch (err) {
        console.error("❌ Error joining branch payment group:", err);
      }
    }
  }

  public async leaveBranchPaymentGroup(branchId: string): Promise<void> {
    if (this.connection && this.connection.state === "Connected") {
      try {
        await this.connection.invoke("LeaveBranchPaymentGroup", branchId);
        console.log(`Left branch payment group: BranchPayment_${branchId}`);
      } catch (err) {
        console.error("Error leaving branch payment group:", err);
      }
    }
  }

  // Event listeners for PaymentReceived
  public addPaymentReceivedListener(callback: (event: PaymentReceivedEvent) => void): void {
    this.paymentReceivedListeners.push(callback);
  }

  public removePaymentReceivedListener(callback: (event: PaymentReceivedEvent) => void): void {
    this.paymentReceivedListeners = this.paymentReceivedListeners.filter(listener => listener !== callback);
  }

  private notifyPaymentReceivedListeners(event: PaymentReceivedEvent): void {
    this.paymentReceivedListeners.forEach(listener => listener(event));
  }

  // Event listeners for PaymentConfirmed
  public addPaymentConfirmedListener(callback: (event: PaymentConfirmedEvent) => void): void {
    this.paymentConfirmedListeners.push(callback);
  }

  public removePaymentConfirmedListener(callback: (event: PaymentConfirmedEvent) => void): void {
    this.paymentConfirmedListeners = this.paymentConfirmedListeners.filter(listener => listener !== callback);
  }

  private notifyPaymentConfirmedListeners(event: PaymentConfirmedEvent): void {
    this.paymentConfirmedListeners.forEach(listener => listener(event));
  }

  // Event listeners for RepairOrderPaid
  public addRepairOrderPaidListener(callback: (event: RepairOrderPaidEvent) => void): void {
    this.repairOrderPaidListeners.push(callback);
  }

  public removeRepairOrderPaidListener(callback: (event: RepairOrderPaidEvent) => void): void {
    this.repairOrderPaidListeners = this.repairOrderPaidListeners.filter(listener => listener !== callback);
  }

  private notifyRepairOrderPaidListeners(event: RepairOrderPaidEvent): void {
    this.repairOrderPaidListeners.forEach(listener => listener(event));
  }

  // Legacy event listeners for backward compatibility
  public addPaymentCreatedListener(callback: (event: PaymentCreatedEvent) => void): void {
    this.paymentCreatedListeners.push(callback);
  }

  public removePaymentCreatedListener(callback: (event: PaymentCreatedEvent) => void): void {
    this.paymentCreatedListeners = this.paymentCreatedListeners.filter(listener => listener !== callback);
  }

  private notifyPaymentCreatedListeners(event: PaymentCreatedEvent): void {
    this.paymentCreatedListeners.forEach(listener => listener(event));
  }

  public addPaymentStatusListener(callback: (event: PaymentStatusUpdatedEvent) => void): void {
    this.paymentStatusListeners.push(callback);
  }

  public removePaymentStatusListener(callback: (event: PaymentStatusUpdatedEvent) => void): void {
    this.paymentStatusListeners = this.paymentStatusListeners.filter(listener => listener !== callback);
  }

  private notifyPaymentStatusListeners(event: PaymentStatusUpdatedEvent): void {
    this.paymentStatusListeners.forEach(listener => listener(event));
  }

  public addPaymentCompletedListener(callback: (event: PaymentCompletedEvent) => void): void {
    this.paymentCompletedListeners.push(callback);
  }

  public removePaymentCompletedListener(callback: (event: PaymentCompletedEvent) => void): void {
    this.paymentCompletedListeners = this.paymentCompletedListeners.filter(listener => listener !== callback);
  }

  private notifyPaymentCompletedListeners(event: PaymentCompletedEvent): void {
    this.paymentCompletedListeners.forEach(listener => listener(event));
  }

  // Get connection status
  public isConnected(): boolean {
    return this.connection !== null && this.connection.state === "Connected";
  }

  public getConnectionId(): string | null {
    return this.connectionId;
  }
}

export const paymentHubService = PaymentHubService.getInstance();
