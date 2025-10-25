"use client"

import { useState, useEffect } from "react"
import { repairOrderService } from "@/services/manager/repair-order-service"
import type { OrderStatus } from "@/types/manager/order-status"

export default function TestStatusFetch() {
  const [statuses, setStatuses] = useState<OrderStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        setLoading(true)
        const data = await repairOrderService.fetchOrderStatuses()
        setStatuses(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch statuses')
      } finally {
        setLoading(false)
      }
    }

    fetchStatuses()
  }, [])

  if (loading) {
    return <div>Loading statuses...</div>
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Order Statuses</h2>
      <ul className="space-y-2">
        {statuses.map((status) => (
          <li key={status.orderStatusId} className="p-2 border rounded">
            <div className="font-medium">{status.statusName}</div>
            <div className="text-sm text-gray-600">
              ID: {status.orderStatusId} | Index: {status.orderIndex} | Count: {status.repairOrderCount}
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-4 text-sm text-gray-500">
        Total statuses: {statuses.length}
      </div>
    </div>
  )
}