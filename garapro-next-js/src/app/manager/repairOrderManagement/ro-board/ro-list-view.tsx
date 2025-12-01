"use client"

import { useState } from "react"
import { MoreHorizontal, Edit, Trash2, DollarSign, User, Car, ExternalLink, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useRouter } from "next/navigation"
import type { RepairOrder } from "@/types/manager/repair-order"

interface ListViewProps {
  repairOrders: RepairOrder[]
  loading: boolean
  onEditRepairOrder: (repairOrder: RepairOrder) => void
  onDeleteRepairOrder: (repairOrderId: string) => void
}

type SortField = "roTypeName" | "customerName" | "statusId" | "estimatedAmount" | "estimatedCompletionDate" | "receiveDate"
type SortOrder = "asc" | "desc"

export default function ListView({ repairOrders, loading, onEditRepairOrder, onDeleteRepairOrder }: ListViewProps) {
  const router = useRouter()
  const [sortField, setSortField] = useState<SortField>("receiveDate")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  const sortedRepairOrders = [...repairOrders].sort((a, b) => {
    let aValue: string | number | Date
    let bValue: string | number | Date

    // Handle different data types
    switch (sortField) {
      case "estimatedAmount":
        aValue = a.estimatedAmount || 0
        bValue = b.estimatedAmount || 0
        break
      case "estimatedCompletionDate":
      case "receiveDate":
        aValue = new Date(a[sortField] || 0)
        bValue = new Date(b[sortField] || 0)
        break
      default:
        aValue = String(a[sortField] || "").toLowerCase()
        bValue = String(b[sortField] || "").toLowerCase()
    }

    if (aValue < bValue) return sortOrder === "asc" ? -1 : 1
    if (aValue > bValue) return sortOrder === "asc" ? 1 : -1
    return 0
  })

  const handleRowClick = (repairOrder: RepairOrder, e: React.MouseEvent) => {
    // Prevent navigation when clicking on dropdown or other interactive elements
    if ((e.target as HTMLElement).closest('[role="menuitem"], button')) {
      return
    }
    router.push(`/manager/repairOrderManagement/orders/${repairOrder.repairOrderId}`)
  }

  const getStatusColor = (statusId: string | undefined | null) => {
    if (!statusId || typeof statusId !== 'string') {
      return "bg-gray-100 text-gray-700 border-gray-200"
    }
    
    // This would need to be updated to use the actual status data
    switch (statusId.toLowerCase()) {
      case "pending-status":
        return "bg-red-100 text-red-700 border-red-200"
      case "in-progress-status":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      case "completed-status":
        return "bg-green-100 text-green-700 border-green-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  if (loading) {
    return (
      <div className="flex-1 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Repair Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5].map((i) => (
              <TableRow key={i}>
                <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-white overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleSort("roTypeName")}
                className="h-auto p-0 font-semibold hover:bg-transparent"
              >
                Repair Order
                <ArrowUpDown className="ml-2 h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead className="w-[200px]">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleSort("customerName")}
                className="h-auto p-0 font-semibold hover:bg-transparent"
              >
                Customer
                <ArrowUpDown className="ml-2 h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead className="w-[150px]">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleSort("statusId")}
                className="h-auto p-0 font-semibold hover:bg-transparent"
              >
                Status
                <ArrowUpDown className="ml-2 h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead className="w-[120px]">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleSort("estimatedAmount")}
                className="h-auto p-0 font-semibold hover:bg-transparent"
              >
                Amount
                <ArrowUpDown className="ml-2 h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead className="w-[120px]">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleSort("estimatedCompletionDate")}
                className="h-auto p-0 font-semibold hover:bg-transparent"
              >
                Due Date
                <ArrowUpDown className="ml-2 h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedRepairOrders.map((repairOrder) => (
            <TableRow 
              key={repairOrder.repairOrderId} 
              className="cursor-pointer hover:bg-gray-50"
              onClick={(e) => handleRowClick(repairOrder, e)}
            >
              <TableCell className="font-medium">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-blue-600">RO #{repairOrder.repairOrderId.substring(0, 8)}</span>
                    <ExternalLink className="w-3 h-3 text-gray-400" />
                  </div>
                  <div className="text-sm text-gray-900">{repairOrder.roTypeName}</div>
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <Car className="w-3 h-3" />
                    <span>Vehicle ID: {repairOrder.vehicleId}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="text-sm font-medium">{repairOrder.customerName}</div>
                  {repairOrder.customerPhone && <div className="text-xs text-gray-600">{repairOrder.customerPhone}</div>}
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <Badge
                    variant="outline"
                    className={`text-xs font-medium ${getStatusColor(repairOrder.statusId)}`}
                  >
                    {repairOrder.statusId}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>Tech: {repairOrder.technicianNames.join(", ") || "Unassigned"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3 text-green-600" />
                      <span className="font-semibold text-green-600">
                        {(repairOrder.estimatedAmount || 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                      </span>
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  {repairOrder.estimatedCompletionDate ? (
                    <div>
                      <div className="font-medium">{new Date(repairOrder.estimatedCompletionDate).toLocaleDateString()}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(repairOrder.estimatedCompletionDate).toLocaleDateString() === new Date().toLocaleDateString() 
                          ? "Today" 
                          : new Date(repairOrder.estimatedCompletionDate) < new Date() 
                            ? "Overdue" 
                            : "Upcoming"}
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-500">No due date</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEditRepairOrder(repairOrder)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDeleteRepairOrder(repairOrder.repairOrderId)} className="text-red-600">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
          {sortedRepairOrders.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
                <div className="text-gray-500">
                  <p className="text-sm">No repair orders found</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}