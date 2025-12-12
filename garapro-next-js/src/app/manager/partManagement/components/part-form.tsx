"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { branchService } from "@/services/branch-service"
import type { Part, PartCategory } from "@/types/manager/part-category"

interface PartFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: {
    name: string
    partCategoryId: string
    branchId?: string // Optional for updates
    price: number
    stock: number
  }) => void
  initialData?: Part
  categories: PartCategory[]
}

export default function PartForm({ open, onOpenChange, onSave, initialData, categories }: PartFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    partCategoryId: "",
    branchId: "",
    price: "",
    stock: "",
  })
  const [currentBranchName, setCurrentBranchName] = useState<string>("")
  const [loadingBranch, setLoadingBranch] = useState(false)

  // Load current user's branch when form opens
  useEffect(() => {
    const loadCurrentBranch = async () => {
      if (open && !formData.branchId) {
        try {
          setLoadingBranch(true)
          const currentBranch = await branchService.getCurrentUserBranch("")
          if (currentBranch) {
            setFormData(prev => ({ ...prev, branchId: currentBranch.branchId }))
            setCurrentBranchName(currentBranch.branchName)
          }
        } catch (error) {
          console.error("Failed to load current branch:", error)
        } finally {
          setLoadingBranch(false)
        }
      }
    }

    if (initialData) {
      setFormData({
        name: initialData.name || "",
        partCategoryId: initialData.partCategoryId || "",
        branchId: initialData.branchId || "",
        price: initialData.price?.toString() || "",
        stock: initialData.stock?.toString() || "",
      })
      // If editing, we might want to show the branch name
      if (initialData.branchId && !currentBranchName) {
        loadCurrentBranch()
      }
    } else {
      setFormData({
        name: "",
        partCategoryId: "",
        branchId: "",
        price: "",
        stock: "",
      })
      loadCurrentBranch()
    }
  }, [initialData, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const isEditing = !!initialData
    
    // For creating: require branchId, for editing: don't send branchId
    if (formData.name.trim() && formData.partCategoryId && (!isEditing || isEditing)) {
      const saveData: any = {
        name: formData.name,
        partCategoryId: formData.partCategoryId,
        price: parseFloat(formData.price) || 0.01,
        stock: parseInt(formData.stock) || 0,
      }
      
      // Only include branchId for new parts
      if (!isEditing && formData.branchId) {
        saveData.branchId = formData.branchId
      }
      
      onSave(saveData)
      setFormData({ name: "", partCategoryId: "", branchId: "", price: "", stock: "" })
      setCurrentBranchName("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Part" : "Add New Part"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Part Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Synthetic Oil 5W-30"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={formData.partCategoryId} onValueChange={(value) => setFormData({ ...formData, partCategoryId: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="branch">Branch</Label>
            <div className="px-3 py-2 bg-muted rounded-md text-sm text-muted-foreground">
              {initialData ? (
                "Branch cannot be changed when editing"
              ) : loadingBranch ? (
                "Loading branch..."
              ) : currentBranchName ? (
                `${currentBranchName} (Auto-selected)`
              ) : (
                "No branch found"
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                placeholder="0.01"
                type="number"
                step="0.01"
                min="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                placeholder="0"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={(!initialData && (!formData.branchId || loadingBranch))}
            >
              {loadingBranch ? "Loading..." : `${initialData ? "Update" : "Create"} Part`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}