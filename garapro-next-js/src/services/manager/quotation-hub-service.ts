// src/services/manager/quotation-hub-service.ts
import { HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { QuotationDto } from "@/types/manager/quotation";

// Event types for quotation updates
export interface QuotationCustomerResponseEvent {
  quotationId: string;
  quotation: QuotationDto;
  customerResponse: "Approved" | "Rejected";
  customerResponseAt: string;
  message?: string;
}

class QuotationHubService {
  private connection: HubConnection | null = null;
  private static instance: QuotationHubService;
  private listeners: Array<(quotation: QuotationDto) => void> = [];
  private customerResponseListeners: Array<(event: QuotationCustomerResponseEvent) => void> = [];
  private connectionId: string | null = null;

  private constructor() {}

  public static getInstance(): QuotationHubService {
    if (!QuotationHubService.instance) {
      QuotationHubService.instance = new QuotationHubService();
    }
    return QuotationHubService.instance;
  }

  public async startConnection(): Promise<boolean> {
    if (this.connection) {
      return true;
    }

    try {
      const { getHubBaseUrl, HUB_CONNECTION_OPTIONS, HUB_ENDPOINTS } = await import('./hub-config');
      const hubUrl = `${getHubBaseUrl()}${HUB_ENDPOINTS.QUOTATION}`;
      
      console.log("🔌 Connecting to QuotationHub:", hubUrl);
      
      this.connection = new HubConnectionBuilder()
        .withUrl(hubUrl, HUB_CONNECTION_OPTIONS)
        .configureLogging(LogLevel.Information)
        .withAutomaticReconnect()
        .build();

      // Set up event handlers before starting connection
      this.setupEventHandlers();

      await this.connection.start();
      this.connectionId = this.connection.connectionId || null;
      console.log("✅ QuotationHub SignalR Connected. Connection ID:", this.connectionId);

      return true;
    } catch (err) {
      console.error("❌ QuotationHub SignalR connection failed:", err);
      this.connection = null;
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

    // ✨ NEW: Listen for customer responses (approve/reject)
    this.connection.on("CustomerResponseReceived", (event: QuotationCustomerResponseEvent) => {
      console.log("Customer response received:", event);
      this.notifyCustomerResponseListeners(event);
      // Also notify general listeners with the updated quotation
      this.notifyListeners(event.quotation);
    });

    // Handle reconnection
    this.connection.onreconnecting((error) => {
      console.warn("QuotationHub reconnecting...", error);
    });

    this.connection.onreconnected((connectionId) => {
      console.log("QuotationHub reconnected. Connection ID:", connectionId);
      this.connectionId = connectionId || null;
    });

    this.connection.onclose((error) => {
      console.warn("QuotationHub connection closed", error);
      this.connectionId = null;
    });
  }

  public async stopConnection(): Promise<void> {
    if (this.connection) {
      try {
        await this.connection.stop();
        console.log("QuotationHub SignalR Disconnected.");
      } catch (err) {
        console.warn("Error stopping QuotationHub SignalR connection (may already be disconnected):", err);
      } finally {
        this.connection = null;
        this.connectionId = null;
      }
    }
  }

  // Join managers group to receive all quotation updates
  public async joinManagersGroup(): Promise<void> {
    if (this.connection && this.connection.state === "Connected") {
      try {
        await this.connection.invoke("JoinManagersGroup");
        console.log("✅ Joined Managers group for quotation updates");
      } catch (err) {
        console.error("❌ Error joining managers group:", err);
      }
    }
  }

  // Leave managers group
  public async leaveManagersGroup(): Promise<void> {
    if (this.connection && this.connection.state === "Connected") {
      try {
        await this.connection.invoke("LeaveManagersGroup");
        console.log("✅ Left Managers group");
      } catch (err) {
        console.error("❌ Error leaving managers group:", err);
      }
    }
  }

  // Join a user group to receive notifications for their quotations
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

  // Leave a user group
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

  // Join a specific quotation group to receive updates for that quotation
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

  // Leave a specific quotation group
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

  // ✨ NEW: Customer response listeners
  public addCustomerResponseListener(callback: (event: QuotationCustomerResponseEvent) => void): void {
    this.customerResponseListeners.push(callback);
  }

  public removeCustomerResponseListener(callback: (event: QuotationCustomerResponseEvent) => void): void {
    this.customerResponseListeners = this.customerResponseListeners.filter(listener => listener !== callback);
  }

  private notifyCustomerResponseListeners(event: QuotationCustomerResponseEvent): void {
    this.customerResponseListeners.forEach(listener => listener(event));
  }

  // Get connection status
  public isConnected(): boolean {
    return this.connection !== null && this.connection.state === "Connected";
  }

  public getConnectionId(): string | null {
    return this.connectionId;
  }

  // Send a message to the hub (example)
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