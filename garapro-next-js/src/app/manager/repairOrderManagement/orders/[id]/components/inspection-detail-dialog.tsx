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
import { inspectionService, InspectionDto } from "@/services/manager/inspection-service"
import { serviceCatalog, GarageServiceCatalogItem, Part } from "@/services/service-catalog"
import { formatVND } from "@/lib/currency"

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
  const [services, setServices] = useState<GarageServiceCatalogItem[]>([])
  const [parts, setParts] = useState<Record<string, Part[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [converting, setConverting] = useState(false)
  const [conversionError, setConversionError] = useState<string | null>(null)

  useEffect(() => {
    if (open && inspectionId) {
      loadInspectionDetails()
    }
  }, [open, inspectionId])

  const loadInspectionDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch inspection details
      const inspectionData = await inspectionService.getInspectionById(inspectionId!)
      setInspection(inspectionData)
      
      // Use services from the inspection data
      if (inspectionData.services) {
        // Convert inspection services to the format expected by the UI
        const inspectionServices = inspectionData.services.map(service => ({
          serviceId: service.serviceId,
          serviceCategoryId: '', // This might need to be fetched separately if needed
          serviceName: service.serviceName,
          description: service.description,
          price: service.price,
          estimatedDuration: service.estimatedDuration,
          isActive: true,
          isAdvanced: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }));
        setServices(inspectionServices);
        
        // Convert parts data to the format expected by the UI
        const partsData: Record<string, Part[]> = {};
        inspectionData.services.forEach(service => {
          partsData[service.serviceId] = service.parts.map(part => ({
            partId: part.partId,
            name: part.name,
            price: part.price,
            stock: 0 // This might need to be fetched separately if needed
          }));
        });
        setParts(partsData);
      } else {
        // Fallback to generic inspection services if none are provided
        const inspectionServices = await inspectionService.getInspectionServices();
        setServices(inspectionServices);
        
        // Load parts for each service
        const partsData: Record<string, Part[]> = {};
        for (const service of inspectionServices) {
          const serviceParts = await serviceCatalog.getPartsByServiceId(service.serviceId);
          partsData[service.serviceId] = serviceParts;
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

  const convertToQuote = async () => {
    if (!inspectionId) return

    try {
      setConverting(true)
      setConversionError(null)
      
      // Call the API to convert inspection to quotation
      // Use the backend API URL instead of the Next.js API route
      const backendApiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://localhost:7113';
      const response = await fetch(`${backendApiUrl}/api/Inspection/convert-to-quotation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Include authorization header if needed
          // 'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          inspectionId: inspectionId,
          note: 'Converted from inspection'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to convert inspection to quote')
      }

      // Handle successful conversion
      const result = await response.json()
      console.log('Successfully converted to quote:', result)
      
      // Show success toast message
      toast.success('Inspection successfully converted to quotation!', {
        description: `Quotation ${result.quotationId} has been created.`,
        duration: 5000,
      });
      
      // Close the dialog after successful conversion
      onOpenChange(false)
      
      // You might want to show a success message or redirect to the quote
      // For now, we'll just close the dialog
    } catch (err) {
      console.error('Failed to convert inspection to quote:', err)
      setConversionError('Failed to convert inspection to quote. Please try again.')
      
      // Show error toast message
      toast.error('Failed to convert inspection to quotation', {
        description: 'Please try again or contact support if the problem persists.',
        duration: 5000,
      });
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
                  <p className="text-sm text-gray-500">Inspection ID</p>
                  <p className="font-medium">{inspection.inspectionId}</p>
                </div>
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
              
              {/* Convert to Quote Button - only show for completed inspections */}
              {inspection.status.toLowerCase() === "completed" && (
                <div className="pt-4 border-t border-gray-200">
                  <Button 
                    onClick={convertToQuote}
                    disabled={converting}
                    className="w-full"
                  >
                    {converting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Converting...
                      </>
                    ) : (
                      "CONVERT TO QUOTE"
                    )}
                  </Button>
                  {conversionError && (
                    <p className="text-red-500 text-sm mt-2 text-center">{conversionError}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          
         
         
          
          {/* Services and Parts */}
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
                          <div>
                            <h3 className="font-medium">{service.serviceName}</h3>
                            <p className="text-sm text-gray-500 mt-1">{service.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatVND(service.price || 0)}</p>
                            <p className="text-sm text-gray-500">
                              Est. {service.estimatedDuration} min
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {parts[service.serviceId] && parts[service.serviceId].length > 0 && (
                        <div className="p-4 bg-gray-50">
                          <h4 className="font-medium text-sm mb-2">Parts</h4>
                          <div className="space-y-2">
                            {parts[service.serviceId].map((part) => (
                              <div key={part.partId} className="flex justify-between text-sm">
                                <div>
                                  <span>{part.name}</span>
                                  {/* Display quantity if available and greater than 1 */}
                                  {isInspectionPartWithDetails(part) && part.quantity > 1 && (
                                    <span className="text-gray-500 ml-2">(x{part.quantity})</span>
                                  )}
                                </div>
                                <div className="text-right">
                                  {/* Display total price if available, otherwise show unit price */}
                                  {isInspectionPartWithDetails(part) && part.totalPrice ? (
                                    <span>{formatVND(part.totalPrice)}</span>
                                  ) : (
                                    <span>{formatVND(part.price || 0)}</span>
                                  )}
                                  {/* Show unit price breakdown if total price differs from unit price */}
                                  {isInspectionPartWithDetails(part) && part.totalPrice && part.price !== part.totalPrice && (
                                    <div className="text-gray-500 text-xs">
                                      ({formatVND(part.price || 0)} each)
                                    </div>
                                  )}
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
        </div>
      </DialogContent>
    </Dialog>
  )
}