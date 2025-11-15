import { useState, useEffect } from "react";
import { 
  technicianAssignmentHubService 
} from "@/services/manager/technician-assignment-hub";
import type { 
  TechnicianAssignmentNotification,
  TechnicianReassignmentNotification,
  InspectionAssignmentNotification,
  InspectionReassignmentNotification
} from "@/services/manager/technician-assignment-hub";

interface NotificationItem {
  id: string;
  type: "jobAssigned" | "jobReassigned" | "inspectionAssigned" | "inspectionReassigned";
  message: string;
  timestamp: Date;
  read: boolean;
}

export function useTechnicianAssignmentNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Start the SignalR connection
    const startConnection = async () => {
      try {
        const connectionResult = await technicianAssignmentHubService.startConnection();
        setConnected(connectionResult);
        
        if (connectionResult) {
          // Register listeners for different types of notifications
          technicianAssignmentHubService.addJobAssignedListener(handleJobAssigned);
          technicianAssignmentHubService.addJobReassignedListener(handleJobReassigned);
          technicianAssignmentHubService.addInspectionAssignedListener(handleInspectionAssigned);
          technicianAssignmentHubService.addInspectionReassignedListener(handleInspectionReassigned);
        }
      } catch (error) {
        console.error("Failed to start SignalR connection:", error);
        setConnected(false);
      }
    };

    startConnection();

    // Cleanup function to remove listeners and stop connection
    return () => {
      technicianAssignmentHubService.removeJobAssignedListener(handleJobAssigned);
      technicianAssignmentHubService.removeJobReassignedListener(handleJobReassigned);
      technicianAssignmentHubService.removeInspectionAssignedListener(handleInspectionAssigned);
      technicianAssignmentHubService.removeInspectionReassignedListener(handleInspectionReassigned);
      technicianAssignmentHubService.stopConnection();
    };
  }, []);

  const handleJobAssigned = (notification: TechnicianAssignmentNotification) => {
    const message = `${notification.technicianName} has been assigned ${notification.jobCount} job(s): ${notification.jobNames.join(', ')}`;
    addNotification("jobAssigned", message);
  };

  const handleJobReassigned = (notification: TechnicianReassignmentNotification) => {
    const message = `Job "${notification.jobName}" has been reassigned to a new technician`;
    addNotification("jobReassigned", message);
  };

  const handleInspectionAssigned = (notification: InspectionAssignmentNotification) => {
    const message = `${notification.technicianName} has been assigned ${notification.inspectionCount} inspection(s): ${notification.inspectionNames.join(', ')}`;
    addNotification("inspectionAssigned", message);
  };

  const handleInspectionReassigned = (notification: InspectionReassignmentNotification) => {
    const message = `Inspection "${notification.inspectionName}" has been reassigned to a new technician`;
    addNotification("inspectionReassigned", message);
  };

  const addNotification = (type: NotificationItem["type"], message: string) => {
    const newNotification: NotificationItem = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      message,
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 9)]); // Keep only the last 10 notifications
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    connected,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll
  };
}