// Example component showing how to use Payment Hub for real-time payment updates
// This can be used in manager dashboard, repair order list, or any other manager view

"use client"

import { useEffect, useState } from "react"
import { usePaymentHub } from "@/hooks/use-payment-hub"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatVND } from "@/lib/currency"

interface PaymentNotification {
  id: string
  message: string
  timestamp: Date
  type: 'created' | 'updated' | 'completed'
}

export function PaymentHubExample() {
  const [notifications, setNotifications] = useState<PaymentNotification[]>([])

  // Connect to payment hub as a manager to receive all payment updates
  const { isConnected, connectionId } = usePaymentHub({
    isManager: true, // Join managers group to receive all payment updates
    autoConnect: true,
    showToasts: true, // Show toast notifications
    onPaymentCreated: (event) => {
      // Handle payment created event
      const notification: PaymentNotification = {
        id: `payment-${event.paymentId}`,
        message: `New ${event.method} payment of ${formatVND(event.amount)} for RO #${event.repairOrderId.substring(0, 8)}`,
        timestamp: new Date(event.createdAt),
        type: 'created'
      }
      setNotifications(prev => [notification, ...prev].slice(0, 10)) // Keep only last 10 notifications
    },
    onPaymentStatusUpdated: (event) => {
      // Handle payment status update
      const notification: PaymentNotification = {
        id: `status-${event.paymentId}-${Date.now()}`,
        message: `Payment #${event.paymentId} status updated to ${event.status}`,
        timestamp: new Date(event.updatedAt),
        type: 'updated'
      }
      setNotifications(prev => [notification, ...prev].slice(0, 10))
    },
    onPaymentCompleted: (event) => {
      // Handle payment completed event
      const notification: PaymentNotification = {
        id: `completed-${event.repairOrderId}`,
        message: `RO #${event.repairOrderId.substring(0, 8)} fully paid! Total: ${formatVND(event.paymentSummary.amountToPay)}`,
        timestamp: new Date(event.completedAt),
        type: 'completed'
      }
      setNotifications(prev => [notification, ...prev].slice(0, 10))
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Real-time Payment Updates</span>
          <Badge variant={isConnected ? "default" : "secondary"}>
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
        </CardTitle>
        {connectionId && (
          <p className="text-xs text-gray-500">Connection ID: {connectionId}</p>
        )}
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            No payment notifications yet. Waiting for customer payments...
          </p>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg border ${
                  notification.type === 'completed' 
                    ? 'bg-green-50 border-green-200' 
                    : notification.type === 'created'
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <p className="text-sm font-medium">{notification.message}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {notification.timestamp.toLocaleTimeString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
