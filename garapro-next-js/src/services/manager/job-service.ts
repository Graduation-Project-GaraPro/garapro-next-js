import { apiClient } from './api-client'
import type { Job } from "@/types/job"

class JobService {
  private baseUrl = '/Job'

  async getJobsByRepairOrderId(repairOrderId: string): Promise<Job[]> {
    try {
      const response = await apiClient.get<Job[]>(`${this.baseUrl}/repairorder/${repairOrderId}`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch jobs:', error)
      throw error
    }
  }

  async getJobById(jobId: string): Promise<Job> {
    try {
      const response = await apiClient.get<Job>(`${this.baseUrl}/${jobId}`)
      return response.data
    } catch (error) {
      console.error(`Failed to fetch job with id ${jobId}:`, error)
      throw error
    }
  }

  async getAllJobs(): Promise<Job[]> {
    try {
      const response = await apiClient.get<Job[]>(this.baseUrl)
      return response.data
    } catch (error) {
      console.error('Failed to fetch all jobs:', error)
      throw error
    }
  }

  async createJob(jobData: Omit<Job, "jobId" | "createdAt" | "updatedAt">): Promise<Job> {
    try {
      const response = await apiClient.post<Job>(this.baseUrl, jobData)
      return response.data
    } catch (error) {
      console.error('Failed to create job:', error)
      throw error
    }
  }

  async updateJob(jobId: string, jobData: Partial<Job>): Promise<Job> {
    try {
      const response = await apiClient.put<Job>(`${this.baseUrl}/${jobId}`, jobData)
      return response.data
    } catch (error) {
      console.error(`Failed to update job ${jobId}:`, error)
      throw error
    }
  }

  async deleteJob(jobId: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/${jobId}`)
    } catch (error) {
      console.error(`Failed to delete job ${jobId}:`, error)
      throw error
    }
  }

  // Assign a technician to a job
  async assignTechnician(jobId: string, technicianId: string): Promise<void> {
    try {
      const endpoint = `${this.baseUrl}/${jobId}/assign/${technicianId}`
      // Use PUT request but handle 204 No Content responses properly
      await apiClient.put(endpoint)
      // If we get here without exception, the assignment was successful
      console.log(`Successfully assigned technician ${technicianId} to job ${jobId}`)
    } catch (error) {
      // Handle the case where API returns 404 even when assignment succeeds
      // This is a known issue where the API returns 404 but the assignment still works
      if (typeof error === 'object' && error !== null && 'status' in error && error.status === 404) {
        console.warn(`Received 404 for assign technician API call, but assignment may have succeeded`)
        // Don't throw the error to allow UI to update
        return
      }
      console.error(`Failed to assign technician ${technicianId} to job ${jobId}:`, error)
      throw error
    }
  }

  // Assign multiple jobs to a technician
  async assignJobsToTechnician(technicianId: string, jobIds: string[]): Promise<void> {
    try {
      // Validate inputs
      if (!technicianId) {
        throw new Error('Technician ID is required')
      }
      
      if (!jobIds || jobIds.length === 0) {
        throw new Error('At least one job ID is required')
      }
      
      // For multiple jobs, make separate calls to the assignTechnician method
      for (const jobId of jobIds) {
        await this.assignTechnician(jobId, technicianId);
      }
    } catch (error) {
      console.error(`Failed to assign jobs to technician ${technicianId}:`, error)
      throw error
    }
  }

  // Get job by ID after assignment to return updated data
  async getJobAfterAssignment(jobId: string): Promise<Job> {
    try {
      // Add a small delay to ensure the assignment has been processed
      await new Promise(resolve => setTimeout(resolve, 100));
      return await this.getJobById(jobId);
    } catch (error) {
      console.error(`Failed to fetch job after assignment ${jobId}:`, error)
      throw error
    }
  }
}

export const jobService = new JobService()