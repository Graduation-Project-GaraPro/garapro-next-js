"use client"

import { useState } from "react"
import { Calendar } from "./calendar"
import { RepairRequestDetailDialog } from "./repair-request-detail-dialog"

export default function CustomerAppointmentsPage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date()
    const day = today.getDay()
    const diff = today.getDate() - day
    return new Date(today.setDate(diff))
  })
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
  }

  const handleWeekNavigate = (direction: "prev" | "next") => {
    setCurrentWeekStart(prev => {
      const newDate = new Date(prev)
      newDate.setDate(prev.getDate() + (direction === "next" ? 7 : -7))
      return newDate
    })
  }

  const handleGoToToday = () => {
    const today = new Date()
    const day = today.getDay()
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - day)
    setCurrentWeekStart(weekStart)
    setSelectedDate(new Date())
  }

  const handleAppointmentSelect = (requestId: string) => {
    setSelectedRequestId(requestId)
    setIsDialogOpen(true)
  }

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex-1 flex min-h-0 overflow-hidden">
        <div className="flex-1 min-w-0 overflow-hidden">
          <Calendar
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            onAppointmentSelect={handleAppointmentSelect}
            currentWeekStart={currentWeekStart}
            onWeekNavigate={handleWeekNavigate}
            onGoToToday={handleGoToToday}
          />
        </div>
      </div>
      <RepairRequestDetailDialog
        requestId={selectedRequestId}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  )
}