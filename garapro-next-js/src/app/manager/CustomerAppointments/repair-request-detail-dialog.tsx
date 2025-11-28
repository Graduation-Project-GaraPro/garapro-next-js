"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Clock,
  User,
  Car,
  Wrench,
  DollarSign,
  Calendar,
  CheckCircle,
  Image as ImageIcon,
  Package,
  FileText,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { ManagerRepairRequest } from "@/types/manager/repair-request"
import { repairRequestService } from "@/services/manager/appointmentService"

interface RepairRequestDetailDialogProps {
  requestId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RepairRequestDetailDialog({
  requestId,
  open,
  onOpenChange,
}: RepairRequestDetailDialogProps) {
  const [repairRequest, setRepairRequest] = useState<ManagerRepairRequest | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isCancelling, setIsCancelling] = useState(false)
  const [isConverting, setIsConverting] = useState(false)
  const [conversionData, setConversionData] = useState({
    note: "",
    selectedServiceIds: [] as string[],
  })
  const [showConversionForm, setShowConversionForm] = useState(false)

  useEffect(() => {
    if (open && requestId) {
      fetchRepairRequestDetails()
    } else {
      setRepairRequest(null)
      setError(null)
      setShowConversionForm(false) // Reset form when dialog closes
    }
  }, [open, requestId])

  const fetchRepairRequestDetails = async () => {
    if (!requestId) return

    try {
      setIsLoading(true)
      setError(null)
      const data = await repairRequestService.getRepairRequestById(requestId)
      if (data) {
        setRepairRequest(data)
      } else {
        setError("Repair request not found")
      }
    } catch (err) {
      console.error("Failed to fetch repair request details:", err)
      setError("Failed to load repair request details")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!repairRequest) return;
    
    try {
      setIsCancelling(true);
      const success = await repairRequestService.cancelRepairRequest(repairRequest.requestID);
      
      if (success) {
        // Update the local state to reflect the cancellation
        setRepairRequest(prev => prev ? {...prev, status: "cancelled"} : null);
        // You might want to show a success message here
      } else {
        // Handle failure (e.g., show error message)
        console.error("Failed to cancel repair request");
      }
    } catch (err) {
      console.error("Failed to cancel repair request:", err);
      // Handle error appropriately (e.g., show toast notification)
    } finally {
      setIsCancelling(false);
    }
  };

