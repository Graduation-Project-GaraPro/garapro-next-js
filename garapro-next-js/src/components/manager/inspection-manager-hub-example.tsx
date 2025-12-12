"use client"

import { useState } from "react"
import { useInspectionHub } from "@/hooks/use-inspection-hub"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Bell, CheckCircle, PlayCircle, AlertCircle } from "lucide-react"
import type { 
  InspectionStatusUpdatedNotification, 
  InspectionStartedNotification, 
  InspectionCompletedNotification 
} from "@/services/manager/inspection-hub"

type NotificationData = InspectionStatusUpdatedNotification | InspectionStartedNotification | InspectionCompletedNotification

/**
 * Example component for managers to receive real-time inspection updates
 * Shows how to handle InspectionStatusUpdated, InspectionStarted, and InspectionCompleted events
 */
export function InspectionManagerHubExample() {
  const [notifications, setNotifications] = useState<Array<{
    type: "status" | "started" | "completed";
    message: string;
    timestamp: string;
    data: NotificationData;
  }>>([]);

  const { isConnected } = useInspectionHub({
    isManager: true, // Join managers group
    autoConnect: true,
    
    // Handle status updates
    onInspectionStatusUpdated: (notification) => {
      console.log("Status updated:", notification);
      
      setNotifications(prev => [{
        type: "status" as const,
        message: `Inspection ${notification.inspectionId.substring(0, 8)} status changed: ${notification.oldStatus} → ${notification.newStatus}`,
        timestamp: notification.updatedAt,
        data: notification
      }, ...prev].slice(0, 20));

      toast.info(notification.message, {
        description: `Technician: ${notification.technicianName}`,
        icon: <AlertCircle className="w-4 h-4" />
      });
    },

    // Handle inspection started
    onInspectionStarted: (notification) => {
      console.log("Inspection started:", notification);
      
      setNotifications(prev => [{
        type: "started" as const,
        message: `${notification.technicianName} started inspection ${notification.inspectionId.substring(0, 8)}`,
        timestamp: notification.startedAt,
        data: notification
      }, ...prev].slice(0, 20));

      toast.info(notification.message, {
        description: `Technician: ${notification.technicianName}`,
        icon: <PlayCircle className="w-4 h-4 text-blue-500" />
      });
    },

    // Handle inspection completed
    onInspectionCompleted: (notification) => {
      console.log("Inspection completed:", notification);
      
      setNotifications(prev => [{
        type: "completed" as const,
        message: `${notification.technicianName} completed inspection ${notification.inspectionId.substring(0, 8)}`,
        timestamp: notification.completedAt,
        data: notification
      }, ...prev].slice(0, 20));

      toast.success(notification.message, {
        description: `${notification.serviceCount} services, ${notification.partCount} parts identified`,
        icon: <CheckCircle className="w-4 h-4 text-green-500" />,
        action: {
          label: "Create Quotation",
          onClick: () => {
            console.log("Navigate to create quotation for:", notification.inspectionId);
            // Navigate to quotation creation
          }
        },
        duration: 10000 // Show for 10 seconds
      });
    }
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "started":
        return <PlayCircle className="w-5 h-5 text-blue-500" />;
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
    }
  };

  const getNotificationBadge = (type: string) => {
    switch (type) {
      case "started":
        return <Badge className="bg-blue-100 text-blue-700">Started</Badge>;
      case "completed":
        return <Badge className="bg-green-100 text-green-700">Completed</Badge>;
      default:
        return <Badge className="bg-orange-100 text-orange-700">Status Update</Badge>;
    }
  };

  return (
    <div className="space-y-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              <span>Manager Inspection Hub</span>
            </div>
            <Badge variant={isConnected ? "default" : "secondary"}>
              {isConnected ? "Connected" : "Disconnected"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Receiving real-time updates for all inspections across the system.
          </p>
          <div className="mt-4 flex gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <PlayCircle className="w-3 h-3" />
              Inspection Started
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Inspection Completed
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Status Changed
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications ({notifications.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 mx-auto text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">
                No notifications yet. Waiting for inspection updates...
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification, index) => (
                <div 
                  key={index} 
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getNotificationBadge(notification.type)}
                      <span className="text-xs text-gray-500">
                        {new Date(notification.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-900">{notification.message}</p>
                    
                    {notification.type === "completed" && (
                      <div className="mt-2 flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => console.log("View details:", notification.data.inspectionId)}
                        >
                          View Details
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => console.log("Create quotation:", notification.data.inspectionId)}
                        >
                          Create Quotation
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
