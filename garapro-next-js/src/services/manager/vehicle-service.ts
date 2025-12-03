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
  private brandBaseUrl = "/VehicleBrands";
  private modelBaseUrl = "/VehicleModels";
  private colorBaseUrl = "/VehicleColors";


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
      console.log('=== CREATE VEHICLE REQUEST ===');
      
      // Use the manager endpoint for creating vehicles for customers
      const endpoint = `${this.vehiclesBaseUrl}/customer`;
      console.log('Endpoint:', endpoint);
      
      // Transform the request to match the manager endpoint structure
      const requestData = {
        customerUserId: vehicleData.userID,
        brandID: vehicleData.brandID,
        modelID: vehicleData.modelID,
        colorID: vehicleData.colorID,
        licensePlate: vehicleData.licensePlate,
        vin: vehicleData.vin,
        year: vehicleData.year,
        odometer: vehicleData.odometer
      };
      
      console.log('Request Data:', JSON.stringify(requestData, null, 2));
      
      const response = await apiClient.post<VehicleDto>(endpoint, requestData);
      
      console.log('=== CREATE VEHICLE RESPONSE ===');
      console.log('Response Data:', response.data);
      
      if (!response.data) {
        throw new Error('No data returned from create vehicle API');
      }
      
      return response.data;
    } catch (error) {
      console.error('=== CREATE VEHICLE ERROR ===');
      console.error('Error:', error);
      
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


  async getModelsByBrand(brandId: string): Promise<VehicleModel[]> {
    try {
      const response = await apiClient.get<VehicleModel[]>(`${this.modelBaseUrl}/bybrand/${brandId}`);
      return response.data || [];
    } catch (error) {
      console.error(`Failed to fetch models for brand ${brandId}:`, error);
      return [];
    }
  }


  async getColorsByModel(modelId: string): Promise<VehicleColor[]> {
    try {
      console.log(`Fetching colors for model: ${modelId}`);
      const response = await apiClient.get<VehicleColor[]>(`${this.colorBaseUrl}/bymodel/${modelId}`);
      console.log(`Colors response:`, response.data);
      return response.data || [];
    } catch (error) {
      console.error(`Failed to fetch colors for model ${modelId}:`, error);
      return [];
    }
  }


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