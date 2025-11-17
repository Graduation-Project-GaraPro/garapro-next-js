// Test API functions for service selection
import { serviceCatalog } from "@/services/service-catalog"
import type { GarageServiceCatalogItem } from "@/services/service-catalog"

/**
 * Test function to verify service catalog API is working
 */
export async function testServiceCatalogAPI() {
  try {
    console.log("Testing service catalog API...")
    
    // Test fetching all services
    const services = await serviceCatalog.list()
    console.log("Fetched services:", services)
    
    // Test fetching service categories
    const categories = await serviceCatalog.getCategories()
    console.log("Fetched categories:", categories)
    
    // If we have categories, test fetching services by category
    if (categories.length > 0) {
      const firstCategory = categories[0]
      console.log("Fetching services for category:", firstCategory)
      const servicesByCategory = await serviceCatalog.getServicesByCategoryId(firstCategory.serviceCategoryId)
      console.log("Fetched services by category:", servicesByCategory)
    }
    
    return {
      success: true,
      services,
      categories
    }
  } catch (error) {
    console.error("Service catalog API test failed:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }
  }
}

/**
 * Calculate totals based on selected services
 */
export function calculateServiceTotals(selectedServices: GarageServiceCatalogItem[]) {
  const totalAmount = selectedServices.reduce((sum, service) => sum + service.price, 0)
  const totalTimeInMinutes = selectedServices.reduce((sum, service) => sum + service.estimatedDuration, 0)
  
  return {
    totalAmount,
    totalTimeInMinutes,
    totalHours: Math.floor(totalTimeInMinutes / 60),
    totalMinutes: totalTimeInMinutes % 60
  }
}