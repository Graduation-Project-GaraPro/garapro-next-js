// src/app/manager/components/Quote/CreateQuotationDialog.tsx
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { SERVICE_CATEGORIES } from "./constants"
import { CustomItem, QuotationData, ServiceCategory, PartWithRecommendation } from "./types"
import { QuoteInfoSection } from "./QuoteInfoSection"
import { ServicesTree } from "./ServicesTree"
import { ServicesSummary } from "./ServicesSummary"
import { PartSelectionModal } from "./PartSelectionModal"
import { serviceCatalog, GarageServiceCatalogItem, Part } from "@/services/service-catalog"
import { quotationService } from "@/services/manager/quotation-service"
import { repairOrderService } from "@/services/manager/repair-order-service"
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
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(["design", "development"]))
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set())
  const [requiredServices, setRequiredServices] = useState<Set<string>>(new Set()) // Add required services state
  const [customItems, setCustomItems] = useState<Record<string, CustomItem[]>>({})
  const [partModalOpen, setPartModalOpen] = useState<string | null>(null) // Add part modal state
  const [partsForService, setPartsForService] = useState<Record<string, PartWithRecommendation[]>>({}) // Add parts state
  const [formData, setFormData] = useState({
    dateCreated: new Date().toISOString().split("T")[0],
    customerName: roData?.customerName || "",
    customerPhone: roData?.customerPhone || "",
    validUntil: "",
  })
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>(SERVICE_CATEGORIES)
  const [loadingCategories, setLoadingCategories] = useState(true)
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

  // Fetch service categories from API
  useEffect(() => {
    const fetchServiceCategories = async () => {
      try {
        setLoadingCategories(true);
        const apiCategories = await serviceCatalog.getCategories();
        
        // Transform API response to match component structure
        const transformedCategories: ServiceCategory[] = [];
        
        // Fetch services for each category
        for (const cat of apiCategories) {
          const services = await serviceCatalog.getServicesByCategoryId(cat.serviceCategoryId);
          
          // Transform services to match the component structure
          const transformedServices = services.map((service: GarageServiceCatalogItem) => ({
            id: service.serviceId,
            name: service.serviceName,
            price: service.price,
            isAdvanced: service.isAdvanced // Add isAdvanced attribute
          }));
          
          transformedCategories.push({
            id: cat.serviceCategoryId,
            name: cat.categoryName,
            children: transformedServices
          });
        }
        
        setServiceCategories(transformedCategories);
      } catch (error) {
        console.error("Failed to fetch service categories:", error);
        // Fallback to hardcoded categories if API fails
        setServiceCategories(SERVICE_CATEGORIES);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchServiceCategories();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  const toggleService = (serviceId: string) => {
    const newSelected = new Set(selectedServices)
    if (newSelected.has(serviceId)) {
      // Don't allow deselecting required services
      if (requiredServices.has(serviceId)) {
        return;
      }
      newSelected.delete(serviceId)
      const newCustomItems = { ...customItems }
      delete newCustomItems[serviceId]
      setCustomItems(newCustomItems)
    } else {
      newSelected.add(serviceId)
    }
    setSelectedServices(newSelected)
  }

  // Toggle required status for a service (manager functionality)
  const toggleRequiredService = (serviceId: string) => {
    const newRequired = new Set(requiredServices)
    if (newRequired.has(serviceId)) {
      newRequired.delete(serviceId)
    } else {
      newRequired.add(serviceId)
      // Auto-select required services
      const newSelected = new Set(selectedServices)
      newSelected.add(serviceId)
      setSelectedServices(newSelected)
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
      // Check if it's a simple service (not advanced) and already has parts
      const serviceCustomItems = customItems[serviceId] || [];
      if (!isServiceAdvanced(serviceId) && serviceCustomItems.length > 0) {
        // Show an alert or message to the user
        alert("Simple services can only have one part selected. Please remove the existing part before adding a new one.");
        return;
      }

      // Check if we already have parts for this service
      if (!partsForService[serviceId]) {
        const parts = await serviceCatalog.getPartsByServiceId(serviceId);
        // Store parts directly without the recommended property
        setPartsForService(prev => ({
          ...prev,
          [serviceId]: parts
        }));
      }
      
      setPartModalOpen(serviceId);
    } catch (error) {
      console.error("Failed to fetch parts for service:", error);
    }
  }

  // Add a part to a service
  const addPartToService = (serviceId: string, part: Part) => {
    // Check if it's a simple service (not advanced) and already has parts
    const serviceCustomItems = customItems[serviceId] || [];
    if (!isServiceAdvanced(serviceId) && serviceCustomItems.length > 0) {
      // Show an alert or message to the user
      alert("Simple services can only have one part selected. Please remove the existing part before adding a new one.");
      return;
    }

    const newItem: CustomItem = {
      id: `${serviceId}-${part.partId}`,
      name: part.name,
      price: part.price,
    }

    setCustomItems((prev) => ({
      ...prev,
      [serviceId]: [...(prev[serviceId] || []), newItem],
    }))
    
    setPartModalOpen(null);
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
      const quotationServices: QuotationServiceCreateDto[] = Array.from(selectedServices).map(serviceId => ({
        serviceId: serviceId, // Keep original case for serviceId to match API expectations
        isSelected: true,
        isRequired: requiredServices.has(serviceId), // Add isRequired property
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
        selectedServices: Array.from(selectedServices),
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
    Array.from(selectedServices).forEach((serviceId) => {
      // Find service in serviceCategories
      for (const category of serviceCategories) {
        if (category.children) {
          const service = category.children.find((s: ServiceCategory) => s.id === serviceId)
          if (service) {
            total += service.price || 0
            break
          }
        }
      }
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

  // Helper function to find service name in dynamic categories
  const findServiceName = (serviceId: string) => {
    for (const category of serviceCategories) {
      if (category.children) {
        const service = category.children.find((s: ServiceCategory) => s.id === serviceId);
        if (service) return service.name;
      }
    }
    return "";
  }

  // Helper function to check if a service is advanced
  const isServiceAdvanced = (serviceId: string) => {
    for (const category of serviceCategories) {
      if (category.children) {
        const service = category.children.find((s: ServiceCategory) => s.id === serviceId);
        if (service) return service.isAdvanced ?? true; // Default to true if not specified
      }
    }
    return true;
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
            <ServicesTree
              expandedCategories={expandedCategories}
              selectedServices={selectedServices}
              requiredServices={requiredServices} // Pass required services
              onToggleCategory={toggleCategory}
              onToggleService={toggleService}
              onToggleRequiredService={toggleRequiredService} // Pass toggle required function
              serviceCategories={serviceCategories}
              loadingCategories={loadingCategories}
            />

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
                  
                  {/* Services Summary */}
                  <ServicesSummary
                    selectedServices={selectedServices}
                    requiredServices={requiredServices} // Pass required services
                    customItems={customItems}
                    onRemoveCustomItem={removeCustomItem}
                    onAddParts={handleAddParts} // Add this prop
                    serviceCategories={serviceCategories} // Pass dynamic categories
                  />
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
          isAdvancedService={isServiceAdvanced(partModalOpen)} // Use dynamic value
          onSelect={(part) => addPartToService(partModalOpen!, part)}
          onClose={() => setPartModalOpen(null)}
        />
      )}
    </Dialog>
  )
}