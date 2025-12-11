"use client"

import { useEffect, useCallback } from "react"
import { useQuotationHub } from "./use-quotation-hub"
import { QuotationUpdatedEvent } from "@/services/manager/quotation-hub-service"

interface UseQuotationUpdatesOptions {
  quotationId?: string
  onQuotationUpdated?: (event: QuotationUpdatedEvent) => void
  autoConnect?: boolean
}

/**
 * Hook for listening to specific quotation updates
 * Use this in quotation detail pages, lists, or any component that needs to update when a quotation changes
 */
export function useQuotationUpdates(options: UseQuotationUpdatesOptions = {}) {
  const { quotationId, onQuotationUpdated, autoConnect = true } = options

  const handleQuotationUpdated = useCallback((event: QuotationUpdatedEvent) => {
    console.log(`📝 Quotation ${event.quotationId} updated:`, event)
    
    if (onQuotationUpdated) {
      onQuotationUpdated(event)
    }
  }, [onQuotationUpdated])

  const { isConnected, connectionId } = useQuotationHub({
    quotationId,
    onQuotationUpdated: handleQuotationUpdated,
    autoConnect
  })

  return {
    isConnected,
    connectionId,
    quotationId
  }
}