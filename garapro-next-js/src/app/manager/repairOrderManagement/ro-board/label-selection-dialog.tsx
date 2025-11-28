"use client"

import { useState, useEffect } from "react"
import { Check, Tag, Circle, CheckCircle2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { labelService } from "@/services/manager/label-service"
import type { Label } from "@/types/manager/label"

interface LabelSelectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  repairOrderId: string
  currentStatusId: number
  currentLabels: string[] // Array of label IDs currently assigned
  onLabelsUpdated: (labels: Array<{
    labelId: string
    labelName: string
    colorName: string
    hexCode: string
    orderStatusId: number
  }>) => void
}

export default function LabelSelectionDialog({
  open,
  onOpenChange,
  repairOrderId,
  currentStatusId,
  currentLabels,
  onLabelsUpdated,
}: LabelSelectionDialogProps) {
  const [availableLabels, setAvailableLabels] = useState<Label[]>([])
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      loadLabels()
    }
  }, [open, currentStatusId])

  const loadLabels = async () => {
    setLoading(true)
    try {
      const labels = await labelService.getLabelsByStatus(currentStatusId)
      setAvailableLabels(labels)
      
      // Pre-select labels that are currently assigned (by labelId as string)
      const preSelected = labels
        .filter((label) => currentLabels.includes(label.labelId.toString()))
        .map((label) => label.labelId.toString())
      setSelectedLabelIds(preSelected)
      
      console.log("Current labels:", currentLabels)
      console.log("Available labels:", labels.map(l => ({ id: l.labelId, name: l.labelName })))
      console.log("Pre-selected:", preSelected)
    } catch (error) {
      console.error("Failed to load labels:", error)
      toast.error("Failed to load labels")
    } finally {
      setLoading(false)
    }
  }

  const toggleLabel = (labelId: string) => {
    setSelectedLabelIds((prev) => {
      // Single selection mode: if clicking the same label, deselect it
      // Otherwise, select only the new label
      if (prev.includes(labelId)) {
        return [] // Deselect if already selected
      } else {
        return [labelId] // Select only this label (replace previous selection)
      }
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Import apiClient dynamically to avoid SSR issues
      const { apiClient } = await import("@/services/manager/api-client")
      
      // Call API to update labels - convert labelIds to strings (GUIDs)
      const response = await apiClient.put<{
        success: boolean
        message: string
        updatedCard: {
          assignedLabels: Array<{
            labelId: string
            labelName: string
            colorName: string
            hexCode: string
            orderStatusId: number
          }>
        }
      }>(`/RepairOrder/${repairOrderId}/labels`, {
        labelIds: selectedLabelIds, // Already strings (GUIDs)
      })
      
      console.log("Sending label IDs:", selectedLabelIds)

      if (response.success && response.data) {
        // Use the labels from the API response
        const updatedLabels = response.data.updatedCard.assignedLabels
        onLabelsUpdated(updatedLabels)
        toast.success(response.data.message || "Labels updated successfully")
        onOpenChange(false)
      } else {
        throw new Error("Failed to update labels")
      }
    } catch (error) {
      console.error("Failed to update labels:", error)
      toast.error("Failed to update labels")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Select Label</DialogTitle>
          <DialogDescription>
            Choose one label for this repair order. Only labels for the current status are shown.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#154c79]"></div>
            </div>
          ) : availableLabels.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <Tag className="w-12 h-12 mb-2 text-gray-400" />
              <p className="text-sm">No labels available for this status</p>
              <p className="text-xs mt-1">Create labels in Garage Settings</p>
            </div>
          ) : (
            <div className="space-y-2">
              {availableLabels.map((label) => {
                const isSelected = selectedLabelIds.includes(label.labelId.toString())
                return (
                  <div
                    key={label.labelId}
                    className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-blue-50 border-blue-300 hover:bg-blue-100' 
                        : 'hover:bg-gray-50 border-gray-200'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleLabel(label.labelId.toString())
                    }}
                  >
                    {/* Radio button style indicator */}
                    <div className="flex-shrink-0">
                      {isSelected ? (
                        <CheckCircle2 className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-300" />
                      )}
                    </div>
                    
                    <div className="flex-1 flex items-center justify-between">
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
                      </div>
                      {isSelected && (
                        <Check className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || loading}
            className="bg-[#154c79] hover:bg-[#123a5c]"
          >
            {saving ? "Saving..." : "Save Label"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
