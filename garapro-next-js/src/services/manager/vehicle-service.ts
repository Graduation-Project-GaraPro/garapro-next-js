import { apiClient } from "./api-client";
import type { VehicleWithCustomerDto, CreateVehicleDto, VehicleDto } from "@/types/manager/vehicle";

class VehicleService {
  private baseUrl = "/api/VehicleIntegration";
  private vehiclesBaseUrl = "/api/Vehicles";

  /**
   * Get all vehicles for a specific customer
   * @param userId - The ID of the customer
   * @returns Array of vehicles associated with the customer
   */
  async getVehiclesByCustomerId(userId: string): Promise<VehicleWithCustomerDto[]> {
    try {
      const response = await apiClient.get<VehicleWithCustomerDto[]>(`${this.baseUrl}/customer/${userId}/vehicles`);
      return response.data;
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
      return response.data;
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
}

export const vehicleService = new VehicleService();