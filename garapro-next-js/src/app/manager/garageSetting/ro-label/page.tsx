"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label as UILabel } from "@/components/ui/label"
import { Plus, Edit2, Trash2, Check, Loader2, Tag } from "lucide-react"
import { toast } from "sonner"
import { labelService } from "@/services/manager/label-service"
import { repairOrderService } from "@/services/manager/repair-order-service"
import type { Label, CreateLabelRequest } from "@/types/manager/label"
import type { OrderStatus } from "@/types/manager/order-status"

const COLOR_PRESETS = [
  { name: "Red", hex: "#EF4444" },
  { name: "Orange", hex: "#F97316" },
  { name: "Yellow", hex: "#EAB308" },
  { name: "Green", hex: "#22C55E" },
  { name: "Blue", hex: "#3B82F6" },
  { name: "Indigo", hex: "#6366F1" },
  { name: "Purple", hex: "#A855F7" },
  { name: "Pink", hex: "#EC4899" },
]

export default function ROLabelPage() {
  const [labels, setLabels] = useState<Label[]>([])
  const [statuses, setStatuses] = useState<OrderStatus[]>([])
  const [editingLabel, setEditingLabel] = useState<Label | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form state
  const [labelName, setLabelName] = useState("")
  const [description, setDescription] = useState("")
  const [selectedColor, setSelectedColor] = useState(COLOR_PRESETS[0])
  const [selectedStatusId, setSelectedStatusId] = useState<number>(1)
  const [isDefault, setIsDefault] = useState(false)

  // Filter state
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<number | "all">("all")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [labelsData, statusesData] = await Promise.all([
        labelService.getAllLabels(),
        repairOrderService.fetchOrderStatuses()
      ])
      setLabels(labelsData)
      setStatuses(statusesData)
      if (statusesData.length > 0) {
        setSelectedStatusId(Number(statusesData[0].orderStatusId))
      }
    } catch (error) {
      console.error("Failed to load data:", error)
      toast.error("Failed to load labels")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setLabelName("")
    setDescription("")
    setSelectedColor(COLOR_PRESETS[0])
    setSelectedStatusId(statuses.length > 0 ? Number(statuses[0].orderStatusId) : 1)
    setIsDefault(false)
    setEditingLabel(null)
    setShowAddDialog(false)
  }

  const handleSubmit = async () => {
    if (!labelName.trim()) {
      toast.error("Label name is required")
      return
    }

    setSaving(true)
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

      await loadData()
      resetForm()
    } catch (error) {
      console.error("Failed to save label:", error)
      toast.error("Failed to save label")
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (label: Label) => {
    setEditingLabel(label)
    setLabelName(label.labelName)
    setDescription(label.description || "")
    setSelectedColor(
      COLOR_PRESETS.find((c) => c.hex === label.hexCode) || COLOR_PRESETS[0]
    )
    setSelectedStatusId(label.orderStatusId)
    setIsDefault(label.isDefault)
    setShowAddDialog(true)
  }

  const handleDelete = async (labelId: number) => {
    if (!confirm("Are you sure you want to delete this label?")) return

    try {
      await labelService.deleteLabel(labelId)
      toast.success("Label deleted successfully")
      await loadData()
    } catch (error) {
      console.error("Failed to delete label:", error)
      toast.error("Failed to delete label")
    }
  }

  const getLabelsByStatus = (statusId: number) => {
    return labels.filter((label) => label.orderStatusId === statusId)
  }

  // Filtering
  const filtered = labels.filter((l) => {
    const matchesQuery = !query || 
      l.labelName.toLowerCase().includes(query.toLowerCase()) || 
      (l.description && l.description.toLowerCase().includes(query.toLowerCase()))
    const matchesStatus = statusFilter === "all" || l.orderStatusId === statusFilter
    return matchesQuery && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#154c79]" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">RO Label Management</h2>
          <p className="text-gray-600">Create and manage labels for repair order statuses. Only one default label per status.</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="bg-[#154c79] hover:bg-[#123a5c]">
          <Plus className="w-4 h-4 mr-2" />
          Add New Label
        </Button>
      </div>

      {/* Toolbar */}
      <div className="bg-white border rounded-lg p-3 mb-4 flex gap-2">
        <Input 
          placeholder="Search labels" 
          value={query} 
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-xs"
        />
        <Select 
          value={statusFilter === "all" ? "all" : statusFilter.toString()} 
          onValueChange={(v) => setStatusFilter(v === "all" ? "all" : Number(v))}
        >
          <SelectTrigger className="max-w-xs">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {statuses.map((status) => (
              <SelectItem key={status.orderStatusId} value={status.orderStatusId}>
                {status.statusName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button 
          variant="outline" 
          onClick={() => { setQuery(""); setStatusFilter("all") }}
        >
          Clear Filters
        </Button>
      </div>

      {/* Add/Edit Label Dialog */}
      <Dialog open={showAddDialog} onOpenChange={(open) => {
        setShowAddDialog(open)
        if (!open) resetForm()
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingLabel ? "Edit Label" : "Create New Label"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
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
                {COLOR_PRESETS.map((color) => (
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={saving || !labelName.trim()}
              className="bg-[#154c79] hover:bg-[#123a5c]"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                editingLabel ? "Update Label" : "Create Label"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Labels by Status */}
      <div className="space-y-4">
        {statusFilter === "all" ? (
          // Show labels grouped by status
          statuses.map((status) => {
            const statusLabels = getLabelsByStatus(Number(status.orderStatusId))
            return (
              <Card key={status.orderStatusId}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">
                      {status.statusName} ({statusLabels.length})
                    </h3>
                  </div>
                </CardHeader>
                <CardContent>
                  {statusLabels.length === 0 ? (
                    <p className="text-sm text-gray-500">No labels for this status</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {statusLabels.map((label) => (
                        <div
                          key={label.labelId}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                        >
                          <div className="flex items-center gap-2 flex-1">
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
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(label)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(label.labelId)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })
        ) : (
          // Show filtered labels
          <Card>
            <CardContent className="pt-6">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Tag className="w-12 h-12 text-gray-400 mb-4" />
                  <div className="text-gray-500 text-center">
                    <p className="text-lg font-medium mb-2">No labels found</p>
                    <p className="text-sm">Adjust filters or create a label</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filtered.map((label) => (
                    <div
                      key={label.labelId}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                    >
                      <div className="flex items-center gap-2 flex-1">
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
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(label)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(label.labelId)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
