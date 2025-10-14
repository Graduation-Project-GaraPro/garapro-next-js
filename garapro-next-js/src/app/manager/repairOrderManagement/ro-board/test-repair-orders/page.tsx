"use client"

import { useState, useEffect } from "react"
import { repairOrderService } from "@/services/manager/repair-order-service"
import type { RepairOrder } from "@/types/manager/repair-order"

export default function TestRepairOrdersPage() {
  const [repairOrders, setRepairOrders] = useState<RepairOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRepairOrders = async () => {
      try {
        setLoading(true)
        const data = await repairOrderService.getAllRepairOrders()
        setRepairOrders(data)
        console.log("Repair orders:", data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch repair orders')
        console.error("Error fetching repair orders:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchRepairOrders()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Testing Repair Order API</h1>
        <p>Loading repair orders...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Testing Repair Order API</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Repair Order Data</h1>
      <div className="mb-4">
        <p>Loaded {repairOrders.length} repair orders</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {repairOrders.map((repairOrder) => (
          <div key={repairOrder.repairOrderId} className="border rounded-lg p-4">
            <h2 className="font-bold text-lg">RO #{repairOrder.repairOrderId.substring(0, 8)}</h2>
            <p className="text-gray-600">Customer: {repairOrder.customerName || "N/A"}</p>
            <p className="text-gray-600">Phone: {repairOrder.customerPhone}</p>
            <p className="text-gray-600">Status: {repairOrder.paidStatus}</p>
            <p className="text-gray-600">Type: {repairOrder.roTypeName}</p>
            <p className="text-gray-600">Note: {repairOrder.note}</p>
            <p className="text-gray-600">Created: {new Date(repairOrder.createdAt).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  )
}