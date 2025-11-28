"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { jobService } from "@/services/manager/job-service"
import { useToast } from "@/hooks/use-toast"
import type { Job } from "@/types/job"
import { Loader2 } from "lucide-react"

interface EditJobDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  job: Job
  onSuccess?: () => void
}

interface UpdateJobData {
  status: number
  note: string
  deadline: string | null
}

export default function EditJobDialog({
  open,
  onOpenChange,
  job,
  onSuccess
}: EditJobDialogProps) {
  const { toast } = useToast()
  const [status, setStatus] = useState<number>(job.status)
  const [note, setNote] = useState(job.note)
  const [deadline, setDeadline] = useState<string>(job.deadline || "")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setStatus(job.status)
      setNote(job.note)
      setDeadline(job.deadline || "")
      setError(null)
    }
  }, [open, job])

  const getStatusText = (statusValue: number) => {
    switch (statusValue) {
      case 0: return "Pending"
      case 1: return "New"
      case 2: return "In Progress"
      case 3: return "Completed"
      case 4: return "On Hold"
      default: return "Unknown"
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const updateData: UpdateJobData = {
        status,
        note: note.trim(),
        deadline: deadline ? new Date(deadline).toISOString() : null
      }

      await jobService.updateJob(job.jobId, updateData)
      
      // Show success toast
      toast({
        variant: "success",
        title: "Job Updated",
        description: "The job has been successfully updated.",
      })
      
      onSuccess?.()
      onOpenChange(false)
    } catch (err) {
      console.error("Failed to update job:", err)
      const errorMessage = "Failed to update job. Please try again."
      setError(errorMessage)
      
      // Show error toast
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: errorMessage,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Job</DialogTitle>
          <p className="text-sm text-gray-500 mt-1">{job.jobName}</p>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Status Selection */}
          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select
              value={status.toString()}
              onValueChange={(value) => setStatus(parseInt(value))}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">{getStatusText(0)}</SelectItem>
                <SelectItem value="1">{getStatusText(1)}</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Managers can only update between Pending and New status
            </p>
          </div>

          {/* Deadline */}
          <div className="space-y-2">
            <Label htmlFor="deadline">Deadline</Label>
            <Input
              id="deadline"
              type="datetime-local"
              value={deadline ? new Date(deadline).toISOString().slice(0, 16) : ""}
              onChange={(e) => setDeadline(e.target.value)}
            />
            <p className="text-xs text-gray-500">
              Optional: Set a deadline for this job
            </p>
          </div>

          {/* Note */}
          <div className="space-y-2">
            <Label htmlFor="note">Note</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add notes about this job..."
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="text-white"
            style={{ backgroundColor: "#154c79" }}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Job"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
