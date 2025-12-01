import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_BASE_URL +"/odata/Repairs" || 'https://localhost:7113/odata/Repairs';

export interface RepairCreateDto {
  jobId: string; 
  description?: string;
  notes?: string;
  estimatedTime: string; 
}

export interface RepairUpdateDto {
  description?: string;
  notes?: string;
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
  actualTimeShort?: string; 
  estimatedTimeShort?: string; 
}

export interface JobPartDto {
  partId: string;
  partName: string;
  unitPrice: number;
}

export interface PartCategoryRepairDto {
  partCategoryId: string;
  categoryName: string;
  parts: JobPartDto[];
}

export interface TechnicianDto {
  technicianId: string;
  fullName: string; 
  email: string;
  phoneNumber: string;
}

export interface RepairDto {
  repairId: string;
  description: string;
  notes: string;
  startTime?: string;
  endTime?: string;
  actualTimeShort?: string; 
  estimatedTimeShort?: string; 
}

export interface JobDetailDto {
  jobId: string;
  jobName: string;
  serviceName: string;
  status: string;
  note: string;
  parts: PartCategoryRepairDto[];
  repairs: RepairDto | null;
  technicians: TechnicianDto[];
}

export interface VehicleBrandDto {
  brandId: string;
  brandName: string;
  country: string;
}

export interface VehicleModelDto {
  modelId: string;
  modelName: string;
  manufacturingYear: number;
}

export interface VehicleColorDto {
  colorId: string;
  colorName: string;
  hexCode?: string;
}

export interface VehicleDto {
  vehicleId: string;
  licensePlate: string;
  vin: string;
  brand: VehicleBrandDto;
  model: VehicleModelDto;
  color?: VehicleColorDto;
}

export interface RepairDetailDto {
  repairOrderId: string;
  vin: string;
  vehicleLicensePlate: string;
  vehicle: VehicleDto;  
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
    console.log("URL: ",API_URL);
    const response = await axios.get(`${API_URL}/${repairOrderId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.message;
      throw new Error(message);
    }
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
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.message;
      throw new Error(message);
    }
    throw error;
  }
};

// Update repair
export const updateRepair = async (repairId: string, data: RepairUpdateDto): Promise<{ message: string }> => {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (!token) {
      throw new Error("Missing authentication token");
    }

    const response = await axios.put(`${API_URL}/${repairId}/Update`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data; 
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.message;
      throw new Error(message);
    }
    throw error;
  }
};