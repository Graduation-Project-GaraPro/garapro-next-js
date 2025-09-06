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

export default function ROLabelPage() {
  const [labels, setLabels] = useState<Label[]>([])
  const [editingLabel, setEditingLabel] = useState<Label | null>(null)
  const [newLabel, setNewLabel] = useState<NewLabel>({ name: "", category: "", color: "#3b82f6", description: "" })
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Load labels on component mount
  useEffect(() => {
    loadLabels()
  }, [])

  const loadLabels = async () => {
    try {
      setLoading(true)
      const fetchedLabels = await labelService.getAllLabels()
      setLabels(fetchedLabels)
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
      const createdLabel = await labelService.createLabel(newLabel)
      setLabels([...labels, createdLabel])
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
      const updatedLabel = await labelService.updateLabel(editingLabel.id, editingLabel)
      setLabels(labels.map((label) => (label.id === editingLabel.id ? updatedLabel : label)))
      setEditingLabel(null)
    } catch (error) {
      console.error("Failed to update label:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteLabel = async (id: number) => {
    try {
      await labelService.deleteLabel(id)
      setLabels(labels.filter((label) => label.id !== id))
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

  const resetNewLabelForm = () => {
    setNewLabel({ name: "", category: "", color: "#3b82f6", description: "" })
  }

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
                <div className="flex items-center gap-2">
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
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Preview</label>
                <Badge style={{ backgroundColor: newLabel.color, color: "white" }}>
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
        {labels.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Tag className="w-12 h-12 text-gray-400 mb-4" />
              <div className="text-gray-500 text-center">
                <p className="text-lg font-medium mb-2">No labels found</p>
                <p className="text-sm">Create your first label to get started</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {labels.map((label) => (
              <Card key={label.id} className="relative group hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-gray-500" />
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        {label.category}
                      </span>
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
                          style={{ backgroundColor: label.color, color: "white" }}
                          className="text-sm px-3 py-1"
                        >
                          {label.name}
                        </Badge>
                      </div>
                      
                      {/* Label Info */}
                      <div className="space-y-2">
                        <h3 className="font-medium text-gray-900 text-center">{label.name}</h3>
                        <p className="text-sm text-gray-600 text-center">{label.description}</p>
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
