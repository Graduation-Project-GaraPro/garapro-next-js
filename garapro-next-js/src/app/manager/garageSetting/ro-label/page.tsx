"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Plus, Edit2, Trash2, Eye, Save, X, Loader2, Tag } from "lucide-react"
import { labelService } from "@/services/manager/label-service"
import type { Label, NewLabel } from "@/types/manager/label"

function getTextColorForBackground(hexColor: string): string {
  // Fallback
  if (!hexColor) return "white"
  let hex = hexColor.replace('#','')
  if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('')
  const r = parseInt(hex.substring(0,2), 16) / 255
  const g = parseInt(hex.substring(2,4), 16) / 255
  const b = parseInt(hex.substring(4,6), 16) / 255
  const toLinear = (c: number) => (c <= 0.03928 ? c/12.92 : Math.pow((c+0.055)/1.055, 2.4))
  const L = 0.2126*toLinear(r) + 0.7152*toLinear(g) + 0.0722*toLinear(b)
  // Contrast vs white(1.0) and black(0.0)
  const contrastWhite = (1.0 + 0.05) / (L + 0.05)
  const contrastBlack = (L + 0.05) / (0.0 + 0.05)
  return contrastWhite >= contrastBlack ? "white" : "black"
}

const COLOR_PRESETS = ["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#14b8a6", "#6b7280", "#e11d48"]

