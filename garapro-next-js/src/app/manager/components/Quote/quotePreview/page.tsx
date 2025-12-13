"use client"

import { useState, useEffect } from "react"
import QuoteHeader from "./quoteHeader"
import QuoteInfo from "./quoteInfo"
import ServicesTable from "./servicesTable"
import ManagerNotes from "./managerNotes"
import QuoteActions from "./quoteActions"
import { quotationService } from "@/services/manager/quotation-service"
import { QuotationDto } from "@/types/manager/quotation"
import { Button } from "@/components/ui/button"
import { useRouter, useSearchParams } from "next/navigation"

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

export default function QuotePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const quotationId = searchParams.get('id')
  
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

    fetchQuotation()
  }, [quotationId])

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
      parts: service.parts.map((part: any) => ({
        id: stringIdToNumber(part.quotationServicePartId),
        name: part.partName,
        quantity: part.quantity,
        unitPrice: part.price,
      })),
    }))
  }

  const totalPrice = quotation?.totalAmount || 0

  const handleSend = async () => {
    if (!quotation) return
    
    try {
      // Update quotation status to "Sent"
      await quotationService.updateQuotationStatus(quotation.quotationId, "Sent")
      
      // Refresh quotation data to get updated status
      const updatedQuotation = await quotationService.getQuotationById(quotation.quotationId)
      setQuotation(updatedQuotation)
      
      alert(`Quote ${quotation.quotationId} sent to customer`)
    } catch (err) {
      console.error("Failed to send quote:", err)
      alert("Failed to send quote. Please try again.")
    }
  }

  const handleDelete = () => {
    if (!quotation) return
    
    if (confirm("Are you sure you want to delete this quote?")) {
      // In a real implementation, you would call an API to delete the quote
      alert("Quote deleted")
      router.back()
    }
  }

  const handleDownloadPDF = () => {
    if (!quotation) return
    
    // In a real implementation, you would generate and download a PDF
    alert(`Downloading quote ${quotation.quotationId} as PDF`)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center py-8">
            <p>Loading quotation...</p>
          </div>
        </div>
      </main>
    )
  }

  if (error || !quotation) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center py-8">
            <p className="text-red-500">{error || "Quotation not found"}</p>
            <Button onClick={() => router.back()} className="mt-4">
              Go Back
            </Button>
          </div>
        </div>
      </main>
    )
  }

  const quoteHeaderData = getQuoteHeaderData()
  const quoteInfoData = getQuoteInfoData()
  const servicesData = getServicesData()

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <QuoteHeader quote={quoteHeaderData} />

        <div className="mt-8 space-y-8">
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
                    {quotation.quotationServices.reduce((sum, service) => sum + service.parts.length, 0)}
                  </span>
                </div>
                <div className="border-t border-border pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-card-foreground">Amount:</span>
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
            isApproved={quotation.status === "Approved"}
            quoteSent={quotation.status === "Sent" || quotation.sentToCustomerAt !== null}
            sentAt={quotation.sentToCustomerAt}
            status={quotation.status as "Pending" | "Sent" | "Approved" | "Rejected" | "Expired" | "Good"}
          />
        </div>
      </div>
    </main>
  )
}