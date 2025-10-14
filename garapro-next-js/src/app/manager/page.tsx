"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Calendar, Settings, Users, BarChart3 } from "lucide-react"

export default function ManagerDashboard() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manager Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to the manager dashboard. Navigate to different sections using the menu below.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <Calendar className="h-8 w-8 text-primary" />
            <div>
              <h3 className="text-lg font-semibold">Customer Appointments</h3>
              <p className="text-sm text-muted-foreground">
                Manage customer appointments and scheduling
              </p>
            </div>
          </div>
          <div className="mt-4">
            <Link href="/manager/CustomerAppointments">
              <Button className="w-full">
                Open Appointments
              </Button>
            </Link>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <h3 className="text-lg font-semibold">Tech Schedule</h3>
              <p className="text-sm text-muted-foreground">
                View and manage technician schedules
              </p>
            </div>
          </div>
          <div className="mt-4">
            <Link href="/manager/techSchedule">
              <Button className="w-full">
                Open Tech Schedule
              </Button>
            </Link>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <Settings className="h-8 w-8 text-primary" />
            <div>
              <h3 className="text-lg font-semibold">Garage Settings</h3>
              <p className="text-sm text-muted-foreground">
                Configure garage settings and preferences
              </p>
            </div>
          </div>
          <div className="mt-4">
            <Link href="/manager/garageSetting">
              <Button className="w-full">
                Open Settings
              </Button>
            </Link>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <BarChart3 className="h-8 w-8 text-primary" />
            <div>
              <h3 className="text-lg font-semibold">Repair Order Board</h3>
              <p className="text-sm text-muted-foreground">
                Monitor repair orders and job management
              </p>
            </div>
          </div>
          <div className="mt-4">
            <Link href="/manager/repairOrderManagement/ro-board">
              <Button className="w-full">
                Open Job Board
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}