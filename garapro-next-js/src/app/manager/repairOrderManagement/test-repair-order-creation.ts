import { repairOrderService } from "@/services/manager/repair-order-service";
import type { CreateRepairOrderRequest } from "@/types/manager/repair-order";

/**
 * Test function to verify repair order creation works correctly
 * This simulates the minimal request that should work based on the working curl example
 */
export async function testRepairOrderCreation() {
  // This is the minimal request format that works according to the curl example
  const testRequest: CreateRepairOrderRequest = {
    customerId: "ad9e0c46-8edc-48d7-9e01-b312f9a27872",
    vehicleId: "7D6A3D38-20A5-441C-A52C-88BF41984311",
    receiveDate: "2025-10-21T09:43:59.848Z",
    roType: 0,
    estimatedCompletionDate: "2025-10-24T09:43:59.848Z",
    estimatedAmount: 5000000,
    note: "k no may",
    estimatedRepairTime: 30
  };

  console.log("Testing repair order creation with minimal request:");
  console.log(JSON.stringify(testRequest, null, 2));

  try {
    // Mock the localStorage token for testing (in a real browser environment, this would be set by login)
    if (typeof window !== 'undefined') {
      // This would normally be set after login
      // localStorage.setItem('authToken', 'YOUR_TEST_TOKEN_HERE');
    }

    const result = await repairOrderService.createRepairOrder(testRequest);
    console.log("Repair order creation successful:", result);
    return result;
  } catch (error) {
    console.error("Repair order creation failed:", error);
    return null;
  }
}