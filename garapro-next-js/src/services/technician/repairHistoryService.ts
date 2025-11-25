import axios from "axios";

const API_URL = "https://localhost:7113/odata/RepairHistories";

export interface RepairHistoryDto {
  vehicle: VehicleDto;
  owner: CustomerDto;
  repairCount: number;
  totalVehicleAmount: number;
  customerIssue: string;
  completedJobs: JobHistoryDto[];
}

export interface VehicleDto {
  vehicleId: string;
  licensePlate: string;
  vin: string;
  brand: VehicleBrandDto | null;
  model: VehicleModelDto | null;
}

export interface VehicleBrandDto {
  brandId: string;
  brandName: string;
}

export interface VehicleModelDto {
  modelId: string;
  modelName: string;
  manufacturingYear: number;
}

export interface CustomerDto {
  customerId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
}

export interface JobHistoryDto {
  jobName: string;
  note: string;
  repairDescription: string;
  totalAmount: number;
  deadline: string | null;
  level: number;
  jobParts: JobPartDto[];
  services: ServiceDto[];
}

export interface JobPartDto {
  partName: string;
  quantity: number;
  unitPrice: number;
}

export interface ServiceDto {
  serviceName: string;
  servicePrice: number;
  actualDuration: number;
  notes: string;
}

// Lấy lịch sử sửa chữa của technician hiện tại
export const getMyRepairHistory = async (): Promise<RepairHistoryDto[]> => {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (!token) {
      throw new Error("Missing authentication token");
    }

    const response = await axios.get(`${API_URL}/my-historys`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    
    return response.data;
  } catch (error) {
    console.error("Error fetching repair history:", error);
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Unable to load repair history");
    }
    throw error;
  }
};