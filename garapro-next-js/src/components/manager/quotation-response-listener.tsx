"use client"

import { useEffect } from "react"
import { useQuotationHub } from "@/hooks/use-quotation-hub"
import { QuotationCustomerResponseEvent } from "@/services/manager/quotation-hub-service"
import { useToast } from "@/hooks/use-toast"
import { authService } from "@/services/authService"

export function QuotationResponseListener() {
  const { toast } = useToast()
  
  // Get current user ID for SignalR group joining
  const currentUserId = authService.getCurrentUserId()
  
  const handleCustomerResponse = (event: QuotationCustomerResponseEvent) => {
    console.log("Manager received customer response:", event)
    
    // Show notification based on response
    if (event.status === "Approved") {
      toast({
        title: "Quotation Approved! 🎉",
        description: `${event.customerName} approved quotation #${event.quotationId.substring(0, 8)}. You can now convert it to jobs.`,
        duration: 8000,
      })
    } else if (event.status === "Rejected") {
      toast({
        title: "Quotation Rejected",
        description: `${event.customerName} rejected quotation #${event.quotationId.substring(0, 8)}. ${event.customerNote || ""}`,
        variant: "destructive",
        duration: 8000,
      })
    }
  }

  // Initialize quotation hub connection for managers
  const { isConnected } = useQuotationHub({
    userId: currentUserId || undefined,
    isManager: true,
    onCustomerResponse: handleCustomerResponse,
    autoConnect: true
  })

  useEffect(() => {
    if (isConnected) {
      console.log("✅ Manager is now listening for customer quotation responses")
      console.log("Manager User ID:", currentUserId)
    }
  }, [isConnected, currentUserId])

  // This component doesn't render anything visible
  return null
}