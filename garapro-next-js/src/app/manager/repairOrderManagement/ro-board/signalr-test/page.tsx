"use client"

import { useState, useEffect } from "react"
import { repairOrderHubService, type RoBoardCardDto } from "@/services/manager/repair-order-hub"

export default function SignalRTestPage() {
  const [connectionStatus, setConnectionStatus] = useState<string>("Disconnected")
  const [connectionId, setConnectionId] = useState<string>("")
  const [events, setEvents] = useState<string[]>([])
  const [repairOrderId, setRepairOrderId] = useState<string>("")
  const [statusId, setStatusId] = useState<string>("")

  useEffect(() => {
    initializeSignalR();
    
    // Cleanup on unmount
    return () => {
      repairOrderHubService.disconnect();
    };
  }, []);

  const initializeSignalR = async () => {
    try {
      setConnectionStatus("Connecting...");
      
      await repairOrderHubService.initialize();
      
      // Register event listeners
      repairOrderHubService.onRepairOrderMoved(handleRepairOrderMoved);
      repairOrderHubService.onRepairOrderCreated(handleRepairOrderCreated);
      repairOrderHubService.onRepairOrderUpdated(handleRepairOrderUpdated);
      repairOrderHubService.onRepairOrderDeleted(handleRepairOrderDeleted);
      repairOrderHubService.onConnected(handleConnected);
      
      setConnectionStatus("Connected");
    } catch (error) {
      console.error("Failed to initialize SignalR:", error);
      setConnectionStatus("Connection Failed");
    }
  };

  const handleRepairOrderMoved = (repairOrderId: string, newStatusId: string, updatedCard: RoBoardCardDto) => {
    const eventMessage = `RepairOrderMoved: ${repairOrderId} -> ${newStatusId}`;
    setEvents(prev => [...prev, eventMessage]);
    console.log("RepairOrderMoved event received:", repairOrderId, newStatusId, updatedCard);
  };

  const handleRepairOrderCreated = (repairOrder: RoBoardCardDto) => {
    const eventMessage = `RepairOrderCreated: ${repairOrder.repairOrderId}`;
    setEvents(prev => [...prev, eventMessage]);
    console.log("RepairOrderCreated event received:", repairOrder);
  };

  const handleRepairOrderUpdated = (repairOrder: RoBoardCardDto) => {
    const eventMessage = `RepairOrderUpdated: ${repairOrder.repairOrderId}`;
    setEvents(prev => [...prev, eventMessage]);
    console.log("RepairOrderUpdated event received:", repairOrder);
  };

  const handleRepairOrderDeleted = (repairOrderId: string) => {
    const eventMessage = `RepairOrderDeleted: ${repairOrderId}`;
    setEvents(prev => [...prev, eventMessage]);
    console.log("RepairOrderDeleted event received:", repairOrderId);
  };

  const handleConnected = (connectionId: string) => {
    setConnectionId(connectionId);
    const eventMessage = `Connected with ID: ${connectionId}`;
    setEvents(prev => [...prev, eventMessage]);
    console.log("Connected to SignalR:", connectionId);
  };

  const testUpdateStatus = async () => {
    if (!repairOrderId || !statusId) {
      alert("Please enter both Repair Order ID and Status ID");
      return;
    }
    
    try {
      const success = await repairOrderHubService.updateRepairOrderStatus(repairOrderId, statusId);
      if (success) {
        setEvents(prev => [...prev, `Status update requested for ${repairOrderId}`]);
      } else {
        setEvents(prev => [...prev, `Failed to request status update for ${repairOrderId}`]);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      setEvents(prev => [...prev, `Error updating status: ${error}`]);
    }
  };

  const clearEvents = () => {
    setEvents([]);
  };

  const disconnect = async () => {
    await repairOrderHubService.disconnect();
    setConnectionStatus("Disconnected");
    setConnectionId("");
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">SignalR Integration Test</h1>
      
      <div className="mb-6 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <span className={`w-3 h-3 rounded-full mr-2 ${connectionStatus === 'Connected' ? 'bg-green-500' : connectionStatus === 'Connecting...' ? 'bg-yellow-500' : 'bg-red-500'}`}></span>
            <span>{connectionStatus}</span>
          </div>
          {connectionId && <span className="text-gray-600">ID: {connectionId}</span>}
        </div>
        
        <div className="mt-4 flex gap-2">
          <button 
            onClick={initializeSignalR}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Reconnect
          </button>
          <button 
            onClick={disconnect}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Disconnect
          </button>
        </div>
      </div>
      
      <div className="mb-6 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Test Status Update</h2>
        <div className="flex gap-4 items-end">
          <div>
            <label className="block text-sm font-medium mb-1">Repair Order ID</label>
            <input
              type="text"
              value={repairOrderId}
              onChange={(e) => setRepairOrderId(e.target.value)}
              className="border rounded px-3 py-2 w-64"
              placeholder="Enter repair order ID"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status ID</label>
            <input
              type="text"
              value={statusId}
              onChange={(e) => setStatusId(e.target.value)}
              className="border rounded px-3 py-2 w-64"
              placeholder="Enter status ID"
            />
          </div>
          <button 
            onClick={testUpdateStatus}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 h-10"
          >
            Update Status
          </button>
        </div>
      </div>
      
      <div className="p-4 border rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Events</h2>
          <button 
            onClick={clearEvents}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
          >
            Clear Events
          </button>
        </div>
        <div className="h-64 overflow-y-auto border rounded p-2 bg-gray-50">
          {events.length === 0 ? (
            <p className="text-gray-500">No events received yet</p>
          ) : (
            <ul className="space-y-1">
              {events.map((event, index) => (
                <li key={index} className="text-sm p-1 border-b last:border-b-0">
                  {event}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
