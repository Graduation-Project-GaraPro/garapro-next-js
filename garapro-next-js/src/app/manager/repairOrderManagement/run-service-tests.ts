// Test runner for service selection functionality
import { testServiceSelectionIntegration } from "./test-service-integration"

/**
 * Run all service selection tests
 */
export async function runServiceSelectionTests() {
  console.log("Starting Service Selection Tests...")
  
  try {
    const results = await testServiceSelectionIntegration()
    console.log("All tests completed successfully!")
    return results
  } catch (error) {
    console.error("Tests failed with error:", error)
    throw error
  }
}

// Run tests if this file is executed directly
if (typeof window === 'undefined' && require.main === module) {
  runServiceSelectionTests()
    .then(() => {
      console.log("Tests completed successfully!")
      process.exit(0)
    })
    .catch((error) => {
      console.error("Tests failed:", error)
      process.exit(1)
    })
}