"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { ManagerAppointment } from "@/types/manager/appointment"

interface CalendarProps {
  selectedDate: Date
  onDateSelect: (date: Date) => void
  onAppointmentSelect: (appointmentId: string) => void
}

export function Calendar({ selectedDate, onDateSelect, onAppointmentSelect }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // Mock data for testing
  const mockAppointments: ManagerAppointment[] = [
    {
      id: "1",
      time: "09:00",
      customer: "John Smith",
      service: "Oil Change",
      status: "confirmed",
      phone: "(555) 123-4567",
      email: "john.smith@email.com",
      vehicle: "2020 Honda Civic",
      notes: "Customer requested synthetic oil.",
      date: "2025-01-20",
    },
    {
      id: "2",
      time: "10:30",
      customer: "Sarah Johnson",
      service: "Brake Inspection",
      status: "pending",
      phone: "(555) 234-5678",
      email: "sarah.j@email.com",
      vehicle: "2018 Toyota Camry",
      notes: "Customer reports squeaking noise.",
      date: "2025-01-20",
    },
  ]

  const [appointments] = useState<ManagerAppointment[]>(mockAppointments)

  // Temporarily commented out to test loading issue
  // useEffect(() => {
  //   const fetchAppointments = async () => {
  //     try {
  //       const data = await managerAppointmentService.getAppointments()
  //       setAppointments(data)
  //     } catch (error) {
  //       console.error('Failed to fetch appointments:', error)
  //     }
  //   }
  //   fetchAppointments()
  // }, [currentMonth])

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i)

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev)
      if (direction === "prev") {
        newMonth.setMonth(prev.getMonth() - 1)
      } else {
        newMonth.setMonth(prev.getMonth() + 1)
      }
      return newMonth
    })
  }

  const getDateKey = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    return date.toISOString().split("T")[0]
  }

  const getDayAppointments = (day: number): ManagerAppointment[] => {
    const dateKey = getDateKey(day)
    return appointments.filter(apt => apt.date === dateKey)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-success/20 text-success border-success/30"
      case "pending":
        return "bg-warning/20 text-warning border-warning/30"
      case "in-progress":
        return "bg-primary/20 text-primary border-primary/30"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <Card className="p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-foreground">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-4">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="p-3 text-center text-sm font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 flex-1">
        {emptyDays.map((day) => (
          <div key={`empty-${day}`} className="p-2 min-h-[120px]" />
        ))}

        {days.map((day) => {
          const dayAppointments = getDayAppointments(day)
          const isSelected =
            selectedDate.getDate() === day &&
            selectedDate.getMonth() === currentMonth.getMonth() &&
            selectedDate.getFullYear() === currentMonth.getFullYear()

          return (
            <div
              key={day}
              className={cn(
                "p-2 min-h-[120px] border border-border rounded-md cursor-pointer hover:bg-accent/50 transition-colors",
                isSelected && "bg-primary/10 border-primary",
              )}
              onClick={() => {
                const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
                onDateSelect(newDate)
              }}
            >
              <div className="text-sm font-medium mb-2">{day}</div>
              <div className="space-y-1">
                {dayAppointments.slice(0, 3).map((appointment) => (
                  <div
                    key={appointment.id}
                    className={cn(
                      "text-xs p-1 rounded border cursor-pointer hover:opacity-80",
                      getStatusColor(appointment.status),
                    )}
                    onClick={(e) => {
                      e.stopPropagation()
                      onAppointmentSelect(appointment.id)
                    }}
                  >
                    <div className="font-medium">{appointment.time}</div>
                    <div className="truncate">{appointment.customer}</div>
                  </div>
                ))}
                {dayAppointments.length > 3 && (
                  <div className="text-xs text-muted-foreground p-1">+{dayAppointments.length - 3} more</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
