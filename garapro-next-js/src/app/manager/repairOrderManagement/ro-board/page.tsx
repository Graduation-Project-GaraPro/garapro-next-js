"use client"

import { useState, useEffect } from "react"
import { Plus, Filter, LayoutGrid, List, Link } from "lucide-react"
import { Button } from "@/components/ui/button"
import RoDragDropBoard from "./ro-drag-drop-board"
import ListView from "./ro-list-view"
import EditTaskModal from "@/app/manager/repairOrderManagement/components/edit-task-modal"
import CreateTask from "@/app/manager/repairOrderManagement/components/create-task"
import CancelRODialog from "./cancel-ro-dialog"
import ArchiveRODialog from "./archive-ro-dialog"
import { useRouter } from "next/navigation"
import { repairOrderService } from "@/services/manager/repair-order-service"
import { repairOrderHubService, type RoBoardCardDto } from "@/services/manager/repair-order-hub"
import { labelService } from "@/services/manager/label-service"
import type { RepairOrder, CreateRepairOrderRequest } from "@/types/manager/repair-order"
import type { OrderStatus } from "@/types/manager/order-status"
import type { Job } from "@/types/job"
import { toast } from "sonner"
import { SearchForm } from "@/app/manager/components/layout/search-form"
import { authService } from "@/services/authService"

type ViewMode = "board" | "list"

