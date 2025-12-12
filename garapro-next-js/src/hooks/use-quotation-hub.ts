// src/hooks/use-quotation-hub.ts
import { useEffect, useState, useCallback } from "react";
import { quotationHubService, QuotationCustomerResponseEvent, QuotationUpdatedEvent } from "@/services/manager/quotation-hub-service";
import { QuotationDto } from "@/types/manager/quotation";
// Note: Toast notifications are now handled by components using this hook

interface UseQuotationHubOptions {
  userId?: string;
  quotationId?: string;
  isManager?: boolean;
  onCustomerResponse?: (event: QuotationCustomerResponseEvent) => void;
  onQuotationUpdate?: (quotation: QuotationDto) => void;
  onQuotationUpdated?: (event: QuotationUpdatedEvent) => void;
  autoConnect?: boolean;
}

export function useQuotationHub(options: UseQuotationHubOptions = {}) {
  const {
    userId,
    quotationId,
    isManager = false,
    onCustomerResponse,
    onQuotationUpdate,
    onQuotationUpdated,
    autoConnect = true
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [connectionId, setConnectionId] = useState<string | null>(null);

  // Handle customer response events
  const handleCustomerResponse = useCallback((event: QuotationCustomerResponseEvent) => {
    console.log("Customer response event received:", event);
    
    // Toast notifications are handled by components using this hook
    
    // Call custom handler if provided
    if (onCustomerResponse) {
      onCustomerResponse(event);
    }
  }, [onCustomerResponse]);

  // Handle general quotation updates
  const handleQuotationUpdate = useCallback((quotation: QuotationDto) => {
    console.log("Quotation update received:", quotation);
    
    if (onQuotationUpdate) {
      onQuotationUpdate(quotation);
    }
  }, [onQuotationUpdate]);

  // Handle quotation updated events
  const handleQuotationUpdated = useCallback((event: QuotationUpdatedEvent) => {
    console.log("Quotation updated event received:", event);
    
    if (onQuotationUpdated) {
      onQuotationUpdated(event);
    }
  }, [onQuotationUpdated]);

  // Initialize connection
  useEffect(() => {
    if (!autoConnect) return;

    let mounted = true;
    let connectionAttempted = false;

    const initializeConnection = async () => {
      if (connectionAttempted) return;
      connectionAttempted = true;

      try {
        // Check if already connected
        if (quotationHubService.isConnected()) {
          if (mounted) {
            setIsConnected(true);
            setConnectionId(quotationHubService.getConnectionId());
          }
          return;
        }

        console.log("🔄 Initializing QuotationHub connection...");
        const connected = await quotationHubService.startConnection();
        
        if (mounted) {
          setIsConnected(connected);
          setConnectionId(quotationHubService.getConnectionId());
        }

        if (connected) {
          // Join managers group if user is a manager
          if (isManager) {
            await quotationHubService.joinManagersGroup();
          }
          
          // Join user group if userId provided
          if (userId) {
            await quotationHubService.joinUserGroup(userId);
          }

          // Join quotation group if quotationId provided
          if (quotationId) {
            await quotationHubService.joinQuotationGroup(quotationId);
          }
        }
      } catch (error) {
        console.error("Failed to initialize quotation hub:", error);
        if (mounted) {
          setIsConnected(false);
          setConnectionId(null);
        }
      }
    };

    initializeConnection();

    return () => {
      mounted = false;
    };
  }, [autoConnect, userId, quotationId, isManager]);

  // Set up event listeners
  useEffect(() => {
    if (!isConnected) return;

    // Add customer response listener
    quotationHubService.addCustomerResponseListener(handleCustomerResponse);
    
    // Add general quotation update listener
    quotationHubService.addListener(handleQuotationUpdate);

    // Add quotation updated event listener
    quotationHubService.addQuotationUpdatedListener(handleQuotationUpdated);

    return () => {
      // Clean up listeners
      quotationHubService.removeCustomerResponseListener(handleCustomerResponse);
      quotationHubService.removeListener(handleQuotationUpdate);
      quotationHubService.removeQuotationUpdatedListener(handleQuotationUpdated);
    };
  }, [isConnected, handleCustomerResponse, handleQuotationUpdate, handleQuotationUpdated]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (userId) {
        quotationHubService.leaveUserGroup(userId);
      }
      if (quotationId) {
        quotationHubService.leaveQuotationGroup(quotationId);
      }
    };
  }, [userId, quotationId]);

  return {
    isConnected,
    connectionId,
    joinManagersGroup: quotationHubService.joinManagersGroup.bind(quotationHubService),
    leaveManagersGroup: quotationHubService.leaveManagersGroup.bind(quotationHubService),
    joinUserGroup: quotationHubService.joinUserGroup.bind(quotationHubService),
    leaveUserGroup: quotationHubService.leaveUserGroup.bind(quotationHubService),
    joinQuotationGroup: quotationHubService.joinQuotationGroup.bind(quotationHubService),
    leaveQuotationGroup: quotationHubService.leaveQuotationGroup.bind(quotationHubService),
  };
}
