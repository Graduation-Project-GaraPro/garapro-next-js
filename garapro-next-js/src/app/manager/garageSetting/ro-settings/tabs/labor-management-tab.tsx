"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Search, Edit, Trash2, Clock, DollarSign, Wrench } from "lucide-react"

export type LaborItem = {
  id: string
  name: string
  description: string
  estimatedHours: number
  laborRate: number
  category: "engine" | "transmission" | "brakes" | "electrical" | "suspension" | "other"
  difficulty: "easy" | "medium" | "hard"
  createdAt: Date
  status: "active" | "inactive"
}

export const LABOR_ITEMS_STORAGE_KEY = "garagepro.laborItems"

export default function LaborManagementTab() {
  const [laborItems, setLaborItems] = useState<LaborItem[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<LaborItem | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(LABOR_ITEMS_STORAGE_KEY) : null
      if (raw) {
        const parsed = JSON.parse(raw) as LaborItem[]
        setLaborItems(parsed.map((item) => ({ ...item, createdAt: new Date(item.createdAt) })))
      } else {
        // Sample data
        setLaborItems([
          {
            id: crypto.randomUUID(),
            name: "Oil Change",
            description: "Standard oil and filter change service",
            estimatedHours: 0.5,
            laborRate: 125,
            category: "engine",
            difficulty: "easy",
            createdAt: new Date(),
            status: "active",
          },
          {
            id: crypto.randomUUID(),
            name: "Brake Pad Replacement",
            description: "Replace front brake pads and inspect rotors",
            estimatedHours: 2.0,
            laborRate: 125,
            category: "brakes",
            difficulty: "medium",
            createdAt: new Date(),
            status: "active",
          },
          {
            id: crypto.randomUUID(),
            name: "Transmission Service",
            description: "Complete transmission fluid change and filter replacement",
            estimatedHours: 3.5,
            laborRate: 155,
            category: "transmission",
            difficulty: "hard",
            createdAt: new Date(),
            status: "active",
          },
        ])
      }
    } catch (e) {
      console.error("Failed to load labor items", e)
    }
  }, [])

  const handleSave = () => {
    try {
      setSaving(true)
      localStorage.setItem(LABOR_ITEMS_STORAGE_KEY, JSON.stringify(laborItems))
    } finally {
      setSaving(false)
    }
  }

  const addLaborItem = (itemData: Omit<LaborItem, "id" | "createdAt">) => {
    const newItem: LaborItem = {
      ...itemData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    }
    setLaborItems((prev) => [...prev, newItem])
    setIsAddDialogOpen(false)
  }

  const updateLaborItem = (id: string, itemData: Omit<LaborItem, "id" | "createdAt">) => {
    setLaborItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...itemData } : item)))
    setEditingItem(null)
  }

  const deleteLaborItem = (id: string) => {
    setLaborItems((prev) => prev.filter((item) => item.id !== id))
  }

  const filteredItems = laborItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "engine":
        return "🔧"
      case "transmission":
        return "⚙️"
      case "brakes":
        return "🛑"
      case "electrical":
        return "⚡"
      case "suspension":
        return "🔩"
      default:
        return "🔧"
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "hard":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const LaborItemForm = ({
    onSubmit,
    onCancel,
    initialData,
  }: {
    onSubmit: (data: Omit<LaborItem, "id" | "createdAt">) => void
    onCancel: () => void
    initialData?: Omit<LaborItem, "id" | "createdAt">
  }) => {
    const [formData, setFormData] = useState<Omit<LaborItem, "id" | "createdAt">>(
      initialData || {
        name: "",
        description: "",
        estimatedHours: 0,
        laborRate: 125,
        category: "other",
        difficulty: "medium",
        status: "active",
      },
    )

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      if (formData.name.trim() && formData.description.trim()) {
        onSubmit(formData)
      }
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Labor Item Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Enter labor item name"
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Describe the labor work in detail"
            rows={3}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="estimatedHours">Estimated Hours</Label>
            <Input
              id="estimatedHours"
              type="number"
              min="0"
              step="0.1"
              value={formData.estimatedHours}
              onChange={(e) => setFormData((prev) => ({ ...prev, estimatedHours: Number(e.target.value) || 0 }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="laborRate">Labor Rate ($)</Label>
            <Input
              id="laborRate"
              type="number"
              min="0"
              step="0.01"
              value={formData.laborRate}
              onChange={(e) => setFormData((prev) => ({ ...prev, laborRate: Number(e.target.value) || 0 }))}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value as any }))}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="engine">Engine</option>
              <option value="transmission">Transmission</option>
              <option value="brakes">Brakes</option>
              <option value="electrical">Electrical</option>
              <option value="suspension">Suspension</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <Label htmlFor="difficulty">Difficulty</Label>
            <select
              id="difficulty"
              value={formData.difficulty}
              onChange={(e) => setFormData((prev) => ({ ...prev, difficulty: e.target.value as any }))}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value as any }))}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" className="bg-[#154c79] hover:bg-[#123a5c]">
            {initialData ? "Update" : "Add"} Labor Item
          </Button>
        </div>
      </form>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold mb-4">Labor Management</h3>
          <p className="text-gray-600 mb-6">
            Manage your labor items, rates, and estimated times. Create standardized labor operations for consistent
            pricing and time estimates.
          </p>

          {/* Search and Filter Controls */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search labor items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">All Categories</option>
              <option value="engine">Engine</option>
              <option value="transmission">Transmission</option>
              <option value="brakes">Brakes</option>
              <option value="electrical">Electrical</option>
              <option value="suspension">Suspension</option>
              <option value="other">Other</option>
            </select>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#154c79] hover:bg-[#123a5c]">+ Add Labor Item</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Labor Item</DialogTitle>
                </DialogHeader>
                <LaborItemForm onSubmit={addLaborItem} onCancel={() => setIsAddDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Labor Items List */}
        <div className="divide-y">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Wrench className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No labor items found. Add your first labor item to get started.</p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div key={item.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg">{getCategoryIcon(item.category)}</span>
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(item.difficulty)}`}
                      >
                        {item.difficulty}
                      </span>
                      {item.status === "inactive" && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{item.estimatedHours} hrs</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        <span>${item.laborRate}/hr</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">Total: ${(item.estimatedHours * item.laborRate).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setEditingItem(item)} className="h-8 w-8 p-0">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteLaborItem(item.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary and Save */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{filteredItems.length}</span> labor items
              {searchTerm && ` matching "${searchTerm}"`}
            </div>
            <Button onClick={handleSave} className="bg-[#154c79] hover:bg-[#123a5c]" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      {editingItem && (
        <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Labor Item</DialogTitle>
            </DialogHeader>
            <LaborItemForm
              initialData={{
                name: editingItem.name,
                description: editingItem.description,
                estimatedHours: editingItem.estimatedHours,
                laborRate: editingItem.laborRate,
                category: editingItem.category,
                difficulty: editingItem.difficulty,
                status: editingItem.status,
              }}
              onSubmit={(data) => updateLaborItem(editingItem.id, data)}
              onCancel={() => setEditingItem(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
