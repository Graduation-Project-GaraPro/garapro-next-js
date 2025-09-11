"use client"

import type React from "react"

import { Badge } from "@/components/ui/badge"
import JobCard from "./job-card"
import type { Job, JobStatus } from "@/types/job"

interface JobColumnProps {
  title: string
  jobs: Job[]
  status: JobStatus
  bgColor: string
  borderColor: string
  onDragStart: (job: Job) => void
  onDragEnd: () => void
  onDrop: (status: JobStatus) => void
  onEditJob: (job: Job) => void
  onDeleteJob: (jobId: string) => void
  isDragOver: boolean
}

export default function JobColumn({
  title,
  jobs,
  status,
  bgColor,
  onDragStart,
  onDragEnd,
  onDrop,
  onEditJob,
  onDeleteJob,
  isDragOver,
}: JobColumnProps) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    onDrop(status)
  }

  return (
    <div
      className={`flex-1 border-r bg-white h-full min-h-0 flex flex-col ${isDragOver ? bgColor : ""}`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="p-1 border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">{title}</h2>
          <Badge variant="secondary">{jobs.length}</Badge>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
        {jobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            onDragStart={() => onDragStart(job)}
            onDragEnd={onDragEnd}
            onEdit={() => onEditJob(job)}
            onDelete={() => onDeleteJob(job.id)}
          />
        ))}

        {jobs.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <p className="text-sm">No jobs in this column</p>
          </div>
        )}
      </div>
    </div>
  )
}
