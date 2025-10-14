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
  statuses?: OrderStatus[] // Add statuses prop for dynamic columns
}

export default function RoDragDropBoard({ 
  repairOrders, 
  loading, 
  onMoveRepairOrder, 
  onEditRepairOrder, 
  onDeleteRepairOrder,
  statuses // Accept statuses as prop
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
    return repairOrders.filter((repairOrder) => repairOrder.statusId === statusId)
  }

  // Use dynamic columns if provided, otherwise fallback to hardcoded ones
  const columns = statuses && statuses.length > 0
    ? statuses
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map(status => ({
        id: status.orderStatusId,
        title: status.statusName,
        repairOrders: getRepairOrdersByStatus(status.orderStatusId),
        bgColor: getBgColorForStatus(status.statusName),
        borderColor: getBorderColorForStatus(status.statusName),
      }))
    : [
      {
        id: "pending-status",
        title: "Pending",
        repairOrders: getRepairOrdersByStatus("pending-status"),
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
      },
      {
        id: "in-progress-status",
        title: "In Progress",
        repairOrders: getRepairOrdersByStatus("in-progress-status"),
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
      },
      {
        id: "completed-status",
        title: "Completed",
        repairOrders: getRepairOrdersByStatus("completed-status"),
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
      },
    ]

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
          isDragOver={draggedRepairOrder?.statusId !== column.id}
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