// src/app/customer/quotations/components/CustomerQuotationDetails.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Check,
  X,
  ChevronDown,
  ChevronRight,
  Lock
} from "lucide-react"
import { QuotationDto } from "@/types/manager/quotation"

interface CustomerQuotationDetailsProps {
  quotation: QuotationDto
  onApprove: (quotationId: string) => void
  onReject: (quotationId: string) => void
  isApproving: boolean
  isRejecting: boolean
}

export default function CustomerQuotationDetails({ 
  quotation, 
  onApprove, 
  onReject,
  isApproving,
  isRejecting
}: CustomerQuotationDetailsProps) {
  const [expandedServices, setExpandedServices] = useState<Record<string, boolean>>({})

  const toggleServiceExpansion = (serviceId: string) => {
    setExpandedServices(prev => ({
      ...prev,
      [serviceId]: !prev[serviceId]
    }))
  }

  const getStatusBadge = (status: QuotationDto["status"]) => {
    switch (status) {
      case "Pending":
        return <Badge variant="secondary">Pending</Badge>
      case "Sent to Customer":
        return <Badge className="bg-blue-500">Sent</Badge>
      case "Approved by Customer":
        return <Badge className="bg-green-500">Approved</Badge>
      case "Rejected by Customer":
        return <Badge variant="destructive">Rejected</Badge>
      case "Expired":
        return <Badge variant="destructive">Expired</Badge>
      default:
        return <Badge variant="secondary">Pending</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Quotation Details</CardTitle>
          {getStatusBadge(quotation.status)}
        </div>
        <p className="text-sm text-gray-500">#{quotation.quotationId}</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Header Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Created Date</p>
            <p className="font-medium">{new Date(quotation.createdAt).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Expires At</p>
            <p className="font-medium">
              {quotation.expiresAt 
                ? new Date(quotation.expiresAt).toLocaleDateString() 
                : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Customer</p>
            <p className="font-medium">{quotation.customerName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Vehicle</p>
            <p className="font-medium">{quotation.vehicleInfo || "Vehicle information not available"}</p>
          </div>
        </div>
        
        {/* Services and Parts */}
        <div>
          <h3 className="text-md font-semibold mb-3">Services</h3>
          <div className="space-y-3">
            {quotation.quotationServices.map(service => (
              <div key={service.quotationServiceId} className="border rounded-lg">
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center space-x-3">
                    <div>
                      <h3 className="font-medium flex items-center">
                        {service.serviceName}
                        {service.isRequired && (
                          <Lock className="w-4 h-4 ml-2 text-red-500" />
                        )}
                      </h3>
                      {service.isRequired && (
                        <Badge variant="destructive" className="mt-1">Required</Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className="font-medium">${service.price.toFixed(2)}</span>
                    <span className="text-sm text-gray-500">Qty: {service.quantity}</span>
                    
                    {service.quotationServiceParts.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleServiceExpansion(service.quotationServiceId)}
                      >
                        {expandedServices[service.quotationServiceId] ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
                
                {expandedServices[service.quotationServiceId] && service.quotationServiceParts.length > 0 && (
                  <div className="border-t p-4 bg-gray-50">
                    <h4 className="font-medium mb-3">Parts</h4>
                    <div className="space-y-3">
                      {service.quotationServiceParts.map(part => (
                        <div key={part.quotationServicePartId} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div>
                              <h5 className="text-sm font-medium">{part.partName}</h5>
                              {part.recommendationNote && (
                                <p className="text-xs text-gray-500">
                                  Note: {part.recommendationNote}
                                </p>
                              )}
                              {part.isRecommended && (
                                <Badge variant="secondary" className="mt-1">Recommended</Badge>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-500">Qty: {part.quantity}</span>
                            <span className="text-sm font-medium">${part.price.toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Financial Summary */}
        <div>
          <h3 className="text-md font-semibold mb-3">Financial Summary</h3>
          <div className="space-y-2 max-w-xs ml-auto">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${quotation.totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Discount:</span>
              <span>${quotation.discountAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg border-t pt-2">
              <span>Total:</span>
              <span>
                ${(quotation.totalAmount - quotation.discountAmount).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
        
        {/* Notes */}
        {quotation.note && (
          <div>
            <h3 className="text-md font-semibold mb-3">Notes</h3>
            <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded-md">{quotation.note}</p>
          </div>
        )}
        
        {/* Action Buttons */}
        {quotation.status === "Sent to Customer" && (
          <div className="flex flex-wrap gap-2 pt-4 border-t">
            <Button 
              variant="destructive" 
              onClick={() => onReject(quotation.quotationId)}
              disabled={isRejecting}
              className="flex-1"
            >
              {isRejecting ? "Rejecting..." : <><X className="w-4 h-4 mr-2" /> Reject</>}
            </Button>
            <Button 
              onClick={() => onApprove(quotation.quotationId)}
              disabled={isApproving}
              className="flex-1"
            >
              {isApproving ? "Approving..." : <><Check className="w-4 h-4 mr-2" /> Approve</>}
            </Button>
          </div>
        )}
        
        {quotation.status === "Approved by Customer" && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 text-center">
            <p className="text-green-800 font-medium">This quotation has been approved</p>
            <p className="text-green-600 text-sm mt-1">Our team will contact you shortly to schedule the services.</p>
          </div>
        )}
        
        {quotation.status === "Rejected by Customer" && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 text-center">
            <p className="text-red-800 font-medium">This quotation has been rejected</p>
            <p className="text-red-600 text-sm mt-1">If you have any questions, please contact our support team.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}