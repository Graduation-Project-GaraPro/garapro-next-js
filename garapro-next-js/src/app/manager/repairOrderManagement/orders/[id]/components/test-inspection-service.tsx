"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { inspectionService, InspectionDto } from "@/services/manager/inspection-service"

export default function TestInspectionService({ orderId }: { orderId: string }) {
  const [inspections, setInspections] = useState<InspectionDto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchInspections = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await inspectionService.getInspectionsByRepairOrderId(orderId)
      setInspections(data)
    } catch (err) {
      console.error("Failed to fetch inspections:", err)
      setError("Failed to fetch inspections")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (orderId) {
      fetchInspections()
    }
  }, [orderId])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test Inspection Service</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button onClick={fetchInspections} disabled={loading}>
            {loading ? "Loading..." : "Fetch Inspections"}
          </Button>
          
          {error && (
            <div className="text-red-500">
              Error: {error}
            </div>
          )}
          
          <div>
            <h3 className="font-medium">Inspection Data:</h3>
            <pre className="bg-gray-100 p-2 rounded mt-2 text-sm overflow-auto max-h-60">
              {JSON.stringify(inspections, null, 2)}
            </pre>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}