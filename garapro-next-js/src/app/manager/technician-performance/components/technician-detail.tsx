"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  TrendingUp,
  Wrench,
  Eye
} from "lucide-react"
import { technicianService } from "@/services/manager/technician-service"

interface TechnicianWorkload {
  technicianId: string
  technicianName: string
  totalJobs: number
  completedJobs: number
  inProgressJobs: number
  pendingJobs: number
  overdueJobs: number
  totalInspections: number
  completedInspections: number
  inProgressInspections: number
  quality: number
  speed: number
  efficiency: number
  score: number
  averageCompletionTime: number
}

interface TechnicianDetailProps {
  technicianId: string
}

export function TechnicianDetail({ technicianId }: TechnicianDetailProps) {
  const [workload, setWorkload] = useState<TechnicianWorkload | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWorkload()
  }, [technicianId])

  const fetchWorkload = async () => {
    try {
      setLoading(true)
      
      // Fetch workload from API
      const workloadData = await technicianService.getTechnicianWorkload(technicianId)
      
      if (workloadData) {
        // Map API response to local interface
        const mappedWorkload: TechnicianWorkload = {
          technicianId: workloadData.technicianId,
          technicianName: workloadData.fullName,
          totalJobs: workloadData.totalJobs,
          completedJobs: workloadData.completedJobs,
          inProgressJobs: workloadData.inProgressJobs,
          pendingJobs: workloadData.pendingJobs,
          overdueJobs: workloadData.overdueJobs,
          totalInspections: 0, // Not provided by API yet
          completedInspections: 0, // Not provided by API yet
          inProgressInspections: 0, // Not provided by API yet
          quality: workloadData.quality,
          speed: workloadData.speed,
          efficiency: workloadData.efficiency,
          score: workloadData.score,
          averageCompletionTime: workloadData.averageCompletionTime
        }
        setWorkload(mappedWorkload)
      }
    } catch (error) {
      console.error("Failed to fetch workload:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!workload) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-red-600">Failed to load technician details</p>
        </CardContent>
      </Card>
    )
  }

  const jobStatusData = [
    { name: "Completed", value: workload.completedJobs, color: "bg-green-500" },
    { name: "In Progress", value: workload.inProgressJobs, color: "bg-blue-500" },
    { name: "Pending", value: workload.pendingJobs, color: "bg-yellow-500" },
    { name: "Overdue", value: workload.overdueJobs, color: "bg-red-500" },
  ]

  const performanceMetrics = [
    { name: "Quality", value: workload.quality, icon: CheckCircle, color: "text-green-600" },
    { name: "Speed", value: workload.speed, icon: Clock, color: "text-blue-600" },
    { name: "Efficiency", value: workload.efficiency, icon: TrendingUp, color: "text-purple-600" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{workload.technicianName}</CardTitle>
          <p className="text-gray-600">Overall Performance Score: <span className="text-2xl font-bold text-blue-600">{workload.score.toFixed(1)}</span>/100</p>
        </CardHeader>
      </Card>

      {/* Job Stats */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Wrench className="w-4 h-4" />
              Total Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{workload.totalJobs}</div>
            <p className="text-xs text-gray-500 mt-1">All assigned jobs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{workload.completedJobs}</div>
            <p className="text-xs text-gray-500 mt-1">
              {((workload.completedJobs / workload.totalJobs) * 100).toFixed(0)}% completion
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{workload.inProgressJobs}</div>
            <p className="text-xs text-gray-500 mt-1">Currently working</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              Overdue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{workload.overdueJobs}</div>
            <p className="text-xs text-gray-500 mt-1">Needs attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {performanceMetrics.map((metric) => {
              const Icon = metric.icon
              return (
                <div key={metric.name}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-5 h-5 ${metric.color}`} />
                      <span className="font-medium">{metric.name}</span>
                    </div>
                    <span className="text-lg font-bold">{metric.value.toFixed(1)}</span>
                  </div>
                  <Progress value={metric.value} className="h-3" />
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Job Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Job Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {jobStatusData.map((status) => (
              <div key={status.name}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">{status.name}</span>
                  <span className="text-sm font-bold">{status.value}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`${status.color} h-2 rounded-full transition-all`}
                    style={{ width: `${(status.value / workload.totalJobs) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Inspection Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Inspection Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-gray-600">Total Inspections</p>
              <p className="text-2xl font-bold">{workload.totalInspections}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{workload.completedInspections}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-blue-600">{workload.inProgressInspections}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Work Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-gray-600">Average Completion Time</p>
              <p className="text-2xl font-bold">{workload.averageCompletionTime.toFixed(1)}</p>
              <p className="text-xs text-gray-500 mt-1">minutes per job</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Overall Score</p>
              <p className="text-2xl font-bold text-blue-600">{workload.score.toFixed(1)}</p>
              <p className="text-xs text-gray-500 mt-1">out of 100</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending Jobs</p>
              <p className="text-2xl font-bold text-yellow-600">{workload.pendingJobs}</p>
              <p className="text-xs text-gray-500 mt-1">awaiting assignment</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
