// src/app/manager/components/Quote/CreateQuotationDialogV2.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2, Package } from "lucide-react"
import { ServiceTreeNavigator } from "./ServiceTreeNavigator"
import { PartCategorySelector } from "./PartCategorySelector"
import { quotationService } from "@/services/manager/quotation-service"
import { repairOrderService } from "@/services/manager/repair-order-service"
import { 
  CreateQuotationDto, 
  QuotationServiceCreateDto, 
} from "@/types/manager/quotation"
import type { RepairOrder } from "@/types/manager/repair-order"
import type { PartItem } from "@/services/manager/quotation-tree-service"
import { toast } from "sonner"
import { formatVND } from "@/lib/currency"

interface SelectedService {
  serviceId: string
  serviceName: string
  servicePrice: number
  parts: PartItem[]
}

interface CreateQuotationDialogV2Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  roData?: {
    roNumber?: string
    customerName?: string
    customerPhone?: string
    vehicleInfo?: string
    dateCreated?: string
  }
  onSuccess: () => void
}

export function CreateQuotationDialogV2({ 
  open, 
  onOpenChange, 
  roData, 
  onSuccess 
}: CreateQuotationDialogV2Props) {
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([])
  const [currentServiceSelection, setCurrentServiceSelection] = useState<{
    serviceId: string
    serviceName: string
    servicePrice: number
  } | null>(null)
  const [repairOrder, setRepairOrder] = useState<RepairOrder | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    note: ""
  })

  // Fetch repair order details
  useEffect(() => {
    const fetchRepairOrder = async () => {
      if (roData?.roNumber) {
        try {
          const order = await repairOrderService.getRepairOrderById(roData.roNumber)
          setRepairOrder(order)
        } catch (error) {
          console.error("Failed to fetch repair order:", error)
        }
      }
    }
    fetchRepairOrder()
  }, [roData?.roNumber])

  const handleServiceSelect = (serviceId: string, serviceName: string, price: number) => {
    setCurrentServiceSelection({ serviceId, serviceName, servicePrice: price })
  }

  const handlePartCategoriesConfirm = (categoryIds: string[], parts: PartItem[]) => {
    if (!currentServiceSelection) return

    const newService: SelectedService = {
      serviceId: currentServiceSelection.serviceId,
      serviceName: currentServiceSelection.serviceName,
      servicePrice: currentServiceSelection.servicePrice,
      parts: parts
    }

    setSelectedServices(prev => [...prev, newService])
    setCurrentServiceSelection(null)
  }

  const handleRemoveService = (index: number) => {
    setSelectedServices(prev => prev.filter((_, i) => i !== index))
  }

  const calculateTotal = () => {
    let total = 0
    selectedServices.forEach(service => {
      total += service.servicePrice
      service.parts.forEach(part => {
        total += part.price
      })
    })
    return total
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Transform selected services to API format
      const quotationServices: QuotationServiceCreateDto[] = selectedServices.map(service => ({
        serviceId: service.serviceId,
        isSelected: false, // Manager sets to false, customer will select
        isRequired: false, // Can be enhanced later
        quotationServiceParts: service.parts.map(part => ({
          partId: part.partId,
          isSelected: false, // Manager includes all with false
          isRecommended: false,
          recommendationNote: "",
          quantity: 1
        }))
      }))

      const quotationData: CreateQuotationDto = {
        repairOrderId: roData?.roNumber || "",
        userId: repairOrder?.userId || "",
        vehicleId: repairOrder?.vehicleId || "",
        inspectionId: null,
        note: formData.note || "Quotation created via tree selection",
        quotationServices
      }

      await quotationService.createQuotation(quotationData)
      toast.success("Quotation created successfully")
      onSuccess()
      onOpenChange(false)
      
      // Reset form
      setSelectedServices([])
      setFormData({ note: "" })
    } catch (error: any) {
      console.error("Failed to create quotation:", error)
      toast.error(error.message || "Failed to create quotation")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-7xl w-[95vw] h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Create Quotation - Tree Selection</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 overflow-hidden">
              {/* Left: Service Tree Navigator */}
              <div className="overflow-hidden">
                <ServiceTreeNavigator onServiceSelect={handleServiceSelect} />
              </div>

              {/* Right: Selected Services Summary */}
              <Card className="flex flex-col overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-lg">Selected Services</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto space-y-4">
                  {/* RO Info */}
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                    <div><strong>RO:</strong> {roData?.roNumber}</div>
                    <div><strong>Customer:</strong> {repairOrder?.customerName || roData?.customerName}</div>
                    <div><strong>Vehicle ID:</strong> {repairOrder?.vehicleId || roData?.vehicleInfo}</div>
                  </div>

                  {/* Note */}
                  <div>
                    <Label htmlFor="note">Note (Optional)</Label>
                    <Input
                      id="note"
                      value={formData.note}
                      onChange={(e) => setFormData({ note: e.target.value })}
                      placeholder="Add a note for this quotation"
                    />
                  </div>

                  {/* Selected Services List */}
                  <div className="space-y-3">
                    {selectedServices.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Package className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p>No services selected</p>
                        <p className="text-sm mt-1">Browse and select services from the tree</p>
                      </div>
                    ) : (
                      selectedServices.map((service, index) => (
                        <div key={index} className="border rounded-lg p-4 space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-medium">{service.serviceName}</div>
                              <div className="text-sm text-gray-600">
                                {formatVND(service.servicePrice)}
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveService(index)}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>

                          {service.parts.length > 0 && (
                            <div className="mt-2 pt-2 border-t">
                              <div className="text-xs font-medium text-gray-600 mb-1">
                                Parts ({service.parts.length}):
                              </div>
                              <div className="space-y-1">
                                {service.parts.map((part) => (
                                  <div 
                                    key={part.partId}
                                    className="text-xs text-gray-600 flex justify-between bg-gray-50 p-2 rounded"
                                  >
                                    <span>{part.name}</span>
                                    <span>{formatVND(part.price)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Total */}
                  {selectedServices.length > 0 && (
                    <div className="border-t pt-4 mt-4">
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span>Total:</span>
                        <span>{formatVND(calculateTotal())}</span>
                      </div>
                    </div>
                  )}
                </CardContent>

                {/* Submit Button */}
                <div className="border-t p-4">
                  <Button
                    type="submit"
                    disabled={selectedServices.length === 0 || isSubmitting}
                    className="w-full"
                  >
                    {isSubmitting ? "Creating..." : "Create Quotation"}
                  </Button>
                </div>
              </Card>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Part Category Selector Modal */}
      {currentServiceSelection && (
        <PartCategorySelector
          serviceId={currentServiceSelection.serviceId}
          serviceName={currentServiceSelection.serviceName}
          servicePrice={currentServiceSelection.servicePrice}
          onConfirm={handlePartCategoriesConfirm}
          onCancel={() => setCurrentServiceSelection(null)}
        />
      )}
    </>
  )
}
