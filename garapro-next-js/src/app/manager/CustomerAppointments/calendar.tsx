"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Plus, Search, Filter } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ManagerRepairRequest } from "@/types/manager/repair-request"
import { repairRequestService } from "@/services/manager/appointmentService"

interface CalendarProps {
  onDateSelect: (date: Date) => void
  onAppointmentSelect: (appointmentId: string) => void
  currentWeekStart: Date
  onWeekNavigate: (direction: "prev" | "next") => void
  onGoToToday?: () => void
}

export function Calendar({ 
  onDateSelect, 
  onAppointmentSelect,
  currentWeekStart,
  onWeekNavigate,
  onGoToToday
}: CalendarProps) {
  const [view, setView] = useState<"week" | "day">("week")
  const [repairRequests, setRepairRequests] = useState<ManagerRepairRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch repair requests from API
  useEffect(() => {
    const fetchRepairRequests = async () => {
      try {
        setIsLoading(true)
        const data = await repairRequestService.getRepairRequests()
        setRepairRequests(data)
      } catch (error) {
        console.error("Failed to load repair requests:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRepairRequests()
  }, [])

  const timeSlots = [
    "7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM",
    "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"
  ]

  const getWeekDays = () => {
    const days = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart)
      date.setDate(currentWeekStart.getDate() + i)
      days.push(date)
    }
    return days
  }

  const weekDays = getWeekDays()

  const getDateKey = (date: Date) => {
    return date.toISOString().split("T")[0]
  }

  const getRepairRequestsForDate = (date: Date) => {
    const dateKey = getDateKey(date)
    return repairRequests.filter(req => req.date === dateKey)
  }

  const getRepairRequestPosition = (time: string) => {
    const [hours] = time.split(":").map(Number)
    // Round down to nearest hour (e.g., 10:30 -> 10:00, 10:45 -> 10:00)
    const roundedHour = hours
    const startMinutes = 7 * 60 // 7 AM
    const totalMinutes = roundedHour * 60
    return ((totalMinutes - startMinutes) / 60) * 80 // 80px per hour
  }

  // Group repair requests by date and time for handling overlaps
  const groupRequestsByDateTime = (requests: ManagerRepairRequest[]) => {
    const grouped: Record<string, ManagerRepairRequest[]> = {}
    
    requests.forEach(req => {
      if (req.date && req.time) {
        const key = `${req.date}_${req.time}`
        if (!grouped[key]) {
          grouped[key] = []
        }
        grouped[key].push(req)
      }
    })
    
    return grouped
  }

  // Get vertical offset for overlapping appointments
  const getVerticalOffset = (groupedRequests: Record<string, ManagerRepairRequest[]>, req: ManagerRepairRequest, indexInGroup: number) => {
    if (!req.date || !req.time) return { topOffset: 0, height: 80 }
    
    const key = `${req.date}_${req.time}`
    const group = groupedRequests[key] || []
    
    if (group.length <= 1) {
      return { topOffset: 0, height: 80 }
    }
    
    // Calculate height and offset for each appointment in the group
    const totalHeight = 80
    const individualHeight = totalHeight / group.length
    const topOffset = indexInGroup * individualHeight
    
    return { topOffset, height: individualHeight }
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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { 
      weekday: "short", 
      month: "2-digit", 
      day: "2-digit" 
    })
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const goToToday = () => {
    if (onGoToToday) {
      onGoToToday()
    } else {
      onDateSelect(new Date())
    }
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-2xl font-bold">Appointments</h1>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search upcoming"
                className="pl-10 pr-4 py-2 rounded-md border border-gray-300 text-gray-900 placeholder-gray-500 w-64 focus:outline-none focus:ring-2 focus:ring-[#154c79] focus:border-[#154c79]"
              />
            </div>
            <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-gray-50">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex-shrink-0 border-b px-6 py-3 flex items-center justify-between bg-card flex-wrap gap-3">
        <div className="flex items-center gap-4 flex-wrap">
          <Button variant="outline" size="sm" onClick={goToToday}>
            TODAY
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => onWeekNavigate("prev")}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onWeekNavigate("next")}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <span className="font-semibold text-lg whitespace-nowrap">
            {currentWeekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - {" "}
            {weekDays[6].toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant={view === "week" ? "default" : "outline"} 
            size="sm"
            onClick={() => setView("week")}
          >
            WEEK
          </Button>
          <Button 
            variant={view === "day" ? "default" : "outline"} 
            size="sm"
            onClick={() => setView("day")}
          >
            DAY
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto min-h-0">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-muted-foreground">Loading repair requests...</div>
          </div>
        ) : repairRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <div className="text-muted-foreground">No repair requests found</div>
            <div className="text-xs text-muted-foreground">Total requests loaded: {repairRequests.length}</div>
          </div>
        ) : (
        <div className="min-w-[1200px] h-full">
          {/* Day Headers */}
          <div className="grid grid-cols-8 border-b bg-muted/30 sticky top-0 z-10">
            <div className="p-3 border-r"></div>
            {weekDays.map((day, idx) => (
              <div 
                key={idx} 
                className={cn(
                  "p-3 text-center border-r",
                  isToday(day) && "bg-primary/10"
                )}
              >
                <div className="font-medium">{formatDate(day)}</div>
                {isToday(day) && (
                  <div className="text-xs text-muted-foreground mt-1">Today</div>
                )}
              </div>
            ))}
          </div>

          {/* Time Slots Grid */}
          <div className="relative" style={{ minHeight: "880px" }}>
            {timeSlots.map((time) => (
              <div key={time} className="grid grid-cols-8 border-b" style={{ height: "80px" }}>
                <div className="p-2 border-r text-sm text-muted-foreground text-right pr-4">
                  {time}
                </div>
                {weekDays.map((day, dayIdx) => (
                  <div 
                    key={dayIdx} 
                    className={cn(
                      "border-r relative",
                      isToday(day) && "bg-primary/5"
                    )}
                  />
                ))}
              </div>
            ))}

            {/* Repair Requests Overlay */}
            {(() => {
              // Group all requests by date and time to handle overlaps
              const groupedRequests = groupRequestsByDateTime(repairRequests)
              
              return weekDays.map((day, dayIdx) => {
                const dayRequests = getRepairRequestsForDate(day)
                return dayRequests.map(req => {
                  if (!req.time) return null
                  const baseTopPosition = getRepairRequestPosition(req.time)
                  
                  // Get position within the group of overlapping requests
                  const dateTimeKey = `${req.date}_${req.time}`
                  const group = groupedRequests[dateTimeKey] || []
                  const indexInGroup = group.findIndex(r => r.requestID === req.requestID)
                  const { topOffset, height: individualHeight } = getVerticalOffset(groupedRequests, req, indexInGroup)
                  
                  // Adjust the top position based on the vertical offset
                  const adjustedTopPosition = baseTopPosition + topOffset
                  
                  return (
                    <div
                      key={req.requestID}
                      className={cn(
                        "absolute rounded-md border-l-4 p-2 cursor-pointer hover:shadow-lg transition-shadow overflow-hidden z-20",
                        getStatusColor(req.status || "pending")
                      )}
                      style={{
                        left: `${12.5 + dayIdx * 12.5}%`,
                        top: `${adjustedTopPosition}px`,
                        width: "11.5%",
                        height: `${individualHeight}px`
                      }}
                      onClick={() => {
                        onDateSelect(day)
                        onAppointmentSelect(req.requestID)
                      }}
                    >
                      <div className="text-white text-sm font-medium truncate">
                        {req.customerName || "Unknown Customer"}
                      </div>
                      <div className="text-white/90 text-xs truncate">
                        {req.displayService || req.description || "Repair Service"}
                      </div>
                    </div>
                  )
                })
              })
            })()}
          </div>
        </div>
        )}
      </div>
    </div>
  )
}