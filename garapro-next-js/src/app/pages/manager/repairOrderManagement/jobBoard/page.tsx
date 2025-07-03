"use client"

import { useState, useEffect } from "react"
import { Plus, Filter, LayoutGrid, List, Link } from "lucide-react"
import { Button } from "@/components/ui/button"
import DragDropBoard from "./drag-drop-board"
import EditTaskModal from "@/app/pages/manager/repairOrderManagement/components/edit-task-modal"
import { jobService } from "@/services/job-service"
import type { Job, JobStatus } from "@/types/job"
import { SearchForm } from '@/components/layout/search-form'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function BoardPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingJob, setEditingJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadJobs()
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

  // Inline Create Task Form State
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    contact: "",
    location: "",
    description: "",
    status: "requires-auth" as JobStatus,
    progress: 0,
    statusText: "",
    dueDate: "",
  })

  const handleCreateFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleCreateJob({
      ...formData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    handleCreateFormReset()
  }

  const handleCreateFormReset = () => {
    setFormData({
      title: "",
      company: "",
      contact: "",
      location: "",
      description: "",
      status: "requires-auth",
      progress: 0,
      statusText: "",
      dueDate: "",
    })
  }

  const handleCreateFormCancel = () => {
    handleCreateFormReset()
    setShowCreateForm(false)
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Main Header */}
      <div className="bg-white border-b px-6 py-[9.5px] flex items-center justify-between shrink-0">
        <h1 className="text-lg font-semibold text-gray-900">Job Board</h1>
      </div>
      {!showCreateForm ? (
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
            />
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <form onSubmit={handleCreateFormSubmit} className="bg-white rounded-lg shadow p-8 w-full max-w-xl space-y-4">
            <h2 className="text-xl font-semibold mb-4">Create New Repair Order</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Job Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="company">Company *</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData((prev) => ({ ...prev, company: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contact">Contact</Label>
                <Input
                  id="contact"
                  value={formData.contact}
                  onChange={(e) => setFormData((prev) => ({ ...prev, contact: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: JobStatus) => setFormData((prev) => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="requires-auth">Requires Authorization</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="ready-to-start">Ready to Start</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="statusText">Status Text</Label>
                <Input
                  id="statusText"
                  value={formData.statusText}
                  onChange={(e) => setFormData((prev) => ({ ...prev, statusText: e.target.value }))}
                  placeholder="e.g., No created 2 hours ago"
                />
              </div>
              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleCreateFormCancel}>
                Cancel
              </Button>
              <Button type="submit">Create Job</Button>
            </div>
          </form>
        </div>
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