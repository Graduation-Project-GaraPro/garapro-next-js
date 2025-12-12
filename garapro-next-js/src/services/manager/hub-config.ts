import { HttpTransportType, IHttpConnectionOptions } from "@microsoft/signalr";

/**
 * Get the base URL for SignalR hubs from environment variables
 */
export function getHubBaseUrl(): string {
  // Try multiple sources for the hub base URL
  const hubBaseUrl = process.env.NEXT_PUBLIC_HUB_BASE_URL || 
                     (typeof window !== "undefined" && (window as any).NEXT_PUBLIC_HUB_BASE_URL) ||
                     "https://localhost:7113";
  
  // Debug logging (can be removed in production)
  if (process.env.NODE_ENV === 'development') {
    console.log("🔍 Hub base URL from env:", process.env.NEXT_PUBLIC_HUB_BASE_URL);
    console.log("🔍 Using hub base URL:", hubBaseUrl);
  }
  
  if (!hubBaseUrl || hubBaseUrl.trim() === "") {
    console.warn("⚠️ NEXT_PUBLIC_HUB_BASE_URL is not defined, using fallback");
    return "https://localhost:7113"; // Fallback to default
  }
  
  // Ensure the URL doesn't end with a slash
  const cleanUrl = hubBaseUrl.replace(/\/$/, "");
  
  // Validate that it's a proper URL
  try {
    new URL(cleanUrl);
    return cleanUrl;
  } catch (error) {
    console.error("❌ Invalid hub base URL:", cleanUrl);
    return "https://localhost:7113"; // Fallback to default
  }
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
