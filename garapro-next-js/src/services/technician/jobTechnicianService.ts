import axios from "axios";
import { handleApiError } from "@/utils/authUtils";
const API_URL = process.env.NEXT_PUBLIC_BASE_URL+ "/odata/JobTechnician" || 'https://localhost:7113/odata/JobTechnician';

export interface JobStatusUpdate {
  JobId: string;
  JobStatus: number; 
}

export const getTechnicianId = async (): Promise<string | null> => {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (!token) {
      throw new Error("Missing authentication token");
    }

    const response = await axios.get(`${API_URL}/my-technician-id`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    console.log("Technician ID response:", response.data);
    return response.data.technicianId || null;
  } catch (error) {
    console.error("Error fetching technician ID:", error);
    
    const savedTechId = typeof window !== "undefined" ? localStorage.getItem("technicianId") : null;
    return savedTechId;
  }
};
export const getMyJobs = async () => {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (!token) {
      throw new Error("Missing authentication token");
    }

    const response = await axios.get(`${API_URL}/my-jobs`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.value || response.data;
  } catch (error) {
    console.error("Error fetching jobs:", error);

   return handleApiError(error);
  }
};

// Lấy chi tiết 1 công việc
export const getJobById = async (id: string) => {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (!token) {
      throw new Error("Missing authentication token");
    }

    const response = await axios.get(`${API_URL}/my-jobs/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching job detail:", error);
    return handleApiError(error);
  }
};

// Cập nhật trạng thái công việc
export const updateJobStatus = async (data: JobStatusUpdate) => {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (!token) {
      throw new Error("Missing authentication token");
    }

    const response = await axios.put(
      `${API_URL}/update-status`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating job status:", error);
    return handleApiError(error);
  }
};