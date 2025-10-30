import axios from "axios";

const API_URL = "https://localhost:7113/odata/InspectionsTechnician";

export interface ServiceUpdate {
  ServiceId: string;
  ConditionStatus: number;
  SuggestedPartIds?: string[];
}

export interface UpdateInspectionRequest {
  Finding?: string;
  ServiceUpdates: ServiceUpdate[];
  IsCompleted: boolean;
}
// Lấy danh sách inspections
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
// Lấy chi tiết 1 inspection
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
//Bắt đầu kiếm tra (New → InProgress)
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
// Tiến hành kiểm tra xe (Save findings + parts)
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
    return response.data;
  } catch (error) {
    console.error("Error updating inspection:", error);
    throw error;
  }
};

// Xóa phụ tùng khỏi inspection
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