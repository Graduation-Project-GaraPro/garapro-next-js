// src/hooks/use-quotation-hub.ts
import { useEffect, useState, useCallback } from "react";
import { quotationHubService, QuotationCustomerResponseEvent } from "@/services/manager/quotation-hub-service";
import { QuotationDto } from "@/types/manager/quotation";
import { toast } from "sonner";

interface UseQuotationHubOptions {
  userId?: string;
  quotationId?: string;
  isManager?: boolean;
  onCustomerResponse?: (event: QuotationCustomerResponseEvent) => void;
  onQuotationUpdate?: (quotation: QuotationDto) => void;
  autoConnect?: boolean;
}

export function useQuotationHub(options: UseQuotationHubOptions = {}) {
  const {
    userId,
    quotationId,
    isManager = false,
    onCustomerResponse,
    onQuotationUpdate,
    autoConnect = true
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [connectionId, setConnectionId] = useState<string | null>(null);

  // Handle customer response events
  const handleCustomerResponse = useCallback((event: QuotationCustomerResponseEvent) => {
    console.log("Customer response event received:", event);
    
    // Show toast notification
    if (event.customerResponse === "Approved") {
      toast.success(
        `Customer approved quotation #${event.quotationId.substring(0, 8)}`,
        {
          description: event.message || "The customer has approved the quotation. You can now copy it to jobs.",
          duration: 5000,
        }
      );
    } else if (event.customerResponse === "Rejected") {
      toast.error(
        `Customer rejected quotation #${event.quotationId.substring(0, 8)}`,
        {
          description: event.message || "The customer has rejected the quotation.",
          duration: 5000,
        }
      );
    }
    
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

  // Initialize connection
  useEffect(() => {
    if (!autoConnect) return;

    let mounted = true;

    const initializeConnection = async () => {
      try {
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
      }
    };

    initializeConnection();

    return () => {
      mounted = false;
    };
  }, [autoConnect, userId, quotationId]);

  // Set up event listeners
  useEffect(() => {
    if (!isConnected) return;

    // Add customer response listener
    quotationHubService.addCustomerResponseListener(handleCustomerResponse);
    
    // Add general quotation update listener
    quotationHubService.addListener(handleQuotationUpdate);

    return () => {
      // Clean up listeners
      quotationHubService.removeCustomerResponseListener(handleCustomerResponse);
      quotationHubService.removeListener(handleQuotationUpdate);
    };
  }, [isConnected, handleCustomerResponse, handleQuotationUpdate]);

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
