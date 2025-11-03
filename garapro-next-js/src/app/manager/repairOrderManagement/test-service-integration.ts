// Test integration of service selection with repair order creation
import { testServiceCatalogAPI } from "./test-service-api"
import { calculateServiceTotals } from "./test-service-api"
import type { GarageServiceCatalogItem } from "@/services/service-catalog"

/**
 * Test the complete service selection integration
 */
export async function testServiceSelectionIntegration() {
  console.log("=== Service Selection Integration Test ===")
  
  // Test 1: Service catalog API
  console.log("\n1. Testing service catalog API...")
  const apiTestResult = await testServiceCatalogAPI()
  console.log("API Test Result:", apiTestResult)
  
  if (!apiTestResult.success) {
    console.error("API test failed, stopping integration test")
    return
  }
  
  // Test 2: Service selection and calculation
  console.log("\n2. Testing service selection and calculation...")
  const mockServices: GarageServiceCatalogItem[] = [
    {
      serviceId: "1",
      serviceCategoryId: "1",
      serviceName: "Oil Change",
      description: "Full synthetic oil change",
      price: 45.00,
      estimatedDuration: 30,
      isActive: true,
      isAdvanced: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      serviceId: "2",
      serviceCategoryId: "1",
      serviceName: "Tire Rotation",
      description: "Rotation and balancing",
      price: 35.00,
      estimatedDuration: 45,
      isActive: true,
      isAdvanced: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      serviceId: "3",
      serviceCategoryId: "2",
      serviceName: "Brake Repair",
      description: "Complete brake system repair",
      price: 150.00,
      estimatedDuration: 120,
      isActive: true,
      isAdvanced: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]
  
  // Test with no services selected
  const noServicesTotals = calculateServiceTotals([])
  console.log("No services selected:", noServicesTotals)
  
  // Test with one service selected
  const oneServiceTotals = calculateServiceTotals([mockServices[0]])
  console.log("One service selected:", oneServiceTotals)
  
  // Test with multiple services selected
  const multipleServicesTotals = calculateServiceTotals(mockServices)
  console.log("Multiple services selected:", multipleServicesTotals)
  
  // Verify calculations
  const expectedTotalAmount = 45.00 + 35.00 + 150.00
  const expectedTotalTime = 30 + 45 + 120
  
  if (multipleServicesTotals.totalAmount === expectedTotalAmount && 
      multipleServicesTotals.totalTimeInMinutes === expectedTotalTime) {
    console.log("✓ Calculations are correct")
  } else {
    console.error("✗ Calculations are incorrect")
    console.error(`Expected: $${expectedTotalAmount}, ${expectedTotalTime}min`)
    console.error(`Actual: $${multipleServicesTotals.totalAmount}, ${multipleServicesTotals.totalTimeInMinutes}min`)
  }
  
  // Test 3: Form data structure
  console.log("\n3. Testing form data structure...")
  const testData = {
    customerId: "test-customer-id",
    vehicleId: "test-vehicle-id",
    receiveDate: new Date().toISOString(),
    roType: 0,
    estimatedCompletionDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    note: "Test repair order",
    selectedServiceIds: mockServices.map(s => s.serviceId)
  }
  
  console.log("Test data structure:", testData)
  
  // Verify required fields are present
  const requiredFields = ['customerId', 'vehicleId', 'receiveDate', 'roType', 'estimatedCompletionDate', 'note', 'selectedServiceIds']
  const missingFields = requiredFields.filter(field => !(field in testData))
  
  if (missingFields.length === 0) {
    console.log("✓ All required fields are present")
  } else {
    console.error("✗ Missing required fields:", missingFields)
  }
  
  console.log("\n=== Integration Test Complete ===")
  return {
    apiTest: apiTestResult,
    calculations: {
      noServices: noServicesTotals,
      oneService: oneServiceTotals,
      multipleServices: multipleServicesTotals
    },
    formData: testData
  }
}