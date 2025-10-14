// Update the ApiResponse interface to match your backend
interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
  success: boolean;
}

// Keep ApiError as is
interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: unknown;
}

class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  private retryAttempts: number;
  private retryDelay: number;
  private requestInterceptors: Array<(config: RequestInit) => RequestInit> = [];
  private responseInterceptors: Array<(response: Response) => Response> = [];

  constructor(
    baseUrl: string = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7113",
    retryAttempts: number = 3,
    retryDelay: number = 1000
  ) {
    this.baseUrl = baseUrl;
    this.retryAttempts = retryAttempts;
    this.retryDelay = retryDelay;
    this.defaultHeaders = {
      "Content-Type": "application/json",
    };
  }

  // Add request interceptor
  addRequestInterceptor(interceptor: (config: RequestInit) => RequestInit) {
    this.requestInterceptors.push(interceptor);
  }

  // Add response interceptor
  addResponseInterceptor(interceptor: (response: Response) => Response) {
    this.responseInterceptors.push(interceptor);
  }

  // Set authentication token - updated to match your backend
  setAuthToken(token: string) {
    this.defaultHeaders.Authorization = `Bearer ${token}`;
  }

  // Clear authentication token
  clearAuthToken() {
    delete this.defaultHeaders.Authorization;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}, 
    attempt: number = 1
  ): Promise<ApiResponse<T>> {
    // Ensure endpoint starts with "/"
    const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const url = `${this.baseUrl}${normalizedEndpoint}`;

    // Apply request interceptors
    let config: RequestInit = {
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
      ...options,
    };

    this.requestInterceptors.forEach(interceptor => {
      config = interceptor(config);
    });

    try {
      const response = await fetch(url, config);

      // Apply response interceptors
      let processedResponse = response;
      this.responseInterceptors.forEach(interceptor => {
        processedResponse = interceptor(processedResponse);
      });

      if (!processedResponse.ok) {
        const errorData = await this.parseErrorResponse(processedResponse);
        throw new Error(errorData.message || `HTTP error! status: ${processedResponse.status}`);
      }

      const data = await processedResponse.json();
      
      // Wrap response to match expected format
      return {
        data: data as T,
        status: processedResponse.status,
        success: true
      };
    } catch (error) {
      // Retry logic for network errors or 5xx responses
      if (attempt < this.retryAttempts && this.shouldRetry(error)) {
        await this.delay(this.retryDelay * attempt);
        return this.request<T>(endpoint, options, attempt + 1);
      }

      throw this.formatError(error);
    }
  }

  private shouldRetry(error: unknown): boolean {
    // Retry on network errors or 5xx server errors
    if (error instanceof Error && error.name === 'TypeError' && error.message.includes('fetch')) {
      return true;
    }
    // Check if error has status property and is a 5xx error
    if (error && typeof error === 'object' && 'status' in error && 
        typeof error.status === 'number' && error.status >= 500 && error.status < 600) {
      return true;
    }
    return false;
  }

  private async parseErrorResponse(response: Response): Promise<ApiError> {
    try {
      const errorData = await response.json();
      return {
        message: errorData.message || 'An error occurred',
        status: response.status,
        code: errorData.code,
        details: errorData.details
      };
    } catch {
      return {
        message: `HTTP ${response.status}: ${response.statusText}`,
        status: response.status
      };
    }
  }

  private formatError(error: unknown): ApiError {
    // Handle error objects with status properties
    if (error && typeof error === 'object' && 'status' in error) {
      const err = error as ApiError;
      return {
        message: err.message || 'API request failed',
        status: err.status,
        code: err.code,
        details: err.details
      };
    }

    // Handle generic Error objects
    if (error instanceof Error) {
      return {
        message: error.message || 'Network error occurred',
        status: 0,
        code: 'NETWORK_ERROR'
      };
    }

    // Handle other types of errors
    return {
      message: String(error) || 'Network error occurred',
      status: 0,
      code: 'NETWORK_ERROR'
    };
  }

  async get<T>(endpoint: string, params?: Record<string, unknown>): Promise<ApiResponse<T>> {
    let url = endpoint;
    if (params) {
      // Convert all values to string for URLSearchParams
      const stringParams: Record<string, string> = {};
      for (const key in params) {
        if (Object.prototype.hasOwnProperty.call(params, key)) {
          const value = params[key];
          stringParams[key] = value !== undefined && value !== null ? String(value) : "";
        }
      }
      url = `${endpoint}?${new URLSearchParams(stringParams)}`;
    }
    return this.request<T>(url, { method: "GET" });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }

  // Upload file with progress tracking
  async uploadFile<T>(
    endpoint: string, 
    file: File, 
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    return this.request<T>(endpoint, {
      method: "POST",
      body: formData,
      headers: {
        // Remove Content-Type to let browser set it with correct boundary
      },
    });
  }

  // Download file
  async downloadFile(endpoint: string, filename?: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'download';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("File download failed:", error);
      throw error;
    }
  }
}

export const apiClient = new ApiClient();

// Update interceptors to match your backend
apiClient.addResponseInterceptor((response) => {
  // Handle authentication response from your backend
  const authHeader = response.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    if (token) {
      apiClient.setAuthToken(token);
    }
  }
  return response;
});