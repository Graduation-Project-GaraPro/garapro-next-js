"use client"

import { useState, useEffect } from "react"
import { Plus, Filter, LayoutGrid, List, Link } from "lucide-react"
import { Button } from "@/components/ui/button"
import DragDropBoard from "./drag-drop-board"
import EditTaskModal from "@/app/manager/repairOrderManagement/components/edit-task-modal"
import CreateTask from "@/app/manager/repairOrderManagement/components/create-task"
import { jobService } from "@/services/manager/job-service"
import type { Job, JobStatus } from "@/types/job"
import { SearchForm } from '@/app/manager/components/layout/search-form'
import { labelService } from "@/services/manager/label-service"
import type { Label as LabelType } from "@/types/manager/label"

export default function BoardPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [labels, setLabels] = useState<LabelType[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingJob, setEditingJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadJobs()
    loadLabels()
  }, [])

  const loadJobs = async () => {
    try {
      setLoading(true)
      const data = await jobService.getAllJobs()
      setJobs(data)
    } catch (error) {
      console.error("Failed to load jobs:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadLabels = async () => {
    try {
      const data = await labelService.getAllLabels()
      setLabels(data)
    } catch (error) {
      console.error("Failed to load labels:", error)
    }
  }

  const handleCreateJob = async (jobData: Omit<Job, "id">) => {
    try {
      const newJob = await jobService.createJob(jobData)
      setJobs((prev) => [...prev, newJob])
      setShowCreateForm(false)
    } catch (error) {
      console.error("Failed to create job:", error)
    }
  }

  const handleUpdateJob = async (jobData: Job) => {
    try {
      const updatedJob = await jobService.updateJob(jobData.id, jobData)
      setJobs((prev) => prev.map((job) => (job.id === updatedJob.id ? updatedJob : job)))
      setEditingJob(null)
    } catch (error) {
      console.error("Failed to update job:", error)
    }
  }

  const handleDeleteJob = async (jobId: string) => {
    try {
      await jobService.deleteJob(jobId)
      setJobs((prev) => prev.filter((job) => job.id !== jobId))
    } catch (error) {
      console.error("Failed to delete job:", error)
    }
  }

  const handleMoveJob = async (jobId: string, newStatus: JobStatus) => {
    try {
      const job = jobs.find((j) => j.id === jobId)
      if (!job) return

      const updatedJob = { ...job, status: newStatus }
      await jobService.updateJob(jobId, updatedJob)
      setJobs((prev) => prev.map((j) => (j.id === jobId ? updatedJob : j)))
    } catch (error) {
      console.error("Failed to move job:", error)
    }
  }


  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Main Header */}
      <div className="bg-white border-b px-6 py-[9.5px] flex items-center justify-between shrink-0">
        <h1 className="text-lg font-semibold text-gray-900">Job Board</h1>
      </div>
      {showCreateForm ? (
        <CreateTask
          onClose={() => setShowCreateForm(false)}
          onSubmit={handleCreateJob}
        />
      ) : (
        <>
          {/* sub Header */}
          <div className="bg-white border-b px-6 py-1.5 flex flex-col gap-2 shrink-0">
            <div className="flex items-center gap-2 w-full">
              <div className="flex items-center gap-2 flex-1">
                <SearchForm className="w-72" />
                <Button variant="outline" size="sm" className="text-gray-600 border-gray-200 hover:bg-gray-50">
                  <Filter className="w-4 h-4 mr-2" />
                  RO Label
                  <span className="ml-2 px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded font-medium">
                    New
                  </span>
                </Button>
                <Button variant="outline" size="sm" className="text-gray-600 border-gray-200 hover:bg-gray-50">
                  Employee
                </Button>
                <Button variant="outline" size="sm" className="text-gray-600 border-gray-200 hover:bg-gray-50">
                  Appt Type
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="text-gray-600 border-gray-200 hover:bg-gray-50">
                  Active
                </Button>
                <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                  <Button variant="ghost" size="sm" className="px-2 py-1.5 hover:bg-gray-50 border-r border-gray-200">
                    <LayoutGrid className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="px-2 py-1.5 hover:bg-gray-50 border-r border-gray-200">
                    <List className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="px-2 py-1.5 hover:bg-gray-50">
                    <Link className="w-4 h-4" />
                  </Button>
                </div>
                <Button className="bg-[#154c79] hover:bg-[#123c66] text-white" size="sm" onClick={() => setShowCreateForm(true)}>
                  <Plus className="w-4 h-4" />
                  Create Repair Order
                </Button>
              </div>
            </div>
          </div>
          <div className="flex-1 h-0 min-h-0 overflow-hidden">
            <DragDropBoard
              jobs={jobs}
              loading={loading}
              onMoveJob={handleMoveJob}
              onEditJob={setEditingJob}
              onDeleteJob={handleDeleteJob}
              labels={labels}
            />
          </div>
        </>
      )}

      {/* Edit Modal */}
      <EditTaskModal
        job={editingJob}
        isOpen={!!editingJob}
        onClose={() => setEditingJob(null)}
        onSubmit={handleUpdateJob}
        onDelete={handleDeleteJob}
      />
    </div>
  )
} 