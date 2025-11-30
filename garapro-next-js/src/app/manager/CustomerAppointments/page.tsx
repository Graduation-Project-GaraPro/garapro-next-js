"use client"

import { useState, useEffect } from "react"
import { Calendar } from "./calendar"
import { RepairRequestDetailDialog } from "./repair-request-detail-dialog"
import { authService } from "@/services/authService"
import type { ManagerRepairRequest } from "@/types/manager/repair-request"
import { repairRequestService } from "@/services/manager/appointmentService"

export default function CustomerAppointmentsPage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [branchId, setBranchId] = useState<string | null>(null)

  // 🔹 NEW: move repairRequests + loading lên đây
  const [repairRequests, setRepairRequests] = useState<ManagerRepairRequest[]>([])
  const [isRequestsLoading, setIsRequestsLoading] = useState(true)

  useEffect(() => {
    try {
      const id = authService.getCurrentbranchId()
      console.log("[CustomerAppointmentsPage] branchId from authService:", id)
      setBranchId(id ?? null)
    } catch (err) {
      console.error("[CustomerAppointmentsPage] Failed to get branchId:", err)
      setBranchId(null)
    }
  }, [])

  // 🔹 NEW: fetch list ở cha (thay vì trong Calendar)
  useEffect(() => {
    const fetchRepairRequests = async () => {
      try {
        setIsRequestsLoading(true)
        const data = await repairRequestService.getRepairRequests()
        setRepairRequests(data)
      } catch (error) {
        console.error("Failed to load repair requests:", error)
      } finally {
        setIsRequestsLoading(false)
      }
    }

    fetchRepairRequests()
  }, [])

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
  }

  const handleAppointmentSelect = (requestId: string) => {
    setSelectedRequestId(requestId)
    setIsDialogOpen(true)
  }

  // 🔹 NEW: callback khi 1 request được update (cancel / convert)
  const handleRequestUpdated = (
    requestId: string,
    patch: Partial<ManagerRepairRequest>
  ) => {
    setRepairRequests(prev =>
      prev.map(r =>
        r.requestID === requestId
          ? { ...r, ...patch }
          : r
      )
    )
  }

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex-1 flex min-h-0 overflow-hidden">
        <div className="flex-1 min-w-0 overflow-hidden">
          <Calendar
            onDateSelect={handleDateSelect}
            onAppointmentSelect={handleAppointmentSelect}
            branchId={branchId}
            repairRequests={repairRequests}          // 🔹 NEW
            setRepairRequests={setRepairRequests}    // 🔹 cho SignalR xài
            isLoading={isRequestsLoading}            // 🔹 NEW
          />
        </div>
      </div>

      <RepairRequestDetailDialog
        requestId={selectedRequestId}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onRequestUpdated={handleRequestUpdated}      // 🔹 NEW
      />
    </div>
  )
}
