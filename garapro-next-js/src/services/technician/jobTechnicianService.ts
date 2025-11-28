import axios from "axios";

const API_URL = "https://localhost:7113/odata/JobTechnician";
import { authService } from "@/services/authService";
export interface JobStatusUpdate {
  JobId: string;
  JobStatus: number; 
}

export const getTechnicianId = async (): Promise<string | null> => {
  try {
    const token = typeof window !== "undefined" ? authService.getToken() : null;
    if (!token) {
      throw new Error("Missing authentication token");
    }

    const response = await axios.get(`${API_URL}/my-jobs`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = response.data.value || response.data;
    
    console.log("API Response for TechnicianId:", data);
    
    if (data && data.length > 0 && data[0].technicians && data[0].technicians.length > 0) {
      const technicianId = data[0].technicians[0].technicianId;
      console.log("TechnicianId found:", technicianId);
      return technicianId;
    }

    console.warn("TechnicianId not found in response");
    return null;
  } catch (error) {
    console.error("Error fetching technician ID:", error);
    return null;
  }
};
// Lấy danh sách công việc của technician
export const getMyJobs = async () => {
  try {
    const token = typeof window !== "undefined" ? authService.getToken() : null;
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

    throw error;
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
    throw error;
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
    throw error;
  }
};