"use client"

import { useState, useEffect } from "react"
import { Plus, Filter, LayoutGrid, List, Link } from "lucide-react"
import { Button } from "@/components/ui/button"
import RoDragDropBoard from "./ro-drag-drop-board"
import ListView from "./ro-list-view"
import EditTaskModal from "@/app/manager/repairOrderManagement/components/edit-task-modal"
import CreateTask from "@/app/manager/repairOrderManagement/components/create-task"
import { repairOrderService } from "@/services/manager/repair-order-service"
import { repairOrderHubService, type RoBoardCardDto } from "@/services/manager/repair-order-hub"
import type { RepairOrder } from "@/types/manager/repair-order"
import type { OrderStatus } from "@/types/manager/order-status"
import { SearchForm } from '@/app/manager/components/layout/search-form'
import type { Job } from "@/types/job"


type ViewMode = "board" | "list"

export default function BoardPage() {
  const [repairOrders, setRepairOrders] = useState<RepairOrder[]>([])
  const [statuses, setStatuses] = useState<OrderStatus[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingRepairOrder, setEditingRepairOrder] = useState<RepairOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>("board")
  const [signalRConnected, setSignalRConnected] = useState(false)

  useEffect(() => {
    initializePage();
    
    // Cleanup on unmount
    return () => {
      repairOrderHubService.disconnect();
    };
  }, []);

  const initializePage = async () => {
    // Initialize SignalR connection
    await initializeSignalR();
    
    // Load initial data
    await Promise.all([
      loadRepairOrders(),
      loadStatuses()
    ]);
    
    setLoading(false);
  };

  const initializeSignalR = async () => {
    try {
      await repairOrderHubService.initialize();
      
      // Register event listeners
      repairOrderHubService.onRepairOrderMoved(handleRepairOrderMoved);
      repairOrderHubService.onRepairOrderCreated(handleRepairOrderCreated);
      repairOrderHubService.onRepairOrderUpdated(handleRepairOrderUpdated);
      repairOrderHubService.onRepairOrderDeleted(handleRepairOrderDeleted);
      repairOrderHubService.onConnected(handleConnected);
      
      setSignalRConnected(true);
    } catch (error) {
      console.error("Failed to initialize SignalR:", error);
    }
  };

  const loadRepairOrders = async () => {
    try {
      const data = await repairOrderService.getAllRepairOrders()
      setRepairOrders(data)
      console.log("Loaded repair orders:", data)
    } catch (error) {
      console.error("Failed to load repair orders:", error)
    }
  }

  // Step 1 implementation: Fetch the list of statuses
  const loadStatuses = async () => {
    try {
      const data = await repairOrderService.fetchOrderStatuses()
      setStatuses(data)
      console.log("Loaded statuses:", data)
    } catch (error) {
      console.error("Failed to load statuses:", error)
    }
  }

  // Wrapper function to convert Job to RepairOrder
  const handleCreateRepairOrderWrapper = async (jobData: Omit<Job, "id">) => {
    try {
      // Create a basic repair order from job data
      const newRepairOrder: Omit<RepairOrder, "repairOrderId"> = {
        receiveDate: new Date().toISOString(),
        roType: 1, // Default type
        roTypeName: jobData.title || "Repair Order",
        estimatedCompletionDate: null,
        completionDate: null,
        cost: 0,
        estimatedAmount: 0,
        paidAmount: 0,
        paidStatus: "unpaid",
        estimatedRepairTime: 0,
        note: jobData.description || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isArchived: false,
        archivedAt: null,
        archivedByUserId: null,
        branchId: "default-branch",
        statusId: "pending-status", // Default status
        vehicleId: "default-vehicle", // This should be updated with actual vehicle data
        userId: "default-user", // This should be updated with actual user data
        repairRequestId: "default-request", // This should be updated with actual request data
        customerName: jobData.company || "Unknown Customer",
        customerPhone: jobData.contact || "",
        technicianNames: [],
        totalJobs: 0,
        completedJobs: 0,
        progressPercentage: 0
      };
      
      // In a real implementation, you would call an API to create the repair order
      // For now, we'll just add it to the local state
      const createdRepairOrder: RepairOrder = {
        ...newRepairOrder,
        repairOrderId: `ro-${Date.now()}` // Simple ID generation for demo
      } as RepairOrder;
      
      setRepairOrders((prev) => [...prev, createdRepairOrder])
      setShowCreateForm(false)
    } catch (error) {
      console.error("Failed to create repair order:", error)
    }
  }

  const handleUpdateRepairOrder = async (repairOrderData: RepairOrder) => {
    try {
      // In a real implementation, you would call an API to update the repair order
      setRepairOrders((prev) => prev.map((ro) => (ro.repairOrderId === repairOrderData.repairOrderId ? repairOrderData : ro)))
      setEditingRepairOrder(null)
    } catch (error) {
      console.error("Failed to update repair order:", error)
    }
  }

  const handleDeleteRepairOrder = async (repairOrderId: string) => {
    try {
      // In a real implementation, you would call an API to delete the repair order
      setRepairOrders((prev) => prev.filter((ro) => ro.repairOrderId !== repairOrderId))
      console.log(`Deleted repair order ${repairOrderId}`)
    } catch (error) {
      console.error("Failed to delete repair order:", error)
    }
  }

  // Handle drag and drop - this is the main function for moving repair orders
  const handleMoveRepairOrder = async (repairOrderId: string, newStatusId: string) => {
    try {
      // Call the API to update the status
      const success = await repairOrderHubService.updateRepairOrderStatus(repairOrderId, newStatusId);
      
      if (success) {
        console.log(`Successfully requested move of repair order ${repairOrderId} to status ${newStatusId}`);
        // The UI will be updated via SignalR notification, not directly here
      } else {
        console.error(`Failed to move repair order ${repairOrderId} to status ${newStatusId}`);
        // Revert the UI change if the API call failed
        // In a real implementation, you might want to show an error message to the user
      }
    } catch (error) {
      console.error("Failed to move repair order:", error)
    }
  }

  // SignalR Event Handlers
  const handleRepairOrderMoved = (repairOrderId: string, newStatusId: string, updatedCard: RoBoardCardDto) => {
    console.log("Repair order moved via SignalR:", repairOrderId, newStatusId, updatedCard);
    
    // Update the repair order in the local state
    setRepairOrders(prev => 
      prev.map(ro => 
        ro.repairOrderId === repairOrderId 
          ? { ...ro, statusId: newStatusId } 
          : ro
      )
    );
  };

  const handleRepairOrderCreated = (repairOrder: RoBoardCardDto) => {
    console.log("Repair order created via SignalR:", repairOrder);
    // In a real implementation, you would convert the RoBoardCardDto to a RepairOrder
    // and add it to the local state
  };

  const handleRepairOrderUpdated = (repairOrder: RoBoardCardDto) => {
    console.log("Repair order updated via SignalR:", repairOrder);
    // In a real implementation, you would update the repair order in the local state
  };

  const handleRepairOrderDeleted = (repairOrderId: string) => {
    console.log("Repair order deleted via SignalR:", repairOrderId);
    setRepairOrders(prev => prev.filter(ro => ro.repairOrderId !== repairOrderId));
  };

  const handleConnected = (connectionId: string) => {
    console.log("Connected to SignalR with connection ID:", connectionId);
    setSignalRConnected(true);
  };

  // For debugging purposes, show the statuses in console
  useEffect(() => {
    if (statuses.length > 0) {
      console.log("Statuses loaded:", statuses)
    }
  }, [statuses])


  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Main Header */}
      <div className="bg-white border-b px-6 py-[9.5px] flex items-center justify-between shrink-0">
        <h1 className="text-lg font-semibold text-gray-900">Repair Order Board</h1>
        {/* For debugging - show number of statuses loaded */}
        <div className="text-sm text-gray-500">
          Loaded {statuses.length} statuses, {repairOrders.length} repair orders
          {signalRConnected && <span className="ml-2 text-green-600">●</span>}
        </div>
      </div>
      {showCreateForm ? (
        <CreateTask
          onClose={() => setShowCreateForm(false)}
          onSubmit={handleCreateRepairOrderWrapper}
        />
      ) : (
        <>
          {/* sub Header */}
          <div className="bg-white border-b px-6 py-1.5 flex flex-col gap-2 shrink-0">
            <div className="flex items-center gap-2 w-full">
              <div className="flex items-center gap-2 flex-1">
                <SearchForm className="w-72" />
                <Button variant="outline" size="sm" className="text-gray-600 border-gray-200 hover:bg-gray-50">
                  <Filter className="w-4 h-4 mr-2" />
                  RO Label
                  <span className="ml-2 px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded font-medium">
                    New
                  </span>
                </Button>
                <Button variant="outline" size="sm" className="text-gray-600 border-gray-200 hover:bg-gray-50">
                  Employee
                </Button>
                <Button variant="outline" size="sm" className="text-gray-600 border-gray-200 hover:bg-gray-50">
                  Appt Type
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="text-gray-600 border-gray-200 hover:bg-gray-50">
                  Active
                </Button>
                <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`px-2 py-1.5 border-r border-gray-200 ${
                      viewMode === "board" ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50"
                    }`}
                    onClick={() => setViewMode("board")}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`px-2 py-1.5 border-r border-gray-200 ${
                      viewMode === "list" ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50"
                    }`}
                    onClick={() => setViewMode("list")}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="px-2 py-1.5 hover:bg-gray-50">
                    <Link className="w-4 h-4" />
                  </Button>
                </div>
                <Button className="bg-[#154c79] hover:bg-[#123c66] text-white" size="sm" onClick={() => setShowCreateForm(true)}>
                  <Plus className="w-4 h-4" />
                  Create Repair Order
                </Button>
              </div>
            </div>
          </div>
          <div className="flex-1 h-0 min-h-0 overflow-hidden">
            {viewMode === "board" ? (
              <RoDragDropBoard
                repairOrders={repairOrders}
                loading={loading}
                onMoveRepairOrder={handleMoveRepairOrder}
                onEditRepairOrder={setEditingRepairOrder}
                onDeleteRepairOrder={handleDeleteRepairOrder}
                statuses={statuses}
              />
            ) : (
              <ListView
                repairOrders={repairOrders}
                loading={loading}
                onEditRepairOrder={setEditingRepairOrder}
                onDeleteRepairOrder={handleDeleteRepairOrder}
              />
            )}
          </div>
        </>
      )}

      {/* Edit Modal */}
      <EditTaskModal
        repairOrder={editingRepairOrder}
        isOpen={!!editingRepairOrder}
        onClose={() => setEditingRepairOrder(null)}
        onSubmit={handleUpdateRepairOrder}
        onDelete={handleDeleteRepairOrder}
      />
    </div>
  )
}