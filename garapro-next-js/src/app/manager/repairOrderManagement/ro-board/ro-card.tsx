"use client"

import { useState } from "react"
import { MoreHorizontal, Edit, Trash2, Clock, DollarSign, User, ExternalLink, Calendar, XCircle, Archive, Tag } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useRouter } from "next/navigation"
import LabelSelectionDialog from "./label-selection-dialog"
import type { RepairOrder } from "@/types/manager/repair-order"
import { PaidStatus } from "@/types/manager/repair-order"

interface RepairOrderCardProps {
  repairOrder: RepairOrder
  onDragStart: () => void
  onDragEnd: () => void
  onEdit: () => void
  onDelete: () => void
  onCancel?: () => void
  onArchive?: () => void
  onLabelsUpdated?: (repairOrderId: string, labels: Array<{
    labelId: string
    labelName: string
    colorName: string
    hexCode: string
    orderStatusId: number
  }>) => void
  isPending?: boolean
  isCompleted?: boolean
  defaultLabel?: { labelName: string; hexCode: string } | null
}

export default function RepairOrderCard({ 
  repairOrder, 
  onDragStart, 
  onDragEnd, 
  onEdit, 
  onDelete, 
  onCancel,
  onArchive,
  onLabelsUpdated,
  isPending = false,
  isCompleted = false,
  defaultLabel = null
}: RepairOrderCardProps) {
  const router = useRouter()
  const [showLabelDialog, setShowLabelDialog] = useState(false)

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if dialog is open
    if (showLabelDialog) {
      return
    }
    
    // Prevent navigation when clicking on dropdown or other interactive elements
    const target = e.target as HTMLElement
    if (target.closest('[role="menuitem"], button, [data-label-area], [role="dialog"]')) {
      return
    }
    
    router.push(`/manager/repairOrderManagement/orders/${repairOrder.repairOrderId}`)
  }

  const handleLabelsUpdated = (labels: Array<{
    labelId: string
    labelName: string
    colorName: string
    hexCode: string
    orderStatusId: number
  }>) => {
    if (onLabelsUpdated) {
      onLabelsUpdated(repairOrder.repairOrderId, labels)
    }
  }

  // Determine which labels to display
  const displayLabels = repairOrder.assignedLabels && repairOrder.assignedLabels.length > 0
    ? repairOrder.assignedLabels
    : defaultLabel
    ? [defaultLabel]
    : []

  // Show archive icon only for:
  // 1. Cancelled ROs, OR
  // 2. Completed ROs that are fully paid
  const canArchive = repairOrder.isCancelled || (isCompleted && repairOrder.paidStatus === PaidStatus.Paid)

  const getPaidStatusColor = (status: PaidStatus) => {
    switch (status) {
      case PaidStatus.Paid:
        return "bg-green-100 text-green-700 border-green-200"
      case PaidStatus.Partial:
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      case PaidStatus.Unpaid:
        return "bg-red-100 text-red-700 border-red-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "walkin":
        return "bg-blue-100 text-blue-700 border-blue-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  return (
    <Card
      className={`group rounded-sm border cursor-move hover:shadow-md transition-shadow ${
        repairOrder.isCancelled 
          ? 'border-red-300 bg-red-50/30 opacity-75' 
          : 'border-gray-200 hover:border-blue-300'
      }`}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={handleCardClick}
    >
      <CardHeader className="px-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 flex-wrap">
            {repairOrder.isCancelled && (
              <Badge
                variant="outline"
                className="text-xs font-medium px-1 py-0 h-4 bg-red-100 text-red-700 border-red-300"
              >
                CANCELLED
              </Badge>
            )}
            <Badge
              variant="outline"
              className={`text-xs font-medium px-1 py-0 h-4 ${getPaidStatusColor(repairOrder.paidStatus)}`}
            >
              {repairOrder.paidStatus}
            </Badge>
            <span className="text-xs font-semibold text-blue-600">RO #{repairOrder.repairOrderId.substring(0, 8)}</span>
            <ExternalLink className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                <MoreHorizontal className="w-2.5 h-2.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              {isPending && onCancel && (
                <DropdownMenuItem onClick={onCancel} className="text-orange-600">
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancel
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={onDelete} className="text-red-600">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="mt-0.5">
          <div className="text-xs text-gray-900 font-medium leading-tight">
            {repairOrder.note || "No description"} • {repairOrder.roTypeName}
          </div>
          {repairOrder.isCancelled && repairOrder.cancelReason && (
            <div className="text-xs text-red-600 italic mt-0.5">
              Reason: {repairOrder.cancelReason}
            </div>
          )}
          {/* Display labels - clickable to open selection dialog */}
          <div 
            className="flex flex-wrap gap-1 mt-1 cursor-pointer hover:opacity-80 transition-opacity"
            data-label-area
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setShowLabelDialog(true)
            }}
            onMouseDown={(e) => {
              e.stopPropagation()
            }}
          >
            {displayLabels.length > 0 ? (
              displayLabels.map((label, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-xs font-medium px-1.5 py-0 h-4"
                  style={{
                    backgroundColor: `${label.hexCode}20`,
                    borderColor: label.hexCode,
                    color: label.hexCode
                  }}
                >
                  {label.labelName}
                </Badge>
              ))
            ) : (
              <Badge
                variant="outline"
                className="text-xs font-medium px-1.5 py-0 h-4 bg-gray-100 text-gray-500 border-gray-300"
              >
                <Tag className="w-2.5 h-2.5 mr-1" />
                Add Label
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-1 pb-1.5 px-2 space-y-1">
        <div className="flex items-center gap-1 text-xs">
          <User className="w-2.5 h-2.5 text-gray-500 flex-shrink-0" />
          <span className="font-medium">
            {repairOrder.customerName || "No customer name"} • {repairOrder.customerPhone}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              <Calendar className="w-2.5 h-2.5 text-gray-500" />
              <span className="text-gray-600">
                Created: {formatDate(repairOrder.createdAt)}
              </span>
            </div>
            <div className="flex items-center gap-0.5">
              <Clock className="w-2.5 h-2.5 text-gray-500" />
              <span className="text-gray-600">{repairOrder.estimatedRepairTime} mins</span>
            </div>
          </div>
          <div className="flex items-center gap-0.5">
            <span className="font-semibold text-green-600">
              {repairOrder.cost > 0 
                ? formatCurrency(repairOrder.cost)
                : formatCurrency(repairOrder.estimatedAmount)
              }
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <div className="flex-1 bg-gray-200 rounded-full h-0.5">
            <div
              className="bg-blue-500 h-0.5 rounded-full transition-all duration-300"
              style={{ width: `${repairOrder.progressPercentage || 0}%` }}
            />
          </div>
          <span className="text-xs font-medium text-gray-900">{repairOrder.progressPercentage || 0}%</span>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 pt-0.5">
          <div className="flex items-center gap-1">
            <span>Est. completion: {formatDate(repairOrder.estimatedCompletionDate)}</span>
            {canArchive && onArchive && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-blue-100"
                      onClick={(e) => {
                        e.stopPropagation()
                        onArchive()
                      }}
                    >
                      <Archive className="w-3 h-3 text-blue-600" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Archive this repair order</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <Badge
            variant="outline"
            className={`text-xs font-medium px-1 py-0 h-4 ${getTypeColor(repairOrder.roTypeName)}`}
          >
            {repairOrder.roTypeName}
          </Badge>
        </div>
      </CardContent>

      {/* Label Selection Dialog */}
      <LabelSelectionDialog
        open={showLabelDialog}
        onOpenChange={setShowLabelDialog}
        repairOrderId={repairOrder.repairOrderId}
        currentStatusId={Number(repairOrder.statusId)}
        currentLabels={repairOrder.assignedLabels?.map((l) => l.labelId) || []}
        onLabelsUpdated={handleLabelsUpdated}
      />
    </Card>
  )
}