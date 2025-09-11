"use client"

import { useState } from "react"
import JobColumn from "./job-column"
import type { Job, JobStatus } from "@/types/job"

interface DragDropBoardProps {
  jobs: Job[]
  loading: boolean
  onMoveJob: (jobId: string, newStatus: JobStatus) => void
  onEditJob: (job: Job) => void
  onDeleteJob: (jobId: string) => void
  labels: { id: number; name: string; color: string }[]
}

export default function DragDropBoard({ jobs, loading, onMoveJob, onEditJob, onDeleteJob, labels }: DragDropBoardProps) {
  const [draggedJob, setDraggedJob] = useState<Job | null>(null)

  const handleDragStart = (job: Job) => {
    setDraggedJob(job)
  }

  const handleDragEnd = () => {
    setDraggedJob(null)
  }

  const handleDrop = (status: JobStatus) => {
    if (draggedJob && draggedJob.status !== status) {
      onMoveJob(draggedJob.id, status)
    }
    setDraggedJob(null)
  }

  const getJobsByStatus = (status: JobStatus) => {
    return jobs.filter((job) => job.status === status)
  }

  const columns = [
    {
      id: "requires-auth" as JobStatus,
      title: "Requires Authorization",
      jobs: getJobsByStatus("requires-auth"),
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
    },
    {
      id: "in-progress" as JobStatus,
      title: "In Progress",
      jobs: getJobsByStatus("in-progress"),
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
    },
    {
      id: "ready-to-start" as JobStatus,
      title: "Ready to Start",
      jobs: getJobsByStatus("ready-to-start"),
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
  ]

  if (loading) {
    return (
      <div className="flex h-full min-h-0">
        {columns.map((column) => (
          <div key={column.id} className="flex-1 border-r bg-white h-full min-h-0">
            <div className="p-4 border-b bg-gray-50">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-800">{column.title}</h2>
                <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="p-4 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0">
      {columns.map((column) => (
        <JobColumn
          key={column.id}
          title={column.title}
          jobs={column.jobs}
          status={column.id}
          bgColor={column.bgColor}
          borderColor={column.borderColor}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDrop={handleDrop}
          onEditJob={onEditJob}
          onDeleteJob={onDeleteJob}
          isDragOver={draggedJob?.status !== column.id}
          labels={labels}
        />
      ))}
    </div>
  )
}
