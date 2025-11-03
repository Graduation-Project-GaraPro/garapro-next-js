// src/app/manager/repairOrderManagement/orders/[id]/components/job-details-view.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog"
import { 
  Wrench,
  Package,
  Calendar,
  Clock,
  RefreshCw
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

interface JobDetailsViewProps {
  jobId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onJobUpdated?: (job: Job) => void
}

export default function JobDetailsView({ jobId, open, onOpenChange }: JobDetailsViewProps) {
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [assignedTech, setAssignedTech] = useState<{ id: string; name: string; monogram: string } | null>(null)

  useEffect(() => {
    if (open && jobId) {
      loadJob()
    }
  }, [open, jobId])

  const loadJob = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await jobService.getJobById(jobId)
      setJob(data)
      
      // Initialize assigned tech from job data
      if (data.assignedTechnicianId && data.assignedTechnicianName && data.assignedTechnicianMonogram) {
        setAssignedTech({
          id: data.assignedTechnicianId,
          name: data.assignedTechnicianName,
          monogram: data.assignedTechnicianMonogram
        })
      } else {
        setAssignedTech(null)
      }
    } catch (err) {
      setError("Failed to load job details")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAssignTech = () => {
    // In a real app, this would open a modal or dropdown to select a technician
    // For now, we'll just assign the first available technician
    const techToAssign = technicians.find(tech => 
      assignedTech?.id !== tech.id
    ) || technicians[0]
    
    setAssignedTech(techToAssign)
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
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p>Loading job details...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (error || !job) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Job Details</DialogTitle>
          </DialogHeader>
          <div className="py-8 text-center">
            <p className="text-red-500">{error || "Job not found"}</p>
            <Button onClick={loadJob} className="mt-4">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
          <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Job Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{job.jobName}</CardTitle>
                  <p className="text-sm text-gray-500">Job ID: {job.jobId}</p>
                </div>
                <div className="flex items-center gap-2">
                  {assignedTech ? (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-2"
                      onClick={handleAssignTech}
                    >
                      <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                        {assignedTech.monogram}
                      </div>
                      <span>{assignedTech.name}</span>
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleAssignTech}
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
                <div className="flex items-center text-sm">
                  <Wrench className="w-4 h-4 text-gray-500 mr-2" />
                  <span>Service ID: {job.serviceId}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {job.parts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Parts ({job.parts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md divide-y">
                  {job.parts.map((part) => (
                    <div key={part.jobPartId} className="p-3 flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium">{part.partName}</p>
                        <p className="text-xs text-gray-500">Part ID: {part.partId}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">${part.unitPrice.toLocaleString()} × {part.quantity}</p>
                        <p className="text-sm font-medium">${part.totalPrice.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {job.note && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded-md">
                  {job.note}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}