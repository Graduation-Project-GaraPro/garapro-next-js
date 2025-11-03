// Demo page for service selection feature
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { serviceCatalog } from "@/services/service-catalog"
import type { GarageServiceCatalogItem } from "@/services/service-catalog"

export default function ServiceSelectionDemo() {
  const [services, setServices] = useState<GarageServiceCatalogItem[]>([])
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [customerName, setCustomerName] = useState("")
  const [vehicleInfo, setVehicleInfo] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadServices()
  }, [])

  const loadServices = async () => {
    try {
      setLoading(true)
      // Fetch all services from the API
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
    // Convert estimated duration from minutes to hours for display
    const totalTimeInMinutes = selected.reduce((sum, service) => sum + service.estimatedDuration, 0)
    return { totalAmount, totalTimeInMinutes }
  }

  const { totalAmount, totalTimeInMinutes } = calculateTotals()

  const handleSubmit = () => {
    if (!customerName || !vehicleInfo) {
      alert("Please fill in customer and vehicle information")
      return
    }
    
    if (selectedServices.length === 0) {
      alert("Please select at least one service")
      return
    }
    
    const selected = services.filter(s => selectedServices.includes(s.serviceId))
    console.log("Creating repair order with:", {
      customerName,
      vehicleInfo,
      services: selected,
      totalAmount,
      totalTime: totalTimeInMinutes
    })
    
    alert(`Repair order created successfully!\nTotal: $${totalAmount.toFixed(2)}\nTime: ${Math.floor(totalTimeInMinutes / 60)}h ${totalTimeInMinutes % 60}m`)
  }

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Service Selection Demo</h1>
          <p className="text-gray-600">Demonstration of the new service selection feature for repair order creation</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer Information */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer name"
                  />
                </div>
                <div>
                  <Label htmlFor="vehicleInfo">Vehicle Information</Label>
                  <Input
                    id="vehicleInfo"
                    value={vehicleInfo}
                    onChange={(e) => setVehicleInfo(e.target.value)}
                    placeholder="Enter vehicle info"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Service Selection */}
          <div className="lg:col-span-2">
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
                          Estimated time: {Math.floor(totalTimeInMinutes / 60)}h {totalTimeInMinutes % 60}m
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-6">
                  <Button 
                    className="w-full" 
                    onClick={handleSubmit}
                    disabled={!customerName || !vehicleInfo || selectedServices.length === 0}
                  >
                    Create Repair Order
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Implementation Notes */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Implementation Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
              <li>Services are fetched from the backend API using the service catalog</li>
              <li>Selected services are automatically calculated for total amount and time</li>
              <li>Service IDs are sent to the repair order creation endpoint</li>
              <li>The backend automatically calculates the final estimated amount and time based on selected services</li>
              <li>All existing repair order functionality remains unchanged</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}