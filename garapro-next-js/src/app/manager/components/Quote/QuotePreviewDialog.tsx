"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import QuoteHeader from "./quotePreview/quoteHeader"
import QuoteInfo from "./quotePreview/quoteInfo"
import ServicesTable from "./quotePreview/servicesTable"
import ManagerNotes from "./quotePreview/managerNotes"
import QuoteActions from "./quotePreview/quoteActions"
import { quotationService } from "@/services/manager/quotation-service"
import { QuotationDto } from "@/types/manager/quotation"
import { Button } from "@/components/ui/button"
import { FileSearch } from "lucide-react"
import { formatVND } from "@/lib/currency"

// Helper function to convert string ID to number
const stringIdToNumber = (id: string): number => {
  // Simple hash function to convert string to number
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    const char = id.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash)
}

interface QuotePreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  quotationId: string
}

export default function QuotePreviewDialog({ open, onOpenChange, quotationId }: QuotePreviewDialogProps) {
  const router = useRouter()
  const [quotation, setQuotation] = useState<QuotationDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [managerNote, setManagerNote] = useState("")

  // Fetch quotation data
  useEffect(() => {
    const fetchQuotation = async () => {
      if (!quotationId) {
        setError("No quotation ID provided")
        setLoading(false)
        return
      }
      
      try {
        setLoading(true)
        const data = await quotationService.getQuotationById(quotationId)
        setQuotation(data)
        setManagerNote(data.note || "")
      } catch (err) {
        console.error("Failed to fetch quotation:", err)
        setError("Failed to load quotation")
      } finally {
        setLoading(false)
      }
    }

    if (open) {
      fetchQuotation()
    }
  }, [quotationId, open])

  // Transform quotation data to match component interfaces
  const getQuoteHeaderData = () => {
    if (!quotation) return { id: "", date: "", status: "" }
    
    return {
      id: quotation.quotationId,
      date: quotation.createdAt,
      status: quotation.status,
    }
  }

  const getQuoteInfoData = () => {
    if (!quotation) return { customerName: "", customerEmail: "", customerPhone: "" }
    
    return {
      customerName: quotation.customerName,
      customerEmail: "", // Not available in current quotation data
      customerPhone: "", // Not available in current quotation data
    }
  }

  const getServicesData = () => {
    if (!quotation) return []
    
    // Calculate inspection fee per good service
    const goodServicesCount = quotation.quotationServices.filter(s => s.isGood).length
    const inspectionFeePerService = goodServicesCount > 0 ? quotation.inspectionFee / goodServicesCount : 0
    
    return quotation.quotationServices.map((service) => ({
      id: stringIdToNumber(service.quotationServiceId),
      name: service.serviceName,
      price: service.totalPrice,
      isRequired: service.isRequired, // Add isRequired property
      isGood: service.isGood, // ✅ NEW - Add isGood property
      inspectionFee: service.isGood ? inspectionFeePerService : 0, // ✅ NEW - Split inspection fee among good services
      parts: service.parts ? service.parts.map((part) => ({
        id: stringIdToNumber(part.quotationServicePartId),
        name: part.partName,
        quantity: part.quantity,
        unitPrice: part.price,
      })) : [],
    }))
  }

  const totalPrice = quotation?.totalAmount || 0

  const handleSend = async () => {
    if (!quotation) return
    
    const loadingToast = toast.loading("Sending quotation to customer...");
    
    try {
      // Update the quotation status to "Sent"
      const updatedQuotation = await quotationService.updateQuotationStatus(
        quotation.quotationId, 
        "Sent"
      );
      
      // Update the local state with the updated quotation
      setQuotation(updatedQuotation);
      
      // Dismiss loading and show success
      toast.dismiss(loadingToast);
      toast.success("Quotation sent successfully!", {
        description: `Quote #${quotation.quotationId.slice(0, 8)} has been sent to the customer.`,
        duration: 4000,
      });
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Failed to send quotation", {
        description: error instanceof Error ? error.message : "Please try again.",
        duration: 5000,
      });
      console.error("Failed to send quotation:", error);
    }
  }

  const handleDelete = () => {
    if (!quotation) return
    
    if (confirm("Are you sure you want to delete this quote?")) {
      // In a real implementation, you would call an API to delete the quote
      toast.success("Quote deleted successfully");
      onOpenChange(false);
    }
  }

  const handleDownloadPDF = () => {
    if (!quotation) return
    
    // In a real implementation, you would generate and download a PDF
    alert(`Downloading quote ${quotation.quotationId} as PDF`)
  }

  const handleCopyToJobs = async () => {
    if (!quotation) return
    
    // Check if jobs were already created
    if (quotation.jobsCreated) {
      toast.error("Jobs Already Created", {
        description: `Jobs were already created from this quotation on ${new Date(quotation.jobsCreatedAt || '').toLocaleDateString()}`,
        duration: 5000,
      });
      return;
    }
    
    // Show loading toast
    const loadingToast = toast.loading("Converting quotation to jobs...");
    
    try {
      // Call the API to copy quotation to jobs
      await quotationService.copyQuotationToJobs(quotation.quotationId);
      
      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success("Quotation converted to jobs successfully!", {
        description: `Quote #${quotation.quotationId.slice(0, 8)} has been added to the jobs list.`,
        duration: 4000,
      });
      
      // Update local state to reflect jobs created
      setQuotation({
        ...quotation,
        jobsCreated: true,
        jobsCreatedAt: new Date().toISOString()
      });
      
      // Close dialog after successful conversion
      setTimeout(() => {
        onOpenChange(false);
      }, 1000);
    } catch (error: any) {
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      
      // Extract error message from the error object
      let errorMessage = "Failed to convert quotation to jobs. Please try again.";
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      // Check if it's a duplicate service error
      const isDuplicateServiceError = errorMessage.toLowerCase().includes("already exist") || 
                                      errorMessage.toLowerCase().includes("duplicate");
      
      // Show error toast with specific message
      toast.error(isDuplicateServiceError ? "Duplicate Services Detected" : "Conversion Failed", {
        description: errorMessage,
        duration: isDuplicateServiceError ? 8000 : 5000, // Longer duration for duplicate errors
      });
      
      console.error("Failed to copy quotation to jobs:", error);
    }
  }

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent 
          className="max-w-6xl w-3/5 h-5/6 sm:max-w-6xl overflow-hidden p-0"
        >
          <DialogHeader className="p-6">
            <DialogTitle>Quote Preview</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8 px-6">
            <p>Loading quotation...</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (error || !quotation) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent 
          className="max-w-6xl w-3/5 h-5/6 sm:max-w-6xl overflow-hidden p-0"
        >
          <DialogHeader className="p-6">
            <DialogTitle>Quote Preview</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8 px-6">
            <p className="text-red-500">{error || "Quotation not found"}</p>
            <Button onClick={() => onOpenChange(false)} className="mt-4">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const quoteHeaderData = getQuoteHeaderData()
  const quoteInfoData = getQuoteInfoData()
  const servicesData = getServicesData()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-6xl w-3/5 h-5/6 sm:max-w-6xl overflow-hidden p-0"
      >
        <DialogHeader className="p-6">
          <div className="flex items-center justify-between">
            <DialogTitle>Quote Preview</DialogTitle>
            {quotation.inspectionId && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  onOpenChange(false)
                  // Small delay to ensure dialog closes smoothly before navigation
                  setTimeout(() => {
                    router.push(`/manager/repairOrderManagement/orders/${quotation.repairOrderId}?tab=inspections&highlightInspection=${quotation.inspectionId}`)
                  }, 100)
                }}
                className="flex items-center gap-2"
              >
                <FileSearch className="w-4 h-4" />
                View Source Inspection
              </Button>
            )}
          </div>
        </DialogHeader>
        <div className="space-y-8 p-6 overflow-y-auto h-[calc(100%-4rem)]">
          <QuoteHeader quote={quoteHeaderData} />

          <QuoteInfo quote={quoteInfoData} />

          {/* Good Status Message */}
          {quotation.status === "Good" && (
            <div className="rounded-lg border-2 border-green-200 bg-green-50 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-600 text-white">
                  ✓
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-800">All Services in Good Condition</h3>
                  <p className="text-sm text-green-700 mt-1">
                    No repairs needed at this time. This is an informational quotation only.
                  </p>
                </div>
              </div>
            </div>
          )}

          <ServicesTable services={servicesData} />

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="text-lg font-semibold text-card-foreground">Quote Summary</h3>
              <div className="mt-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Services:</span>
                  <span className="font-medium text-card-foreground">{quotation.quotationServices.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Good Condition Services:</span>
                  <span className="font-medium text-green-600">
                    {quotation.quotationServices.filter(s => s.isGood).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Parts:</span>
                  <span className="font-medium text-card-foreground">
                    {quotation.quotationServices.reduce((sum, service) => sum + (service.parts ? service.parts.length : 0), 0)}
                  </span>
                </div>
                {quotation.inspectionFee > 0 && (
                  <div className="flex justify-between border-t border-border pt-3">
                    <span className="text-muted-foreground">Inspection Fee:</span>
                    <span className="font-medium text-green-600">{formatVND(quotation.inspectionFee)}</span>
                  </div>
                )}
                <div className="border-t border-border pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-card-foreground">Total Amount:</span>
                    <span className="text-2xl font-bold text-primary">{formatVND(totalPrice)}</span>
                  </div>
                </div>
              </div>
            </div>

            <ManagerNotes note={managerNote} onNoteChange={setManagerNote} />
          </div>

          {/* Hide actions for Good status quotations */}
          {quotation.status !== "Good" && (
            <QuoteActions 
              onSend={handleSend} 
              onDelete={handleDelete} 
              onDownloadPDF={handleDownloadPDF}
              onCopyToJobs={handleCopyToJobs} // Add copy to jobs handler
              isApproved={quotation?.status === "Approved"} // Check if quotation is approved
              jobsCreated={quotation?.jobsCreated || false} // Pass jobs created flag
              jobsCreatedAt={quotation?.jobsCreatedAt || null} // Pass jobs created timestamp
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}