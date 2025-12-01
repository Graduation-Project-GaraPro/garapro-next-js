// src/app/manager/repairOrderManagement/orders/[id]/components/quotation-details-view.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Printer, 
  Mail, 
  Download,
  Send,
  Check,
  X,
  ChevronDown,
  ChevronRight,
  FileSearch
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { quotationService } from "@/services/manager/quotation-service";
import { QuotationDto } from "@/types/manager/quotation";

interface QuotationDetailsViewProps {
  quotation: QuotationDto;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onQuotationUpdated: (quotation: QuotationDto) => void;
  onViewInspection?: (inspectionId: string) => void;
}

export default function QuotationDetailsView({ 
  quotation, 
  open, 
  onOpenChange,
  onQuotationUpdated,
  onViewInspection
}: QuotationDetailsViewProps) {
  const router = useRouter();
  const [expandedServices, setExpandedServices] = useState<Record<string, boolean>>({});
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleServiceExpansion = (serviceId: string) => {
    setExpandedServices(prev => ({
      ...prev,
      [serviceId]: !prev[serviceId]
    }));
  };

  const handleApprove = async () => {
    try {
      setIsApproving(true);
      const updatedQuotation = await quotationService.processCustomerResponse(quotation.quotationId, 'approve');
      onQuotationUpdated(updatedQuotation);
    } catch (err) {
      setError("Failed to approve quotation");
      console.error(err);
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    try {
      setIsRejecting(true);
      const updatedQuotation = await quotationService.processCustomerResponse(quotation.quotationId, 'reject');
      onQuotationUpdated(updatedQuotation);
    } catch (err) {
      setError("Failed to reject quotation");
      console.error(err);
    } finally {
      setIsRejecting(false);
    }
  };

  const handleViewInspection = () => {
    if (quotation.inspectionId) {
      // Close the dialog
      onOpenChange(false);
      
      // Small delay to ensure dialog closes smoothly before navigation
      setTimeout(() => {
        // If callback is provided, use it (for parent component control)
        if (onViewInspection) {
          onViewInspection(quotation.inspectionId);
        } else {
          // Otherwise, navigate directly with query params
          router.push(`/manager/repairOrderManagement/orders/${quotation.repairOrderId}?tab=inspections&highlightInspection=${quotation.inspectionId}`);
        }
      }, 100);
    }
  };

  const getStatusBadge = (status: QuotationDto["status"]) => {
    switch (status) {
      case "Pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "Sent":
        return <Badge className="bg-blue-500">Sent</Badge>;
      case "Approved":
        return <Badge className="bg-green-500">Approved</Badge>;
      case "Rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      case "Expired":
        return <Badge variant="destructive">Expired</Badge>;
      case "Good":
        return <Badge className="bg-green-600">✓ All Good</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Quotation Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md">
              {error}
            </div>
          )}
          
          {/* Header Information */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Quotation #{quotation.quotationId}</CardTitle>
                <div className="flex items-center gap-2">
                  {quotation.inspectionId && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleViewInspection}
                      className="flex items-center gap-2"
                    >
                      <FileSearch className="w-4 h-4" />
                      View Source Inspection
                    </Button>
                  )}
                  {getStatusBadge(quotation.status)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            </CardContent>
          </Card>
          
          {/* Good Status Message */}
          {quotation.status === "Good" && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-green-700">
                  <Check className="w-5 h-5" />
                  <p className="font-medium">All services in good condition - No repairs needed</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Services and Parts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Services & Parts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {quotation.quotationServices.map(service => (
                <div 
                  key={service.quotationServiceId} 
                  className={`border rounded-lg ${service.isGood ? 'bg-green-50 border-green-200' : ''}`}
                >
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center space-x-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className={`font-medium ${service.isGood ? 'text-green-700' : ''}`}>
                            {service.serviceName}
                          </h3>
                          {service.isGood && (
                            <Badge className="bg-green-600">✓ Good Condition</Badge>
                          )}
                          {!service.isGood && service.isRequired && (
                            <Badge variant="destructive">⚠️ Required</Badge>
                          )}
                          {!service.isGood && !service.isRequired && (
                            <Badge variant="secondary">Optional</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      {service.isGood ? (
                        <span className="text-sm text-green-600 font-medium">No repair needed</span>
                      ) : (
                        <>
                          <span className="font-medium">${service.price.toFixed(2)}</span>
                          <span className="text-sm text-gray-500">Qty: {service.quantity}</span>
                        </>
                      )}
                      
                      {service.parts && service.parts.length > 0 && (
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
                  
                  {expandedServices[service.quotationServiceId] && service.parts && service.parts.length > 0 && (
                    <div className="border-t p-4 bg-gray-50">
                      <h4 className="font-medium mb-3">Parts</h4>
                      <div className="space-y-3">
                        {service.parts.map(part => (
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
            </CardContent>
          </Card>
          
          {/* Financial Summary */}
          {quotation.status !== "Good" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Financial Summary</CardTitle>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          )}
          
          {/* Notes */}
          {quotation.note && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{quotation.note}</p>
              </CardContent>
            </Card>
          )}
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Send className="w-4 h-4 mr-2" />
                  Send
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <Mail className="w-4 h-4 mr-2" />
                  Send via Email
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Printer className="w-4 h-4 mr-2" />
                  Print Quotation
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {quotation.status === "Sent" && (
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="destructive" 
                onClick={handleReject}
                disabled={isRejecting}
              >
                {isRejecting ? "Rejecting..." : <><X className="w-4 h-4 mr-2" /> Reject</>}
              </Button>
              <Button 
                onClick={handleApprove}
                disabled={isApproving}
              >
                {isApproving ? "Approving..." : <><Check className="w-4 h-4 mr-2" /> Approve</>}
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}