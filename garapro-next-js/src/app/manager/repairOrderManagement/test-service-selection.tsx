// Test component to verify service selection functionality
"use client"

import { useState, useEffect } from "react"
import { serviceCatalog } from "@/services/service-catalog"
import type { GarageServiceCatalogItem } from "@/services/service-catalog"

export default function TestServiceSelection() {
  const [services, setServices] = useState<GarageServiceCatalogItem[]>([])
  const [selectedServices, setSelectedServices] = useState<GarageServiceCatalogItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadServices()
  }, [])

  const loadServices = async () => {
    setLoading(true)
    try {
      const serviceData = await serviceCatalog.list()
      setServices(serviceData)
    } catch (error) {
      console.error("Failed to load services:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleServiceSelection = (service: GarageServiceCatalogItem) => {
    setSelectedServices(prev => {
      const isSelected = prev.some(s => s.serviceId === service.serviceId)
      if (isSelected) {
        return prev.filter(s => s.serviceId !== service.serviceId)
      } else {
        return [...prev, service]
      }
    })
  }

  const calculateTotals = () => {
    const totalAmount = selectedServices.reduce((sum, service) => sum + service.price, 0)
    const totalTimeInMinutes = selectedServices.reduce((sum, service) => sum + service.estimatedDuration, 0)
    
    return {
      totalAmount,
      totalTimeInMinutes
    }
  }

  const { totalAmount, totalTimeInMinutes } = calculateTotals()

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Service Selection Test</h1>
      
      {loading ? (
        <div>Loading services...</div>
      ) : (
        <div className="space-y-4">
          <div className="border rounded-md">
            <div className="max-h-96 overflow-y-auto">
              {services.map((service) => {
                const isSelected = selectedServices.some(s => s.serviceId === service.serviceId)
                return (
                  <div 
                    key={service.serviceId} 
                    className={`p-3 border-b last:border-b-0 flex items-center justify-between cursor-pointer hover:bg-gray-50 ${
                      isSelected ? "bg-blue-50" : ""
                    }`}
                    onClick={() => toggleServiceSelection(service)}
                  >
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center mr-3 ${
                        isSelected ? "bg-blue-500 border-blue-500" : "border-gray-300"
                      }`}>
                        {isSelected && (
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{service.serviceName}</div>
                        <div className="text-sm text-gray-600">{service.description}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">${service.price.toFixed(2)}</div>
                      <div className="text-sm text-gray-600">{service.estimatedDuration} min</div>
                    </div>
                  </div>
                )
              })}
            </div>
            
            {selectedServices.length > 0 && (
              <div className="p-3 bg-gray-50 border-t">
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
          </div>
          
          <div className="mt-4">
            <h2 className="text-lg font-medium mb-2">Selected Services:</h2>
            {selectedServices.length === 0 ? (
              <p className="text-gray-500">No services selected</p>
            ) : (
              <ul className="list-disc pl-5 space-y-1">
                {selectedServices.map(service => (
                  <li key={service.serviceId}>
                    {service.serviceName} - ${service.price.toFixed(2)} ({service.estimatedDuration} min)
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}