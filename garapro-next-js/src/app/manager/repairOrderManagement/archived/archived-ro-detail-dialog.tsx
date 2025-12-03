"use client"

import { useState, useEffect } from "react"
import { X, Calendar, User, Car, DollarSign, Package, Wrench, FileText, Archive } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { repairOrderService } from "@/services/manager/repair-order-service"
import { formatVND } from "@/lib/currency"

interface ArchivedRODetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  repairOrderId: string
}

interface ArchivedRODetail {
  repairOrderId: string
  receiveDate: string
  roType: number
  roTypeName: string
  estimatedCompletionDate: string
  completionDate: string
  cost: number
  estimatedAmount: number
  paidAmount: number
  missingCost: number
  outstandingAmount: number
  paidStatus: number
  estimatedRepairTime: number
  note: string
  createdAt: string
  updatedAt: string
  isArchived: boolean
  archivedAt: string
  archivedByUserId: string
  archivedByUserName: string
  archiveReason: string | null
  branchName: string
  statusName: string
  statusColor: string
  customerName: string
  customerEmail: string
  customerPhone: string
  vehicle: {
    licensePlate: string
    vin: string
    year: number
    odometer: number
    brandName: string
    modelName: string
    colorName: string
  }
  services: Array<{
    repairOrderServiceId: string
    serviceName: string
    serviceDescription: string
    servicePrice: number
    quantity: number
    totalPrice: number
    parts: Array<{
      partName: string
      partCode: string
      partPrice: number
      quantity: number
      totalPrice: number
    }>
  }>
  jobs: Array<{
    jobId: string
    jobName: string
    technicianName: string
    startTime: string | null
    endTime: string | null
    status: string
    notes: string
  }>
  totalJobs: number
  completedJobs: number
  progressPercentage: number
}

export default function ArchivedRODetailDialog({
  open,
  onOpenChange,
  repairOrderId,
}: ArchivedRODetailDialogProps) {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<ArchivedRODetail | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open && repairOrderId) {
      loadArchivedRODetail()
    }
  }, [open, repairOrderId])

  const loadArchivedRODetail = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/RepairOrder/archived/${repairOrderId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error("Failed to load archived RO details")
      }

      const result = await response.json()
      setData(result)
    } catch (err) {
      console.error("Error loading archived RO:", err)
      setError("Failed to load archived repair order details")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return "N/A"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-8xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Archive className="h-5 w-5 text-gray-500" />
              Archived Repair Order Details
            </DialogTitle>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading details...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-700">{error}</p>
          </div>
        ) : data ? (
          <div className="space-y-6">
            {/* Header Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">RO #{data.repairOrderId.substring(0, 8)}</h3>
                <Badge style={{ backgroundColor: data.statusColor, color: "#fff" }}>
                  {data.statusName}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">Type:</span> {data.roTypeName}
                </div>
                <div>
                  <span className="text-gray-600">Branch:</span> {data.branchName}
                </div>
              </div>
            </div>

            {/* Archive Info */}
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Archive className="h-4 w-4 text-yellow-700" />
                <h4 className="font-semibold text-yellow-900">Archive Information</h4>
              </div>
              <div className="space-y-1 text-sm">
                <div>
                  <span className="text-gray-700">Archived At:</span>{" "}
                  <span className="font-medium">{formatDate(data.archivedAt)}</span>
                </div>
                <div>
                  <span className="text-gray-700">Archived By:</span>{" "}
                  <span className="font-medium">{data.archivedByUserName}</span>
                </div>
                {data.archiveReason && (
                  <div>
                    <span className="text-gray-700">Reason:</span>{" "}
                    <span className="font-medium">{data.archiveReason}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Customer & Vehicle */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <User className="h-4 w-4 text-blue-600" />
                  <h4 className="font-semibold">Customer</h4>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="font-medium">{data.customerName}</div>
                  <div className="text-gray-600">{data.customerPhone}</div>
                  <div className="text-gray-600">{data.customerEmail}</div>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Car className="h-4 w-4 text-green-600" />
                  <h4 className="font-semibold">Vehicle</h4>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="font-medium">
                    {data.vehicle.brandName} {data.vehicle.modelName} ({data.vehicle.year})
                  </div>
                  <div className="text-gray-600">Plate: {data.vehicle.licensePlate}</div>
                  <div className="text-gray-600">VIN: {data.vehicle.vin}</div>
                  <div className="text-gray-600">Odometer: {data.vehicle.odometer.toLocaleString()} km</div>
                </div>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="h-4 w-4 text-purple-600" />
                <h4 className="font-semibold">Financial Summary</h4>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-gray-600">Estimated</div>
                  <div className="font-semibold">{formatVND(data.estimatedAmount)}</div>
                </div>
                <div>
                  <div className="text-gray-600">Actual Cost</div>
                  <div className="font-semibold">{formatVND(data.cost)}</div>
                </div>
                <div>
                  <div className="text-gray-600">Paid Amount</div>
                  <div className="font-semibold text-green-600">{formatVND(data.paidAmount)}</div>
                </div>
              </div>
            </div>

            {/* Services */}
            {data.services && data.services.length > 0 && (
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Package className="h-4 w-4 text-orange-600" />
                  <h4 className="font-semibold">Services ({data.services.length})</h4>
                </div>
                <div className="space-y-3">
                  {data.services.map((service) => (
                    <div key={service.repairOrderServiceId} className="bg-gray-50 p-3 rounded">
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <div className="font-medium">{service.serviceName}</div>
                          {service.serviceDescription && (
                            <div className="text-sm text-gray-600">{service.serviceDescription}</div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{formatVND(service.totalPrice)}</div>
                          <div className="text-xs text-gray-600">
                            {formatVND(service.servicePrice)} × {service.quantity}
                          </div>
                        </div>
                      </div>
                      {service.parts && service.parts.length > 0 && (
                        <div className="mt-2 pl-4 border-l-2 border-gray-300">
                          <div className="text-xs font-medium text-gray-700 mb-1">Parts:</div>
                          {service.parts.map((part, idx) => (
                            <div key={idx} className="text-xs text-gray-600 flex justify-between">
                              <span>
                                {part.partName} ({part.partCode})
                              </span>
                              <span>
                                {formatVND(part.partPrice)} × {part.quantity} = {formatVND(part.totalPrice)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Jobs */}
            {data.jobs && data.jobs.length > 0 && (
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Wrench className="h-4 w-4 text-blue-600" />
                  <h4 className="font-semibold">
                    Jobs ({data.completedJobs}/{data.totalJobs})
                  </h4>
                </div>
                <div className="space-y-2">
                  {data.jobs.map((job) => (
                    <div key={job.jobId} className="bg-gray-50 p-3 rounded">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{job.jobName}</div>
                          <div className="text-sm text-gray-600">Technician: {job.technicianName}</div>
                          {job.notes && <div className="text-sm text-gray-600 mt-1">{job.notes}</div>}
                        </div>
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          {job.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dates & Notes */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-4 w-4 text-gray-600" />
                <h4 className="font-semibold">Timeline & Notes</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-3">
                <div>
                  <div className="text-gray-600">Received</div>
                  <div className="font-medium">{formatDate(data.receiveDate)}</div>
                </div>
                <div>
                  <div className="text-gray-600">Completed</div>
                  <div className="font-medium">{formatDate(data.completionDate)}</div>
                </div>
              </div>
              {data.note && (
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-sm font-medium text-gray-700 mb-1">Notes:</div>
                  <div className="text-sm text-gray-600">{data.note}</div>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
