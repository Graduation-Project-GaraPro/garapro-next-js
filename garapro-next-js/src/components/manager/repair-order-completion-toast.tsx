// src/components/manager/repair-order-completion-toast.tsx
"use client";

import React, { useEffect } from 'react';
import { CheckCircle2, Car, User, ExternalLink, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useManagerNotifications } from '@/hooks/use-manager-notifications';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

interface RepairOrderCompletionToastProps {
  branchId?: string;
}

export function RepairOrderCompletionToast({ branchId }: RepairOrderCompletionToastProps) {
  const router = useRouter();
  const { notifications } = useManagerNotifications({ branchId, useRepairOrderHub: false });

  useEffect(() => {
    // Listen for new repair order completion notifications
    const completionNotifications = notifications.filter(
      n => n.type === 'REPAIR_ORDER_COMPLETED' && n.status === 'Unread'
    );

    completionNotifications.forEach(notification => {
      const isAutoCompleted = notification.isAutoCompleted;
      const completionType = isAutoCompleted ? 'automatically completed' : 'marked as completed';
      const completionIcon = isAutoCompleted ? <Sparkles className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />;
      
      toast({
        title: `Repair Order ${isAutoCompleted ? 'Auto-' : ''}Completed`,
        description: `${notification.customerName}'s ${notification.vehicleInfo} is ready for payment and pickup.`,     
        duration: 10000, // Show for 10 seconds
        variant: "default",
        className: " bg-white shadow-sm max-w-md",
      });
    });
  }, [notifications, router]);

  return null; 
}