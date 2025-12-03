"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Archive, Eye, Search, Calendar, User, Car, DollarSign, FileText } from "lucide-react"
import ArchivedRODetailDialog from "./archived-ro-detail-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { repairOrderService } from "@/services/manager/repair-order-service"
import type { RepairOrder } from "@/types/manager/repair-order"

export default function ArchivedOrdersPage() {
  const [archivedOrders, setArchivedOrders] = useState<RepairOrder[]>([])
  const [filteredOrders, setFilteredOrders] = useState<RepairOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    loadArchivedOrders()
  }, [])

  useEffect(() => {
    filterOrders()
  }, [searchQuery, archivedOrders])

  const loadArchivedOrders = async () => {
    try {
      setLoading(true)
      const orders = await repairOrderService.getArchivedRepairOrders()
      setArchivedOrders(orders)
      setFilteredOrders(orders)
    } catch (error) {
      console.error("Failed to load archived orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterOrders = () => {
    if (!searchQuery.trim()) {
      setFilteredOrders(archivedOrders)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = archivedOrders.filter((order) => {
      return (
        order.repairOrderId?.toLowerCase().includes(query) ||
        order.customerName?.toLowerCase().includes(query) ||
        order.roTypeName?.toLowerCase().includes(query)
      )
    })
    setFilteredOrders(filtered)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch {
      return "N/A"
    }
  }

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return "$0.00"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const handleViewDetails = (orderId: string) => {
    setSelectedOrderId(orderId)
    setIsDetailDialogOpen(true)
  }

  const handleViewFullPage = (orderId: string) => {
    router.push(`/manager/repairOrderManagement/orders/${orderId}`)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b bg-background px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted">
              <Archive className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Archived Orders</h1>
              <p className="text-sm text-muted-foreground">
                View all archived repair orders
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by order ID, customer, vehicle..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Archived Repair Orders</CardTitle>
            <CardDescription>
              {loading
                ? "Loading archived orders..."
                : `${filteredOrders.length} archived order${filteredOrders.length !== 1 ? "s" : ""} found`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-muted-foreground">Loading...</div>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Archive className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No archived orders found</h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery
                    ? "Try adjusting your search criteria"
                    : "Archived orders will appear here"}
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created Date</TableHead>
                      <TableHead>Archived Date</TableHead>
                      <TableHead className="text-right">Cost</TableHead>
                      <TableHead className="text-right">Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.repairOrderId}>

                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>{order.customerName || "N/A"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{order.customerPhone || "N/A"}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {order.roTypeName || "Unknown"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {formatDate(order.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            <Archive className="h-4 w-4 text-muted-foreground" />
                            {formatDate(order.archivedAt || undefined)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              {formatCurrency(order.cost)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetails(order.repairOrderId)}
                              title="View Details"
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Archived RO Detail Dialog */}
      {selectedOrderId && (
        <ArchivedRODetailDialog
          open={isDetailDialogOpen}
          onOpenChange={setIsDetailDialogOpen}
          repairOrderId={selectedOrderId}
        />
      )}
    </div>
  )
}