export default function BoardPage() {
  const [repairOrders, setRepairOrders] = useState<RepairOrder[]>([])
  const [statuses, setStatuses] = useState<OrderStatus[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingRepairOrder, setEditingRepairOrder] = useState<RepairOrder | null>(null)
  const [cancelingRepairOrderId, setCancelingRepairOrderId] = useState<string | null>(null)
  const [archivingRepairOrderId, setArchivingRepairOrderId] = useState<string | null>(null)
  const [isCanceling, setIsCanceling] = useState(false)
  const [isArchiving, setIsArchiving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>("board")
  const [signalRConnected, setSignalRConnected] = useState(false)
  const [defaultLabels, setDefaultLabels] = useState<Map<string, { labelName: string; hexCode: string }>>(new Map())
  const router = useRouter()

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
      loadStatuses(),
      loadDefaultLabels()
    ]);
    
    setLoading(false);
  };

  const loadDefaultLabels = async () => {
    try {
      const allLabels = await labelService.getAllLabels()
      const defaultLabelMap = new Map<string, { labelName: string; hexCode: string }>()
      
      allLabels.forEach((label) => {
        if (label.isDefault) {
          defaultLabelMap.set(label.orderStatusId.toString(), {
            labelName: label.labelName,
            hexCode: label.hexCode
          })
        }
      })
      
      setDefaultLabels(defaultLabelMap)
    } catch (error) {
      console.error("Failed to load default labels:", error)
    }
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
      
      // Additional debugging
      if (data.length > 0) {
        console.log("First repair order statusId:", data[0].statusId);
      }
    } catch (error) {
      console.error("Failed to load repair orders:", error)
    }
  }

  // Step 1 implementation: Fetch the list of statuses
  const loadStatuses = async () => {
    try {
      const data = await repairOrderService.fetchOrderStatuses()
      setStatuses(data)
      
      // Additional debugging
      if (data.length > 0) {
        console.log("First status ID:", data[0].orderStatusId);
      }
    } catch (error) {
      console.error("Failed to load statuses:", error)
    }
  }

  // Wrapper function to convert Job to RepairOrder and call the API
  const handleCreateRepairOrderWrapper = async (jobData: Omit<Job, "id">) => {
    try {
      // Extract the additional properties that were spread into the jobData
      const additionalData = jobData as Omit<Job, "id"> & {
        customerId?: string;
        vehicleId?: string;
        receiveDate?: string;
        roType?: number;
        estimatedCompletionDate?: string;
        estimatedAmount?: number;
        note?: string;
        labelId?: number;
        estimatedRepairTime?: number;
        selectedServiceIds?: string[];
      };

      // Validate required fields
      if (!additionalData.customerId) {
        toast.error("Please select a customer");
        console.error("Customer ID is required");
        return;
      }
      
      if (!additionalData.vehicleId) {
        toast.error("Please select a vehicle");
        console.error("Vehicle ID is required");
        return;
      }

      // Map jobData to CreateRepairOrderRequest - only send the fields that are required
      const createRequest: CreateRepairOrderRequest = {
        customerId: additionalData.customerId,
        vehicleId: additionalData.vehicleId,
        receiveDate: additionalData.receiveDate || new Date().toISOString(),
        roType: additionalData.roType !== undefined ? additionalData.roType : 0, // 0: walkin, 1: scheduled, 2: breakdown
        estimatedCompletionDate: additionalData.estimatedCompletionDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Default to 7 days from now
        note: additionalData.note || "",
        // Use calculated values if available, otherwise use defaults
        estimatedAmount: additionalData.estimatedAmount || 0,
        estimatedRepairTime: additionalData.estimatedRepairTime || 0,
        // Add selected service IDs if available
        selectedServiceIds: additionalData.selectedServiceIds || []
      };

      // Log the request data for debugging
      console.log('Creating repair order with data:', JSON.stringify(createRequest, null, 2));
      
      // Call the repair order service to create the repair order
      const createdRepairOrder = await repairOrderService.createRepairOrder(createRequest);
      
      if (createdRepairOrder) {
        // Add the created repair order to the local state
        setRepairOrders((prev) => [...prev, createdRepairOrder]);
        setShowCreateForm(false);
        toast.success("Repair order created successfully");
        console.log("Successfully created repair order:", createdRepairOrder);
      } else {
        toast.error("Failed to create repair order");
        console.error("Failed to create repair order - API returned null");
      }
    } catch (error) {
      toast.error("Failed to create repair order. Please try again.");
      console.error("Failed to create repair order:", error);
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

  const handleLabelsUpdated = (repairOrderId: string, labels: Array<{
    labelId: string
    labelName: string
    colorName: string
    hexCode: string
    orderStatusId: number
  }>) => {
    setRepairOrders((prev) =>
      prev.map((ro) =>
        ro.repairOrderId === repairOrderId
          ? { ...ro, assignedLabels: labels }
          : ro
      )
    )
  }

  const handleCancelRepairOrder = async (cancelReason: string) => {
    if (!cancelingRepairOrderId) return

    setIsCanceling(true)
    try {
      await repairOrderService.cancelRepairOrder({
        repairOrderId: cancelingRepairOrderId,
        cancelReason
      })
      
      toast.success("Repair order canceled successfully")
      setCancelingRepairOrderId(null)
      
      // Refresh the repair orders list
      await loadRepairOrders()
    } catch (error) {
      console.error("Failed to cancel repair order:", error)
      toast.error("Failed to cancel repair order. Please try again.")
    } finally {
      setIsCanceling(false)
    }
  }

  const handleArchiveRepairOrder = async (archiveReason: string) => {
    if (!archivingRepairOrderId) return

    setIsArchiving(true)
    try {
      const currentUser = authService.getCurrentUser()
      
      if (!currentUser.userId) {
        toast.error("User not authenticated")
        return
      }
      
      await repairOrderService.archiveRepairOrder({
        repairOrderId: archivingRepairOrderId,
        archiveReason,
        archivedByUserId: currentUser.userId
      })
      
      toast.success("Repair order archived successfully")
      setArchivingRepairOrderId(null)
      
      // Refresh the repair orders list
      await loadRepairOrders()
    } catch (error) {
      console.error("Failed to archive repair order:", error)
      toast.error("Failed to archive repair order. Please try again.")
    } finally {
      setIsArchiving(false)
    }
  }

  // Handle drag and drop - this is the main function for moving repair orders
  const handleMoveRepairOrder = async (repairOrderId: string, newStatusId: string) => {
    try {
      // Call the API to update the status
      const result = await repairOrderHubService.updateRepairOrderStatus(repairOrderId, newStatusId);
      
      if (result.success) {
        console.log(`Successfully requested move of repair order ${repairOrderId} to status ${newStatusId}`);
        toast.success("Repair order status updated successfully");
        // The UI will be updated via SignalR notification, not directly here
      } else {
        console.error(`Failed to move repair order ${repairOrderId} to status ${newStatusId}: ${result.message}`);
        // Show specific error message from backend if available
        const errorMessage = result.message || "Failed to update repair order status";
        toast.error(errorMessage);
        // Revert the UI change if the API call failed
        // In a real implementation, you might want to show an error message to the user
      }
    } catch (error) {
      console.error("Failed to move repair order:", error);
      toast.error("An unexpected error occurred while updating repair order status");
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

  console.log("Rendering BoardPage - repair orders:", repairOrders, "statuses:", statuses);

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
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-gray-600 border-gray-200 hover:bg-gray-50"
                  onClick={() => router.push("/manager/garageSetting/ro-label")}
                >
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
                onCancelRepairOrder={setCancelingRepairOrderId}
                onArchiveRepairOrder={setArchivingRepairOrderId}
                onLabelsUpdated={handleLabelsUpdated}
                statuses={statuses}
                defaultLabels={defaultLabels}
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

      {/* Cancel Dialog */}
      <CancelRODialog
        open={!!cancelingRepairOrderId}
        onOpenChange={(open) => !open && setCancelingRepairOrderId(null)}
        onConfirm={handleCancelRepairOrder}
        repairOrderId={cancelingRepairOrderId || ""}
        isLoading={isCanceling}
      />

      {/* Archive Dialog */}
      <ArchiveRODialog
        open={!!archivingRepairOrderId}
        onOpenChange={(open) => !open && setArchivingRepairOrderId(null)}
        onConfirm={handleArchiveRepairOrder}
        repairOrderId={archivingRepairOrderId || ""}
        isLoading={isArchiving}
      />
    </div>
  )
}