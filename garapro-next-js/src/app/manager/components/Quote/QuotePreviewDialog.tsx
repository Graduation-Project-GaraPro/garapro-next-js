"use client"

import { useState, useEffect } from "react"
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
    
    return quotation.quotationServices.map((service) => ({
      id: stringIdToNumber(service.quotationServiceId),
      name: service.serviceName,
      price: service.totalPrice,
      isRequired: service.isRequired, // Add isRequired property
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
    
    try {
      // Update the quotation status to "Sent"
      const updatedQuotation = await quotationService.updateQuotationStatus(
        quotation.quotationId, 
        "Sent"
      );
      
      // Update the local state with the updated quotation
      setQuotation(updatedQuotation);
      
      // Show success message
      alert(`Quote ${quotation.quotationId} has been sent to the customer and status updated to Sent`);
    } catch (error) {
      console.error("Failed to send quotation:", error);
      alert("Failed to send quotation. Please try again.");
    }
  }

  const handleDelete = () => {
    if (!quotation) return
    
    if (confirm("Are you sure you want to delete this quote?")) {
      // In a real implementation, you would call an API to delete the quote
      alert("Quote deleted")
      onOpenChange(false)
    }
  }

  const handleDownloadPDF = () => {
    if (!quotation) return
    
    // In a real implementation, you would generate and download a PDF
    alert(`Downloading quote ${quotation.quotationId} as PDF`)
  }

  const handleCopyToJobs = async () => {
    if (!quotation) return
    
    try {
      // Call the API to copy quotation to jobs
      await quotationService.copyQuotationToJobs(quotation.quotationId);
      
      // Show success message
      alert(`Quote ${quotation.quotationId} has been copied to jobs successfully`);
    } catch (error) {
      console.error("Failed to copy quotation to jobs:", error);
      alert("Failed to copy quotation to jobs. Please try again.");
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
          <DialogTitle>Quote Preview</DialogTitle>
        </DialogHeader>
        <div className="space-y-8 p-6 overflow-y-auto h-[calc(100%-4rem)]">
          <QuoteHeader quote={quoteHeaderData} />

          <QuoteInfo quote={quoteInfoData} />

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
                  <span className="text-muted-foreground">Total Parts:</span>
                  <span className="font-medium text-card-foreground">
                    {quotation.quotationServices.reduce((sum, service) => sum + (service.parts ? service.parts.length : 0), 0)}
                  </span>
                </div>
                <div className="border-t border-border pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-card-foreground">Total Amount:</span>
                    <span className="text-2xl font-bold text-primary">${totalPrice.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <ManagerNotes note={managerNote} onNoteChange={setManagerNote} />
          </div>

          <QuoteActions 
            onSend={handleSend} 
            onDelete={handleDelete} 
            onDownloadPDF={handleDownloadPDF}
            onCopyToJobs={handleCopyToJobs} // Add copy to jobs handler
            isApproved={quotation?.status === "Approved"} // Check if quotation is approved
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}