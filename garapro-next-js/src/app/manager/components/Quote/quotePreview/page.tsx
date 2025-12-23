"use client"

import { useState, useEffect } from "react"
import QuoteHeader from "./quoteHeader"
import QuoteInfo from "./quoteInfo"
import ServicesTable from "./servicesTable"
import CustomerNotes from "./customerNotes"
import QuoteActions from "./quoteActions"
import { quotationService } from "@/services/manager/quotation-service"
import { QuotationDto } from "@/types/manager/quotation"
import { Button } from "@/components/ui/button"
import { useRouter, useSearchParams } from "next/navigation"
import { Check, X, Eye } from "lucide-react"
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

export default function QuotePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const quotationId = searchParams.get('id')
  
  const [quotation, setQuotation] = useState<QuotationDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
      date: quotation.createdAt || new Date().toISOString(),
      status: quotation.status,
    }
  }

  const getQuoteInfoData = () => {
    if (!quotation) return { customerName: "" }
    
    return {
      customerName: quotation.customerName,
      // Only include customerPhone if it's available and not empty
      // Currently not available in QuotationDto
    }
  }

  const getServicesData = () => {
    if (!quotation) return []
    
    return quotation.quotationServices.map((service) => ({
      id: stringIdToNumber(service.quotationServiceId),
      name: service.serviceName,
      price: service.totalPrice,
      isRequired: service.isRequired,
      isGood: service.isGood,
      isSelected: service.isSelected, // Add customer selection status
      inspectionFee: quotation.inspectionFee || undefined, // Convert null to undefined
      parts: service.parts.map((part: any) => ({
        id: stringIdToNumber(part.quotationServicePartId),
        name: part.partName,
        quantity: part.quantity,
        unitPrice: part.price,
        isSelected: part.isSelected, // Add customer selection status for parts
        isRecommended: part.isRecommended, // Add recommendation status
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
      alert("Quote deleted")
      router.back()
    }
  }

  const handleDownloadPDF = () => {
    if (!quotation) return
    
    alert(`Downloading quote ${quotation.quotationId} as PDF`)
  }

  const handleCopyToJobs = async () => {
    if (!quotation) return
    
    // Check if jobs were already created
    if (quotation.jobsCreated) {
      alert(`Jobs were already created from this quotation on ${new Date(quotation.jobsCreatedAt || '').toLocaleDateString()}`)
      return;
    }
    
    try {
      // Call the API to copy quotation to jobs
      await quotationService.copyQuotationToJobs(quotation.quotationId);
      
      // Update local state to reflect jobs created
      setQuotation({
        ...quotation,
        jobsCreated: true,
        jobsCreatedAt: new Date().toISOString()
      });
      
      alert(`Quote ${quotation.quotationId} converted to jobs successfully`)
    } catch (error: any) {
      console.error("Failed to copy quotation to jobs:", error)
      alert("Failed to convert quotation to jobs. Please try again.")
    }
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

          <ServicesTable 
            services={servicesData} 
            showCustomerChoices={true}
            quotationStatus={quotation.status as "Pending" | "Sent" | "Approved" | "Rejected" | "Expired" | "Good"}
          />

          {/* Customer Response Summary - Only show after customer has responded */}
          {(quotation.status === "Approved" || quotation.status === "Rejected") && (
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="text-lg font-semibold text-card-foreground mb-4">
                Customer Response Summary
              </h3>
              
              <div className="grid gap-6 md:grid-cols-2">
                {/* Selected Items */}
                <div className="space-y-4">
                  <h4 className="font-medium text-green-700 flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    Selected by Customer
                  </h4>
                  
                  {/* Selected Services */}
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium text-gray-700">Services:</h5>
                    {servicesData.filter(s => s.isSelected && !s.isGood).length > 0 ? (
                      <ul className="space-y-1 text-sm">
                        {servicesData.filter(s => s.isSelected && !s.isGood).map(service => (
                          <li key={service.id} className="flex items-center gap-2 text-green-700">
                            <Check className="w-3 h-3" />
                            {service.name} - {formatVND(service.price)}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">No services selected</p>
                    )}
                  </div>

                  {/* Selected Parts */}
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium text-gray-700">Parts:</h5>
                    {servicesData.some(s => s.parts.some(p => p.isSelected)) ? (
                      <ul className="space-y-1 text-sm">
                        {servicesData.flatMap(service => 
                          service.parts.filter(part => part.isSelected).map(part => (
                            <li key={part.id} className="flex items-center gap-2 text-green-700">
                              <Check className="w-3 h-3" />
                              {part.name} (Qty: {part.quantity}) - {formatVND(part.unitPrice * part.quantity)}
                            </li>
                          ))
                        )}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">No parts selected</p>
                    )}
                  </div>
                </div>

                {/* Declined Items */}
                <div className="space-y-4">
                  <h4 className="font-medium text-red-700 flex items-center gap-2">
                    <X className="w-4 h-4" />
                    Declined by Customer
                  </h4>
                  
                  {/* Declined Services */}
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium text-gray-700">Services:</h5>
                    {servicesData.filter(s => !s.isSelected && !s.isGood && !s.isRequired).length > 0 ? (
                      <ul className="space-y-1 text-sm">
                        {servicesData.filter(s => !s.isSelected && !s.isGood && !s.isRequired).map(service => (
                          <li key={service.id} className="flex items-center gap-2 text-red-700">
                            <X className="w-3 h-3" />
                            {service.name} - {formatVND(service.price)}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">No optional services declined</p>
                    )}
                  </div>

                  {/* Declined Parts */}
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium text-gray-700">Parts:</h5>
                    {servicesData.some(s => s.parts.some(p => !p.isSelected)) ? (
                      <ul className="space-y-1 text-sm">
                        {servicesData.flatMap(service => 
                          service.parts.filter(part => !part.isSelected).map(part => (
                            <li key={part.id} className="flex items-center gap-2 text-red-700">
                              <X className="w-3 h-3" />
                              {part.name} (Qty: {part.quantity}) - {formatVND(part.unitPrice * part.quantity)}
                            </li>
                          ))
                        )}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">No parts declined</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Good Condition Items */}
              {servicesData.filter(s => s.isGood).length > 0 && (
                <div className="mt-6 pt-4 border-t border-border">
                  <h4 className="font-medium text-green-700 flex items-center gap-2 mb-3">
                    <Eye className="w-4 h-4" />
                    Items in Good Condition (No Repair Needed)
                  </h4>
                  <ul className="space-y-1 text-sm">
                    {servicesData.filter(s => s.isGood).map(service => (
                      <li key={service.id} className="flex items-center gap-2 text-green-700">
                        <Eye className="w-3 h-3" />
                        {service.name}
                        {service.inspectionFee && service.inspectionFee > 0 && (
                          <span className="text-gray-600">- Inspection Fee: {formatVND(service.inspectionFee)}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Customer Response Date */}
              {quotation.customerResponseAt && (
                <div className="mt-4 pt-4 border-t border-border text-sm text-gray-600">
                  Customer responded on: {new Date(quotation.customerResponseAt).toLocaleString()}
                </div>
              )}
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="text-lg font-semibold text-card-foreground">Quote Summary</h3>
              <div className="mt-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Services:</span>
                  <span className="font-medium text-card-foreground">{quotation.quotationServices.length}</span>
                </div>
                <div className="border-t border-border pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-card-foreground">Amount:</span>
                    <span className="text-2xl font-bold text-primary">${totalPrice.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <CustomerNotes 
              customerNote={quotation.customerNote} 
              customerResponseAt={quotation.customerResponseAt}
            />
          </div>

          <QuoteActions 
            onSend={handleSend} 
            onDelete={handleDelete} 
            onDownloadPDF={handleDownloadPDF}
            onCopyToJobs={handleCopyToJobs}
            isApproved={quotation.status === "Approved"}
            jobsCreated={quotation.jobsCreated || false}
            jobsCreatedAt={quotation.jobsCreatedAt || null}
            quoteSent={quotation.status === "Sent" || quotation.sentToCustomerAt !== null}
            sentAt={quotation.sentToCustomerAt}
            status={quotation.status as "Pending" | "Sent" | "Approved" | "Rejected" | "Expired" | "Good"}
          />
        </div>
      </div>
    </main>
  )
}