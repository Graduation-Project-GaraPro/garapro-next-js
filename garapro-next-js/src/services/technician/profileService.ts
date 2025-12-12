import axios, { AxiosError } from "axios";

const API_URL = process.env.NEXT_PUBLIC_BASE_URL + "/api/users" || 'https://localhost:7113/api/users';

export interface UserDto {
  gender?: boolean;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  dateOfBirth?: string;
  email?: string;
  phoneNumber?: string;
}

export interface UpdateUserDto {
  gender?: boolean;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  dateOfBirth?: string;
}

export interface UpdateDeviceIdRequest {
  deviceId: string;
}

interface ApiErrorResponse {
  message?: string;
  error?: string;
  statusCode?: number;
}

interface PermissionsResponse {
  permissions: string[];
  fetchedAt: string;
}

const getAuthToken = (): string | null => {
  return typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
};

const isOver18 = (dateOfBirth: string): boolean => {
  try {
    const [year, month, day] = dateOfBirth.split('-').map(Number);
    const birthDate = new Date(year, month - 1, day);
    const today = new Date();
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age >= 18;
  } catch {
    return false;
  }
};

const getMaxBirthDate = (): string => {
  const today = new Date();
  const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
  return maxDate.toISOString().split('T')[0];
};

const formatDateForInput = (dateString?: string): string => {
  if (!dateString) return '';
  
  try {
    const dateOnly = dateString.split('T')[0];
    return dateOnly;
  } catch {
    return '';
  }
};

const formatDateForDisplay = (dateString?: string): string => {
  if (!dateString) return 'Not set';
  
  try {
    const [year, month, day] = dateString.split('T')[0].split('-').map(Number);
    const date = new Date(year, month - 1, day);
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return 'Invalid date';
  }
};

const validateFormData = (formData: UpdateUserDto): string[] => {
  const errors: string[] = [];
  
  if (!formData.firstName?.trim()) {
    errors.push('First name is required');
  }
  
  if (!formData.lastName?.trim()) {
    errors.push('Last name is required');
  }
  
  if (formData.dateOfBirth) {
    const today = new Date();
    const [year, month, day] = formData.dateOfBirth.split('-').map(Number);
    const birthDate = new Date(year, month - 1, day);
    
    if (isNaN(birthDate.getTime())) {
      errors.push('Invalid date of birth');
    } 
    else if (birthDate > today) {
      errors.push('Date of birth cannot be in the future');
    }
    else if (!isOver18(formData.dateOfBirth)) {
      errors.push('You must be at least 18 years old');
    }
  }
  
  return errors;
};

const handleAuthError = (error: AxiosError<ApiErrorResponse>): never => {
  console.error("Error details:", error);
  
  if (error.response?.status === 401) {
    localStorage.removeItem("authToken");
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }
  
  const errorMessage = error.response?.data?.message || 
                       error.response?.data?.error || 
                       error.message;
  
  throw new Error(errorMessage);
};

export const getCurrentUser = async (): Promise<UserDto> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error("Missing authentication token");
    }

    const response = await axios.get<UserDto>(`${API_URL}/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    console.log("Current user response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching current user:", error);
    
    if (axios.isAxiosError(error)) {
      return handleAuthError(error as AxiosError<ApiErrorResponse>);
    }
    
    throw new Error("Failed to load profile data");
  }
};

export const updateCurrentUser = async (data: UpdateUserDto): Promise<UserDto> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error("Missing authentication token");
    }

    const response = await axios.put<UserDto>(`${API_URL}/me`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    
    console.log("Update user response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating user:", error);
    
    if (axios.isAxiosError(error)) {
      return handleAuthError(error as AxiosError<ApiErrorResponse>);
    }
    
    throw new Error("Failed to update profile");
  }
};

export const updateDeviceId = async (deviceId: string): Promise<void> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error("Missing authentication token");
    }

    const requestData: UpdateDeviceIdRequest = { deviceId };
    
    await axios.put(`${API_URL}/device`, requestData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    
    console.log("DeviceId updated successfully");
  } catch (error) {
    console.error("Error updating deviceId:", error);
    
    if (axios.isAxiosError(error)) {
      handleAuthError(error as AxiosError<ApiErrorResponse>);
    }
    
    throw new Error("Failed to update device ID");
  }
};

export const getMyPermissions = async (): Promise<PermissionsResponse> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error("Missing authentication token");
    }

    const response = await axios.get<PermissionsResponse>(`${API_URL}/permissions`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    return response.data;
  } catch (error) {
    console.error("Error fetching permissions:", error);
    
    if (axios.isAxiosError(error)) {
      return handleAuthError(error as AxiosError<ApiErrorResponse>);
    }
    
    throw new Error("Failed to fetch permissions");
  }
};

export const profileUtils = {
  isOver18,
  getMaxBirthDate,
  formatDateForInput,
  formatDateForDisplay,
  validateFormData,
};

export const profileService = {
  getCurrentUser,
  updateCurrentUser,
  updateDeviceId,
  getMyPermissions,
  ...profileUtils,
};