// Service selection dialog component with search functionality
"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Check, X } from "lucide-react"
import { serviceCatalog } from "@/services/service-catalog"
import type { GarageServiceCatalogItem } from "@/services/service-catalog"

interface ServiceSelectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedServiceIds: string[]
  onSelectionChange: (selectedServiceIds: string[]) => void
  title?: string
}

export function ServiceSelectionDialog({
  open,
  onOpenChange,
  selectedServiceIds,
  onSelectionChange,
  title = "Select Services"
}: ServiceSelectionDialogProps) {
  const [services, setServices] = useState<GarageServiceCatalogItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load services when dialog opens
  useEffect(() => {
    if (open) {
      loadServices()
    }
  }, [open])

  const loadServices = async () => {
    try {
      setLoading(true)
      setError(null)
      const serviceData = await serviceCatalog.list()
      setServices(serviceData)
    } catch (err) {
      setError("Failed to load services")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Filter services based on search term
  const filteredServices = useMemo(() => {
    if (!searchTerm) return services
    
    const term = searchTerm.toLowerCase()
    return services.filter(service => 
      service.serviceName.toLowerCase().includes(term) ||
      service.description.toLowerCase().includes(term)
    )
  }, [services, searchTerm])

  // Get selected services for display
  const selectedServices = useMemo(() => {
    return services.filter(service => selectedServiceIds.includes(service.serviceId))
  }, [services, selectedServiceIds])

  const toggleService = (serviceId: string) => {
    const newSelected = selectedServiceIds.includes(serviceId)
      ? selectedServiceIds.filter(id => id !== serviceId)
      : [...selectedServiceIds, serviceId]
    
    onSelectionChange(newSelected)
  }

  const removeService = (serviceId: string) => {
    const newSelected = selectedServiceIds.filter(id => id !== serviceId)
    onSelectionChange(newSelected)
  }

  const clearAll = () => {
    onSelectionChange([])
  }

  const calculateTotals = () => {
    const selected = services.filter(s => selectedServiceIds.includes(s.serviceId))
    const totalAmount = selected.reduce((sum, service) => sum + service.price, 0)
    const totalTimeInMinutes = selected.reduce((sum, service) => sum + service.estimatedDuration, 0)
    return { totalAmount, totalTimeInMinutes }
  }

  const { totalAmount, totalTimeInMinutes } = calculateTotals()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 flex-grow overflow-hidden">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search services by name or description..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Selected Services Preview */}
          {selectedServices.length > 0 && (
            <div className="bg-blue-50 rounded-md p-3">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-blue-900">Selected Services ({selectedServices.length})</h4>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearAll}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Clear All
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                {selectedServices.map((service) => (
                  <div 
                    key={service.serviceId}
                    className="flex items-center bg-white rounded-full px-3 py-1 text-sm border border-blue-200"
                  >
                    <span className="mr-2">{service.serviceName}</span>
                    <button 
                      onClick={() => removeService(service.serviceId)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Selection Controls */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {selectedServiceIds.length} of {services.length} services selected
            </div>
          </div>
          
          {/* Services List */}
          <div className="flex-grow overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                  <p className="text-gray-500">Loading services...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-40">
                <div className="text-center">
                  <p className="text-red-500 mb-2">{error}</p>
                  <Button variant="outline" onClick={loadServices}>Retry</Button>
                </div>
              </div>
            ) : filteredServices.length === 0 ? (
              <div className="flex items-center justify-center h-40">
                <p className="text-gray-500">
                  {searchTerm ? "No services match your search" : "No services available"}
                </p>
              </div>
            ) : (
              <div className="h-[400px] rounded-md border">
                <ScrollArea className="h-full w-full">
                  <div className="p-2">
                    {filteredServices.map((service) => {
                      const isSelected = selectedServiceIds.includes(service.serviceId)
                      return (
                        <div 
                          key={service.serviceId}
                          className={`flex items-center justify-between p-3 rounded-md cursor-pointer transition-colors ${
                            isSelected 
                              ? "bg-blue-50 border border-blue-200" 
                              : "hover:bg-gray-50"
                          }`}
                          onClick={() => toggleService(service.serviceId)}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                              isSelected 
                                ? "bg-blue-500 border-blue-500" 
                                : "border-gray-300"
                            }`}>
                              {isSelected && <Check className="w-4 h-4 text-white" />}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-medium truncate">{service.serviceName}</div>
                              <div className="text-sm text-gray-500 truncate">
                                {service.description}
                              </div>
                            </div>
                          </div>
                          <div className="text-right ml-2">
                            <div className="font-medium">${service.price.toFixed(2)}</div>
                            <div className="text-sm text-gray-500">
                              {service.estimatedDuration} min
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
          
          {/* Summary */}
          {selectedServiceIds.length > 0 && (
            <div className="p-3 bg-gray-50 rounded-md">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-medium">{selectedServiceIds.length}</span> service(s) selected
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
        
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => onOpenChange(false)}>
            Confirm Selection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}