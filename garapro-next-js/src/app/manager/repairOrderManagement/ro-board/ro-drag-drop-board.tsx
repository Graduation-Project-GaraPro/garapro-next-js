"use client"

import { useState } from "react"
import RoColumn from "./ro-column"
import type { RepairOrder } from "@/types/manager/repair-order"
import type { OrderStatus } from "@/types/manager/order-status"

interface DragDropBoardProps {
  repairOrders: RepairOrder[]
  loading: boolean
  onMoveRepairOrder: (repairOrderId: string, newStatusId: string) => void
  onEditRepairOrder: (repairOrder: RepairOrder) => void
  onDeleteRepairOrder: (repairOrderId: string) => void
  onCancelRepairOrder?: (repairOrderId: string) => void
  onArchiveRepairOrder?: (repairOrderId: string) => void
  onLabelsUpdated?: (repairOrderId: string, labels: Array<{
    labelId: string
    labelName: string
    colorName: string
    hexCode: string
    orderStatusId: number
  }>) => void
  statuses?: OrderStatus[] // Add statuses prop for dynamic columns
  defaultLabels?: Map<string, { labelName: string; hexCode: string }> // Default label per status
}

export default function RoDragDropBoard({ 
  repairOrders, 
  loading, 
  onMoveRepairOrder, 
  onEditRepairOrder, 
  onDeleteRepairOrder,
  onCancelRepairOrder,
  onArchiveRepairOrder,
  onLabelsUpdated,
  statuses, // Accept statuses as prop
  defaultLabels = new Map() // Accept default labels
}: DragDropBoardProps) {
  const [draggedRepairOrder, setDraggedRepairOrder] = useState<RepairOrder | null>(null)

  const handleDragStart = (repairOrder: RepairOrder) => {
    setDraggedRepairOrder(repairOrder)
  }

  const handleDragEnd = () => {
    setDraggedRepairOrder(null)
  }

  const handleDrop = (statusId: string) => {
    if (draggedRepairOrder && draggedRepairOrder.statusId !== statusId) {
      // Call the parent handler to move the repair order
      onMoveRepairOrder(draggedRepairOrder.repairOrderId, statusId)
    }
    setDraggedRepairOrder(null)
  }

  const getRepairOrdersByStatus = (statusId: string) => {
    const filtered = repairOrders.filter((repairOrder) => {
      // Convert both values to strings for comparison to handle any type mismatches
      const orderStatusId = String(repairOrder.statusId);
      const targetStatusId = String(statusId);
      const matches = orderStatusId === targetStatusId;
      return matches;
    });
    return filtered;
  }

  // Use dynamic columns if provided, otherwise fallback to hardcoded ones
  const columns = statuses && statuses.length > 0
    ? statuses
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map(status => {
        const repairOrdersForStatus = getRepairOrdersByStatus(status.orderStatusId);
        return {
          id: status.orderStatusId,
          title: status.statusName,
          repairOrders: repairOrdersForStatus,
          bgColor: getBgColorForStatus(status.statusName),
          borderColor: getBorderColorForStatus(status.statusName),
        };
      })
    : [
      {
        id: "1",
        title: "Pending",
        repairOrders: getRepairOrdersByStatus("1"),
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
      },
      {
        id: "2",
        title: "In Progress",
        repairOrders: getRepairOrdersByStatus("2"),
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
      },
      {
        id: "3",
        title: "Completed",
        repairOrders: getRepairOrdersByStatus("3"),
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
      },
    ]

  // Add a check to see if we have any repair orders at all
  if (loading) {
    return (
      <div className="flex h-full min-h-0">
        {columns.map((column) => (
          <div key={column.id} className="flex-1 border-r bg-white h-full min-h-0">
            <div className="p-4 border-b bg-gray-50">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-800">{column.title}</h2>
                <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="p-4 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Helper function to check if a status is "Pending"
  const isPendingStatus = (statusName: string) => {
    return statusName.toLowerCase().includes('pending')
  }

  // Helper function to check if a status is "Completed"
  const isCompletedStatus = (statusName: string) => {
    return statusName.toLowerCase().includes('complete')
  }

  return (
    <div className="flex h-full min-h-0">
      {columns.map((column) => (
        <RoColumn
          key={column.id}
          title={`${column.title} (${column.repairOrders.length})`}
          repairOrders={column.repairOrders}
          statusId={column.id}
          bgColor={column.bgColor}
          borderColor={column.borderColor}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDrop={handleDrop}
          onEditRepairOrder={onEditRepairOrder}
          onDeleteRepairOrder={onDeleteRepairOrder}
          onCancelRepairOrder={onCancelRepairOrder}
          onArchiveRepairOrder={onArchiveRepairOrder}
          onLabelsUpdated={onLabelsUpdated}
          isPending={isPendingStatus(column.title)}
          isCompleted={isCompletedStatus(column.title)}
          isDragOver={draggedRepairOrder?.statusId !== column.id}
          defaultLabel={defaultLabels.get(column.id) || null}
        />
      ))}
    </div>
  )
}

// Helper functions for styling based on status name
function getBgColorForStatus(statusName: string): string {
  const lowerStatus = statusName.toLowerCase()
  if (lowerStatus.includes('pending') || lowerStatus.includes('require')) {
    return "bg-red-50"
  } else if (lowerStatus.includes('progress') || lowerStatus.includes('in progress')) {
    return "bg-yellow-50"
  } else if (lowerStatus.includes('complete') || lowerStatus.includes('ready')) {
    return "bg-green-50"
  } else if (lowerStatus.includes('hold') || lowerStatus.includes('pause')) {
    return "bg-blue-50"
  } else {
    return "bg-gray-50"
  }
}

function getBorderColorForStatus(statusName: string): string {
  const lowerStatus = statusName.toLowerCase()
  if (lowerStatus.includes('pending') || lowerStatus.includes('require')) {
    return "border-red-200"
  } else if (lowerStatus.includes('progress') || lowerStatus.includes('in progress')) {
    return "border-yellow-200"
  } else if (lowerStatus.includes('complete') || lowerStatus.includes('ready')) {
    return "border-green-200"
  } else if (lowerStatus.includes('hold') || lowerStatus.includes('pause')) {
    return "border-blue-200"
  } else {
    return "border-gray-200"
  }
}