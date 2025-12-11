import { HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import type {
  TechnicianAssignmentNotification,
  TechnicianReassignmentNotification,
  InspectionAssignmentNotification,
  InspectionReassignmentNotification
} from "@/types/manager/technician";

// Re-export for backward compatibility
export type { 
  TechnicianAssignmentNotification, 
  TechnicianReassignmentNotification, 
  InspectionAssignmentNotification, 
  InspectionReassignmentNotification 
}

class TechnicianAssignmentHubService {
  private connection: HubConnection | null = null;
  private static instance: TechnicianAssignmentHubService;
  private listeners: {
    onJobAssigned: Array<(notification: TechnicianAssignmentNotification) => void>;
    onJobReassigned: Array<(notification: TechnicianReassignmentNotification) => void>;
    onInspectionAssigned: Array<(notification: InspectionAssignmentNotification) => void>;
    onInspectionReassigned: Array<(notification: InspectionReassignmentNotification) => void>;
  } = {
    onJobAssigned: [],
    onJobReassigned: [],
    onInspectionAssigned: [],
    onInspectionReassigned: [],
  };

  private constructor() {}

  public static getInstance(): TechnicianAssignmentHubService {
    if (!TechnicianAssignmentHubService.instance) {
      TechnicianAssignmentHubService.instance = new TechnicianAssignmentHubService();
    }
    return TechnicianAssignmentHubService.instance;
  }

  public async startConnection(): Promise<boolean> {
    if (this.connection) {
      return true;
    }

    try {
      const { getHubBaseUrl, HUB_CONNECTION_OPTIONS, HUB_ENDPOINTS } = await import('./hub-config');
      const hubUrl = `${getHubBaseUrl()}${HUB_ENDPOINTS.TECHNICIAN_ASSIGNMENT}`;
      
      console.log("🔌 Connecting to TechnicianAssignmentHub:", hubUrl);
      
      // Configure the connection with authentication and automatic reconnection
      this.connection = new HubConnectionBuilder()
        .withUrl(hubUrl, HUB_CONNECTION_OPTIONS)
        .withAutomaticReconnect([0, 2000, 10000, 30000]) // Retry after 0, 2, 10, 30 seconds
        .configureLogging(LogLevel.Information)
        .build();

      // Setup connection handlers
      this.setupConnectionHandlers();

      await this.connection.start();

      // Register event listeners
      this.registerEventListeners();
      
      return true;
    } catch (err) {
      console.error("❌ TechnicianAssignmentHub connection failed:", err);
      this.connection = null;
      return false;
    }
  }

  private registerEventListeners(): void {
    if (!this.connection) return;

    // Listen for job assignment notifications
    this.connection.on("JobAssigned", (technicianId: string, technicianName: string, jobCount: number, jobNames: string[]) => {
      console.log("Job assigned notification received:", { technicianId, technicianName, jobCount, jobNames });
      const notification: TechnicianAssignmentNotification = { technicianId, technicianName, jobCount, jobNames };
      this.listeners.onJobAssigned.forEach(callback => callback(notification));
    });

    // Listen for job reassignment notifications
    this.connection.on("JobReassigned", (jobId: string, oldTechnicianId: string, newTechnicianId: string, jobName: string) => {
      console.log("Job reassigned notification received:", { jobId, oldTechnicianId, newTechnicianId, jobName });
      const notification: TechnicianReassignmentNotification = { jobId, oldTechnicianId, newTechnicianId, jobName };
      this.listeners.onJobReassigned.forEach(callback => callback(notification));
    });

    // Listen for inspection assignment notifications
    this.connection.on("InspectionAssigned", (technicianId: string, technicianName: string, inspectionCount: number, inspectionNames: string[]) => {
      console.log("Inspection assigned notification received:", { technicianId, technicianName, inspectionCount, inspectionNames });
      const notification: InspectionAssignmentNotification = { technicianId, technicianName, inspectionCount, inspectionNames };
      this.listeners.onInspectionAssigned.forEach(callback => callback(notification));
    });

    // Listen for inspection reassignment notifications
    this.connection.on("InspectionReassigned", (inspectionId: string, oldTechnicianId: string, newTechnicianId: string, inspectionName: string) => {
      console.log("Inspection reassigned notification received:", { inspectionId, oldTechnicianId, newTechnicianId, inspectionName });
      const notification: InspectionReassignmentNotification = { inspectionId, oldTechnicianId, newTechnicianId, inspectionName };
      this.listeners.onInspectionReassigned.forEach(callback => callback(notification));
    });

  }

  private setupConnectionHandlers(): void {
    if (!this.connection) return;

    // Handle reconnecting state
    this.connection.onreconnecting((error) => {
      if (error) {
        console.warn("TechnicianAssignmentHub reconnecting:", error.message);
      }
    });

    // Handle successful reconnection
    this.connection.onreconnected(async (connectionId) => {
      // Re-register event listeners after reconnection
      this.registerEventListeners();
    });

    // Handle connection closure
    this.connection.onclose(async (error) => {
      if (error) {
        console.error("TechnicianAssignmentHub connection error:", error.message);
      }
    });
  }

  public async stopConnection(): Promise<void> {
    if (this.connection) {
      try {
        await this.connection.stop();

      } catch (err) {
        console.warn("Error stopping Technician Assignment SignalR connection:", err);
      } finally {
        this.connection = null;
      }
    }
  }

  // Listener management methods
  public addJobAssignedListener(callback: (notification: TechnicianAssignmentNotification) => void): void {
    this.listeners.onJobAssigned.push(callback);
  }

  public removeJobAssignedListener(callback: (notification: TechnicianAssignmentNotification) => void): void {
    this.listeners.onJobAssigned = this.listeners.onJobAssigned.filter(listener => listener !== callback);
  }

  public addJobReassignedListener(callback: (notification: TechnicianReassignmentNotification) => void): void {
    this.listeners.onJobReassigned.push(callback);
  }

  public removeJobReassignedListener(callback: (notification: TechnicianReassignmentNotification) => void): void {
    this.listeners.onJobReassigned = this.listeners.onJobReassigned.filter(listener => listener !== callback);
  }

  public addInspectionAssignedListener(callback: (notification: InspectionAssignmentNotification) => void): void {
    this.listeners.onInspectionAssigned.push(callback);
  }

  public removeInspectionAssignedListener(callback: (notification: InspectionAssignmentNotification) => void): void {
    this.listeners.onInspectionAssigned = this.listeners.onInspectionAssigned.filter(listener => listener !== callback);
  }

  public addInspectionReassignedListener(callback: (notification: InspectionReassignmentNotification) => void): void {
    this.listeners.onInspectionReassigned.push(callback);
  }

  public removeInspectionReassignedListener(callback: (notification: InspectionReassignmentNotification) => void): void {
    this.listeners.onInspectionReassigned = this.listeners.onInspectionReassigned.filter(listener => listener !== callback);
  }
}

export const technicianAssignmentHubService = TechnicianAssignmentHubService.getInstance();