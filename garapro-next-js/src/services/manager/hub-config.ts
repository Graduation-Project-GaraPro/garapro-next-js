import { HttpTransportType, IHttpConnectionOptions } from "@microsoft/signalr";

/**
 * Get the base URL for SignalR hubs from environment variables
 */
export function getHubBaseUrl(): string {
  const hubBaseUrl = process.env.NEXT_PUBLIC_HUB_BASE_URL;
  
  if (!hubBaseUrl) {
    console.warn("⚠️ NEXT_PUBLIC_HUB_BASE_URL is not defined in environment variables");
    return "https://localhost:7113"; // Fallback to default
  }
  
  return hubBaseUrl;
}

/**
 * SignalR Hub endpoints
 */
export const HUB_ENDPOINTS = {
  INSPECTION: "/hubs/inspection",
  QUOTATION: "/hubs/quotation",
  REPAIR_ORDER: "/hubs/repairorder",
  TECHNICIAN_ASSIGNMENT: "/hubs/technicianassignment",
  JOB: "/hubs/job",
  REPAIR: "/hubs/repair",
  PAYMENT: "/hubs/payment",
} as const;

/**
 * Common SignalR connection options
 */
export const HUB_CONNECTION_OPTIONS: IHttpConnectionOptions = {
  transport: HttpTransportType.WebSockets | HttpTransportType.ServerSentEvents | HttpTransportType.LongPolling,
  skipNegotiation: false,
  accessTokenFactory: () => {
    // Get the auth token from localStorage
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("authToken");
      return token || "";
    }
    return "";
  },
  withCredentials: false,
};
