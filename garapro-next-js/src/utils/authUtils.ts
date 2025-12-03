import axios, { AxiosError } from "axios"; 

export interface ApiErrorResponse {
  message?: string;
  error?: string;
  statusCode?: number;
}

export const handleAuthError = (error: AxiosError<ApiErrorResponse>): never => {
  console.error("Authentication error:", error);
  
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

export const handleApiError = (error: unknown): never => {
  console.error("API Error:", error);
  
  if (axios.isAxiosError(error)) {
    return handleAuthError(error as AxiosError<ApiErrorResponse>);
  }
  
  const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
  throw new Error(errorMessage);
};