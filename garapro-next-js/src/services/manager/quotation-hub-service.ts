// src/services/manager/quotation-hub-service.ts
import { HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { QuotationDto } from "@/types/manager/quotation";

// Event types for quotation updates
export interface QuotationCustomerResponseEvent {
  quotationId: string;
  repairOrderId: string;
  inspectionId: string;
  customerId: string;
  customerName: string;
  status: "Approved" | "Rejected";
  totalAmount: number;
  selectedServicesCount: number;
  totalServicesCount: number;
  customerNote: string;
  respondedAt: string;
  message: string;
}

export interface QuotationUpdatedEvent {
  quotationId: string;
  userId: string;
  repairOrderId: string;
  totalAmount: number;
  status: "Approved" | "Rejected";
  note: string;
  updatedAt: string;
  customerRespondedAt: string;
}

class QuotationHubService {
  private connection: HubConnection | null = null;
  private static instance: QuotationHubService;
  private listeners: Array<(quotation: QuotationDto) => void> = [];
  private customerResponseListeners: Array<(event: QuotationCustomerResponseEvent) => void> = [];
  private quotationUpdatedListeners: Array<(event: QuotationUpdatedEvent) => void> = [];
  private connectionId: string | null = null;

  private constructor() {}

  public static getInstance(): QuotationHubService {
    if (!QuotationHubService.instance) {
      QuotationHubService.instance = new QuotationHubService();
    }
    return QuotationHubService.instance;
  }

  public async startConnection(): Promise<boolean> {
    // Check if connection already exists and is connected
    if (this.connection && this.connection.state === "Connected") {
      return true;
    }

    // If connection exists but is not connected, stop it first
    if (this.connection && this.connection.state !== "Disconnected") {
      console.log("🔄 Stopping existing QuotationHub connection...");
      try {
        await this.connection.stop();
      } catch (stopError) {
        console.warn("Warning stopping existing connection:", stopError);
      }
      this.connection = null;
      this.connectionId = null;
    }

    try {
      const { getHubBaseUrl, HUB_CONNECTION_OPTIONS, HUB_ENDPOINTS } = await import('./hub-config');
      const baseUrl = getHubBaseUrl();
      const hubUrl = `${baseUrl}${HUB_ENDPOINTS.QUOTATION}`;
      
      console.log("🔌 Connecting to QuotationHub:", hubUrl);
      console.log("🔍 Base URL:", baseUrl);
      console.log("🔍 Hub endpoint:", HUB_ENDPOINTS.QUOTATION);
      
      // Validate URL before creating connection
      try {
        new URL(hubUrl);
      } catch (urlError) {
        console.error("❌ Invalid hub URL:", hubUrl);
        throw new Error(`Invalid hub URL: ${hubUrl}`);
      }
      
      this.connection = new HubConnectionBuilder()
        .withUrl(hubUrl, HUB_CONNECTION_OPTIONS)
        .configureLogging(LogLevel.Information)
        .withAutomaticReconnect()
        .build();

      // Set up event handlers before starting connection
      this.setupEventHandlers();

      await this.connection.start();
      this.connectionId = this.connection.connectionId || null;
      console.log("QuotationHub SignalR Connected. Connection ID:", this.connectionId);

      return true;
    } catch (err) {
      console.error("QuotationHub SignalR connection failed:", err);
      this.connection = null;
      this.connectionId = null;
      return false;
    }
  }

  private setupEventHandlers(): void {
    if (!this.connection) return;

    // Listen for quotation status updates
    this.connection.on("QuotationStatusUpdated", (quotation: QuotationDto) => {
      console.log("Quotation status updated:", quotation);
      this.notifyListeners(quotation);
    });

    // Listen for new quotations
    this.connection.on("QuotationCreated", (quotation: QuotationDto) => {
      console.log("New quotation created:", quotation);
      this.notifyListeners(quotation);
    });

    // Listen for customer response notifications
    this.connection.on("CustomerRespondedToQuotation", (event: QuotationCustomerResponseEvent) => {
      console.log("Customer responded to quotation:", event);
      this.notifyCustomerResponseListeners(event);
    });

    // Listen for quotation updates
    this.connection.on("QuotationUpdated", (event: QuotationUpdatedEvent) => {
      console.log("Quotation updated:", event);
      this.notifyQuotationUpdatedListeners(event);
    });

    // Handle connection events
    this.connection.onclose((error) => {
      console.warn("QuotationHub connection closed", error);
      this.connectionId = null;
    });

    this.connection.onreconnecting((error) => {
      console.warn("QuotationHub reconnecting...", error);
    });

    this.connection.onreconnected((connectionId) => {
      console.log("QuotationHub reconnected. Connection ID:", connectionId);
      this.connectionId = connectionId || null;
    });
  }

  public async stopConnection(): Promise<void> {
    if (this.connection) {
      try {
        if (this.connection.state !== "Disconnected") {
          await this.connection.stop();
          console.log("QuotationHub SignalR Disconnected.");
        }
      } catch (err) {
        console.warn("Error stopping QuotationHub SignalR connection (may already be disconnected):", err);
      } finally {
        this.connection = null;
        this.connectionId = null;
      }
    }
  }

  public async joinManagersGroup(): Promise<void> {
    if (this.connection && this.connection.state === "Connected") {
      try {
        await this.connection.invoke("JoinManagersGroup");
        console.log("✅ Joined Managers group for quotation updates");
      } catch (err) {
        console.log("ℹ️ JoinManagersGroup not available on QuotationHub (auto-send enabled)");
      }
    }
  }

  public async leaveManagersGroup(): Promise<void> {
    if (this.connection && this.connection.state === "Connected") {
      try {
        await this.connection.invoke("LeaveManagersGroup");
        console.log("✅ Left Managers group");
      } catch (err) {
        console.log("ℹ️ LeaveManagersGroup not available on QuotationHub");
      }
    }
  }

  public async joinUserGroup(userId: string): Promise<void> {
    if (this.connection && this.connection.state === "Connected") {
      try {
        await this.connection.invoke("JoinUserGroup", userId);
        console.log(`✅ Joined user group: User_${userId}`);
      } catch (err) {
        console.error("❌ Error joining user group:", err);
      }
    }
  }

  public async leaveUserGroup(userId: string): Promise<void> {
    if (this.connection && this.connection.state === "Connected") {
      try {
        await this.connection.invoke("LeaveUserGroup", userId);
        console.log(`Left user group: User_${userId}`);
      } catch (err) {
        console.error("Error leaving user group:", err);
      }
    }
  }

  public async joinQuotationGroup(quotationId: string): Promise<void> {
    if (this.connection && this.connection.state === "Connected") {
      try {
        await this.connection.invoke("JoinQuotationGroup", quotationId);
        console.log(`Joined quotation group: Quotation_${quotationId}`);
      } catch (err) {
        console.error("Error joining quotation group:", err);
      }
    }
  }

  public async leaveQuotationGroup(quotationId: string): Promise<void> {
    if (this.connection && this.connection.state === "Connected") {
      try {
        await this.connection.invoke("LeaveQuotationGroup", quotationId);
        console.log(`Left quotation group: Quotation_${quotationId}`);
      } catch (err) {
        console.error("Error leaving quotation group:", err);
      }
    }
  }

  // General quotation update listeners
  public addListener(callback: (quotation: QuotationDto) => void): void {
    this.listeners.push(callback);
  }

  public removeListener(callback: (quotation: QuotationDto) => void): void {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  private notifyListeners(quotation: QuotationDto): void {
    this.listeners.forEach(listener => listener(quotation));
  }

  public addCustomerResponseListener(callback: (event: QuotationCustomerResponseEvent) => void): void {
    this.customerResponseListeners.push(callback);
  }

  public removeCustomerResponseListener(callback: (event: QuotationCustomerResponseEvent) => void): void {
    this.customerResponseListeners = this.customerResponseListeners.filter(listener => listener !== callback);
  }

  private notifyCustomerResponseListeners(event: QuotationCustomerResponseEvent): void {
    this.customerResponseListeners.forEach(listener => listener(event));
  }

  public addQuotationUpdatedListener(callback: (event: QuotationUpdatedEvent) => void): void {
    this.quotationUpdatedListeners.push(callback);
  }

  public removeQuotationUpdatedListener(callback: (event: QuotationUpdatedEvent) => void): void {
    this.quotationUpdatedListeners = this.quotationUpdatedListeners.filter(listener => listener !== callback);
  }

  private notifyQuotationUpdatedListeners(event: QuotationUpdatedEvent): void {
    this.quotationUpdatedListeners.forEach(listener => listener(event));
  }

  // Get connection status
  public isConnected(): boolean {
    return this.connection !== null && this.connection.state === "Connected";
  }

  public getConnectionId(): string | null {
    return this.connectionId;
  }

  public getConnectionState(): string {
    return this.connection?.state || "Disconnected";
  }

  public async sendQuotationUpdate(quotationId: string, status: string): Promise<void> {
    if (this.connection && this.connection.state === "Connected") {
      try {
        await this.connection.invoke("UpdateQuotationStatus", quotationId, status);
      } catch (err) {
        console.error("Error sending quotation update:", err);
      }
    }
  }
}

export const quotationHubService = QuotationHubService.getInstance();