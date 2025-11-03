"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Clock, User, Wrench, Phone, Mail, MapPin, Edit, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { ManagerAppointment } from "@/types/manager/appointment"

interface AppointmentSidebarProps {
  selectedDate: Date
  selectedAppointment: string | null
  onAppointmentSelect: (appointmentId: string | null) => void
}

export function AppointmentSidebar({
  selectedDate,
  selectedAppointment,
  onAppointmentSelect,
}: AppointmentSidebarProps) {
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

  const dateKey = selectedDate.toISOString().split("T")[0]
  const dayAppointments = mockAppointments.filter(apt => apt.date === dateKey)
  const selectedAppointmentData = selectedAppointment
    ? mockAppointments.find(apt => apt.id === selectedAppointment)
    : null

  // Temporarily commented out async calls
  // const [appointments, setAppointments] = useState<ManagerAppointment[]>([])
  // const [selectedAppointmentData, setSelectedAppointmentData] = useState<ManagerAppointment | null>(null)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-success/20 text-success"
      case "pending":
        return "bg-warning/20 text-warning"
      case "in-progress":
        return "bg-primary/20 text-primary"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Confirmed"
      case "pending":
        return "Pending"
      case "in-progress":
        return "In Progress"
      default:
        return status
    }
  }

  return (
    <div className="w-96 border-l border-border bg-card p-6 overflow-y-auto">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">
          {selectedDate.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </h3>
        <p className="text-sm text-muted-foreground">
          {dayAppointments.length} appointment{dayAppointments.length !== 1 ? "s" : ""} scheduled
        </p>
      </div>

      {selectedAppointmentData ? (
        <Card className="p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold">Appointment Details</h4>
            <Button variant="ghost" size="sm" onClick={() => onAppointmentSelect(null)}>
              ×
            </Button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{selectedAppointmentData.time}</span>
              <Badge className={getStatusColor(selectedAppointmentData.status)}>
                {getStatusText(selectedAppointmentData.status)}
              </Badge>
            </div>

            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{selectedAppointmentData.customer}</span>
            </div>

            <div className="flex items-center gap-3">
              <Wrench className="h-4 w-4 text-muted-foreground" />
              <span>{selectedAppointmentData.service}</span>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{selectedAppointmentData.phone}</span>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{selectedAppointmentData.email}</span>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{selectedAppointmentData.vehicle}</span>
            </div>

            {selectedAppointmentData.notes && (
              <div className="pt-2">
                <p className="text-sm font-medium mb-1">Notes:</p>
                <p className="text-sm text-muted-foreground">{selectedAppointmentData.notes}</p>
              </div>
            )}
          </div>

          <Separator className="my-4" />

          <div className="flex gap-2">
            <Button size="sm" className="flex-1">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline" size="sm" className="flex-1 bg-transparent">
              <Trash2 className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {dayAppointments.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground">No appointments scheduled for this day</p>
              <Button className="mt-4" size="sm">
                Schedule Appointment
              </Button>
            </Card>
          ) : (
            dayAppointments.map((appointment) => (
              <Card
                key={appointment.id}
                className={cn(
                  "p-4 cursor-pointer hover:bg-accent/50 transition-colors",
                  selectedAppointment === appointment.id && "ring-2 ring-primary",
                )}
                onClick={() => onAppointmentSelect(appointment.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{appointment.time}</span>
                  <Badge className={getStatusColor(appointment.status)}>{getStatusText(appointment.status)}</Badge>
                </div>
                <p className="font-medium text-sm">{appointment.customer}</p>
                <p className="text-sm text-muted-foreground">{appointment.service}</p>
                <p className="text-xs text-muted-foreground mt-1">{appointment.vehicle}</p>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}
