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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2, AlertCircle } from "lucide-react"
import { inspectionService } from "@/services/manager/inspection-service"
import type { GarageServiceCatalogItem } from "@/services/service-catalog"

interface CreateInspectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  repairOrderId: string
  onInspectionCreated: () => void
}

export function CreateInspectionDialog({ 
  open, 
  onOpenChange, 
  repairOrderId,
  onInspectionCreated
}: CreateInspectionDialogProps) {
  const [services, setServices] = useState<GarageServiceCatalogItem[]>([])
  const [selectedServiceId, setSelectedServiceId] = useState<string>("")
  const [customerConcern, setCustomerConcern] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Load inspection services when dialog opens
  useEffect(() => {
    if (open) {
      loadInspectionServices()
      resetForm()
    }
  }, [open])

  const loadInspectionServices = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Load only inspection services
      const serviceData = await inspectionService.getInspectionServices()
      setServices(serviceData)
    } catch (err) {
      console.error("Failed to load inspection services:", err)
      setError("Failed to load inspection services")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setSelectedServiceId("")
    setCustomerConcern("")
    setError(null)
  }

  const handleSubmit = async () => {
    if (!customerConcern.trim()) {
      setError("Please enter customer concern")
      return
    }

    try {
      setSubmitting(true)
      setError(null)
      
      // Create inspection
      await inspectionService.createInspection({
        repairOrderId,
        customerConcern
      })
      
      // Reset form and close dialog
      resetForm()
      onInspectionCreated()
      onOpenChange(false)
    } catch (err) {
      console.error("Failed to create inspection:", err)
      setError("Failed to create inspection. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Inspection</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-center text-red-700">
              <AlertCircle className="h-4 w-4 mr-2" />
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="service">Inspection Type</Label>
            <Select 
              value={selectedServiceId} 
              onValueChange={setSelectedServiceId}
              disabled={loading || submitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an inspection type" />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service.serviceId} value={service.serviceId}>
                    {service.serviceName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500">Select the type of inspection to perform</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="concern">Customer Concern *</Label>
            <Textarea
              id="concern"
              value={customerConcern}
              onChange={(e) => setCustomerConcern(e.target.value)}
              placeholder="Describe the customer's concern..."
              disabled={submitting}
              rows={4}
            />
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