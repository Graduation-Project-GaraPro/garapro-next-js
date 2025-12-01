"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { AlertCircle } from "lucide-react"

interface CancelRODialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (reason: string) => void
  repairOrderId: string
  isLoading?: boolean
}

export default function CancelRODialog({ 
  open, 
  onOpenChange, 
  onConfirm, 
  repairOrderId,
  isLoading = false 
}: CancelRODialogProps) {
  const [cancelReason, setCancelReason] = useState("")

  const handleConfirm = () => {
    if (cancelReason.trim()) {
      onConfirm(cancelReason)
      setCancelReason("")
    }
  }

  const handleCancel = () => {
    setCancelReason("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            Cancel Repair Order
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel repair order #{repairOrderId.substring(0, 8)}? 
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="cancelReason">
              Cancellation Reason <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="cancelReason"
              placeholder="Please provide a reason for canceling this repair order..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
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
            Keep Order
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleConfirm}
            disabled={!cancelReason.trim() || isLoading}
          >
            {isLoading ? "Canceling..." : "Cancel Order"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
