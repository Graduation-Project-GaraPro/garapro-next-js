// src/app/manager/repairOrderManagement/orders/[id]/components/jobs-tab.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  RefreshCw,
  Wrench,
  Package,
  Calendar,
  Clock
} from "lucide-react"
import { jobService } from "@/services/manager/job-service"
import type { Job } from "@/types/job"

// Mock technician data - in a real app this would come from an API
const technicians = [
  { id: "1", name: "John Smith", monogram: "JS" },
  { id: "2", name: "Sarah Johnson", monogram: "SJ" },
  { id: "3", name: "Mike Davis", monogram: "MD" },
  { id: "4", name: "Emily Wilson", monogram: "EW" },
]

interface JobsTabProps {
  orderId: string
}

export default function JobsTab({ orderId }: JobsTabProps) {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [assignedTechs, setAssignedTechs] = useState<Record<string, { id: string; name: string; monogram: string } | null>>({})

  useEffect(() => {
    loadJobs()
  }, [orderId])

  const loadJobs = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await jobService.getJobsByRepairOrderId(orderId)
      setJobs(data)
      
      // Initialize assigned techs from job data
      const initialAssignedTechs: Record<string, { id: string; name: string; monogram: string } | null> = {}
      data.forEach(job => {
        if (job.assignedTechnicianId && job.assignedTechnicianName && job.assignedTechnicianMonogram) {
          initialAssignedTechs[job.jobId] = {
            id: job.assignedTechnicianId,
            name: job.assignedTechnicianName,
            monogram: job.assignedTechnicianMonogram
          }
        } else {
          initialAssignedTechs[job.jobId] = null
        }
      })
      setAssignedTechs(initialAssignedTechs)
    } catch (err) {
      setError("Failed to load jobs")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAssignTech = (jobId: string) => {
    // In a real app, this would open a modal or dropdown to select a technician
    // For now, we'll just assign the first available technician
    const techToAssign = technicians.find(tech => 
      !Object.values(assignedTechs).some(assigned => assigned?.id === tech.id)
    ) || technicians[0]
    
    setAssignedTechs(prev => ({
      ...prev,
      [jobId]: techToAssign
    }))
  }

  const getJobStatusText = (status: number) => {
    switch (status) {
      case 0: return "Pending"
      case 1: return "In Progress"
      case 2: return "Completed"
      default: return "Unknown"
    }
  }

  const getJobStatusColor = (status: number) => {
    switch (status) {
      case 0: return "bg-yellow-100 text-yellow-800"
      case 1: return "bg-blue-100 text-blue-800"
      case 2: return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading jobs...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-700">{error}</p>
        <Button onClick={loadJobs} className="mt-2">
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Jobs</h2>
        <Button onClick={loadJobs} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {jobs.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Wrench className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No jobs found</h3>
            <p className="text-gray-500">Jobs will appear here once created from approved quotations.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job) => (
            <Card key={job.jobId}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{job.jobName}</CardTitle>
                    <p className="text-sm text-gray-500">Job ID: {job.jobId}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {assignedTechs[job.jobId] ? (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center gap-2"
                        onClick={() => handleAssignTech(job.jobId)}
                      >
                        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                          {assignedTechs[job.jobId]?.monogram}
                        </div>
                        <span>{assignedTechs[job.jobId]?.name}</span>
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleAssignTech(job.jobId)}
                      >
                        Assign Tech
                      </Button>
                    )}
                    <Badge className={getJobStatusColor(job.status)}>
                      {getJobStatusText(job.status)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center text-sm">
                    <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                    <span>Created: {new Date(job.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Clock className="w-4 h-4 text-gray-500 mr-2" />
                    <span>Updated: {new Date(job.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {job.parts.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2 flex items-center">
                      <Package className="w-4 h-4 mr-2" />
                      Parts ({job.parts.length})
                    </h4>
                    <div className="border rounded-md divide-y">
                      {job.parts.map((part) => (
                        <div key={part.jobPartId} className="p-3 flex justify-between items-center">
                          <div>
                            <p className="text-sm font-medium">{part.partName}</p>
                            <p className="text-xs text-gray-500">ID: {part.partId}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm">${part.unitPrice.toLocaleString()} × {part.quantity}</p>
                            <p className="text-sm font-medium">${part.totalPrice.toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {job.note && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Notes</h4>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                      {job.note}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}