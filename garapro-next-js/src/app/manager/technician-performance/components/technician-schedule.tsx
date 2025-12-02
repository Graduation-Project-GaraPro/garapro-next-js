"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, Clock, Calendar, AlertCircle } from "lucide-react"
import { technicianService } from "@/services/manager/technician-service"
import type { TechnicianJob as ApiTechnicianJob } from "@/types/manager/technician"

interface Job {
  jobId: string
  jobName: string
  status: string
  technicianName: string
  vehicleLicensePlate: string
  startDate: string
  deadline: string
  estimatedDuration: number
  actualDuration: number
  repairOrderId: string
  isOverdue: boolean
}

export function TechnicianSchedule() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [expandedJobs, setExpandedJobs] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchSchedule()
  }, [filterStatus])

  const fetchSchedule = async () => {
    try {
      setLoading(true)
      
      // Fetch schedule with optional status filter
      const scheduleData = await technicianService.getAllTechnicianSchedules({
        status: filterStatus === "all" ? undefined : filterStatus
      })
      
      // Map to local Job interface
      const mappedJobs: Job[] = scheduleData.map((job: ApiTechnicianJob) => ({
        jobId: job.jobId,
        jobName: job.jobName,
        status: job.status,
        technicianName: job.technicianName,
        vehicleLicensePlate: job.vehicleLicensePlate,
        startDate: job.startDate,
        deadline: job.deadline,
        estimatedDuration: job.estimatedDuration,
        actualDuration: job.actualDuration,
        repairOrderId: job.repairOrderId,
        isOverdue: job.isOverdue
      }))
      
      setJobs(mappedJobs)
    } catch (error) {
      console.error("Failed to fetch schedule:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleExpand = (jobId: string) => {
    const newExpanded = new Set(expandedJobs)
    if (newExpanded.has(jobId)) {
      newExpanded.delete(jobId)
    } else {
      newExpanded.add(jobId)
    }
    setExpandedJobs(newExpanded)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-500 text-white"
      case "InProgress":
        return "bg-blue-500 text-white"
      case "Pending":
        return "bg-yellow-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const filteredJobs = filterStatus === "all" 
    ? jobs 
    : jobs.filter(job => job.status === filterStatus)

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filter Buttons */}
      <div className="flex gap-2 mb-6">
        <Button 
          variant={filterStatus === "all" ? "default" : "outline"} 
          onClick={() => setFilterStatus("all")}
        >
          All Jobs
        </Button>
        <Button
          variant={filterStatus === "InProgress" ? "default" : "outline"}
          onClick={() => setFilterStatus("InProgress")}
        >
          In Progress
        </Button>
        <Button 
          variant={filterStatus === "Pending" ? "default" : "outline"} 
          onClick={() => setFilterStatus("Pending")}
        >
          Pending
        </Button>
        <Button
          variant={filterStatus === "Completed" ? "default" : "outline"}
          onClick={() => setFilterStatus("Completed")}
        >
          Completed
        </Button>
      </div>

      {/* Schedule List */}
      <div className="space-y-3">
        {filteredJobs.map((job) => (
          <Card key={job.jobId} className="cursor-pointer hover:shadow-md transition-shadow">
            <div onClick={() => toggleExpand(job.jobId)} className="p-4 flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-lg">{job.jobName}</h3>
                  <Badge className={getStatusColor(job.status)}>{job.status}</Badge>
                  {job.isOverdue && (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Overdue
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  {job.technicianName} • {job.vehicleLicensePlate}
                </p>
              </div>
              <ChevronDown 
                className={`transition-transform ${expandedJobs.has(job.jobId) ? "rotate-180" : ""}`} 
              />
            </div>

            {/* Expanded Details */}
            {expandedJobs.has(job.jobId) && (
              <CardContent className="border-t py-4 space-y-3">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-xs text-gray-500 uppercase flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Start Date
                    </p>
                    <p className="font-medium">{formatDate(job.startDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Deadline
                    </p>
                    <p className="font-medium">{formatDate(job.deadline)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Estimated Duration</p>
                    <p className="font-medium">{job.estimatedDuration} minutes</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Actual Duration</p>
                    <p className="font-medium">{job.actualDuration || "N/A"} minutes</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Repair Order ID</p>
                  <p className="font-mono text-sm">{job.repairOrderId}</p>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-500 text-center py-8">No jobs found for selected filter</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
