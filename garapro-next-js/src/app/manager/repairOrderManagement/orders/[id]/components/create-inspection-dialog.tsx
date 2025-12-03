"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Loader2, AlertCircle, Info, Search, X } from "lucide-react"
import { inspectionService } from "@/services/manager/inspection-service"
import { serviceCatalog } from "@/services/service-catalog"
import type { GarageServiceCatalogItem } from "@/services/service-catalog"
import { formatVND } from "@/lib/currency"

interface CreateInspectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  repairOrderId: string
  onInspectionCreated: () => void
}

interface ServiceWithStatus extends GarageServiceCatalogItem {
  isAvailable: boolean
  isInspected: boolean
}

export function CreateInspectionDialog({ 
  open, 
  onOpenChange, 
  repairOrderId,
  onInspectionCreated
}: CreateInspectionDialogProps) {
  const [allServices, setAllServices] = useState<ServiceWithStatus[]>([])
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([])
  const [customerConcern, setCustomerConcern] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Load services when dialog opens
  useEffect(() => {
    if (open) {
      loadServices()
      resetForm()
    }
  }, [open, repairOrderId])

  const loadServices = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch available services (not in completed inspections)
      const availableServices = await inspectionService.getAvailableServices(repairOrderId)
      
      // Fetch all active services from catalog
      const allCatalogServices = await serviceCatalog.getAllServices()
      
      // Create a map of available service IDs for quick lookup
      const availableServiceIds = new Set(availableServices.map(s => s.serviceId))
      
      // Merge the data: mark services as available or inspected
      const servicesWithStatus: ServiceWithStatus[] = allCatalogServices.map(service => ({
        ...service,
        isAvailable: availableServiceIds.has(service.serviceId),
        isInspected: !availableServiceIds.has(service.serviceId)
      }))
      
      // Group by category for better display
      const sortedServices = servicesWithStatus.sort((a, b) => {
        // Sort by availability first (available first), then by category, then by name
        if (a.isAvailable !== b.isAvailable) {
          return a.isAvailable ? -1 : 1
        }
        const catA = a.categoryName || 'Other'
        const catB = b.categoryName || 'Other'
        if (catA !== catB) {
          return catA.localeCompare(catB)
        }
        return a.serviceName.localeCompare(b.serviceName)
      })
      
      setAllServices(sortedServices)
    } catch (err) {
      console.error("Failed to load services:", err)
      setError("Failed to load services. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setSelectedServiceIds([])
    setCustomerConcern("")
    setSearchQuery("")
    setError(null)
  }

  const handleServiceToggle = (serviceId: string, isAvailable: boolean) => {
    if (!isAvailable) {
      // Don't allow selecting already inspected services
      return
    }
    
    setSelectedServiceIds(prev => {
      if (prev.includes(serviceId)) {
        return prev.filter(id => id !== serviceId)
      } else {
        return [...prev, serviceId]
      }
    })
  }

  const handleSubmit = async () => {
    if (!customerConcern.trim()) {
      setError("Please enter customer concern")
      return
    }

    try {
      setSubmitting(true)
      setError(null)
      
      // Create manager inspection with selected services
      await inspectionService.createManagerInspection({
        repairOrderId,
        customerConcern,
        serviceIds: selectedServiceIds.length > 0 ? selectedServiceIds : undefined
      })
      
      // Reset form and close dialog
      resetForm()
      onInspectionCreated()
      onOpenChange(false)
    } catch (err: any) {
      console.error("Failed to create inspection:", err)
      // Extract error message from API response
      const errorMessage = err?.response?.data?.message || err?.message || "Failed to create inspection. Please try again."
      setError(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  // Filter services based on search query
  const filteredServices = allServices.filter(service => {
    if (!searchQuery.trim()) return true
    
    const query = searchQuery.toLowerCase()
    return (
      service.serviceName.toLowerCase().includes(query) ||
      service.description?.toLowerCase().includes(query) ||
      service.categoryName?.toLowerCase().includes(query)
    )
  })

  // Group filtered services by category
  const groupedServices = filteredServices.reduce((acc, service) => {
    const category = service.categoryName || "Other"
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(service)
    return acc
  }, {} as Record<string, ServiceWithStatus[]>)

  const inspectedCount = allServices.filter(s => s.isInspected).length
  const availableCount = allServices.filter(s => s.isAvailable).length
  const filteredCount = filteredServices.length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Inspection</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-start text-red-700">
              <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="concern">Customer Concern *</Label>
            <Textarea
              id="concern"
              value={customerConcern}
              onChange={(e) => setCustomerConcern(e.target.value)}
              placeholder="Describe the customer's concern..."
              disabled={submitting}
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-gray-500">{customerConcern.length}/500 characters</p>
          </div>
          
          <div className="space-y-2">
            <Label>Select Services (Optional)</Label>
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 flex items-start text-blue-700 text-sm mb-3">
              <Info className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Service Selection Guide:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Services can be added now or later by the technician</li>
                  <li>Grayed out services have already been inspected in completed inspections</li>
                  <li>Services from the RO can be re-inspected</li>
                  <li>{availableCount} services available, {inspectedCount} already inspected</li>
                </ul>
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search services by name, description, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={loading || submitting}
                className="pl-10 pr-10"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  type="button"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            
            {searchQuery && (
              <p className="text-xs text-gray-500">
                Showing {filteredCount} of {allServices.length} services
              </p>
            )}
            
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              </div>
            ) : allServices.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No services available</p>
              </div>
            ) : filteredServices.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No services match your search</p>
                <Button
                  variant="link"
                  onClick={() => setSearchQuery("")}
                  className="mt-2"
                >
                  Clear search
                </Button>
              </div>
            ) : (
              <div className="border rounded-md max-h-96 overflow-y-auto">
                {Object.entries(groupedServices).map(([category, services]) => (
                  <div key={category} className="border-b last:border-b-0">
                    <div className="bg-gray-50 px-4 py-2 font-medium text-sm text-gray-700 sticky top-0">
                      {category}
                    </div>
                    <div className="divide-y">
                      {services.map((service) => (
                        <div
                          key={service.serviceId}
                          className={`px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors ${
                            !service.isAvailable ? "opacity-50 cursor-not-allowed bg-gray-100" : "cursor-pointer"
                          }`}
                          onClick={() => handleServiceToggle(service.serviceId, service.isAvailable)}
                        >
                          <Checkbox
                            checked={selectedServiceIds.includes(service.serviceId)}
                            disabled={!service.isAvailable || submitting}
                            onCheckedChange={() => handleServiceToggle(service.serviceId, service.isAvailable)}
                            className="mt-0.5"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`font-medium ${!service.isAvailable ? "text-gray-500" : "text-gray-900"}`}>
                                {service.serviceName}
                              </span>
                              {service.isInspected && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-600">
                                  Already Inspected
                                </span>
                              )}
                              {service.isAdvanced && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                                  Advanced
                                </span>
                              )}
                            </div>
                            {service.description && (
                              <p className="text-sm text-gray-500 mt-1">{service.description}</p>
                            )}
                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                              <span>{formatVND(service.price || 0)}</span>
                              {service.estimatedDuration && (
                                <span>{service.estimatedDuration} min</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {selectedServiceIds.length > 0 && (
              <p className="text-sm text-gray-600 mt-2">
                {selectedServiceIds.length} service{selectedServiceIds.length !== 1 ? "s" : ""} selected
              </p>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={submitting || !customerConcern.trim()}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Inspection"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}