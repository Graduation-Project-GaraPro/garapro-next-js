// src/app/manager/repairOrderManagement/orders/[id]/components/inspection-detail-dialog.tsx
"use client"

import { useState, useEffect } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { 
  Calendar, 
  Clock, 
  Wrench, 
  Package,
  Image as ImageIcon,
  AlertCircle
} from "lucide-react"
import { inspectionService, InspectionDto, InspectionServiceDto } from "@/services/manager/inspection-service"
import { serviceCatalog, Part } from "@/services/service-catalog"
import { ConditionStatus } from "@/types/manager/inspection"
import { quotationService } from "@/services/manager/quotation-service"

interface InspectionDetailDialogProps {
  inspectionId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Type guard to check if part has quantity and totalPrice properties
interface InspectionPartWithDetails extends Part {
  quantity: number;
  totalPrice: number;
}

function isInspectionPartWithDetails(part: Part): part is InspectionPartWithDetails {
  return 'quantity' in part && 'totalPrice' in part;
}

export function InspectionDetailDialog({ 
  inspectionId, 
  open, 
  onOpenChange 
}: InspectionDetailDialogProps) {
  const [inspection, setInspection] = useState<InspectionDto | null>(null)
  const [services, setServices] = useState<InspectionServiceDto[]>([])
  const [parts, setParts] = useState<Record<string, Array<{ partId: string; name: string; quantity: number; status?: string | null }>>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [converting, setConverting] = useState(false)
  const [conversionError, setConversionError] = useState<string | null>(null)
  const [hasQuotation, setHasQuotation] = useState(false)
  const [checkingQuotation, setCheckingQuotation] = useState(false)

  useEffect(() => {
    if (open && inspectionId) {
      loadInspectionDetails()
    }
  }, [open, inspectionId])

  const checkQuotationStatus = async (inspectionId: string) => {
    try {
      setCheckingQuotation(true)
      const quotations = await quotationService.getQuotationsByInspectionId(inspectionId)
      setHasQuotation(quotations.length > 0)
    } catch (error) {
      console.error("Failed to check quotation status:", error)
      // Don't set error state for this, just assume no quotation exists
      setHasQuotation(false)
    } finally {
      setCheckingQuotation(false)
    }
  }

  const loadInspectionDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch inspection details
      const inspectionData = await inspectionService.getInspectionById(inspectionId!)
      setInspection(inspectionData)
      
      // Check if inspection has already been converted to quotation
      await checkQuotationStatus(inspectionId!)
      
      // Use services from the inspection data directly
      if (inspectionData.services && inspectionData.services.length > 0) {
        // Log the services data to debug conditionStatus
        console.log('Inspection services data:', inspectionData.services);
        
        // Store services as-is with their inspection-specific fields
        setServices(inspectionData.services);
        
        // Convert parts data to the format expected by the UI
        const partsData: Record<string, any[]> = {};
        inspectionData.services.forEach(service => {
          console.log(`Service ${service.serviceId} conditionStatus:`, service.conditionStatus);
          if (service.parts && service.parts.length > 0) {
            partsData[service.serviceId] = service.parts.map(part => ({
              partId: part.partId,
              name: part.partName,
              quantity: part.quantity,
              status: part.status
            }));
          }
        });
        setParts(partsData);
      } else {
        // Fallback to generic inspection services if none are provided
        const inspectionServices = await inspectionService.getInspectionServices();
        
        // Convert to InspectionServiceDto format with default conditionStatus
        const convertedServices: InspectionServiceDto[] = inspectionServices.map(service => ({
          serviceInspectionId: service.serviceId,
          serviceId: service.serviceId,
          serviceName: service.serviceName,
          conditionStatus: 0, // Default to Good
          createdAt: new Date().toISOString(),
          description: service.description,
          price: service.price,
          estimatedDuration: service.estimatedDuration,
          parts: []
        }));
        
        setServices(convertedServices);
        
        // Load parts for each service
        const partsData: Record<string, Array<{ partId: string; name: string; quantity: number; status?: string | null }>> = {};
        for (const service of inspectionServices) {
          const serviceParts = await serviceCatalog.getPartsByServiceId(service.serviceId);
          partsData[service.serviceId] = serviceParts.map(part => ({
            partId: part.partId,
            name: part.name,
            quantity: 1, // Default quantity
            status: null
          }));
        }
        setParts(partsData);
      }
    } catch (err) {
      console.error("Failed to load inspection details:", err)
      setError("Failed to load inspection details. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const getStatusDisplayName = (status: string): string => {
    switch (status.toLowerCase()) {
      case "new":
        return "New"
      case "pending":
        return "Pending"
      case "inprogress":
        return "In Progress"
      case "completed":
        return "Completed"
      default:
        return status
    }
  }

  const getStatusBadgeClass = (status: string): string => {
    switch (status.toLowerCase()) {
      case "new":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "inprogress":
        return "bg-purple-100 text-purple-800"
      case "completed":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getConditionStatusName = (status: number | undefined | null): string => {
    if (status === undefined || status === null) return "Not Assessed"
    
    switch (status) {
      case ConditionStatus.Good:
        return "Good"
      case ConditionStatus.Needs_Attention:
        return "Needs Attention"
      case ConditionStatus.Replace:
        return "Replace"
      default:
        return "Unknown"
    }
  }

  const getConditionStatusBadge = (status: number | undefined | null): string => {
    if (status === undefined || status === null) return "bg-gray-100 text-gray-800"
    
    switch (status) {
      case ConditionStatus.Good:
        return "bg-green-100 text-green-800"
      case ConditionStatus.Needs_Attention:
        return "bg-yellow-100 text-yellow-800"
      case ConditionStatus.Replace:
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const convertToQuote = async () => {
    if (!inspectionId) return

    try {
      setConverting(true)
      setConversionError(null)
      
      // Use the quotation service to convert inspection
      await quotationService.convertInspectionToQuotation(inspectionId)
      
      // Show success toast message
      toast.success('Inspection converted to quotation successfully')
      
      // Update quotation status to hide the button
      setHasQuotation(true)
      
      // Optionally close the dialog after successful conversion
      // onOpenChange(false)
    } catch (err: any) {
      console.error('Failed to convert inspection to quote:', err)
      const errorMessage = err?.message || 'Failed to convert inspection to quotation'
      setConversionError(errorMessage)
      
      // Show error toast message
      toast.error(errorMessage)
    } finally {
      setConverting(false)
    }
  }

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="sr-only">Loading Inspection Details</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (error) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inspection Details</DialogTitle>
          </DialogHeader>
          <div className="py-8 text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
            <p className="text-red-500">{error}</p>
            <Button onClick={loadInspectionDetails} className="mt-4">
              Retry
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!inspection) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inspection Details</DialogTitle>
          </DialogHeader>
          <div className="py-8 text-center">
            <p className="text-gray-500">Inspection not found</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto w-[90vw]" style={{ maxWidth: '1200px' }}>
        <DialogHeader>
          <DialogTitle>Inspection Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Inspection Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Wrench className="w-5 h-5" />
                Inspection Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge className={getStatusBadgeClass(inspection.status)}>
                    {getStatusDisplayName(inspection.status)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Created At</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>{new Date(inspection.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span>
                      {inspection.updatedAt 
                        ? new Date(inspection.updatedAt).toLocaleDateString() 
                        : "Never"}
                    </span>
                  </div>
                </div>
              </div>
              
              {inspection.technicianName && (
                <div>
                  <p className="text-sm text-gray-500">Assigned Technician</p>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-medium text-sm">
                      {inspection.technicianName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                    </div>
                    <span className="font-medium">{inspection.technicianName}</span>
                  </div>
                </div>
              )}
              
              {inspection.customerConcern && (
                <div>
                  <p className="text-sm text-gray-500">Customer Concern</p>
                  <p className="bg-gray-50 p-3 rounded-md">{inspection.customerConcern}</p>
                </div>
              )}
              
              {inspection.finding && (
                <div>
                  <p className="text-sm text-gray-500">Findings</p>
                  <p className="bg-gray-50 p-3 rounded-md">{inspection.finding}</p>
                </div>
              )}
              
              {/* Convert to Quote Button - only show for completed inspections that haven't been converted yet */}
              {inspection.status.toLowerCase() === "completed" && !hasQuotation && (
                <div className="pt-4 border-t border-gray-200">
                  <Button 
                    onClick={convertToQuote}
                    disabled={converting || checkingQuotation}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {converting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Converting...
                      </>
                    ) : checkingQuotation ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Checking...
                      </>
                    ) : (
                      "Convert to Quotation"
                    )}
                  </Button>
                  {conversionError && (
                    <p className="text-red-500 text-sm mt-2 text-center">{conversionError}</p>
                  )}
                </div>
              )}
              
              {/* Show message when inspection has already been converted */}
              {inspection.status.toLowerCase() === "completed" && hasQuotation && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-center">
                    <p className="text-blue-800 font-medium">✓ Already Converted to Quotation</p>
                    <p className="text-blue-600 text-sm mt-1">This inspection has been converted to a quotation.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
         
         
          
          {/* Services and Parts - Only show for InProgress or Completed inspections */}
          {(inspection.status.toLowerCase() === "inprogress" || inspection.status.toLowerCase() === "completed") && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Services & Parts
                </CardTitle>
              </CardHeader>
              <CardContent>
                {services.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No services found for this inspection</p>
                ) : (
                  <div className="space-y-4">
                    {services.map((service) => (
                      <div key={service.serviceId} className="border rounded-lg">
                        <div className="p-4 border-b">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="font-medium">{service.serviceName}</h3>
                              {service.description && (
                                <p className="text-sm text-gray-500 mt-1">{service.description}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <Badge className={getConditionStatusBadge(service.conditionStatus)}>
                                {getConditionStatusName(service.conditionStatus)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        {parts[service.serviceId] && parts[service.serviceId].length > 0 && (
                          <div className="p-4 bg-gray-50">
                            <h4 className="font-medium text-sm mb-2">Parts</h4>
                            <div className="space-y-2">
                              {parts[service.serviceId].map((part) => (
                                <div key={part.partId} className="flex justify-between text-sm">
                                  <div className="flex-1">
                                    <span>{part.name}</span>
                                    <span className="text-gray-500 ml-2">Qty: {part.quantity}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          
          {/* Empty state for pending/new inspections */}
          {(inspection.status.toLowerCase() === "pending" || inspection.status.toLowerCase() === "new") && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Services & Parts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-500 font-medium">Inspection Not Started</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Services and parts will be available once the technician starts working on this inspection.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}