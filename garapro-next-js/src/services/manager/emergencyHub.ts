/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/emergencyHub.ts
import {
  HubConnection,
  HubConnectionBuilder,
  LogLevel,
} from "@microsoft/signalr";

const HUB_URL = `${process.env.NEXT_PUBLIC_HUB_BASE_URL}api/emergencyrequesthub`;

export interface EmergencyNotification {
  EmergencyRequestId: string;
  Status: string;
  CustomerId?: string | null;
  BranchId?: string | null;
  VehicleId?: string | null;
  IssueDescription?: string | null;
  Latitude?: number | null;
  Longitude?: number | null;
  DistanceToGarageKm?: number | null;
  EstimatedArrivalMinutes?: number | null;
  RequestTime?: string | Date | null;
  ResponseDeadline?: string | Date | null;
  Address?: string | null;
  CustomerName?: string;
  CustomerPhone?: string;
  BranchName?: string;
  Message?: string;
  Timestamp?: string | Date;
  // any other fields server may send
  [key: string]: any;
}

type Handler = (...args: any[]) => void;

class EmergencyHubClient {
  private connection: HubConnection | null = null;
  private handlers: Map<string, Set<Handler>> = new Map();
  private isStarting = false;

  buildConnection(accessToken?: string) {
    if (this.connection) return this.connection;

    this.connection = new HubConnectionBuilder()
      .withUrl(HUB_URL, {
        accessTokenFactory: () => accessToken ?? "",
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    // Forward a fixed set of server events to internal handlers
    const forwardEvents = [
      "Connected",
      "JoinedCustomerGroup",
      "JoinedBranchGroup",
      "LeftCustomerGroup",
      "LeftBranchGroup",
      "EmergencyRequestCreated", // <-- added
    ];

    for (const ev of forwardEvents) {
      this.connection.on(ev, (...args: any[]) => {
        const s = this.handlers.get(ev);
        if (s) for (const h of s) h(...args);
      });
    }

    // Also forward any event user registers later via on() - but keep server.on as above
    return this.connection;
  }

  async start(accessToken?: string) {
    if (!this.connection) this.buildConnection(accessToken);
    if (!this.connection) throw new Error("Failed to build hub connection");

    if (this.isStarting) return;
    this.isStarting = true;

    try {
      if (this.connection.state === "Disconnected") {
        await this.connection.start();
      }
    } finally {
      this.isStarting = false;
    }
  }

  async stop() {
    if (!this.connection) return;
    try {
      if (
        this.connection.state === "Connected" ||
        this.connection.state === "Connecting"
      ) {
        await this.connection.stop();
      }
    } catch (err) {
      console.warn("Error stopping connection", err);
    }
  }

  on(eventName: string, handler: Handler) {
    const set = this.handlers.get(eventName) ?? new Set<Handler>();
    set.add(handler);
    this.handlers.set(eventName, set);
  }

  off(eventName: string, handler?: Handler) {
    if (!this.handlers.has(eventName)) return;
    if (!handler) {
      this.handlers.delete(eventName);
      this.connection?.off(eventName);
      return;
    }
    const set = this.handlers.get(eventName)!;
    set.delete(handler);
    if (set.size === 0) this.handlers.delete(eventName);
  }

  async joinCustomerGroup(customerId: string) {
    if (!this.connection) throw new Error("Connection not initialized");
    return this.connection.invoke("JoinCustomerGroup", customerId);
  }
  async leaveCustomerGroup(customerId: string) {
    if (!this.connection) throw new Error("Connection not initialized");
    return this.connection.invoke("LeaveCustomerGroup", customerId);
  }
  async joinBranchGroup(branchId: string) {
    if (!this.connection) throw new Error("Connection not initialized");
    return this.connection.invoke("JoinBranchGroup", branchId);
  }
  async leaveBranchGroup(branchId: string) {
    if (!this.connection) throw new Error("Connection not initialized");
    return this.connection.invoke("LeaveBranchGroup", branchId);
  }

  async getJoinedGroups(): Promise<string[]> {
    if (!this.connection) throw new Error("Connection not initialized");
    const r = await this.connection.invoke<string[]>("GetJoinedGroups");
    return r ?? [];
  }

  async invoke(methodName: string, ...args: any[]) {
    if (!this.connection) throw new Error("Connection not initialized");
    return this.connection.invoke(methodName, ...args);
  }

  connectionState() {
    return this.connection?.state ?? "Disconnected";
  }
}

export const emergencyHubClient = new EmergencyHubClient();
export type { Handler };
