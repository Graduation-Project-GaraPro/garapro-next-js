// /services/technician/statisticalService.ts
import axios from "axios";

const API_URL = "https://localhost:7113/odata/Statisticals";

// Interface for Technician Statistics
export interface TechnicianStatistic {
  quality: number;
  speed: number;
  efficiency: number;
  score: number;
  newJobs: number;
  inProgressJobs: number;
  completedJobs: number;
  onHoldJobs: number;
  recentJobs: RecentJob[];
}

export interface RecentJob {
  jobName: string;
  licensePlate: string;
  status: string;
  assignedAt: string;
}

// Lấy thống kê của technician hiện tại
export const getMyStatistics = async (): Promise<TechnicianStatistic> => {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (!token) {
      throw new Error("Missing authentication token");
    }

    const response = await axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    
    return response.data;
  } catch (error) {
    console.error("Error fetching statistics:", error);
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Không thể tải thống kê");
    }
    throw error;
  }
};