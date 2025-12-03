import axios from "axios";
import { handleApiError } from "@/utils/authUtils";
const API_URL = process.env.NEXT_PUBLIC_BASE_URL+ "/odata/Specification" || 'https://localhost:7113/odata/Specification';

export interface SpecificationField {
  label: string;
  value: string;
  displayOrder: number;
}

export interface SpecificationCategory {
  category: string;
  displayOrder: number;
  fields: SpecificationField[];
}

export interface VehicleSpecificationDto {
  lookupID: string;
  automaker: string;
  nameCar: string;
  categories: SpecificationCategory[];
}

export const getAllSpecifications = async (): Promise<VehicleSpecificationDto[]> => {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (!token) {
      throw new Error("Missing authentication token");
    }
    const response = await axios.get(`${API_URL}/all`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = response.data;
    if (!Array.isArray(data)) {
      console.warn('API response is not an array:', data);
      return [];
    }
    
    return data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const searchSpecifications = async (keyword: string): Promise<VehicleSpecificationDto[]> => {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (!token) {
      throw new Error("Missing authentication token");
    }

    const response = await axios.get(`${API_URL}/search`, {
      params: { keyword },
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    
    return response.data;
  } catch (error) {
    console.error("Error searching specifications:", error);
    if (axios.isAxiosError(error)) {
      return handleApiError(error);
    }
    return handleApiError(error);
  }
};