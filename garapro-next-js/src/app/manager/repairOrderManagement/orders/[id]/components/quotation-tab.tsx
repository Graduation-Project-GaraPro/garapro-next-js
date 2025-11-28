"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Plus,
  RefreshCw,
  Send,
  Briefcase,
  Loader2
} from "lucide-react"
import { toast } from "sonner"
import { CreateQuotationDialog } from "@/app/manager/components/Quote"
import QuotePreviewDialog from "@/app/manager/components/Quote/QuotePreviewDialog"
import { quotationService } from "@/services/manager/quotation-service"
import { QuotationDto } from "@/types/manager/quotation"
import { useEffect } from "react"

interface QuotationTabProps {
  orderId: string
}

export default function QuotationTab({ orderId }: QuotationTabProps) {
  const [quotations, setQuotations] = useState<QuotationDto[]>([])
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [selectedQuotationId, setSelectedQuotationId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    let pollingInterval: NodeJS.Timeout | null = null;
    
    // Load initial quotations
    loadQuotations();
    
    // Set up polling for updates
    pollingInterval = setInterval(loadQuotations, 30000); // Poll every 30 seconds

    // Cleanup function
    return () => {
      // Clear polling interval if it exists
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [orderId]);

  const loadQuotations = async () => {
    try {
      setIsLoading(true);
      const data = await quotationService.getQuotationsByRepairOrderId(orderId);
      setQuotations(data);
    } catch (err) {
      setError("Failed to load quotations");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuotationCreated = () => {
    loadQuotations();
  };

  const handleViewQuotation = (quotationId: string) => {
    setSelectedQuotationId(quotationId);
    setIsPreviewOpen(true);
  };
  
  const handleSendToCustomer = async (quotationId: string) => {
    setActionLoading(quotationId);
    try {
      await quotationService.updateQuotationStatus(quotationId, "Sent");
      toast.success("Quotation sent to customer successfully");
      loadQuotations();
    } catch (err: any) {
      console.error("Failed to send quotation:", err);
      toast.error(err.message || "Failed to send quotation to customer");
    } finally {
      setActionLoading(null);
    }
  };
  
  const handleCopyToJobs = async (quotationId: string) => {
    setActionLoading(quotationId);
    try {
      await quotationService.copyQuotationToJobs(quotationId);
      toast.success("Jobs created from quotation successfully");
      loadQuotations();
    } catch (err: any) {
      console.error("Failed to copy quotation to jobs:", err);
      toast.error(err.message || "Failed to create jobs from quotation");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    // Normalize status to lowercase for comparison
    const normalizedStatus = status.toLowerCase();
    
    // Define status colors to match quote preview
    const statusColors = {
      pending: "bg-yellow-100 text-yellow-800",
      sent: "bg-blue-100 text-blue-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      expired: "bg-gray-100 text-gray-800",
    };
    
    // Display text for each status
    const statusDisplayText = {
      pending: "Pending",
      sent: "Sent",
      approved: "Approved",
      rejected: "Rejected",
      expired: "Expired",
    };
    
    // Determine the status key for lookup
    let statusKey: keyof typeof statusColors = "pending";
    
    if (normalizedStatus.includes("pending")) {
      statusKey = "pending";
    } else if (normalizedStatus.includes("sent")) {
      statusKey = "sent";
    } else if (normalizedStatus.includes("approved")) {
      statusKey = "approved";
    } else if (normalizedStatus.includes("rejected")) {
      statusKey = "rejected";
    } else if (normalizedStatus.includes("expired")) {
      statusKey = "expired";
    }
    
    return (
      <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${statusColors[statusKey]}`}>
        {statusDisplayText[statusKey]}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quotations</h1>
          <p className="text-sm text-gray-600 mt-1">
            Create quotations manually or convert from completed inspections
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={loadQuotations} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setIsCreateFormOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Quotation
          </Button>
        </div>
      </div>

      {/* Quotations List */}
      <Card>
        <CardHeader>
          <CardTitle>Quotations</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
              {error}
            </div>
          )}
          
          {isLoading ? (
            <div className="text-center py-4">Loading quotations...</div>
          ) : quotations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="mb-2">No quotations yet</p>
              <p className="text-sm">Create a quotation manually or convert from a completed inspection</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900">Total Amount</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Creation Date</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {quotations.map((q) => (
                    <tr key={q.quotationId} className="border-t">
                      <td className="py-3 px-4">
                        {getStatusBadge(q.status)}
                      </td>
                      <td className="py-3 px-4 text-right">${q.totalAmount.toFixed(2)}</td>
                      <td className="py-3 px-4">{new Date(q.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewQuotation(q.quotationId)}
                          >
                            View
                          </Button>
                          
                          {/* Send to Customer button - only for Pending quotations */}
                          {q.status.toLowerCase() === "pending" && (
                            <Button 
                              variant="default"
                              size="sm"
                              onClick={() => handleSendToCustomer(q.quotationId)}
                              disabled={actionLoading === q.quotationId}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              {actionLoading === q.quotationId ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <Send className="h-4 w-4 mr-2" />
                                  Send to Customer
                                </>
                              )}
                            </Button>
                          )}
                          
                          {/* Copy to Jobs button - only for Approved quotations */}
                          {q.status.toLowerCase() === "approved" && (
                            <Button 
                              variant="default"
                              size="sm"
                              onClick={() => handleCopyToJobs(q.quotationId)}
                              disabled={actionLoading === q.quotationId}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {actionLoading === q.quotationId ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <Briefcase className="h-4 w-4 mr-2" />
                                  Copy to Jobs
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Quotation Dialog */}
      <CreateQuotationDialog
        open={isCreateFormOpen}
        onOpenChange={setIsCreateFormOpen}
        onSubmit={() => {
          // The quotation has already been created by the CreateQuotationDialog component
          // Just handle the UI updates here
          handleQuotationCreated();
          setIsCreateFormOpen(false);
        }}
        roData={{
          roNumber: orderId,
          customerName: "John Doe", // This would come from the RO data
          customerPhone: "+1234567890", // This would come from the RO data
          vehicleInfo: "2023 Toyota Camry", // This would come from the RO data
          dateCreated: new Date().toISOString().split('T')[0]
        }}
      />

      {/* Quote Preview Dialog */}
      {selectedQuotationId && (
        <QuotePreviewDialog
          open={isPreviewOpen}
          onOpenChange={setIsPreviewOpen}
          quotationId={selectedQuotationId}
        />
      )}
    </div>
  )
}