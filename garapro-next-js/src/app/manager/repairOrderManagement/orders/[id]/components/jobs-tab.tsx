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
  Clock,
  User,
  Users,
  AlertCircle,
  Edit
} from "lucide-react"
import { jobService } from "@/services/manager/job-service"
import { TechnicianSelectionDialog } from "@/components/manager/technician-selection-dialog"
import EditJobDialog from "./edit-job-dialog"
import { useToast } from "@/hooks/use-toast"
import type { Job } from "@/types/job"

interface JobsTabProps {
  orderId: string
  branchId?: string // Optional branch ID for branch-specific technician filtering
}

export default function JobsTab({ orderId, branchId }: JobsTabProps) {
  const { toast } = useToast()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [assignedTechs, setAssignedTechs] = useState<Record<string, { id: string; name: string; monogram: string } | null>>({})
  const [isTechSelectionOpen, setIsTechSelectionOpen] = useState(false)
  const [selectedJobIds, setSelectedJobIds] = useState<string[]>([])
  const [assignmentError, setAssignmentError] = useState<string | null>(null)
  const [isEditJobOpen, setIsEditJobOpen] = useState(false)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)

  // Get technician monogram from name
  const getTechnicianMonogram = (name: string | null): string => {
    if (!name) return "NA"
    const names = name.split(" ")
    if (names.length === 1) return names[0].substring(0, 2).toUpperCase()
    return (names[0][0] + names[names.length - 1][0]).toUpperCase()
  }

  useEffect(() => {
    loadJobs()
  }, [orderId])

  const loadJobs = async () => {
    try {
      setLoading(true)
      setError(null)
      setAssignmentError(null)
      const data = await jobService.getJobsByRepairOrderId(orderId)
      setJobs(data)
      
      // Initialize assigned techs from job data
      const initialAssignedTechs: Record<string, { id: string; name: string; monogram: string } | null> = {}
      data.forEach(job => {
        // Check if at least the assignedTechnicianId is present
        if (job.assignedTechnicianId && job.assignedTechnicianName) {
          const techName = job.assignedTechnicianName
          initialAssignedTechs[job.jobId] = {
            id: job.assignedTechnicianId,
            name: techName,
            monogram: getTechnicianMonogram(techName)
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
    setSelectedJobIds([jobId])
    setIsTechSelectionOpen(true)
  }

  const handleBatchAssignTech = () => {
    // Get all pending jobs for batch assignment
    const pendingJobs = jobs.filter(job => job.status === 0) // 0 = Pending
    setSelectedJobIds(pendingJobs.map(job => job.jobId))
    setIsTechSelectionOpen(true)
  }

  const handleEditJob = (job: Job) => {
    setSelectedJob(job)
    setIsEditJobOpen(true)
  }

  const handleJobUpdated = () => {
    loadJobs()
  }

  const handleTechAssignment = async (technicianId: string) => {
    if (!selectedJobIds.length) return

    try {
      setAssignmentError(null)
      
      if (selectedJobIds.length === 1) {
        // Single job assignment/reassignment
        const jobId = selectedJobIds[0];
        
        console.log(`Assigning/reassigning job ${jobId} to technician ${technicianId}`);
        // Use the new assignTechnician method
        await jobService.assignTechnician(jobId, technicianId);
        
        // Show success toast for single assignment
        toast({
          variant: "success",
          title: "Technician Assigned",
          description: "The technician has been successfully assigned to the job.",
        })
      } else {
        // Batch job assignment
        console.log(`Assigning ${selectedJobIds.length} jobs to technician ${technicianId}`);
        await jobService.assignJobsToTechnician(technicianId, selectedJobIds);
        
        // Show success toast for batch assignment
        toast({
          variant: "success",
          title: "Technician Assigned",
          description: `Successfully assigned technician to ${selectedJobIds.length} jobs.`,
        })
      }

      // Refresh the jobs list to show the change (similar to inspection component)
      await loadJobs();

      // Close dialog and reset selection
      setIsTechSelectionOpen(false);
      setSelectedJobIds([]);
      
    } catch (error) {
      console.error("Failed to assign technician:", error);
      // Extract error message if it's an Error object
      const errorMessage = error instanceof Error ? error.message : "Failed to assign technician to job(s)";
      setAssignmentError(errorMessage);
      
      // Show error toast
      toast({
        variant: "destructive",
        title: "Assignment Failed",
        description: errorMessage,
      })
      
      // Keep the dialog open so the user can try again
      // Or you could close it and show the error in a toast/notification
    }
  }

  const getJobStatusText = (status: number) => {
    switch (status) {
      case 0: return "Pending"
      case 1: return "New"
      case 2: return "In Progress"
      case 3: return "Completed"
      case 4: return "On Hold"
      default: return "Unknown"
    }
  }

  const getJobStatusColor = (status: number) => {
    switch (status) {
      case 0: return "bg-yellow-100 text-yellow-800"
      case 1: return "bg-blue-100 text-blue-800"
      case 2: return "bg-orange-100 text-orange-800"
      case 3: return "bg-green-100 text-green-800"
      case 4: return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  // Check if there are pending jobs that can be assigned
  const hasPendingJobs = jobs.some(job => job.status === 0)

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
        <div className="flex gap-2">
          {hasPendingJobs && (
            <Button onClick={handleBatchAssignTech} variant="outline" size="sm">
              <Users className="w-4 h-4 mr-2" />
              Assign All Pending
            </Button>
          )}
          <Button onClick={loadJobs} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Assignment Error Message */}
      {assignmentError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
          <div>
            <p className="text-red-700 font-medium">Assignment Failed</p>
            <p className="text-red-600 text-sm">{assignmentError}</p>
          </div>
        </div>
      )}

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
                    {/* Edit Job Button */}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleEditJob(job)}
                      className="flex items-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edit</span>
                    </Button>
                    
                    {/* Assign Tech Button - Show for all non-completed jobs */}
                    {job.status !== 3 && ( // 3 = Completed
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleAssignTech(job.jobId)}
                        className="flex items-center gap-2"
                      >
                        {assignedTechs[job.jobId] ? (
                          <>
                            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-medium text-xs">
                              {assignedTechs[job.jobId]?.monogram}
                            </div>
                            <span>{assignedTechs[job.jobId]?.name}</span>
                          </>
                        ) : (
                          <>
                            <User className="h-4 w-4" />
                            <span>Assign Tech</span>
                          </>
                        )}
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

      <TechnicianSelectionDialog
        open={isTechSelectionOpen}
        onOpenChange={setIsTechSelectionOpen}
        onAssign={handleTechAssignment}
        jobIds={selectedJobIds}
        branchId={branchId}
      />

      {/* Edit Job Dialog */}
      {selectedJob && (
        <EditJobDialog
          open={isEditJobOpen}
          onOpenChange={setIsEditJobOpen}
          job={selectedJob}
          onSuccess={handleJobUpdated}
        />
      )}
    </div>
  )
}