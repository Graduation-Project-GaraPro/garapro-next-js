
import axios from "axios";
import { handleApiError } from "@/utils/authUtils";
const API_URL = process.env.NEXT_PUBLIC_BASE_URL+ "/odata/Statisticals" || 'https://localhost:7113/odata/Statisticals';

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
   return handleApiError(error);
  }
};