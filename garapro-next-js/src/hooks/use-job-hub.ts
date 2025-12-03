import { useEffect, useState, useCallback } from "react";
import { jobHubService, type JobStatusUpdatedNotification, type RepairCreatedNotification, type RepairUpdatedNotification } from "@/services/manager/job-hub";
import { HubConnectionState } from "@microsoft/signalr";

export function useJobHub() {
  const [connectionState, setConnectionState] = useState<HubConnectionState>(
    jobHubService.connectionState
  );
  const [isConnected, setIsConnected] = useState(jobHubService.isConnected);

  useEffect(() => {
    // Start connection
    const connect = async () => {
      if (!jobHubService.isConnected) {
        await jobHubService.startConnection();
      }
    };

    connect();

    // Listen for connection state changes
    const handleConnectionStateChanged = (state: HubConnectionState) => {
      setConnectionState(state);
      setIsConnected(state === HubConnectionState.Connected);
    };

    jobHubService.addConnectionStateChangedListener(handleConnectionStateChanged);

    // Cleanup
    return () => {
      jobHubService.removeConnectionStateChangedListener(handleConnectionStateChanged);
    };
  }, []);

  const onJobStatusUpdated = useCallback((callback: (notification: JobStatusUpdatedNotification) => void) => {
    jobHubService.addJobStatusUpdatedListener(callback);
    return () => jobHubService.removeJobStatusUpdatedListener(callback);
  }, []);

  const onRepairCreated = useCallback((callback: (notification: RepairCreatedNotification) => void) => {
    jobHubService.addRepairCreatedListener(callback);
    return () => jobHubService.removeRepairCreatedListener(callback);
  }, []);

  const onRepairUpdated = useCallback((callback: (notification: RepairUpdatedNotification) => void) => {
    jobHubService.addRepairUpdatedListener(callback);
    return () => jobHubService.removeRepairUpdatedListener(callback);
  }, []);

  return {
    connectionState,
    isConnected,
    onJobStatusUpdated,
    onRepairCreated,
    onRepairUpdated,
  };
}
