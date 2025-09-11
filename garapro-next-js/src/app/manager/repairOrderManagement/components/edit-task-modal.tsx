"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { Job, JobStatus } from "@/types/job"
import { labelService } from "@/services/manager/label-service"
import type { Label } from "@/types/manager/label"
import { LABOR_RATES_STORAGE_KEY, type LaborRate } from "@/app/manager/garageSetting/ro-settings/tabs/labor-rates-tab"

interface EditTaskModalProps {
  job: Job | null
  isOpen: boolean
  onClose: () => void
  onSubmit: (job: Job) => void
  onDelete: (jobId: string) => void
}

export default function EditTaskModal({ job, isOpen, onClose, onSubmit, onDelete }: EditTaskModalProps) {
  const [formData, setFormData] = useState<Job | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [labels, setLabels] = useState<Label[]>([])
  const [rates, setRates] = useState<LaborRate[]>([])

  useEffect(() => {
    if (job) {
      setFormData({ ...job })
    }
    labelService.getAllLabels().then(setLabels).catch((e) => console.error("Failed to load labels", e))
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(LABOR_RATES_STORAGE_KEY) : null
      if (raw) setRates(JSON.parse(raw) as LaborRate[])
    } catch (e) {
      console.error("Failed to load rates", e)
    }
  }, [job])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData) {
      onSubmit({
        ...formData,
        updatedAt: new Date().toISOString(),
      })
    }
  }

  const handleDelete = () => {
    if (job) {
      onDelete(job.id)
      setShowDeleteDialog(false)
    }
  }

  if (!formData) return null

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Repair Order</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-title">Job Title *</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => (prev ? { ...prev, title: e.target.value } : null))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="edit-company">Company *</Label>
                <Input
                  id="edit-company"
                  value={formData.company}
                  onChange={(e) => setFormData((prev) => (prev ? { ...prev, company: e.target.value } : null))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-contact">Contact</Label>
                <Input
                  id="edit-contact"
                  value={formData.contact || ""}
                  onChange={(e) => setFormData((prev) => (prev ? { ...prev, contact: e.target.value } : null))}
                />
              </div>

              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: JobStatus) =>
                    setFormData((prev) => (prev ? { ...prev, status: value } : null))
                  }
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
              <Label htmlFor="edit-label">RO Label</Label>
              <Select
                value={formData.labelId ? String(formData.labelId) : ""}
                onValueChange={(value: string) =>
                  setFormData((prev) => (prev ? { ...prev, labelId: value ? Number(value) : undefined } : null))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select label (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {labels.map((l) => (
                    <SelectItem key={l.id} value={String(l.id)}>
                      {l.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="edit-rate">Labor Rate</Label>
              <Select
                value={formData.laborRateId || ""}
                onValueChange={(value: string) =>
                  setFormData((prev) => (prev ? { ...prev, laborRateId: value, laborRate: rates.find((r) => r.id === value)?.rate } : null))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select labor rate" />
                </SelectTrigger>
                <SelectContent>
                  {rates.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name} - ${r.rate}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="edit-location">Location</Label>
              <Input
                id="edit-location"
                value={formData.location || ""}
                onChange={(e) => setFormData((prev) => (prev ? { ...prev, location: e.target.value } : null))}
              />
            </div>

            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description || ""}
                onChange={(e) => setFormData((prev) => (prev ? { ...prev, description: e.target.value } : null))}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit-progress">Progress (%)</Label>
                <Input
                  id="edit-progress"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.progress}
                  onChange={(e) =>
                    setFormData((prev) => (prev ? { ...prev, progress: Number.parseInt(e.target.value) || 0 } : null))
                  }
                />
              </div>

              <div>
                <Label htmlFor="edit-statusText">Status Text</Label>
                <Input
                  id="edit-statusText"
                  value={formData.statusText || ""}
                  onChange={(e) => setFormData((prev) => (prev ? { ...prev, statusText: e.target.value } : null))}
                />
              </div>

              <div>
                <Label htmlFor="edit-dueDate">Due Date</Label>
                <Input
                  id="edit-dueDate"
                  type="date"
                  value={formData.dueDate || ""}
                  onChange={(e) => setFormData((prev) => (prev ? { ...prev, dueDate: e.target.value } : null))}
                />
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button type="button" variant="destructive" onClick={() => setShowDeleteDialog(true)}>
                Delete Job
              </Button>

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit">Update Job</Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the job &quot;{job?.title}&quot; and remove it from the
              board.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
