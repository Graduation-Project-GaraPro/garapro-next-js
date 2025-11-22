import axios from "axios";

const API_URL = "https://localhost:7113/odata/Specification";

// API Response Types
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

// Get all vehicle specifications
export const getAllSpecifications = async (): Promise<VehicleSpecificationDto[]> => {
  try {
    const response = await fetch('YOUR_API_URL', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Thêm token nếu cần
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data || !Array.isArray(data)) {
      console.warn('API response is not an array:', data);
      return [];
    }
    return data;
  } catch (error) {
    console.error('Error fetching specifications:', error);
    return []; // Trả về array rỗng thay vì throw error
  }
};

// Search vehicle specifications by keyword
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
      throw new Error(error.response?.data?.message || "Unable to search vehicle specifications");
    }
    throw error;
  }
};