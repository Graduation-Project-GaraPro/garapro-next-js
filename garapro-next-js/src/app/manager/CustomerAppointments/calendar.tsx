"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
// import { ChevronLeft, ChevronRight, Search, Filter } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ManagerRepairRequest } from "@/types/manager/repair-request"
import { repairRequestService } from "@/services/manager/appointmentService"

import * as signalR from "@microsoft/signalr"
import { enrichRepairRequest } from "@/services/manager/appointmentService"
// import type { ManagerRepairRequestDto } from "@/types/manager/repair-request"

interface CalendarProps {
  onDateSelect: (date: Date) => void
  onAppointmentSelect: (appointmentId: string) => void
  branchId: string | null
  repairRequests: ManagerRepairRequest[]                 
  setRepairRequests: React.Dispatch<React.SetStateAction<ManagerRepairRequest[]>> 
  isLoading: boolean                                     
}

export function Calendar({
  onDateSelect,
  onAppointmentSelect,
  branchId,
  repairRequests,
  setRepairRequests,
  isLoading
}: CalendarProps) {
  const [selectedDate, setSelectedDate] = useState(new Date())
 
 

  const [timeSlots, setTimeSlots] = useState<string[] | null>([])
  const [isSlotLoading, setIsSlotLoading] = useState(false)
  const [isClosedDay, setIsClosedDay] = useState(false)

  // NEW: status filter
  const [statusFilter, setStatusFilter] = useState<string>("all")

  //  TIME SLOTS
  

  // ---------------- FETCH API ----------------

  useEffect(() => {
  const fetchTimeSlots = async () => {
    if (!branchId) return

    try {
      setIsSlotLoading(true)
      setIsClosedDay(false)

      const dateStr = selectedDate.toISOString().split("T")[0]
      const slots = await repairRequestService.getArrivalTimeSlotsByBranch(branchId, dateStr)

      if (!slots || slots.length === 0) {
        setIsClosedDay(true)
        setTimeSlots([])
      } else {
        setTimeSlots(slots)
      }
    } catch (error) {
      console.error("Failed to load arrival time slots:", error)
    } finally {
      setIsSlotLoading(false)
    }
  }

  fetchTimeSlots()
}, [branchId, selectedDate])


  
  // ---------------- SignalR ----------------
  useEffect(() => {
  if (!branchId) return

  const baseUrl = process.env.NEXT_PUBLIC_HUB_BASE_URL

  const connection = new signalR.HubConnectionBuilder()
    .withUrl(`${baseUrl}/hubs/repairRequest`)
    .build()

  connection.on("NewRepairRequest", (raw: any) => {
  const enriched = enrichRepairRequest(raw)

  setRepairRequests((prev) => {
    if (prev.some((r) => r.requestID === enriched.requestID)) return prev
    return [...prev, enriched]
  })
})

connection.on("CancelRepairRequest", (payload: any) => {
  console.log("[SignalR] CancelRepairRequest received", payload)

  setRepairRequests((prev) =>
    prev.map((r) =>
      r.requestID === payload.requestID
        ? { ...r, status: "cancelled", isCompleted: false }
        : r
    )
  )
})

  let retryCount = 0
  const maxRetries = 5
  const retryDelay = 2000 // 2s mỗi lần retry

  const startConnection = async () => {
    try {
      await connection.start()
      console.log("[SignalR] Connected")
      await connection.invoke("JoinBranchGroup", branchId)
      console.log("[SignalR] Joined group:", branchId)
    } catch (err) {
      console.error(`[SignalR] Connection failed (${retryCount + 1}/${maxRetries})`, err)

      retryCount++

      if (retryCount <= maxRetries) {
        setTimeout(() => startConnection(), retryDelay)
      } else {
        console.error("[SignalR] Max retry attempts reached. Giving up.")
      }
    }
  }

  startConnection()

  return () => {
    connection.stop()
  }
}, [branchId])


  // ---------------- FILTERING ----------------

  const selectedDateKey = selectedDate.toISOString().split("T")[0]

  const getRepairRequestsForDate = () => {
    let list = repairRequests.filter((req) => req.date === selectedDateKey)

    if (statusFilter !== "all") {
      list = list.filter((r) => r.status === statusFilter)
    }

    return list
  }
  const parseSlotTo24h = (slot: string): { hour24: number; minute: number } | null => {
    const m = slot.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i)
    if (!m) return null

    let hour = parseInt(m[1], 10)
    const minute = parseInt(m[2], 10)
    const ampm = m[3].toUpperCase()

    if (ampm === "AM") {
      if (hour === 12) hour = 0 // 12AM -> 00h
    } else {
      // PM
      if (hour !== 12) hour += 12
    }

    return { hour24: hour, minute }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-500 border-blue-600"
      case "pending":
        return "bg-yellow-500 border-yellow-600"
      case "in-progress":
        return "bg-green-500 border-green-600"
      case "completed":
        return "bg-blue-500 border-blue-600"
      case "cancelled":
        return "bg-red-500 border-red-600"
      case "accept":
        return "bg-purple-500 border-purple-600"
      default:
        return "bg-gray-400 border-gray-500"
    }
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* ---------------- HEADER ---------------- */}
      <div className="p-4 border-b flex items-center justify-between bg-white">
        <h1 className="text-xl font-bold">Appointments (Day View)</h1>

        <div className="flex items-center gap-4">
          {/* 🔵 Today Button */}
          <Button
            variant="outline"
            onClick={() => {
              const today = new Date()
              setSelectedDate(today)
              onDateSelect(today)
            }}
          >
            Today
          </Button>

          {/*  Date Picker */}
          <input
            type="date"
            value={selectedDate.toISOString().split("T")[0]}
            onChange={(e) => {
              const d = new Date(e.target.value)
              setSelectedDate(d)
              onDateSelect(d)
            }}
            className="border px-3 py-2 rounded-md"
          />

          {/*  Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border px-3 py-2 rounded-md"
          >
            <option value="all">All</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="accept">Accepted</option>
          </select>
        </div>
      </div>

      {/* ---------------- LOADING ---------------- */}
      {isLoading && (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          Loading repair requests...
        </div>
      )}

     {!isLoading && (
  <div className="flex-1 overflow-auto relative bg-gray-50">

    {isSlotLoading && (
      <div className="p-4 text-gray-500">Loading time slots...</div>
    )}

    {/* ----------- CLOSED DAY UI ----------- */}
    {!isSlotLoading && isClosedDay && (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <p className="text-lg font-medium">Branch is closed today</p>
        <p className="text-sm">No appointments can be scheduled.</p>
      </div>
    )}

    {/* ----------- OPEN DAY UI ----------- */}
    {!isSlotLoading && !isClosedDay && timeSlots && (
      <>
        {timeSlots.map((time) => {
          const slotParsed = parseSlotTo24h(time)
          const dayRequests = getRepairRequestsForDate()

          const slotRequests = dayRequests.filter((req) => {
            if (!req.time || !slotParsed) return false

            const [reqHourStr, reqMinuteStr] = req.time.split(":")
            const reqHour = parseInt(reqHourStr, 10)
            const reqMinute = parseInt(reqMinuteStr, 10)

            return reqHour === slotParsed.hour24 && reqMinute === slotParsed.minute
          })

          return (
            <div
              key={time}
              className="border-b grid grid-cols-[120px_1fr]"
              style={{ minHeight: "80px" }}
            >
              <div className="p-3 text-right text-gray-500 pr-6">{time}</div>

              <div className="border-l bg-white">
                {slotRequests.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-2">
                    {slotRequests.map((req) => (
                      <div
                        key={req.requestID}
                        className={cn(
                          "rounded-md border-l-4 p-2 text-white cursor-pointer shadow-sm text-sm",
                          "overflow-hidden",
                          getStatusColor(req.status ?? "")
                        )}
                        style={{
                          flex: "0 0 25%",
                          maxWidth: "25%",
                          minHeight: "48px",
                        }}
                        onClick={() => onAppointmentSelect(req.requestID)}
                      >
                        <div className="font-semibold truncate">
                          {req.customerName || "Unknown Customer"}
                        </div>
                        <div className="text-xs opacity-80 truncate">
                          {req.vehicleInfo|| req.description}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </>
    )}
  </div>
)}

    </div>
  )
}
