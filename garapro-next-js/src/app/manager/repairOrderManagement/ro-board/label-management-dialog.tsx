"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Check } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label as UILabel } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { labelService } from "@/services/manager/label-service"
import type { Label, CreateLabelRequest } from "@/types/manager/label"
import type { OrderStatus } from "@/types/manager/order-status"

interface LabelManagementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  statuses: OrderStatus[]
}

const PRESET_COLORS = [
  { name: "Red", hex: "#EF4444" },
  { name: "Orange", hex: "#F97316" },
  { name: "Yellow", hex: "#EAB308" },
  { name: "Green", hex: "#22C55E" },
  { name: "Blue", hex: "#3B82F6" },
  { name: "Indigo", hex: "#6366F1" },
  { name: "Purple", hex: "#A855F7" },
  { name: "Pink", hex: "#EC4899" },
]

export default function LabelManagementDialog({
  open,
  onOpenChange,
  statuses,
}: LabelManagementDialogProps) {
  const [labels, setLabels] = useState<Label[]>([])
  const [loading, setLoading] = useState(false)
  const [editingLabel, setEditingLabel] = useState<Label | null>(null)
  const [showForm, setShowForm] = useState(false)
  
  // Form state
  const [labelName, setLabelName] = useState("")
  const [description, setDescription] = useState("")
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0])
  const [selectedStatusId, setSelectedStatusId] = useState<number>(1)
  const [isDefault, setIsDefault] = useState(false)

  useEffect(() => {
    if (open) {
      loadLabels()
    }
  }, [open])

  const loadLabels = async () => {
    setLoading(true)
    try {
      const data = await labelService.getAllLabels()
      setLabels(data)
    } catch (error) {
      console.error("Failed to load labels:", error)
      toast.error("Failed to load labels")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setLabelName("")
    setDescription("")
    setSelectedColor(PRESET_COLORS[0])
    setSelectedStatusId(1)
    setIsDefault(false)
    setEditingLabel(null)
    setShowForm(false)
  }

  const handleSubmit = async () => {
    if (!labelName.trim()) {
      toast.error("Label name is required")
      return
    }

    setLoading(true)
    try {
      const request: CreateLabelRequest = {
        labelName: labelName.trim(),
        description: description.trim() || undefined,
        colorName: selectedColor.name,
        hexCode: selectedColor.hex,
        orderStatusId: selectedStatusId,
        isDefault,
      }

      if (editingLabel) {
        await labelService.updateLabel(editingLabel.labelId, {
          ...request,
          labelId: editingLabel.labelId,
        })
        toast.success("Label updated successfully")
      } else {
        await labelService.createLabel(request)
        toast.success("Label created successfully")
      }

      await loadLabels()
      resetForm()
    } catch (error) {
      console.error("Failed to save label:", error)
      toast.error("Failed to save label")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (label: Label) => {
    setEditingLabel(label)
    setLabelName(label.labelName)
    setDescription(label.description || "")
    setSelectedColor(
      PRESET_COLORS.find((c) => c.hex === label.hexCode) || PRESET_COLORS[0]
    )
    setSelectedStatusId(label.orderStatusId)
    setIsDefault(label.isDefault)
    setShowForm(true)
  }

  const handleDelete = async (labelId: number) => {
    if (!confirm("Are you sure you want to delete this label?")) return

    setLoading(true)
    try {
      await labelService.deleteLabel(labelId)
      toast.success("Label deleted successfully")
      await loadLabels()
    } catch (error) {
      console.error("Failed to delete label:", error)
      toast.error("Failed to delete label")
    } finally {
      setLoading(false)
    }
  }

  const getLabelsByStatus = (statusId: number) => {
    return labels.filter((label) => label.orderStatusId === statusId)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Labels</DialogTitle>
          <DialogDescription>
            Create and manage labels for repair orders. Only one default label per status.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Label Form */}
          {showForm ? (
            <div className="border rounded-lg p-4 space-y-4 bg-gray-50">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">
                  {editingLabel ? "Edit Label" : "Create New Label"}
                </h3>
                <Button variant="ghost" size="sm" onClick={resetForm}>
                  Cancel
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <UILabel htmlFor="labelName">Label Name *</UILabel>
                  <Input
                    id="labelName"
                    value={labelName}
                    onChange={(e) => setLabelName(e.target.value)}
                    placeholder="e.g., Customer Arriving"
                  />
                </div>

                <div className="space-y-2">
                  <UILabel htmlFor="status">Status *</UILabel>
                  <Select
                    value={selectedStatusId.toString()}
                    onValueChange={(value) => setSelectedStatusId(Number(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((status) => (
                        <SelectItem
                          key={status.orderStatusId}
                          value={status.orderStatusId}
                        >
                          {status.statusName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <UILabel htmlFor="description">Description</UILabel>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <UILabel>Color</UILabel>
                <div className="flex gap-2 flex-wrap">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color.hex}
                      type="button"
                      className={`w-10 h-10 rounded-md border-2 transition-all ${
                        selectedColor.hex === color.hex
                          ? "border-gray-900 scale-110"
                          : "border-gray-300"
                      }`}
                      style={{ backgroundColor: color.hex }}
                      onClick={() => setSelectedColor(color)}
                    >
                      {selectedColor.hex === color.hex && (
                        <Check className="w-5 h-5 text-white mx-auto" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isDefault"
                  checked={isDefault}
                  onCheckedChange={(checked: boolean) => setIsDefault(checked)}
                />
                <UILabel htmlFor="isDefault" className="cursor-pointer">
                  Set as default label for this status
                </UILabel>
              </div>

              <Button onClick={handleSubmit} disabled={loading} className="w-full">
                {editingLabel ? "Update Label" : "Create Label"}
              </Button>
            </div>
          ) : (
            <Button onClick={() => setShowForm(true)} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Create New Label
            </Button>
          )}

          {/* Labels by Status */}
          <div className="space-y-4">
            {statuses.map((status) => {
              const statusLabels = getLabelsByStatus(Number(status.orderStatusId))
              return (
                <div key={status.orderStatusId} className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3">
                    {status.statusName} ({statusLabels.length})
                  </h3>
                  {statusLabels.length === 0 ? (
                    <p className="text-sm text-gray-500">No labels for this status</p>
                  ) : (
                    <div className="space-y-2">
                      {statusLabels.map((label) => (
                        <div
                          key={label.labelId}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded"
                        >
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              style={{
                                backgroundColor: `${label.hexCode}20`,
                                borderColor: label.hexCode,
                                color: label.hexCode,
                              }}
                            >
                              {label.labelName}
                            </Badge>
                            {label.isDefault && (
                              <Badge variant="secondary" className="text-xs">
                                Default
                              </Badge>
                            )}
                            {label.description && (
                              <span className="text-xs text-gray-500">
                                {label.description}
                              </span>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(label)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(label.labelId)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
