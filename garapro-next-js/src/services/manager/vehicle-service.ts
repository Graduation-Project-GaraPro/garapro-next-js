import { apiClient } from "./api-client";
import type { 
  VehicleWithCustomerDto, 
  CreateVehicleDto, 
  VehicleDto,
  VehicleBrand,
  VehicleModel,
  VehicleColor
} from "@/types/manager/vehicle";

class VehicleService {
  private baseUrl = "/VehicleIntegration";
  private vehiclesBaseUrl = "/Vehicles";
  private brandBaseUrl = "/VehicleBrand";
  private modelBaseUrl = "/VehicleModel";
  private colorBaseUrl = "/VehicleColor";


  async getVehiclesByCustomerId(userId: string): Promise<VehicleWithCustomerDto[]> {
    try {
      const response = await apiClient.get<VehicleWithCustomerDto[]>(`${this.baseUrl}/customer/${userId}/vehicles`);
      return response.data || [];
    } catch (error) {
      console.error(`Failed to fetch vehicles for customer ${userId}:`, error);
      // Return empty array on error to prevent app crash
      return [];
    }
  }

  /**
   * Get a specific vehicle by ID
   * @param vehicleId - The ID of the vehicle
   * @returns Vehicle details or null if not found
   */
  async getVehicleById(vehicleId: string): Promise<VehicleWithCustomerDto | null> {
    try {
      const response = await apiClient.get<VehicleWithCustomerDto>(`${this.baseUrl}/vehicle/${vehicleId}`);
      return response.data || null;
    } catch (error) {
      console.error(`Failed to fetch vehicle ${vehicleId}:`, error);
      // Throw error to let caller handle it appropriately
      throw error;
    }
  }

  /**
   * Create a new vehicle
   * @param vehicleData - The vehicle data to create
   * @returns The created vehicle
   */
  async createVehicle(vehicleData: CreateVehicleDto): Promise<VehicleDto> {
    try {
      const response = await apiClient.post<VehicleDto>(this.vehiclesBaseUrl, vehicleData);
      if (!response.data) {
        throw new Error('No data returned from create vehicle API');
      }
      return response.data;
    } catch (error) {
      console.error('Failed to create vehicle:', error);
      
      // Re-throw the error with more details
      if (error instanceof Error) {
        throw new Error(`Failed to create vehicle: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Get all vehicle brands
   * @returns List of all brands
   */
  async getAllBrands(): Promise<VehicleBrand[]> {
    try {
      const response = await apiClient.get<VehicleBrand[]>(this.brandBaseUrl);
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch brands:', error);
      return [];
    }
  }

  /**
   * Get models by brand ID
   * @param brandId - The brand ID
   * @returns List of models for the brand
   */
  async getModelsByBrand(brandId: string): Promise<VehicleModel[]> {
    try {
      const response = await apiClient.get<VehicleModel[]>(`${this.modelBaseUrl}/brand/${brandId}`);
      return response.data || [];
    } catch (error) {
      console.error(`Failed to fetch models for brand ${brandId}:`, error);
      return [];
    }
  }

  /**
   * Get colors by model ID
   * @param modelId - The model ID
   * @returns List of colors for the model
   */
  async getColorsByModel(modelId: string): Promise<VehicleColor[]> {
    try {
      const response = await apiClient.get<VehicleColor[]>(`${this.colorBaseUrl}/model/${modelId}`);
      return response.data || [];
    } catch (error) {
      console.error(`Failed to fetch colors for model ${modelId}:`, error);
      return [];
    }
  }

  /**
   * Get all colors (alternative if not filtering by model)
   * @returns List of all colors
   */
  async getAllColors(): Promise<VehicleColor[]> {
    try {
      const response = await apiClient.get<VehicleColor[]>(this.colorBaseUrl);
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch colors:', error);
      return [];
    }
  }
}

export const vehicleService = new VehicleService();