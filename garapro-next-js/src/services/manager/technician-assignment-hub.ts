import { HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";

// Define the structure for assignment notifications
export interface TechnicianAssignmentNotification {
  technicianId: string;
  technicianName: string;
  jobCount: number;
  jobNames: string[];
}

export interface TechnicianReassignmentNotification {
  jobId: string;
  oldTechnicianId: string;
  newTechnicianId: string;
  jobName: string;
}

export interface InspectionAssignmentNotification {
  technicianId: string;
  technicianName: string;
  inspectionCount: number;
  inspectionNames: string[];
}

export interface InspectionReassignmentNotification {
  inspectionId: string;
  oldTechnicianId: string;
  newTechnicianId: string;
  inspectionName: string;
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
      // Get the base URL from environment variables
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7113";
      
      // Get the authentication token from localStorage
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      
      // Configure the connection with authentication
      this.connection = new HubConnectionBuilder()
        .withUrl(`${baseUrl}/api/technicianassignmenthub`, {
          accessTokenFactory: () => token || ""
        })
        .configureLogging(LogLevel.Information)
        .build();

      await this.connection.start();
      console.log("Technician Assignment SignalR Connected.");

      // Register event listeners
      this.registerEventListeners();
      
      return true;
    } catch (err) {
      console.error("Technician Assignment SignalR connection failed:", err);
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

    // Handle connection closure
    this.connection.onclose(async () => {
      console.log("Technician Assignment SignalR Disconnected. Reconnecting...");
      await this.reconnect();
    });
  }

  // Reconnect logic
  private async reconnect(): Promise<void> {
    let retryCount = 0;
    const maxRetries = 5;
    const retryInterval = 5000; // 5 seconds

    while (retryCount < maxRetries && this.connection) {
      try {
        await new Promise(resolve => setTimeout(resolve, retryInterval));
        await this.connection.start();
        console.log("Technician Assignment SignalR Reconnected");
        this.registerEventListeners(); // Re-register event listeners after reconnect
        return;
      } catch (error) {
        console.error(`Reconnection attempt ${retryCount + 1} failed:`, error);
        retryCount++;
      }
    }

    console.error("Failed to reconnect to Technician Assignment SignalR after maximum retries");
  }

  public async stopConnection(): Promise<void> {
    if (this.connection) {
      try {
        await this.connection.stop();
        console.log("Technician Assignment SignalR Disconnected.");
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