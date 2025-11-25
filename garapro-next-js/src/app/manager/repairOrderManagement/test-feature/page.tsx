// Test page for the service selection feature
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { serviceCatalog } from "@/services/service-catalog"
import type { GarageServiceCatalogItem } from "@/services/service-catalog"

export default function TestServiceSelectionFeature() {
  const [services, setServices] = useState<GarageServiceCatalogItem[]>([])
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadServices()
  }, [])

  const loadServices = async () => {
    try {
      setLoading(true)
      const serviceData = await serviceCatalog.list()
      setServices(serviceData)
    } catch (err) {
      setError("Failed to load services")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const toggleService = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    )
  }

  const calculateTotals = () => {
    const selected = services.filter(s => selectedServices.includes(s.serviceId))
    const totalAmount = selected.reduce((sum, service) => sum + service.price, 0)
    const totalTime = selected.reduce((sum, service) => sum + service.estimatedDuration, 0)
    return { totalAmount, totalTime }
  }

  const { totalAmount, totalTime } = calculateTotals()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading services...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <Button onClick={loadServices}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Service Selection Feature Test</h1>
          <p className="text-gray-600">Testing the new service selection functionality for repair order creation</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Select Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {services.map((service) => (
                <div 
                  key={service.serviceId} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    <Switch
                      checked={selectedServices.includes(service.serviceId)}
                      onCheckedChange={() => toggleService(service.serviceId)}
                    />
                    <div>
                      <div className="font-medium">{service.serviceName}</div>
                      <p className="text-sm text-gray-500">{service.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${service.price.toFixed(2)}</div>
                    <div className="text-sm text-gray-500">{service.estimatedDuration} min</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            {selectedServices.length > 0 && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">{selectedServices.length}</span> service(s) selected
                  </div>
                  <div className="text-right">
                    <div className="font-medium">Total: ${totalAmount.toFixed(2)}</div>
                    <div className="text-sm text-gray-600">
                      Estimated time: {Math.floor(totalTime / 60)}h {totalTime % 60}m
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6">
              <Button 
                className="w-full" 
                disabled={selectedServices.length === 0}
                onClick={() => {
                  const selected = services.filter(s => selectedServices.includes(s.serviceId))
                  console.log("Selected services:", selected)
                  alert(`Selected ${selectedServices.length} services\nTotal: $${totalAmount.toFixed(2)}\nTime: ${Math.floor(totalTime / 60)}h ${totalTime % 60}m`)
                }}
              >
                Test Selection
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-700">Total Services</div>
                <div className="text-2xl font-bold text-blue-900">{services.length}</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-sm text-green-700">Selected Services</div>
                <div className="text-2xl font-bold text-green-900">{selectedServices.length}</div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="text-sm text-purple-700">Completion Rate</div>
                <div className="text-2xl font-bold text-purple-900">
                  {services.length > 0 ? Math.round((selectedServices.length / services.length) * 100) : 0}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Implementation Status */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Implementation Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-3"></div>
                <div>
                  <div className="font-medium">Service Catalog Integration</div>
                  <div className="text-sm text-gray-600">Successfully fetching services from backend</div>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-3"></div>
                <div>
                  <div className="font-medium">Service Selection UI</div>
                  <div className="text-sm text-gray-600">Interactive service selection with visual feedback</div>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-3"></div>
                <div>
                  <div className="font-medium">Auto-calculation</div>
                  <div className="text-sm text-gray-600">Real-time calculation of totals</div>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-3"></div>
                <div>
                  <div className="font-medium">API Integration</div>
                  <div className="text-sm text-gray-600">Sending selected service IDs to backend</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}