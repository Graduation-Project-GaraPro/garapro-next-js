import { useEffect, useCallback, useRef } from "react";
import { 
  inspectionHubService, 
  InspectionsRetrievedNotification, 
  InspectionRetrievedNotification,
  InspectionStatusUpdatedNotification,
  InspectionStartedNotification,
  InspectionCompletedNotification
} from "@/services/manager/inspection-hub";

interface UseInspectionHubOptions {
  technicianId?: string;
  inspectionId?: string;
  isManager?: boolean;
  onInspectionsRetrieved?: (notification: InspectionsRetrievedNotification) => void;
  onInspectionRetrieved?: (notification: InspectionRetrievedNotification) => void;
  onInspectionStatusUpdated?: (notification: InspectionStatusUpdatedNotification) => void;
  onInspectionStarted?: (notification: InspectionStartedNotification) => void;
  onInspectionCompleted?: (notification: InspectionCompletedNotification) => void;
  autoConnect?: boolean;
}

export function useInspectionHub({
  technicianId,
  inspectionId,
  isManager = false,
  onInspectionsRetrieved,
  onInspectionRetrieved,
  onInspectionStatusUpdated,
  onInspectionStarted,
  onInspectionCompleted,
  autoConnect = true
}: UseInspectionHubOptions = {}) {
  const isInitialized = useRef(false);

  // Connect to the hub
  const connect = useCallback(async () => {
    if (isInitialized.current) return;
    
    try {
      const connected = await inspectionHubService.startConnection();
      if (connected) {
        isInitialized.current = true;
        
        // Join managers group if user is a manager
        if (isManager) {
          await inspectionHubService.joinManagersGroup();
        }
        
        // Join technician group if technicianId is provided
        if (technicianId) {
          await inspectionHubService.joinTechnicianGroup(technicianId);
        }

        // Join inspection group if inspectionId is provided
        if (inspectionId) {
          await inspectionHubService.joinInspectionGroup(inspectionId);
        }
      }
    } catch (error) {
      console.error("Failed to connect to inspection hub:", error);
    }
  }, [technicianId, inspectionId, isManager]);

  // Disconnect from the hub
  const disconnect = useCallback(async () => {
    if (!isInitialized.current) return;
    
    try {
      // Leave managers group if user is a manager
      if (isManager) {
        await inspectionHubService.leaveManagersGroup();
      }

      // Leave technician group if technicianId is provided
      if (technicianId) {
        await inspectionHubService.leaveTechnicianGroup(technicianId);
      }

      // Leave inspection group if inspectionId is provided
      if (inspectionId) {
        await inspectionHubService.leaveInspectionGroup(inspectionId);
      }
      
      await inspectionHubService.stopConnection();
      isInitialized.current = false;
    } catch (error) {
      console.error("Failed to disconnect from inspection hub:", error);
    }
  }, [technicianId, inspectionId, isManager]);

  // Join managers group
  const joinManagersGroup = useCallback(async () => {
    if (!isInitialized.current) {
      await connect();
    }
    await inspectionHubService.joinManagersGroup();
  }, [connect]);

  // Leave managers group
  const leaveManagersGroup = useCallback(async () => {
    await inspectionHubService.leaveManagersGroup();
  }, []);

  // Join a technician group
  const joinTechnicianGroup = useCallback(async (techId: string) => {
    if (!isInitialized.current) {
      await connect();
    }
    await inspectionHubService.joinTechnicianGroup(techId);
  }, [connect]);

  // Leave a technician group
  const leaveTechnicianGroup = useCallback(async (techId: string) => {
    await inspectionHubService.leaveTechnicianGroup(techId);
  }, []);

  // Join an inspection group
  const joinInspectionGroup = useCallback(async (inspId: string) => {
    if (!isInitialized.current) {
      await connect();
    }
    await inspectionHubService.joinInspectionGroup(inspId);
  }, [connect]);

  // Leave an inspection group
  const leaveInspectionGroup = useCallback(async (inspId: string) => {
    await inspectionHubService.leaveInspectionGroup(inspId);
  }, []);

  // Set up event listeners
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    // Register listeners
    if (onInspectionsRetrieved) {
      inspectionHubService.addInspectionsRetrievedListener(onInspectionsRetrieved);
    }

    if (onInspectionRetrieved) {
      inspectionHubService.addInspectionRetrievedListener(onInspectionRetrieved);
    }

    if (onInspectionStatusUpdated) {
      inspectionHubService.addInspectionStatusUpdatedListener(onInspectionStatusUpdated);
    }

    if (onInspectionStarted) {
      inspectionHubService.addInspectionStartedListener(onInspectionStarted);
    }

    if (onInspectionCompleted) {
      inspectionHubService.addInspectionCompletedListener(onInspectionCompleted);
    }

    // Cleanup
    return () => {
      if (onInspectionsRetrieved) {
        inspectionHubService.removeInspectionsRetrievedListener(onInspectionsRetrieved);
      }

      if (onInspectionRetrieved) {
        inspectionHubService.removeInspectionRetrievedListener(onInspectionRetrieved);
      }

      if (onInspectionStatusUpdated) {
        inspectionHubService.removeInspectionStatusUpdatedListener(onInspectionStatusUpdated);
      }

      if (onInspectionStarted) {
        inspectionHubService.removeInspectionStartedListener(onInspectionStarted);
      }

      if (onInspectionCompleted) {
        inspectionHubService.removeInspectionCompletedListener(onInspectionCompleted);
      }

      if (autoConnect) {
        disconnect();
      }
    };
  }, [autoConnect, connect, disconnect, onInspectionsRetrieved, onInspectionRetrieved, onInspectionStatusUpdated, onInspectionStarted, onInspectionCompleted]);

  return {
    connect,
    disconnect,
    joinManagersGroup,
    leaveManagersGroup,
    joinTechnicianGroup,
    leaveTechnicianGroup,
    joinInspectionGroup,
    leaveInspectionGroup,
    isConnected: inspectionHubService.isConnected
  };
}
