"use client"

import { useState, useEffect } from "react"
import { Car, Calendar, Gauge, User, Loader2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { repairOrderService } from "@/services/manager/repair-order-service"
import type { CustomerVehicleInfo } from "@/types/manager/repair-order"
import { toast } from "sonner"

interface VehicleInformationProps {
  orderId: string
}

export default function VehicleInformation({ orderId }: VehicleInformationProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<CustomerVehicleInfo | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const info = await repairOrderService.getCustomerVehicleInfo(orderId)
        if (info) {
          setData(info)
        } else {
          setError("Failed to load customer and vehicle information")
        }
      } catch (err) {
        console.error("Error fetching customer vehicle info:", err)
        setError("Failed to load customer and vehicle information")
        toast.error("Failed to load information")
      } finally {
        setLoading(false)
      }
    }

    if (orderId) {
      fetchData()
    }
  }, [orderId])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">{error || "No data available"}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Customer & Vehicle Information</h2>
        <Badge variant="outline" className="text-sm">
          RO Status: {data.statusName}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vehicle Details Card */}
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <Car className="w-5 h-5 mr-2 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Vehicle Details</h3>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Brand</Label>
                <div className="p-2 border rounded-md bg-gray-50">{data.brandName}</div>
              </div>
              <div>
                <Label>Model</Label>
                <div className="p-2 border rounded-md bg-gray-50">{data.modelName}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Year</Label>
                <div className="p-2 border rounded-md bg-gray-50">{data.year}</div>
              </div>
              <div>
                <Label>Color</Label>
                <div className="p-2 border rounded-md bg-gray-50">{data.colorName}</div>
              </div>
            </div>

            <div>
              <Label>VIN</Label>
              <div className="p-2 border rounded-md bg-gray-50 font-mono text-sm">{data.vin}</div>
            </div>

            <div>
              <Label>License Plate</Label>
              <div className="p-2 border rounded-md bg-gray-50 font-semibold">{data.licensePlate}</div>
            </div>

            <div>
              <Label>Odometer</Label>
              <div className="p-2 border rounded-md bg-gray-50 flex items-center">
                <Gauge className="w-4 h-4 mr-2 text-gray-500" />
                <span className="font-medium">{data.odometer.toLocaleString()} km</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Customer Information Card */}
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <User className="w-5 h-5 mr-2 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Customer Information</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label>Full Name</Label>
              <div className="p-2 border rounded-md bg-gray-50 font-medium">{data.customerFullName}</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>First Name</Label>
                <div className="p-2 border rounded-md bg-gray-50">{data.customerFirstName}</div>
              </div>
              <div>
                <Label>Last Name</Label>
                <div className="p-2 border rounded-md bg-gray-50">{data.customerLastName}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Phone</Label>
                <div className="p-2 border rounded-md bg-gray-50 flex items-center">
                  <span className="font-mono">{data.customerPhone}</span>
                </div>
              </div>
              <div>
                <Label>Email</Label>
                <div className="p-2 border rounded-md bg-gray-50 text-sm break-all">{data.customerEmail}</div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Repair Order Information */}
      <Card className="p-6">
        <div className="flex items-center mb-4">
          <Calendar className="w-5 h-5 mr-2 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Repair Order Information</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Receive Date</Label>
            <div className="p-2 border rounded-md bg-gray-50">
              {new Date(data.receiveDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>
          <div>
            <Label>Current Status</Label>
            <div className="p-2 border rounded-md bg-gray-50">
              <Badge variant="outline" className="text-sm">{data.statusName}</Badge>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}