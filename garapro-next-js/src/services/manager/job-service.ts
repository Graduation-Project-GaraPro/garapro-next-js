import { apiClient } from '../api-client'
import type { Job } from "@/types/job"

class JobService {
  private baseUrl = '/api/Job'

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
}

export const jobService = new JobService()
