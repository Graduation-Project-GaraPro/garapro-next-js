"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Archive } from "lucide-react"

interface ArchiveRODialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (reason: string) => void
  repairOrderId: string
  isLoading?: boolean
}

export default function ArchiveRODialog({ 
  open, 
  onOpenChange, 
  onConfirm, 
  repairOrderId,
  isLoading = false 
}: ArchiveRODialogProps) {
  const [archiveReason, setArchiveReason] = useState("")

  const handleConfirm = () => {
    if (archiveReason.trim()) {
      onConfirm(archiveReason)
      setArchiveReason("")
    }
  }

  const handleCancel = () => {
    setArchiveReason("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Archive className="w-5 h-5 text-blue-500" />
            Archive Repair Order
          </DialogTitle>
          <DialogDescription>
            Archive repair order #{repairOrderId.substring(0, 8)}. 
            Archived orders will be moved out of the active board.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="archiveReason">
              Archive Reason <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="archiveReason"
              placeholder="Please provide a reason for archiving this repair order..."
              value={archiveReason}
              onChange={(e) => setArchiveReason(e.target.value)}
              rows={4}
              disabled={isLoading}
            />
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!archiveReason.trim() || isLoading}
          >
            {isLoading ? "Archiving..." : "Archive Order"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
