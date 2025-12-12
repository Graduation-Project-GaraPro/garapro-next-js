// src/app/manager/components/Quote/CreateQuotationDialog.tsx
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CustomItem, QuotationData} from "./types"
import { QuoteInfoSection } from "./QuoteInfoSection"
import { ServicesTree } from "./ServicesTree"
import { PartSelectionModal } from "./PartSelectionModal"
import { quotationService } from "@/services/manager/quotation-service"
import { repairOrderService } from "@/services/manager/repair-order-service"
import { quotationTreeService } from "@/services/manager/quotation-tree-service"
import { serviceCatalog } from "@/services/service-catalog"
import { formatVND } from "@/lib/currency"
import { 
  CreateQuotationDto, 
  QuotationServiceCreateDto, 
  QuotationServicePartCreateDto 
} from "@/types/manager/quotation"
import type { RepairOrder } from "@/types/manager/repair-order"

interface CreateQuotationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  roData?: {
    roNumber?: string
    customerName?: string
    customerPhone?: string
    vehicleInfo?: string
    dateCreated?: string
  }
  onSubmit: (data: QuotationData) => void
}

export function CreateQuotationDialog({ open, onOpenChange, roData, onSubmit }: CreateQuotationDialogProps) {
  const [selectedServices, setSelectedServices] = useState<Map<string, { name: string; price: number }>>(new Map())
  const [requiredServices, setRequiredServices] = useState<Set<string>>(new Set())
  const [customItems, setCustomItems] = useState<Record<string, CustomItem[]>>({})
  const [partModalOpen, setPartModalOpen] = useState<string | null>(null)
  const [partsForService, setPartsForService] = useState<Record<string, Array<{ partId: string; name: string; price: number; stock: number }>>>({})
  const [currentServiceSelection, setCurrentServiceSelection] = useState<{
    serviceId: string
    serviceName: string
    servicePrice: number
  } | null>(null)
  const [formData, setFormData] = useState({
    dateCreated: new Date().toISOString().split("T")[0],
    customerName: roData?.customerName || "",
    customerPhone: roData?.customerPhone || "",
    validUntil: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [repairOrder, setRepairOrder] = useState<RepairOrder | null>(null)

  // Fetch repair order details when RO number is provided
  useEffect(() => {
    const fetchRepairOrder = async () => {
      if (roData?.roNumber) {
        try {
          const order = await repairOrderService.getRepairOrderById(roData.roNumber);
          if (order) {
            setRepairOrder(order);
            // Update form data with repair order details
            setFormData(prev => ({
              ...prev,
              customerName: order.customerName || prev.customerName,
              customerPhone: order.customerPhone || prev.customerPhone,
            }));
          }
        } catch (error) {
          console.error("Failed to fetch repair order:", error);
        }
      }
    };

    fetchRepairOrder();
  }, [roData?.roNumber]);

  // Handle service selection from tree
  const handleServiceSelect = async (serviceId: string, serviceName: string, price: number) => {
    // Store the service selection temporarily
    setCurrentServiceSelection({ serviceId, serviceName, servicePrice: price })
    
    // Try to fetch parts for this service using the tree API first
    try {
      const serviceDetails = await quotationTreeService.getServiceDetails(serviceId)
      console.log("servicePart", serviceDetails.partCategories)
      // Check if part categories have parts included
      const hasPartsInCategories = serviceDetails.partCategories.some(
        (cat: { parts?: Array<{ partId: string; name: string; price: number }> }) => cat.parts && cat.parts.length > 0
      )
      
      if (hasPartsInCategories) {
        // API includes parts in categories - extract them
        const allParts: Array<{ partId: string; name: string; price: number, stock:number }> = []
        serviceDetails.partCategories.forEach((category: { parts?: Array<{ partId: string; name: string; price: number; stock:number }> }) => {
          if (category.parts) {
            category.parts.forEach((part) => {
              allParts.push({
                partId: part.partId,
                name: part.name,
                price: part.price,
                stock: part.stock
              })
            })
          }
        })
        setPartsForService(prev => ({
          ...prev,
          [serviceId]: allParts
        }))
        setPartModalOpen(serviceId)

         console.log("servicePart", allParts)

      } else {
        // API only returns category IDs - fetch parts for each category
        console.log("Fetching parts for each category...")
        const allParts: Array<{ partId: string; name: string; price: number; stock:number }> = []
        
        for (const category of serviceDetails.partCategories) {
          try {
            const categoryParts = await quotationTreeService.getPartsByCategory(category.partCategoryId)

         console.log("categoryParts", categoryParts )
            
            categoryParts.forEach((part) => {
               console.log("item", part)
              allParts.push({
                partId: part.partId,
                name: part.name,
                price: part.price,
                stock: part.stock
              })
            })
          } catch (error) {
            console.error(`Failed to fetch parts for category ${category.partCategoryId}:`, error)
          }
        }
        
        if (allParts.length > 0) {
          setPartsForService(prev => ({
            ...prev,
            [serviceId]: allParts
          }))
          setPartModalOpen(serviceId)
        } else {
          addServiceWithoutParts(serviceId, serviceName, price)
        }
      }
    } catch (error: unknown) {
      console.warn("Tree API error, falling back to service catalog:", error)
      
      // Fallback: Try to fetch parts using the old service catalog API
      try {
        const parts = await serviceCatalog.getPartsByServiceId(serviceId)
        if (parts && parts.length > 0) {
          setPartsForService(prev => ({
            ...prev,
            [serviceId]: parts
          }))
          setPartModalOpen(serviceId)
        } else {
          // No parts available, just add the service
          addServiceWithoutParts(serviceId, serviceName, price)
        }
      } catch (fallbackError) {
        console.error("Failed to fetch parts from service catalog:", fallbackError)
        // If both APIs fail, just add the service without parts
        addServiceWithoutParts(serviceId, serviceName, price)
      }
    }
  }

  const addServiceWithoutParts = (serviceId: string, serviceName: string, price: number) => {
    setSelectedServices(prev => new Map(prev).set(serviceId, { name: serviceName, price }))
    setCurrentServiceSelection(null)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const removeService = (serviceId: string) => {
    if (requiredServices.has(serviceId)) {
      return // Don't allow removing required services
    }
    const newSelected = new Map(selectedServices)
    newSelected.delete(serviceId)
    setSelectedServices(newSelected)
    
    const newCustomItems = { ...customItems }
    delete newCustomItems[serviceId]
    setCustomItems(newCustomItems)
  }

  // Toggle required status for a service (manager functionality)
  const toggleRequiredService = (serviceId: string) => {
    const newRequired = new Set(requiredServices)
    if (newRequired.has(serviceId)) {
      newRequired.delete(serviceId)
    } else {
      newRequired.add(serviceId)
    }
    setRequiredServices(newRequired)
  }

  // Removed toggleItemRecommendation function since we're removing recommended items

  const removeCustomItem = (serviceId: string, itemId: string) => {
    setCustomItems((prev) => ({
      ...prev,
      [serviceId]: prev[serviceId].filter((item) => item.id !== itemId),
    }))
  }

  // Fetch parts for a service when "Add Parts" is clicked
  const handleAddParts = async (serviceId: string) => {
    try {
      // Check if we already have parts for this service
      if (!partsForService[serviceId]) {
        // Try tree API first
        try {
          const serviceDetails = await quotationTreeService.getServiceDetails(serviceId)
          const allParts: Array<{ partId: string; name: string; price: number; stock:number }> = []
          
          // Check if parts are included in categories
          const hasPartsInCategories = serviceDetails.partCategories.some(
            (cat: { parts?: Array<{ partId: string; name: string; price: number }> }) => cat.parts && cat.parts.length > 0
          )
          
          if (hasPartsInCategories) {
            // Extract parts from categories
            serviceDetails.partCategories.forEach((category: { parts?: Array<{ partId: string; name: string; price: number; stock:number }> }) => {
              if (category.parts) {
                category.parts.forEach((part) => {
                  allParts.push({
                    partId: part.partId,
                    name: part.name,
                    price: part.price,
                    stock: part.stock
                  })
                })
              }
            })
          } else {
            // Fetch parts for each category
            for (const category of serviceDetails.partCategories) {
              try {
                const categoryParts = await quotationTreeService.getPartsByCategory(category.partCategoryId)
                categoryParts.forEach((part) => {
                  allParts.push({
                    partId: part.partId,
                    name: part.name,
                    price: part.price,
                    stock: part.stock
                  })
                })
              } catch (error) {
                console.error(`Failed to fetch parts for category ${category.partCategoryId}:`, error)
              }
            }
          }
          
          setPartsForService(prev => ({
            ...prev,
            [serviceId]: allParts
          }))
        } catch (treeError) {
          console.warn("Tree API not available, using service catalog:", treeError)
          // Fallback to service catalog
          const parts = await serviceCatalog.getPartsByServiceId(serviceId)
          setPartsForService(prev => ({
            ...prev,
            [serviceId]: parts
          }))
        }
      }
      
      setPartModalOpen(serviceId)
    } catch (error) {
      console.error("Failed to fetch parts for service:", error)
      alert("No parts available for this service")
    }
  }

  // Add a part to a service
  const addPartToService = (serviceId: string, part: { partId: string; name: string; price: number }) => {
    const newItem: CustomItem = {
      id: `${serviceId}-${part.partId}`,
      name: part.name,
      price: part.price,
    }

    setCustomItems((prev) => ({
      ...prev,
      [serviceId]: [...(prev[serviceId] || []), newItem],
    }))
    
    // If this is from the initial service selection, add the service now
    if (currentServiceSelection && currentServiceSelection.serviceId === serviceId) {
      setSelectedServices(prev => new Map(prev).set(
        currentServiceSelection.serviceId, 
        { name: currentServiceSelection.serviceName, price: currentServiceSelection.servicePrice }
      ))
      setCurrentServiceSelection(null)
    }
    
    setPartModalOpen(null)
  }

  // Transform custom items to quotation service parts format
  const transformCustomItemsToQuotationParts = (serviceId: string): QuotationServicePartCreateDto[] => {
    const serviceCustomItems = customItems[serviceId] || [];
    return serviceCustomItems.map(item => {
      // Extract partId correctly from the custom item id
      // The format is: {serviceId}-{partId}
      // We need to remove the serviceId and the dash from the beginning
      const prefix = `${serviceId}-`;
      let partId = item.id;
      if (item.id.startsWith(prefix)) {
        partId = item.id.substring(prefix.length);
      }
      // Keep original case for partId to match API expectations
      // partId = partId.toLowerCase();  // Remove this line
      
      return {
        partId: partId, // Extract partId correctly
        isSelected: true,
        isRecommended: false, // Set to false since we removed recommended functionality
        recommendationNote: "string", // Include recommendationNote as in the successful request
        quantity: 1
      };
    });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Transform data to match API format
      const quotationServices: QuotationServiceCreateDto[] = Array.from(selectedServices.keys()).map(serviceId => ({
        serviceId: serviceId,
        isSelected: false, // Manager sets to false, customer will select
        isRequired: requiredServices.has(serviceId),
        quotationServiceParts: transformCustomItemsToQuotationParts(serviceId)
      }));

      // Handle vehicleId - get it from repair order if available, otherwise use default
      let vehicleId = "00000000-0000-0000-0000-000000000000";
      if (repairOrder?.vehicleId) {
        // Use vehicleId from repair order - keep original case
        vehicleId = repairOrder.vehicleId;
      } else if (roData?.vehicleInfo) {
        if (roData.vehicleInfo.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
          // It's already a GUID - keep original case
          vehicleId = roData.vehicleInfo;
        } else {
          // It's not a GUID, but we still need to send a valid GUID
          vehicleId = "00000000-0000-0000-0000-000000000000";
        }
      }

      const quotationData: CreateQuotationDto = {
        inspectionId: null, // Use null instead of a default GUID
        repairOrderId: (roData?.roNumber || "00000000-0000-0000-0000-000000000000"), // Keep original case
        userId: "a524ea81-a694-4224-bdbc-35b6d3176660", // Use a valid user ID
        vehicleId: vehicleId,
        note: "Quotation created from frontend",
        quotationServices
      };

      // Log the request data for debugging
      console.log("Sending quotation data:", JSON.stringify(quotationData, null, 2));

      // Call the API to create the quotation
      const response = await quotationService.createQuotation(quotationData);
      console.log("Quotation created successfully:", response);
      
      // Call the original onSubmit for any local handling
      const localQuotationData: QuotationData = {
        ...formData,
        selectedServices: Array.from(selectedServices.keys()),
        customItems,
        totalPrice: calculateTotal(),
        repairOrderId: roData?.roNumber || "",
        userId: "", // This would typically come from auth context
        vehicleId: roData?.vehicleInfo || "",
      };
      onSubmit(localQuotationData);
      
      // Close the dialog
      onOpenChange(false);
    } catch (error: unknown) {
      console.error("Failed to create quotation:", error);
      // Log the error response if available
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { response?: { data?: unknown; status?: number; headers?: unknown; statusText?: string } };
        console.error("Error response:", apiError.response);
        if (apiError.response?.data) {
          console.error("Error data:", apiError.response.data);
        }
        if (apiError.response?.status) {
          console.error("Error status:", apiError.response.status);
        }
        if (apiError.response?.statusText) {
          console.error("Error status text:", apiError.response.statusText);
        }
        if (apiError.response?.headers) {
          console.error("Error headers:", apiError.response.headers);
        }
        
        // Show specific error message if available
        if (apiError.response?.data) {
          try {
            const errorData = apiError.response.data as { title?: string; errors?: Record<string, string[]> };
            if (errorData.title) {
              alert(`Failed to create quotation: ${errorData.title}`);
            } else if (errorData.errors) {
              const errorMessages = Object.entries(errorData.errors)
                .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
                .join('\n');
              alert(`Failed to create quotation due to validation errors:\n${errorMessages}`);
            } else {
              alert("Failed to create quotation. Please check console for details.");
            }
          } catch {
            alert("Failed to create quotation. Please check console for details.");
          }
        } else {
          alert("Failed to create quotation. Please try again.");
        }
      } else if (error instanceof Error) {
        alert(`Failed to create quotation: ${error.message}`);
      } else {
        alert("Failed to create quotation. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const calculateTotal = () => {
    let total = 0
    selectedServices.forEach((service) => {
      total += service.price || 0
    })
    Object.values(customItems).forEach((items) => {
      items.forEach((item) => {
        total += item.price
      })
    })
    return total
  }

  const isFormValid = () => {
    return (
      selectedServices.size > 0 &&
      formData.customerName &&
      formData.customerPhone &&
      formData.validUntil
    )
  }

  // Helper function to find service name
  const findServiceName = (serviceId: string) => {
    const service = selectedServices.get(serviceId)
    return service?.name || ""
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-6xl w-4/5 h-4/5 sm:max-w-6xl overflow-hidden"
        onPointerDownOutside={(e) => partModalOpen && e.preventDefault()}
        onInteractOutside={(e) => partModalOpen && e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Create Quotation</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 h-full flex flex-col">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow overflow-hidden">
            {/* Services Tree */}
            <ServicesTree onServiceSelect={handleServiceSelect} />

            {/* Main Content */}
            <Card className="lg:col-span-2 p-6 h-fit max-h-[calc(100vh-200px)] overflow-y-auto">
              <div className="space-y-6">
                {/* Quote Info Section */}
                <QuoteInfoSection 
                  roData={roData}
                  formData={formData}
                  onInputChange={handleInputChange}
                />

                <div className="border-t border-border pt-6">
                  <h3 className="text-lg font-semibold mb-4">Quotation Summary</h3>
                  
                  {/* Selected Services */}
                  {selectedServices.size === 0 ? (
                    <p className="text-sm text-gray-500">No services selected yet. Browse the tree to add services.</p>
                  ) : (
                    <div className="space-y-4">
                      {Array.from(selectedServices.entries()).map(([serviceId, service]) => (
                        <div key={serviceId} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <div className="font-medium">{service.name}</div>
                                {requiredServices.has(serviceId) && (
                                  <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">
                                    Required
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-gray-600">{formatVND(service.price)}</div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant={requiredServices.has(serviceId) ? "default" : "outline"}
                                size="sm"
                                onClick={() => toggleRequiredService(serviceId)}
                                className={requiredServices.has(serviceId) ? "bg-red-600 hover:bg-red-700" : ""}
                              >
                                {requiredServices.has(serviceId) ? "Required" : "Mark Required"}
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleAddParts(serviceId)}
                              >
                                Add Parts
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeService(serviceId)}
                                disabled={requiredServices.has(serviceId)}
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                          
                          {/* Parts for this service */}
                          {customItems[serviceId] && customItems[serviceId].length > 0 && (
                            <div className="mt-2 pt-2 border-t">
                              <div className="text-xs font-medium text-gray-600 mb-1">Parts:</div>
                              <div className="space-y-1">
                                {customItems[serviceId].map((item) => (
                                  <div key={item.id} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                                    <span>{item.name}</span>
                                    <div className="flex items-center gap-2">
                                      <span>{formatVND(item.price)}</span>
                                      <button
                                        type="button"
                                        onClick={() => removeCustomItem(serviceId, item.id)}
                                        className="text-red-600 hover:text-red-800"
                                      >
                                        ×
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                      
                      <div className="border-t pt-4 flex justify-between items-center font-bold text-lg">
                        <span>Total:</span>
                        <span>{formatVND(calculateTotal())}</span>
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={!isFormValid() || isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? "Creating Quotation..." : "Submit Quote Request"}
                </Button>
              </div>
            </Card>
          </div>
        </form>
      </DialogContent>

      {/* Part Selection Modal */}
      {partModalOpen && (
        <PartSelectionModal
          serviceName={findServiceName(partModalOpen)}
          parts={partsForService[partModalOpen] || []}
          isAdvancedService={true}
          onSelect={(part) => addPartToService(partModalOpen!, part)}
          onClose={() => {
            setPartModalOpen(null)
            // If closing without selecting parts, still add the service
            if (currentServiceSelection && currentServiceSelection.serviceId === partModalOpen) {
              addServiceWithoutParts(
                currentServiceSelection.serviceId,
                currentServiceSelection.serviceName,
                currentServiceSelection.servicePrice
              )
            }
          }}
        />
      )}
    </Dialog>
  )
}