"use client"

import { useState, useEffect } from "react"
import { repairOrderService } from "@/services/manager/repair-order-service"
import type { OrderStatus } from "@/types/manager/order-status"
import type { RepairOrder } from "@/types/manager/repair-order"

export default function TestApiPage() {
  const [statuses, setStatuses] = useState<OrderStatus[]>([])
  const [repairOrders, setRepairOrders] = useState<RepairOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Test fetching order statuses
        console.log("Fetching order statuses...")
        const statusData = await repairOrderService.fetchOrderStatuses()
        console.log("Order statuses:", statusData)
        setStatuses(statusData)
        
        // Test fetching repair orders
        console.log("Fetching repair orders...")
        const repairOrderData = await repairOrderService.getAllRepairOrders()
        console.log("Repair orders:", repairOrderData)
        setRepairOrders(repairOrderData)
      } catch (err) {
        console.error("Error in fetchData:", err)
        setError(err instanceof Error ? err.message : 'An unknown error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Testing API Connection</h1>
        <p>Loading data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Testing API Connection</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">API Test Results</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Order Statuses</h2>
        <p>Loaded {statuses.length} statuses</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {statuses.map((status) => (
            <div key={status.orderStatusId} className="border rounded-lg p-4">
              <h3 className="font-bold">{status.statusName}</h3>
              <p className="text-gray-600">ID: {status.orderStatusId}</p>
              <p className="text-gray-600">Index: {status.orderIndex}</p>
              <p className="text-gray-600">Count: {status.repairOrderCount}</p>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-4">Repair Orders</h2>
        <p>Loaded {repairOrders.length} repair orders</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {repairOrders.map((repairOrder) => (
            <div key={repairOrder.repairOrderId} className="border rounded-lg p-4">
              <h3 className="font-bold">RO #{repairOrder.repairOrderId.substring(0, 8)}</h3>
              <p className="text-gray-600">Customer: {repairOrder.customerName}</p>
              <p className="text-gray-600">Phone: {repairOrder.customerPhone}</p>
              <p className="text-gray-600">Status: {repairOrder.paidStatus}</p>
              <p className="text-gray-600">Type: {repairOrder.roTypeName}</p>
              <p className="text-gray-600">Note: {repairOrder.note}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}