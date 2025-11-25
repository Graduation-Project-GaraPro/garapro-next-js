// src/hooks/manager/useJobManagement.ts
import { useState } from "react"
import { jobService } from "@/services/manager/job-service"
import { technicianService } from "@/services/manager/technician-service"
import type { Job } from "@/types/job"
import type { Technician } from "@/types/manager/tech-schedule"

export function useJobManagement() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadJobsByRepairOrderId = async (orderId: string) => {
    try {
      setLoading(true)
      setError(null)
      const data = await jobService.getJobsByRepairOrderId(orderId)
      setJobs(data)
    } catch (err) {
      setError("Failed to load jobs")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadTechnicians = async () => {
    try {
      const data = await technicianService.getAllTechnicians()
      setTechnicians(data)
    } catch (err) {
      console.error("Failed to load technicians", err)
    }
  }

  const assignJobsToTechnician = async (technicianId: string, jobIds: string[]) => {
    try {
      if (jobIds.length === 1) {
        // Single job assignment
        await jobService.assignTechnician(jobIds[0], technicianId)
      } else if (jobIds.length > 1) {
        // Batch job assignment
        await jobService.assignJobsToTechnician(technicianId, jobIds)
      }
      
      // Update local job status - use status 1 (New) for assigned jobs
      setJobs(prevJobs => 
        prevJobs.map(job => 
          jobIds.includes(job.jobId) 
            ? { ...job, status: 1, assignedTechnicianId: technicianId } 
            : job
        )
      )
      
      return true
    } catch (err) {
      setError("Failed to assign jobs to technician")
      console.error(err)
      return false
    }
  }

  return {
    jobs,
    technicians,
    loading,
    error,
    loadJobsByRepairOrderId,
    loadTechnicians,
    assignJobsToTechnician,
  }
}