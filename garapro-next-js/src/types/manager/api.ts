// API Response interface to match backend
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  status: number;
  success: boolean;
  repairOrderId?: string;
  oldStatusId?: string | null;
  newStatusId?: string | null;
  updatedAt?: string;
  updatedCard?: unknown | null;
  warnings?: unknown[];
  errors?: unknown[];
}

// API Error interface
export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: unknown;
}
