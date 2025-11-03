// src/app/customer/quotations/page.tsx
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  RefreshCw
} from "lucide-react"
import { quotationService } from "@/services/manager/quotation-service"
import { QuotationDto } from "@/types/manager/quotation"
import { CustomerQuotationDetails } from "./components"

export default function CustomerQuotationsPage() {
  const [quotations, setQuotations] = useState<QuotationDto[]>([])
  const [selectedQuotation, setSelectedQuotation] = useState<QuotationDto | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)

  useEffect(() => {
    loadQuotations()
  }, [])

  const loadQuotations = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await quotationService.getQuotationsForUser()
      setQuotations(data)
    } catch (err) {
      setError("Failed to load quotations")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async (quotationId: string) => {
    try {
      setIsApproving(true)
      const updatedQuotation = await quotationService.processCustomerResponse(quotationId, 'approve')
      // Update the quotation in the list
      setQuotations(prev => prev.map(q => q.quotationId === quotationId ? updatedQuotation : q))
      // If we're viewing this quotation, update it there too
      if (selectedQuotation?.quotationId === quotationId) {
        setSelectedQuotation(updatedQuotation)
      }
    } catch (err) {
      setError("Failed to approve quotation")
      console.error(err)
    } finally {
      setIsApproving(false)
    }
  }

  const handleReject = async (quotationId: string) => {
    try {
      setIsRejecting(true)
      const updatedQuotation = await quotationService.processCustomerResponse(quotationId, 'reject')
      // Update the quotation in the list
      setQuotations(prev => prev.map(q => q.quotationId === quotationId ? updatedQuotation : q))
      // If we're viewing this quotation, update it there too
      if (selectedQuotation?.quotationId === quotationId) {
        setSelectedQuotation(updatedQuotation)
      }
    } catch (err) {
      setError("Failed to reject quotation")
      console.error(err)
    } finally {
      setIsRejecting(false)
    }
  }

  const getStatusBadge = (status: QuotationDto["status"]) => {
    switch (status) {
      case "Pending":
        return <span className="inline-block rounded-full px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>
      case "Sent to Customer":
        return <span className="inline-block rounded-full px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800">Sent</span>
      case "Approved by Customer":
        return <span className="inline-block rounded-full px-3 py-1 text-xs font-medium bg-green-100 text-green-800">Approved</span>
      case "Rejected by Customer":
        return <span className="inline-block rounded-full px-3 py-1 text-xs font-medium bg-red-100 text-red-800">Rejected</span>
      case "Expired":
        return <span className="inline-block rounded-full px-3 py-1 text-xs font-medium bg-gray-100 text-gray-800">Expired</span>
      default:
        return <span className="inline-block rounded-full px-3 py-1 text-xs font-medium bg-gray-100 text-gray-800">Unknown</span>
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Quotations</h1>
        <p className="text-gray-600">Review and manage your service quotations</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 text-red-700 p-3 rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quotations List */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Quotations</CardTitle>
            <Button variant="outline" size="sm" onClick={loadQuotations} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-4">Loading quotations...</div>
            ) : quotations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No quotations found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {quotations.map((quotation) => (
                  <div 
                    key={quotation.quotationId} 
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedQuotation?.quotationId === quotation.quotationId 
                        ? 'border-primary bg-primary/5' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedQuotation(quotation)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">Quotation #{quotation.quotationId.slice(0, 8)}</h3>
                        <p className="text-sm text-gray-500">
                          {new Date(quotation.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {getStatusBadge(quotation.status)}
                    </div>
                    <div className="mt-2 flex justify-between items-center">
                      <span className="text-lg font-semibold">${quotation.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quotation Details */}
        <div className="lg:col-span-2">
          {selectedQuotation ? (
            <CustomerQuotationDetails 
              quotation={selectedQuotation}
              onApprove={handleApprove}
              onReject={handleReject}
              isApproving={isApproving}
              isRejecting={isRejecting}
            />
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-full min-h-[400px]">
                <div className="text-center">
                  <p className="text-gray-500">Select a quotation to view details</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}