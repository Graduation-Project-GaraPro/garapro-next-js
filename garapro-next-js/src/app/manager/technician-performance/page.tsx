"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TechnicianOverview, TechnicianSchedule, TechnicianDetail } from "./components"
import { Users, Calendar, TrendingUp } from "lucide-react"

export default function TechnicianPerformancePage() {
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Technician Performance Dashboard</h1>
          <p className="text-gray-600">Monitor technician workload, schedules, and performance metrics</p>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-12">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Schedule
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Individual Performance
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6">
            <TechnicianOverview onSelectTechnician={setSelectedTechnicianId} />
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="mt-6">
            <TechnicianSchedule />
          </TabsContent>

          {/* Individual Performance Tab */}
          <TabsContent value="performance" className="mt-6">
            {selectedTechnicianId ? (
              <TechnicianDetail technicianId={selectedTechnicianId} />
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-gray-500 text-center py-12">
                    Select a technician from the Overview tab to view detailed performance metrics
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
