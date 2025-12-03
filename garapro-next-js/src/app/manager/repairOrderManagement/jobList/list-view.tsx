"use client"

import { useState, useEffect } from "react"
import { ArrowUpDown, Wrench, ChevronLeft, ChevronRight, Calendar, User, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { repairOrderService } from "@/services/manager/repair-order-service"
import type { RepairOrder } from "@/types/manager/repair-order"

export default function ListView() {
  const router = useRouter()
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [repairOrders, setRepairOrders] = useState<RepairOrder[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)

  // Fetch repair orders with pagination
  useEffect(() => {
    const fetchRepairOrders = async () => {
      setLoading(true)
      try {
        const result = await repairOrderService.getRepairOrdersListView(
          currentPage,
          pageSize,
          'ReceiveDate',
          sortOrder === 'desc' ? 'Desc' : 'Asc'
        )
        setRepairOrders(result.items)
        setTotalPages(result.totalPages)
        setTotalCount(result.totalCount)
      } catch (error) {
        console.error("Failed to fetch repair orders:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRepairOrders()
  }, [currentPage, pageSize, sortOrder])

  const handleSort = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
  }

  const handleRowClick = (ro: RepairOrder, e: React.MouseEvent) => {
    // Prevent navigation when clicking on dropdown or other interactive elements
    if ((e.target as HTMLElement).closest('[role="menuitem"], button')) {
      return
    }
    router.push(`/manager/repairOrderManagement/orders/${ro.repairOrderId}`)
  }

  const getStatusText = (statusId: string) => {
    switch (statusId) {
      case "1": return "Pending"
      case "2": return "In Progress"
      case "3": return "Completed"
      default: return "Unknown"
    }
  }

  const getStatusColor = (statusId: string) => {
    switch (statusId) {
      case "1": return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "2": return "bg-blue-100 text-blue-800 border-blue-200"
      case "3": return "bg-green-100 text-green-800 border-green-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  // Calculate display range
  const startIndex = (currentPage - 1) * pageSize + 1
  const endIndex = Math.min(currentPage * pageSize, totalCount)

  // Reset to page 1 when page size changes
  const handlePageSizeChange = (newSize: string) => {
    setPageSize(Number(newSize))
    setCurrentPage(1)
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
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
              <TableHead>Created</TableHead>
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 bg-white rounded-lg shadow overflow-hidden h-[calc(100vh-200px)]">
      <div className="flex-1 overflow-y-auto">
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleSort}
                  className="h-auto p-0 font-semibold hover:bg-transparent"
                >
                  Repair Order
                  <ArrowUpDown className="ml-2 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead className="w-[200px]">Customer</TableHead>
              <TableHead className="w-[150px]">Status</TableHead>
              <TableHead className="w-[150px]">Amount</TableHead>
              <TableHead className="w-[120px]">Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {repairOrders.map((ro) => (
              <TableRow 
                key={ro.repairOrderId} 
                className="cursor-pointer hover:bg-gray-50"
                onClick={(e) => handleRowClick(ro, e)}
              >
                <TableCell className="font-medium">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-semibold text-blue-600">RO #{ro.repairOrderId.substring(0, 8)}</span>
                    </div>
                    {ro.note && (
                      <div className="text-xs text-gray-500">{ro.note}</div>
                    )}
                    <div className="text-xs text-gray-500">{ro.roTypeName}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-sm font-medium">
                      <User className="w-3 h-3 text-gray-500" />
                      {ro.customerName}
                    </div>
                    <div className="text-xs text-gray-500">{ro.customerPhone}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`text-xs font-medium ${getStatusColor(ro.statusId)}`}
                  >
                    {getStatusText(ro.statusId)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3 text-green-600" />
                    <span className="text-sm font-semibold text-green-600">
                      {formatCurrency(ro.cost > 0 ? ro.cost : ro.estimatedAmount)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar className="w-3 h-3 text-gray-500" />
                    {new Date(ro.createdAt).toLocaleDateString('vi-VN')}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {repairOrders.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="text-gray-500">
                    <Wrench className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                    <p className="text-sm">No repair orders found</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {totalCount > 0 && (
        <div className="border-t px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Rows per page:</span>
            <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
              <SelectTrigger className="w-[70px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700">
              {startIndex}-{endIndex} of {totalCount}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-gray-700 px-2">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
