// src/hooks/use-payment-hub.ts
// NOTE: This hook uses RepairOrderHub for payment events
import { useEffect, useState, useCallback } from "react";
import { 
  paymentHubService, 
  PaymentReceivedEvent,
  PaymentConfirmedEvent,
  RepairOrderPaidEvent,
  // Legacy types for backward compatibility
  PaymentCreatedEvent, 
  PaymentStatusUpdatedEvent,
  PaymentCompletedEvent 
} from "@/services/manager/payment-hub";
import { toast } from "sonner";

interface UsePaymentHubOptions {
  repairOrderId?: string;
  userId?: string;
  branchId?: string;
  isManager?: boolean;
  // New event handlers
  onPaymentReceived?: (event: PaymentReceivedEvent) => void;
  onPaymentConfirmed?: (event: PaymentConfirmedEvent) => void;
  onRepairOrderPaid?: (event: RepairOrderPaidEvent) => void;
  // Legacy event handlers for backward compatibility
  onPaymentCreated?: (event: PaymentCreatedEvent) => void;
  onPaymentStatusUpdated?: (event: PaymentStatusUpdatedEvent) => void;
  onPaymentCompleted?: (event: PaymentCompletedEvent) => void;
  autoConnect?: boolean;
  showToasts?: boolean;
}

export function usePaymentHub(options: UsePaymentHubOptions = {}) {
  const {
    repairOrderId,
    userId,
    branchId,
    isManager = false,
    onPaymentReceived,
    onPaymentConfirmed,
    onRepairOrderPaid,
    // Legacy handlers
    onPaymentCreated,
    onPaymentStatusUpdated,
    onPaymentCompleted,
    autoConnect = true,
    showToasts = true
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [connectionId, setConnectionId] = useState<string | null>(null);

  // Handle PaymentReceived events (cash payment)
  const handlePaymentReceived = useCallback((event: PaymentReceivedEvent) => {
    console.log("💰 Payment received event:", event);
    
    if (showToasts) {
      toast.success(
        `Payment Received`,
        {
          description: `${event.method} payment of ${event.amount.toLocaleString()} VND from ${event.customerName}`,
          duration: 5000,
        }
      );
    }
    
    if (onPaymentReceived) {
      onPaymentReceived(event);
    }
  }, [onPaymentReceived, showToasts]);

  // Handle PaymentConfirmed events (PayOS payment)
  const handlePaymentConfirmed = useCallback((event: PaymentConfirmedEvent) => {
    console.log("✅ Payment confirmed event:", event);
    
    if (showToasts) {
      toast.success(
        `Payment Confirmed`,
        {
          description: `PayOS payment of ${event.amount.toLocaleString()} VND confirmed for ${event.customerName}`,
          duration: 5000,
        }
      );
    }
    
    if (onPaymentConfirmed) {
      onPaymentConfirmed(event);
    }
  }, [onPaymentConfirmed, showToasts]);

  // Handle RepairOrderPaid events (fully paid)
  const handleRepairOrderPaid = useCallback((event: RepairOrderPaidEvent) => {
    console.log("🎉 Repair order paid event:", event);
    
    if (showToasts) {
      toast.success(
        `Repair Order Fully Paid! 🎉`,
        {
          description: `RO #${event.repairOrderId.substring(0, 8)} is now fully paid`,
          duration: 6000,
        }
      );
    }
    
    if (onRepairOrderPaid) {
      onRepairOrderPaid(event);
    }
  }, [onRepairOrderPaid, showToasts]);

  // Legacy handlers for backward compatibility
  const handlePaymentCreated = useCallback((event: PaymentCreatedEvent) => {
    console.log("💰 Payment created event received (legacy):", event);
    
    if (onPaymentCreated) {
      onPaymentCreated(event);
    }
  }, [onPaymentCreated]);

  const handlePaymentStatusUpdated = useCallback((event: PaymentStatusUpdatedEvent) => {
    console.log("🔄 Payment status updated (legacy):", event);
    
    if (onPaymentStatusUpdated) {
      onPaymentStatusUpdated(event);
    }
  }, [onPaymentStatusUpdated]);

  const handlePaymentCompleted = useCallback((event: PaymentCompletedEvent) => {
    console.log("✅ Payment completed event received (legacy):", event);
    
    if (onPaymentCompleted) {
      onPaymentCompleted(event);
    }
  }, [onPaymentCompleted]);

  // Initialize connection
  useEffect(() => {
    if (!autoConnect) return;

    let mounted = true;

    const initializeConnection = async () => {
      try {
        const connected = await paymentHubService.startConnection();
        
        if (mounted) {
          setIsConnected(connected);
          setConnectionId(paymentHubService.getConnectionId());
        }

        if (connected) {
          // Join managers group if user is a manager
          if (isManager) {
            await paymentHubService.joinManagersGroup();
          }
          
          // Join repair order group if repairOrderId provided
          if (repairOrderId) {
            await paymentHubService.joinRepairOrderPaymentGroup(repairOrderId);
          }

          // Note: Customer and branch payment groups are handled by managers group
          // No additional group joining needed for userId or branchId
        }
      } catch (error) {
        console.error("Failed to initialize payment hub:", error);
      }
    };

    initializeConnection();

    return () => {
      mounted = false;
    };
  }, [autoConnect, repairOrderId, userId, branchId, isManager]);

  // Set up event listeners
  useEffect(() => {
    if (!isConnected) return;

    // Add new event listeners
    paymentHubService.addPaymentReceivedListener(handlePaymentReceived);
    paymentHubService.addPaymentConfirmedListener(handlePaymentConfirmed);
    paymentHubService.addRepairOrderPaidListener(handleRepairOrderPaid);
    
    // Add legacy event listeners for backward compatibility
    paymentHubService.addPaymentCreatedListener(handlePaymentCreated);
    paymentHubService.addPaymentStatusListener(handlePaymentStatusUpdated);
    paymentHubService.addPaymentCompletedListener(handlePaymentCompleted);

    return () => {
      // Clean up new listeners
      paymentHubService.removePaymentReceivedListener(handlePaymentReceived);
      paymentHubService.removePaymentConfirmedListener(handlePaymentConfirmed);
      paymentHubService.removeRepairOrderPaidListener(handleRepairOrderPaid);
      
      // Clean up legacy listeners
      paymentHubService.removePaymentCreatedListener(handlePaymentCreated);
      paymentHubService.removePaymentStatusListener(handlePaymentStatusUpdated);
      paymentHubService.removePaymentCompletedListener(handlePaymentCompleted);
    };
  }, [
    isConnected, 
    handlePaymentReceived, 
    handlePaymentConfirmed, 
    handleRepairOrderPaid,
    handlePaymentCreated, 
    handlePaymentStatusUpdated, 
    handlePaymentCompleted
  ]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (repairOrderId) {
        paymentHubService.leaveRepairOrderPaymentGroup(repairOrderId);
      }
      if (isManager) {
        paymentHubService.leaveManagersGroup();
      }
      // Note: Customer and branch groups are no-ops, no cleanup needed
    };
  }, [repairOrderId, isManager]);

  return {
    isConnected,
    connectionId,
    joinManagersGroup: paymentHubService.joinManagersGroup.bind(paymentHubService),
    leaveManagersGroup: paymentHubService.leaveManagersGroup.bind(paymentHubService),
    joinRepairOrderPaymentGroup: paymentHubService.joinRepairOrderPaymentGroup.bind(paymentHubService),
    leaveRepairOrderPaymentGroup: paymentHubService.leaveRepairOrderPaymentGroup.bind(paymentHubService),
  };
}
