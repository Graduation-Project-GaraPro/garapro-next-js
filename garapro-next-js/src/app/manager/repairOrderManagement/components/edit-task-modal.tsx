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
import type { RepairOrder } from "@/types/manager/repair-order"
import { labelService } from "@/services/manager/label-service"
import type { Label as LabelType } from "@/types/manager/label"
import { LABOR_RATES_STORAGE_KEY, type LaborRate } from "@/app/manager/garageSetting/ro-settings/tabs/labor-rates-tab"

interface EditTaskModalProps {
  repairOrder: RepairOrder | null
  isOpen: boolean
  onClose: () => void
  onSubmit: (repairOrder: RepairOrder) => void
  onDelete: (repairOrderId: string) => void
}

export default function EditTaskModal({ repairOrder, isOpen, onClose, onSubmit, onDelete }: EditTaskModalProps) {
  const [formData, setFormData] = useState<RepairOrder | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [labels, setLabels] = useState<LabelType[]>([])
  const [rates, setRates] = useState<LaborRate[]>([])

  useEffect(() => {
    if (repairOrder) {
      setFormData({ ...repairOrder })
    }
    labelService.getAllLabels().then(setLabels).catch((e) => console.error("Failed to load labels", e))
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(LABOR_RATES_STORAGE_KEY) : null
      if (raw) setRates(JSON.parse(raw) as LaborRate[])
    } catch (e) {
      console.error("Failed to load rates", e)
    }
  }, [repairOrder])

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
    if (repairOrder) {
      onDelete(repairOrder.repairOrderId)
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
                <Label htmlFor="edit-roTypeName">RO Type *</Label>
                <Input
                  id="edit-roTypeName"
                  value={formData.roTypeName}
                  onChange={(e) => setFormData((prev) => (prev ? { ...prev, roTypeName: e.target.value } : null))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="edit-customerName">Customer Name *</Label>
                <Input
                  id="edit-customerName"
                  value={formData.customerName}
                  onChange={(e) => setFormData((prev) => (prev ? { ...prev, customerName: e.target.value } : null))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-customerPhone">Customer Phone</Label>
                <Input
                  id="edit-customerPhone"
                  value={formData.customerPhone || ""}
                  onChange={(e) => setFormData((prev) => (prev ? { ...prev, customerPhone: e.target.value } : null))}
                />
              </div>

              <div>
                <Label htmlFor="edit-statusId">Status</Label>
                <Input
                  id="edit-statusId"
                  value={formData.statusId}
                  onChange={(e) => setFormData((prev) => (prev ? { ...prev, statusId: e.target.value } : null))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-label">RO Label</Label>
              <Select
                value={formData.branchId || ""}
                onValueChange={(value: string) =>
                  setFormData((prev) => (prev ? { ...prev, branchId: value } : null))
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
                value={formData.userId || ""}
                onValueChange={(value: string) =>
                  setFormData((prev) => (prev ? { ...prev, userId: value } : null))
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
              <Label htmlFor="edit-vehicleId">Vehicle ID</Label>
                <Input
                  id="edit-vehicleId"
                  value={formData.vehicleId || ""}
                  onChange={(e) => setFormData((prev) => (prev ? { ...prev, vehicleId: e.target.value } : null))}
                />
            </div>

            <div>
              <Label htmlFor="edit-note">Note</Label>
              <Textarea
                id="edit-note"
                value={formData.note || ""}
                onChange={(e) => setFormData((prev) => (prev ? { ...prev, note: e.target.value } : null))}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit-estimatedAmount">Estimated Amount ($)</Label>
                <Input
                  id="edit-estimatedAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.estimatedAmount}
                  onChange={(e) =>
                    setFormData((prev) => (prev ? { ...prev, estimatedAmount: parseFloat(e.target.value) || 0 } : null))
                  }
                />
              </div>

              <div>
                <Label htmlFor="edit-estimatedCompletionDate">Due Date</Label>
                <Input
                  id="edit-estimatedCompletionDate"
                  type="date"
                  value={formData.estimatedCompletionDate?.split("T")[0] || ""}
                  onChange={(e) => setFormData((prev) => (prev ? { ...prev, estimatedCompletionDate: e.target.value } : null))}
                />
              </div>

              <div>
                <Label htmlFor="edit-receiveDate">Receive Date</Label>
                <Input
                  id="edit-receiveDate"
                  type="date"
                  value={formData.receiveDate?.split("T")[0] || ""}
                  onChange={(e) => setFormData((prev) => (prev ? { ...prev, receiveDate: e.target.value } : null))}
                />
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button type="button" variant="destructive" onClick={() => setShowDeleteDialog(true)}>
                Delete Repair Order
              </Button>

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit">Update Repair Order</Button>
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
              This action cannot be undone. This will permanently delete the repair order &quot;{repairOrder?.roTypeName}&quot; and remove it from the
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