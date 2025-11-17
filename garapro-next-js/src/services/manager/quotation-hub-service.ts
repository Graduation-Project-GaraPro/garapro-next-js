// src/services/manager/quotation-hub-service.ts
import { HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { QuotationDto } from "@/types/manager/quotation";

class QuotationHubService {
  private connection: HubConnection | null = null;
  private static instance: QuotationHubService;
  private listeners: Array<(quotation: QuotationDto) => void> = [];

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
      // In a real application, this would point to your SignalR hub endpoint
      this.connection = new HubConnectionBuilder()
        .withUrl("/api/QuotationHub") // Adjust this to your actual hub URL
        .configureLogging(LogLevel.Information)
        .build();

      await this.connection.start();
      console.log("SignalR Connected.");

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

      return true;
    } catch (err) {
      console.warn("SignalR connection failed, falling back to polling:", err);
      this.connection = null;
      return false;
    }
  }

  public async stopConnection(): Promise<void> {
    if (this.connection) {
      try {
        await this.connection.stop();
        console.log("SignalR Disconnected.");
      } catch (err) {
        console.warn("Error stopping SignalR connection (may already be disconnected):", err);
      } finally {
        this.connection = null;
      }
    }
  }

  public addListener(callback: (quotation: QuotationDto) => void): void {
    this.listeners.push(callback);
  }

  public removeListener(callback: (quotation: QuotationDto) => void): void {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  private notifyListeners(quotation: QuotationDto): void {
    this.listeners.forEach(listener => listener(quotation));
  }

  // Send a message to the hub (example)
  public async sendQuotationUpdate(quotationId: string, status: string): Promise<void> {
    if (this.connection) {
      try {
        await this.connection.invoke("UpdateQuotationStatus", quotationId, status);
      } catch (err) {
        console.error("Error sending quotation update:", err);
      }
    }
  }
}

export const quotationHubService = QuotationHubService.getInstance();