export default function ROLabelPage() {
  const [labels, setLabels] = useState<Label[]>([])
  const [editingLabel, setEditingLabel] = useState<Label | null>(null)
  const [newLabel, setNewLabel] = useState<NewLabel>({ name: "", category: "", color: "#3b82f6", description: "" })
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Toolbar state
  const [query, setQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>()
  const [statusFilter, setStatusFilter] = useState<"active" | "archived" | "all">("active")

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())

  useEffect(() => {
    loadLabels()
  }, [])

  const loadLabels = async () => {
    try {
      setLoading(true)
      const fetched = await labelService.getAllLabels()
      // Ensure optional fields exist for UI logic
      const normalized = fetched.map((l) => ({
        active: true,
        usageCount: 0,
        ...l,
      }))
      setLabels(normalized)
    } catch (error) {
      console.error("Failed to load labels:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddLabel = async () => {
    if (!newLabel.name || !newLabel.category) return

    try {
      setSaving(true)
      const created = await labelService.createLabel({ active: true, ...newLabel })
      // default usageCount to 0 for new label
      setLabels([...labels, { usageCount: 0, ...created }])
      setNewLabel({ name: "", category: "", color: "#3b82f6", description: "" })
      setShowAddDialog(false)
    } catch (error) {
      console.error("Failed to create label:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleEditLabel = (label: Label) => {
    setEditingLabel({ ...label })
  }

  const handleSaveEdit = async () => {
    if (!editingLabel) return

    try {
      setSaving(true)
      const updated = await labelService.updateLabel(editingLabel.id, editingLabel)
      setLabels(labels.map((label) => (label.id === editingLabel.id ? { ...label, ...updated } : label)))
      setEditingLabel(null)
    } catch (error) {
      console.error("Failed to update label:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteLabel = async (id: number) => {
    const target = labels.find(l => l.id === id)
    if (target && (target.usageCount ?? 0) > 0) {
      // Prevent deleting labels in use
      return
    }
    try {
      await labelService.deleteLabel(id)
      setLabels(labels.filter((label) => label.id !== id))
      setSelectedIds((prev) => { const next = new Set(prev); next.delete(id); return next })
    } catch (error) {
      console.error("Failed to delete label:", error)
    }
  }

  const handleSetDefault = async (id: number) => {
    try {
      await labelService.setDefaultLabel(id)
      setLabels(
        labels.map((label) => ({
          ...label,
          isDefault: label.id === id,
        }))
      )
    } catch (error) {
      console.error("Failed to set default label:", error)
    }
  }

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAll = (ids: number[]) => {
    setSelectedIds(new Set(ids))
  }
  const clearSelection = () => setSelectedIds(new Set())

  // Bulk actions
  const bulkArchive = () => {
    setLabels((prev) => prev.map((l) => selectedIds.has(l.id) ? { ...l, active: false } : l))
    clearSelection()
  }
  const bulkRestore = () => {
    setLabels((prev) => prev.map((l) => selectedIds.has(l.id) ? { ...l, active: true } : l))
    clearSelection()
  }
  const bulkDelete = async () => {
    // Only delete labels not in use
    const deletable = labels.filter((l) => selectedIds.has(l.id) && ((l.usageCount ?? 0) === 0))
    for (const l of deletable) {
      await handleDeleteLabel(l.id)
    }
    clearSelection()
  }
  const bulkSetDefault = async () => {
    // If multiple selected, set first as default
    const first = labels.find((l) => selectedIds.has(l.id))
    if (first) {
      await handleSetDefault(first.id)
    }
    clearSelection()
  }

  const resetNewLabelForm = () => {
    setNewLabel({ name: "", category: "", color: "#3b82f6", description: "" })
  }

  // Filtering
  const filtered = labels.filter((l) => {
    const matchesQuery = !query || l.name.toLowerCase().includes(query.toLowerCase()) || l.description.toLowerCase().includes(query.toLowerCase())
    const matchesCategory = !categoryFilter || l.category === categoryFilter
    const matchesStatus = statusFilter === "all" || (statusFilter === "active" ? (l.active ?? true) : !(l.active ?? true))
    return matchesQuery && matchesCategory && matchesStatus
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
          <p className="text-gray-600">Create and manage custom labels for repair orders</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="bg-[#154c79] hover:bg-[#123a5c]">
          <Plus className="w-4 h-4 mr-2" />
          Add New Label
        </Button>
      </div>

      {/* Toolbar */}
      <div className="bg-white border rounded-lg p-3 mb-4 grid grid-cols-1 md:grid-cols-4 gap-2">
        <Input placeholder="Search labels" value={query} onChange={(e) => setQuery(e.target.value)} />
        <Select value={categoryFilter} onValueChange={setCategoryFilter as any}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Status">Status</SelectItem>
            <SelectItem value="Type">Type</SelectItem>
            <SelectItem value="Process">Process</SelectItem>
            <SelectItem value="Priority">Priority</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { setQuery(""); setCategoryFilter(undefined); setStatusFilter("active") }}>Clear</Button>
          {selectedIds.size > 0 && (
            <Button variant="outline" onClick={clearSelection}>Clear Selection ({selectedIds.size})</Button>
          )}
        </div>
      </div>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="bg-[#f8fafc] border rounded-lg p-3 mb-3 flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-600">Selected: {selectedIds.size}</span>
          <Button size="sm" className="bg-[#154c79] hover:bg-[#123a5c]" onClick={bulkArchive}>Archive</Button>
          <Button size="sm" variant="outline" onClick={bulkRestore}>Restore</Button>
          <Button size="sm" variant="destructive" onClick={bulkDelete}>Delete</Button>
          <Button size="sm" variant="outline" onClick={bulkSetDefault}>Set Default</Button>
          <Button size="sm" variant="outline" onClick={() => selectAll(filtered.map((l) => l.id))}>Select All</Button>
        </div>
      )}

      {/* Add New Label Dialog */}
      <Dialog open={showAddDialog} onOpenChange={(open) => {
        setShowAddDialog(open)
        if (!open) resetNewLabelForm()
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Label</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Label Name</label>
                <Input
                  value={newLabel.name}
                  onChange={(e) => setNewLabel({ ...newLabel, name: e.target.value })}
                  placeholder="Enter label name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <Select
                  value={newLabel.category}
                  onValueChange={(value) => setNewLabel({ ...newLabel, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Status">Status</SelectItem>
                    <SelectItem value="Type">Type</SelectItem>
                    <SelectItem value="Process">Process</SelectItem>
                    <SelectItem value="Priority">Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Color</label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="color"
                    value={newLabel.color}
                    onChange={(e) => setNewLabel({ ...newLabel, color: e.target.value })}
                    className="w-12 h-10 rounded border"
                  />
                  <Input
                    value={newLabel.color}
                    onChange={(e) => setNewLabel({ ...newLabel, color: e.target.value })}
                    placeholder="#3b82f6"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {COLOR_PRESETS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewLabel({ ...newLabel, color: c })}
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: c }}
                      aria-label={`preset ${c}`}
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Preview</label>
                <Badge style={{ backgroundColor: newLabel.color, color: getTextColorForBackground(newLabel.color) }}>
                  {newLabel.name || "Label Preview"}
                </Badge>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea
                value={newLabel.description}
                onChange={(e) => setNewLabel({ ...newLabel, description: e.target.value })}
                placeholder="Enter label description"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddLabel} 
              className="bg-[#154c79] hover:bg-[#123a5c]"
              disabled={saving || !newLabel.name || !newLabel.category}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Label
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Labels Grid */}
      <div className="space-y-6">
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Tag className="w-12 h-12 text-gray-400 mb-4" />
              <div className="text-gray-500 text-center">
                <p className="text-lg font-medium mb-2">No labels found</p>
                <p className="text-sm">Adjust filters or create a label</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((label) => (
              <Card key={label.id} className="relative group hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(label.id)}
                        onChange={() => toggleSelect(label.id)}
                        className="w-4 h-4"
                        aria-label={`select ${label.name}`}
                      />
                      <Tag className="w-4 h-4 text-gray-500" />
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        {label.category}
                      </span>
                      {label.active === false && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-200 text-gray-700">Archived</span>
                      )}
                    </div>
                    {label.isDefault && (
                      <Badge variant="secondary" className="text-xs">
                        DEFAULT
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {editingLabel?.id === label.id ? (
                    <div className="space-y-3">
                      <Input
                        value={editingLabel.name}
                        onChange={(e) => setEditingLabel({ ...editingLabel, name: e.target.value })}
                        className="text-sm"
                      />
                      <Select
                        value={editingLabel.category}
                        onValueChange={(value) => setEditingLabel({ ...editingLabel, category: value })}
                      >
                        <SelectTrigger className="text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Status">Status</SelectItem>
                          <SelectItem value="Type">Type</SelectItem>
                          <SelectItem value="Process">Process</SelectItem>
                          <SelectItem value="Priority">Priority</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={editingLabel.color}
                          onChange={(e) => setEditingLabel({ ...editingLabel, color: e.target.value })}
                          className="w-8 h-8 rounded border"
                        />
                        <Input
                          value={editingLabel.color}
                          onChange={(e) => setEditingLabel({ ...editingLabel, color: e.target.value })}
                          className="text-sm"
                        />
                      </div>
                      <Textarea
                        value={editingLabel.description}
                        onChange={(e) => setEditingLabel({ ...editingLabel, description: e.target.value })}
                        rows={2}
                        className="text-sm"
                      />
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          onClick={handleSaveEdit} 
                          className="bg-[#154c79] hover:bg-[#123a5c]"
                          disabled={saving}
                        >
                          {saving ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Save className="w-3 h-3" />
                          )}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingLabel(null)}>
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Label Preview */}
                      <div className="flex justify-center">
                        <Badge 
                          style={{ backgroundColor: label.color, color: getTextColorForBackground(label.color) }}
                          className="text-sm px-3 py-1"
                        >
                          {label.name}
                        </Badge>
                      </div>
                      
                      {/* Label Info */}
                      <div className="space-y-2">
                        <h3 className="font-medium text-gray-900 text-center">{label.name}</h3>
                        <p className="text-sm text-gray-600 text-center">{label.description}</p>
                        <p className="text-xs text-gray-500 text-center">Used in {label.usageCount ?? 0} RO(s)</p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-center gap-1 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleEditLabel(label)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleDeleteLabel(label.id)}
                          className="h-8 w-8 p-0"
                          disabled={(label.usageCount ?? 0) > 0}
                          aria-disabled={(label.usageCount ?? 0) > 0}
                          title={(label.usageCount ?? 0) > 0 ? "Cannot delete a label in use" : "Delete"}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                        {!label.isDefault && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleSetDefault(label.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
