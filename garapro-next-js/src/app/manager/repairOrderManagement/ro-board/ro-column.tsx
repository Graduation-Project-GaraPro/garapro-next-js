"use client"

import type React from "react"

import { Badge } from "@/components/ui/badge"
import RepairOrderCard from "./ro-card"
import type { RepairOrder } from "@/types/manager/repair-order"

interface RoColumnProps {
  title: string
  repairOrders: RepairOrder[]
  statusId: string
  bgColor: string
  borderColor: string
  onDragStart: (repairOrder: RepairOrder) => void
  onDragEnd: () => void
  onDrop: (statusId: string) => void
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
  isPending?: boolean
  isCompleted?: boolean
  isDragOver: boolean
  defaultLabel?: { labelName: string; hexCode: string } | null
}

export interface OrderStatus {
  orderStatusId: string
  statusName: string
  repairOrderCount: number
  orderIndex: number
  cards: unknown[]
  availableLabels: unknown[]
}

export interface OrderStatusResponse {
  pending: OrderStatus[]
  inProgress: OrderStatus[]
  completed: OrderStatus[]
}

export default function RoColumn({
  title,
  repairOrders,
  statusId,
  bgColor,
  onDragStart,
  onDragEnd,
  onDrop,
  onEditRepairOrder,
  onDeleteRepairOrder,
  onCancelRepairOrder,
  onArchiveRepairOrder,
  onLabelsUpdated,
  isPending = false,
  isCompleted = false,
  isDragOver,
  defaultLabel = null,
}: RoColumnProps) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    onDrop(statusId)
  }

  return (
    <div
      className={`flex-1 border-r bg-white h-full min-h-0 flex flex-col ${isDragOver ? bgColor : ""}`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="p-1 border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">{title}</h2>
          <Badge variant="secondary">{repairOrders.length}</Badge>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
        {repairOrders.map((repairOrder) => (
          <RepairOrderCard
            key={repairOrder.repairOrderId}
            repairOrder={repairOrder}
            onDragStart={() => onDragStart(repairOrder)}
            onDragEnd={onDragEnd}
            onEdit={() => onEditRepairOrder(repairOrder)}
            onDelete={() => onDeleteRepairOrder(repairOrder.repairOrderId)}
            onCancel={onCancelRepairOrder ? () => onCancelRepairOrder(repairOrder.repairOrderId) : undefined}
            onArchive={onArchiveRepairOrder ? () => onArchiveRepairOrder(repairOrder.repairOrderId) : undefined}
            onLabelsUpdated={onLabelsUpdated}
            isPending={isPending}
            isCompleted={isCompleted}
            defaultLabel={defaultLabel}
          />
        ))}

        {repairOrders.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <p className="text-sm">No repair orders in this column</p>
          </div>
        )}
      </div>
    </div>
  )
}