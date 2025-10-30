// /services/technician/repairService.ts
import axios from "axios";

const API_URL = "https://localhost:7113/odata/Repairs";

// Interfaces
export interface RepairCreateDto {
  JobId: string;
  Description: string;
  Notes: string;
  EstimatedTime: string; // Format: "HH:mm:ss" e.g., "02:30:00"
}

export interface RepairUpdateDto {
  Description: string;
  Notes: string;
}

export interface RepairResponseDto {
  repairId: string;
  repairOrderId: string;
  jobId: string;
  jobName: string;
  serviceName: string;
  description: string;
  notes: string;
  startTime?: string;
  endTime?: string;
  actualTime?: string;
  estimatedTime?: string;
}

export interface JobPartDto {
  partName: string;
  unitPrice: number;
}

export interface TechnicianDto {
  technicianId: string;
  technicianName: string;
  email: string;
  phoneNumber: string;
}

export interface RepairDto {
  repairId: string;
  description: string;
  notes: string;
  startTime?: string;
  endTime?: string;
  actualTime?: string;
  estimatedTime?: string;
}

export interface JobDetailDto {
  jobId: string;
  jobName: string;
  serviceName: string;
  status: string;
  note: string;
  parts: JobPartDto[];
  repairs: RepairDto | null;
  technicians: TechnicianDto[];
}

export interface RepairDetailDto {
  repairOrderId: string;
  vin: string;
  vehicleBrand: string;        
  vehicleModel: string;       
  vehicleLicensePlate: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  note: string;
  jobs: JobDetailDto[];
}

// Get repair order details
export const getRepairOrderDetails = async (repairOrderId: string): Promise<RepairDetailDto> => {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (!token) {
      throw new Error("Missing authentication token");
    }

    const response = await axios.get(`${API_URL}/${repairOrderId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching repair order details:", error);
    throw error;
  }
};

// Create repair
export const createRepair = async (data: RepairCreateDto): Promise<RepairResponseDto> => {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (!token) {
      throw new Error("Missing authentication token");
    }

    const response = await axios.post(`${API_URL}/Create`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating repair:", error);
    throw error;
  }
};

// Update repair
export const updateRepair = async (repairId: string, data: RepairUpdateDto): Promise<void> => {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (!token) {
      throw new Error("Missing authentication token");
    }

    await axios.put(`${API_URL}/${repairId}/Update`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error updating repair:", error);
    throw error;
  }
};