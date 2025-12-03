"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { repairOrderService } from "@/services/manager/repair-order-service"
import { serviceCatalog, type GarageServiceCatalogItem } from "@/services/service-catalog"
import { useToast } from "@/hooks/use-toast"
import type { UpdateRepairOrderStatusRequest } from "@/types/manager/repair-order"
import type { OrderStatus } from "@/types/manager/order-status"
import { Loader2 } from "lucide-react"

interface EditRepairOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderId: string
  currentStatusId: number
  currentNote: string
  onSuccess?: () => void
}

export default function EditRepairOrderDialog({
  open,
  onOpenChange,
  orderId,
  currentStatusId,
  currentNote,
  onSuccess
}: EditRepairOrderDialogProps) {
  const { toast } = useToast()
  const [statusId, setStatusId] = useState<string>(currentStatusId.toString())
  const [note, setNote] = useState(currentNote)
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([])
  const [statuses, setStatuses] = useState<OrderStatus[]>([])
  const [services, setServices] = useState<GarageServiceCatalogItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      loadData()
      setStatusId(currentStatusId.toString())
      setNote(currentNote)
    }
  }, [open, currentStatusId, currentNote])

  const loadData = async () => {
    setIsLoadingData(true)
    setError(null)
    try {
      // Fetch statuses, services, and repair order details in parallel
      const [statusesData, servicesData, repairOrderData] = await Promise.all([
        repairOrderService.fetchOrderStatuses(),
        serviceCatalog.list({ status: true }),
        repairOrderService.getRepairOrderById(orderId)
      ])
      
      setStatuses(statusesData)
      setServices(servicesData)
      
      // Extract service IDs from the repair order
      const existingServiceIds = repairOrderData?.serviceIds || []
      setSelectedServiceIds(existingServiceIds)
      
      console.log("Loaded existing services from RO:", existingServiceIds)
    } catch (err) {
      console.error("Failed to load data:", err)
      setError("Failed to load statuses and services")
    } finally {
      setIsLoadingData(false)
    }
  }

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServiceIds(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    )
  }

  const handleSubmit = async () => {
    if (selectedServiceIds.length === 0) {
      setError("Please select at least one service")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const updateData: UpdateRepairOrderStatusRequest = {
        statusId: parseInt(statusId),
        note: note.trim() || undefined,
        selectedServiceIds,
        updatedAt: new Date().toISOString()
      }

      await repairOrderService.updateRepairOrderStatus(orderId, updateData)
      
      // Show success toast
      toast({
        variant: "success",
        title: "Repair Order Updated",
        description: "The repair order has been successfully updated.",
      })
      
      onSuccess?.()
      onOpenChange(false)
    } catch (err) {
      console.error("Failed to update repair order:", err)
      const errorMessage = "Failed to update repair order. Please try again."
      setError(errorMessage)
      
      // Show error toast
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: errorMessage,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Repair Order</DialogTitle>
        </DialogHeader>

        {isLoadingData ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
            <span className="ml-2 text-gray-500">Loading...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
                {error}
              </div>
            )}

            {/* Status Selection */}
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={statusId}
                onValueChange={(value) => setStatusId(value)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status.orderStatusId} value={status.orderStatusId}>
                      {status.statusName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Note */}
            <div className="space-y-2">
              <Label htmlFor="note">Note</Label>
              <Textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note for this repair order..."
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-gray-500">
                {note.length}/500 characters
              </p>
            </div>

            {/* Services Selection */}
            <div className="space-y-2">
              <Label>Services *</Label>
              <div className="border rounded-md p-4 max-h-64 overflow-y-auto space-y-3">
                {services.length === 0 ? (
                  <p className="text-sm text-gray-500">No services available</p>
                ) : (
                  services.map((service) => (
                    <div key={service.serviceId} className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id={`service-${service.serviceId}`}
                        checked={selectedServiceIds.includes(service.serviceId)}
                        onChange={() => handleServiceToggle(service.serviceId)}
                        className="mt-1 h-4 w-4 rounded border-gray-300"
                      />
                      <div className="flex-1">
                        <label
                          htmlFor={`service-${service.serviceId}`}
                          className="text-sm font-medium cursor-pointer"
                        >
                          {service.serviceName}
                        </label>
                        {service.description && (
                          <p className="text-xs text-gray-500 mt-1">
                            {service.description}
                          </p>
                        )}
                        <p className="text-xs text-gray-600 mt-1">
                          ${service.price.toFixed(2)} • {service.estimatedDuration} min
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <p className="text-xs text-gray-500">
                {selectedServiceIds.length} service(s) selected
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || isLoadingData}
            className="text-white"
            style={{ backgroundColor: "#154c79" }}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Repair Order"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
