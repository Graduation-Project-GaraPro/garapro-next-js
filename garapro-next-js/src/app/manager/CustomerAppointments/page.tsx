"use client"

import { useState } from "react"
import { Calendar } from "./calendar"
import { AppointmentSidebar } from "./appointment-sidebar"
import { Header } from "./header"

export default function CustomerAppointmentsPage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null)

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setSelectedAppointment(null) // Clear selected appointment when date changes
  }

  const handleAppointmentSelect = (appointmentId: string | null) => {
    setSelectedAppointment(appointmentId)
  }

  return (
    <div className="h-full flex flex-col">
      <Header />
      <div className="flex-1 flex min-h-0">
        <div className="flex-1 p-6">
          <Calendar
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            onAppointmentSelect={handleAppointmentSelect}
          />
        </div>
        <AppointmentSidebar
          selectedDate={selectedDate}
          selectedAppointment={selectedAppointment}
          onAppointmentSelect={handleAppointmentSelect}
        />
      </div>
    </div>
  )
}