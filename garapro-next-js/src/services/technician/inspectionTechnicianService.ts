import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_BASE_URL+ "/odata/InspectionsTechnician" || 'https://localhost:7113/odata/InspectionsTechnician';

export interface PartWithQuantityDto {
  partId: string;
  quantity: number;
}

export interface ServiceUpdateDto {
  ServiceId: string;
  ConditionStatus: number;
  SelectedPartCategoryIds?: string[];
  SuggestedPartsByCategory?: { [key: string]: PartWithQuantityDto[] };
}

export interface UpdateInspectionRequest {
  Finding?: string;
  ServiceUpdates: ServiceUpdateDto[];
  IsCompleted: boolean;
}

export interface AddServiceToInspectionRequest {
  ServiceId: string;
}

export interface RepairImageDto {
  imageId: string;
  imageUrl: string;
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
    
    return response.data.technicianId || null;
  } catch (error) {
    console.error("Error fetching technician ID:", error);
    return null;
  }
};

export const getMyInspections = async () => {  
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (!token) {
      throw new Error("Missing authentication token");
    }

    const response = await axios.get(`${API_URL}/my-inspections`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.value || response.data;
  } catch (error) {
    console.error("Error fetching inspections:", error);
    throw error;
  }
};

export const getInspectionById = async (id: string) => {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (!token) {
      throw new Error("Missing authentication token");
    }

    const response = await axios.get(`${API_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching inspection detail:", error);
    throw error;
  }
};

export const startInspection = async (id: string) => {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (!token) {
      throw new Error("Missing authentication token");
    }

    const response = await axios.post(
      `${API_URL}/${id}/start`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error starting inspection:", error);
    throw error;
  }
};

export const updateInspection = async (id: string, data: UpdateInspectionRequest) => {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (!token) {
      throw new Error("Missing authentication token");
    }

    const response = await axios.put(
      `${API_URL}/${id}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("inspection data", data);
    return response.data;
  } catch (error) {
    console.error("Error updating inspection:", error);
    throw error;
  }
};

export const removePartFromInspection = async (
  inspectionId: string,
  serviceId: string,
  partInspectionId: string
) => {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (!token) {
      throw new Error("Missing authentication token");
    }

    const response = await axios.delete(
      `${API_URL}/${inspectionId}/services/${serviceId}/part-inspections/${partInspectionId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error removing part:", error);
    throw error;
  }
};

export const getAllServices = async () => {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (!token) {
      throw new Error("Missing authentication token");
    }

    const response = await axios.get(`${API_URL}/services`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching services:", error);
    throw error;
  }
};

export const addServiceToInspection = async (inspectionId: string, serviceId: string) => {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (!token) {
      throw new Error("Missing authentication token");
    }

    const response = await axios.post(
      `${API_URL}/${inspectionId}/services`,
      { ServiceId: serviceId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding service:", error);
    throw error;
  }
};

export const removeServiceFromInspection = async (
  inspectionId: string,
  serviceInspectionId: string
) => {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (!token) {
      throw new Error("Missing authentication token");
    }

    const response = await axios.delete(
      `${API_URL}/${inspectionId}/services/${serviceInspectionId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error removing service:", error);
    throw error;
  }
};

export const removePartCategoryFromService = async (
  inspectionId: string,
  serviceInspectionId: string,
  partCategoryId: string
) => {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (!token) {
      throw new Error("Missing authentication token");
    }

    const response = await axios.delete(
      `${API_URL}/${inspectionId}/services/${serviceInspectionId}/part-categories/${partCategoryId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error removing part category:", error);
    throw error;
  }
};