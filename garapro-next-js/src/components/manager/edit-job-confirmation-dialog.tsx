"use client"

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
import { AlertTriangle, User, Clock } from "lucide-react"

interface EditJobConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  jobName: string
  technicianName?: string | null
  jobStatus: number
}

export function EditJobConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  jobName,
  technicianName,
  jobStatus
}: EditJobConfirmationDialogProps) {
  const getStatusText = (status: number) => {
    switch (status) {
      case 0: return "Pending"
      case 1: return "New"
      case 2: return "In Progress"
      case 3: return "Completed"
      case 4: return "On Hold"
      default: return "Unknown"
    }
  }

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0: return "bg-yellow-100 text-yellow-800"
      case 1: return "bg-blue-100 text-blue-800"
      case 2: return "bg-orange-100 text-orange-800"
      case 3: return "bg-green-100 text-green-800"
      case 4: return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const isInProgress = jobStatus === 2
  const isOnHold = jobStatus === 4
  const needsConfirmation = isInProgress || isOnHold

  const getWarningMessage = () => {
    if (isInProgress) {
      return "Editing this job may affect the technician's work and could cause confusion or delays. The technician will be notified of any changes made."
    }
    if (isOnHold) {
      return "This job is currently on hold. Editing it may change its status or affect the reason it was put on hold."
    }
    return ""
  }

  const getDialogTitle = () => {
    if (isInProgress) return "Edit Job in Progress"
    if (isOnHold) return "Edit Job on Hold"
    return "Edit Job"
  }

  const getDialogDescription = () => {
    if (isInProgress) {
      return "You are about to edit a job that is currently being worked on by a technician."
    }
    if (isOnHold) {
      return "You are about to edit a job that is currently on hold."
    }
    return "You are about to edit this job."
  }

  const handleConfirm = () => {
    onConfirm()
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
            </div>
            <AlertDialogTitle>
              {getDialogTitle()}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-left space-y-3">
            <p>
              {getDialogDescription()}
            </p>
            
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-orange-600" />
                <span className="font-medium">Job:</span>
                <span>{jobName}</span>
              </div>
              
              {technicianName && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-orange-600" />
                  <span className="font-medium">Technician:</span>
                  <span>{technicianName}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-sm">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <span className="font-medium">Status:</span>
                <span className={`px-2 py-1 rounded text-xs ${getStatusColor(jobStatus)}`}>
                  {getStatusText(jobStatus)}
                </span>
              </div>
            </div>

            {needsConfirmation && (
              <div className="text-sm text-gray-600">
                <strong>Warning:</strong> {getWarningMessage()}
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-orange-600 hover:bg-orange-700 focus:ring-orange-600"
          >
            {isInProgress ? "Edit Anyway" : isOnHold ? "Edit Job" : "Continue"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}