  const handleConvertToRepairOrder = async () => {
    if (!repairRequest) return;
    
    // If we haven't shown the form yet, show it to collect data
    if (!showConversionForm) {
      // Pre-select all services by default
      const serviceIds = repairRequest.services?.map(s => s.serviceId) || [];
      setConversionData(prev => ({
        ...prev,
        selectedServiceIds: serviceIds
      }));
      setShowConversionForm(true);
      return;
    }
    
    try {
      setIsConverting(true);
      const success = await repairRequestService.convertToRepairOrder(repairRequest.requestID, conversionData);
      
      if (success) {
        // Show success message or handle success case
        console.log("Repair request converted to repair order:", repairRequest.requestID);
        // You might want to show a toast notification or close the dialog
        setShowConversionForm(false);
        onOpenChange(false); // Close the dialog after successful conversion
      } else {
        // Handle failure
        console.error("Failed to convert repair request to repair order");
      }
    } catch (err) {
      console.error("Failed to convert repair request to repair order:", err);
      // Handle error appropriately (e.g., show toast notification)
    } finally {
      setIsConverting(false);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-500/20 text-blue-700 border-blue-600"
      case "pending":
        return "bg-yellow-500/20 text-yellow-700 border-yellow-600"
      case "in-progress":
        return "bg-green-500/20 text-green-700 border-green-600"
      case "completed":
        return "bg-gray-500/20 text-gray-700 border-gray-600"
      case "cancelled":
        return "bg-red-500/20 text-red-700 border-red-600"
      case "accept":
        return "bg-purple-500/20 text-purple-700 border-purple-600"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getStatusText = (status?: string) => {
    switch (status) {
      case "confirmed":
        return "Confirmed"
      case "pending":
        return "Pending"
      case "in-progress":
        return "In Progress"
      case "completed":
        return "Completed"
      case "cancelled":
        return "Cancelled"
      case "accept":
        return "Accepted"
      default:
        return "Unknown"
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return dateString
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Repair Request Details</DialogTitle>
          <DialogDescription>
            View detailed information about this repair request
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-muted-foreground">Loading repair request details...</div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center py-12">
            <div className="text-destructive">{error}</div>
          </div>
        )}

        {!isLoading && !error && repairRequest && (
          <div className="space-y-6">
            {/* Status Badge */}
            <div className="flex items-center justify-between">
              <Badge className={cn("border", getStatusColor(repairRequest.status))}>
                {getStatusText(repairRequest.status)}
              </Badge>
              {repairRequest.isCompleted && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Completed</span>
                </div>
              )}
            </div>

            {/* Basic Information */}
            <Card className="p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Basic Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm text-muted-foreground">Customer</div>
                    <div className="font-medium">
                      {repairRequest.customerName || "Unknown Customer"}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex items-start gap-3">
                  <Car className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm text-muted-foreground">Vehicle</div>
                    <div className="font-medium">{repairRequest.vehicleInfo}</div>
                  </div>
                </div>

                <Separator />

                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm text-muted-foreground">Request Time</div>
                    <div className="font-medium">
                      {repairRequest.time && repairRequest.date
                        ? `${repairRequest.date} at ${repairRequest.time}`
                        : formatDate(repairRequest.requestDate)}
                    </div>
                    {repairRequest.arrivalWindowStart && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Arrival Window: {formatDate(repairRequest.arrivalWindowStart)}
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm text-muted-foreground">Request Date</div>
                    <div className="font-medium">{formatDate(repairRequest.requestDate)}</div>
                  </div>
                </div>

                {repairRequest.completedDate && (
                  <>
                    <Separator />
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <div className="text-sm text-muted-foreground">Completed Date</div>
                        <div className="font-medium">{formatDate(repairRequest.completedDate)}</div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </Card>

            {/* Description */}
            {repairRequest.description && (
              <Card className="p-4">
                <h3 className="font-semibold mb-3">Description</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {repairRequest.description}
                </p>
              </Card>
            )}

            {/* Services */}
            {repairRequest.services && repairRequest.services.length > 0 && (
              <Card className="p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Wrench className="h-4 w-4" />
                  Services ({repairRequest.services.length})
                </h3>
                <div className="space-y-4">
                  {repairRequest.services.map((service, index) => (
                    <div key={service.requestServiceId || index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{service.serviceName}</div>
                        <div className="text-sm font-semibold">
                          {formatCurrency(service.serviceFee)}
                        </div>
                      </div>
                      {service.requestParts && service.requestParts.length > 0 && (
                        <div className="ml-4 space-y-1">
                          <div className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                            <Package className="h-3 w-3" />
                            Parts:
                          </div>
                          {service.requestParts.map((part, partIndex) => (
                            <div
                              key={part.requestPartId || partIndex}
                              className="flex items-center justify-between text-xs ml-4"
                            >
                              <span className="text-muted-foreground">{part.partName}</span>
                              <span className="font-medium">
                                {formatCurrency(part.unitPrice)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      {index < repairRequest.services.length - 1 && <Separator />}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Standalone Parts */}
            {repairRequest.parts && repairRequest.parts.length > 0 && (
              <Card className="p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Parts ({repairRequest.parts.length})
                </h3>
                <div className="space-y-2">
                  {repairRequest.parts.map((part, index) => (
                    <div
                      key={part.requestPartId || index}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm">{part.partName}</span>
                      <span className="text-sm font-semibold">
                        {formatCurrency(part.unitPrice)}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Estimated Cost */}
            {repairRequest.estimatedCost !== undefined && repairRequest.estimatedCost > 0 && (
              <Card className="p-4 bg-primary/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <span className="font-semibold">Estimated Total Cost</span>
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    {formatCurrency(repairRequest.estimatedCost)}
                  </div>
                </div>
              </Card>
            )}

            {/* Images */}
            {repairRequest.imageUrls && repairRequest.imageUrls.length > 0 && (
              <Card className="p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Images ({repairRequest.imageUrls.length})
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {repairRequest.imageUrls.map((url, index) => (
                    <div key={index} className="relative aspect-video rounded-md overflow-hidden">
                      <img
                        src={url}
                        alt={`Repair request image ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = "none"
                        }}
                      />
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Metadata */}
            <Card className="p-4 bg-muted/50">
              <h3 className="font-semibold mb-3 text-sm">Metadata</h3>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Request ID:</span>
                  <span className="font-mono">{repairRequest.requestID}</span>
                </div>
                <div className="flex justify-between">
                  <span>Vehicle ID:</span>
                  <span className="font-mono">{repairRequest.vehicleID}</span>
                </div>
                <div className="flex justify-between">
                  <span>Customer ID:</span>
                  <span className="font-mono">{repairRequest.customerID}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between">
                  <span>Created At:</span>
                  <span>{formatDate(repairRequest.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Updated At:</span>
                  <span>{formatDate(repairRequest.updatedAt)}</span>
                </div>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              {repairRequest?.status !== "completed" && repairRequest?.status !== "cancelled" && !showConversionForm && (
                <Button 
                  variant="destructive" 
                  className="flex-1"
                  onClick={handleCancel}
                  disabled={isCancelling}
                >
                  {isCancelling ? "Cancelling..." : "Cancel Request"}
                </Button>
              )}
              {repairRequest?.status === "accept" && !showConversionForm && (
                <Button 
                  variant="default" 
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  onClick={handleConvertToRepairOrder}
                  disabled={isConverting}
                >
                  {isConverting ? "Converting..." : "Convert to Repair Order"}
                </Button>
              )}
              {repairRequest?.status === "accept" && showConversionForm && (
                <div className="w-full space-y-4">
                  <Card className="p-4">
                    <h3 className="font-semibold mb-3">Convert to Repair Order</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="note">Note</Label>
                        <Textarea
                          id="note"
                          value={conversionData.note}
                          onChange={(e) => setConversionData(prev => ({
                            ...prev,
                            note: e.target.value
                          }))}
                          placeholder="Enter any notes for this repair order (optional)"
                        />
                      </div>
                      
                      {repairRequest.services && repairRequest.services.length > 0 ? (
                        <div>
                          <Label>Services</Label>
                          <div className="space-y-2 mt-2">
                            {repairRequest.services.map((service) => (
                              <div 
                                key={service.requestServiceId}
                                className={cn(
                                  "flex items-center justify-between p-2 rounded border cursor-pointer",
                                  conversionData.selectedServiceIds.includes(service.serviceId) 
                                    ? "bg-blue-50 border-blue-500" 
                                    : "bg-white border-gray-200"
                                )}
                                onClick={() => {
                                  const selected = [...conversionData.selectedServiceIds];
                                  if (selected.includes(service.serviceId)) {
                                    setConversionData(prev => ({
                                      ...prev,
                                      selectedServiceIds: selected.filter(id => id !== service.serviceId)
                                    }));
                                  } else {
                                    setConversionData(prev => ({
                                      ...prev,
                                      selectedServiceIds: [...selected, service.serviceId]
                                    }));
                                  }
                                }}
                              >
                                <div>
                                  <div className="font-medium">{service.serviceName}</div>
                                  <div className="text-sm text-gray-500">
                                    {formatCurrency(service.serviceFee)}
                                  </div>
                                </div>
                                <div className="flex items-center">
                                  <div className={cn(
                                    "w-4 h-4 rounded-full border",
                                    conversionData.selectedServiceIds.includes(service.serviceId) 
                                      ? "bg-blue-500 border-blue-500" 
                                      : "border-gray-300"
                                  )}>
                                    {conversionData.selectedServiceIds.includes(service.serviceId) && (
                                      <CheckCircle className="w-4 h-4 text-white" />
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          No services available for this repair request. You can still convert to a repair order with just a note.
                        </div>
                      )}
                    </div>
                  </Card>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="default" 
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      onClick={handleConvertToRepairOrder}
                      disabled={isConverting}
                    >
                      {isConverting ? "Converting..." : "Confirm Conversion"}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setShowConversionForm(false)}
                      disabled={isConverting}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
              {!showConversionForm && (
                <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
                  Close
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}



