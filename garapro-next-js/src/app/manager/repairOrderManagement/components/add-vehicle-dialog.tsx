"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Vehicle {
  id: string
  licensePlate: string
  brand: string
  model: string
  year: number
  color: string
}

interface AddVehicleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customerName: string
  onVehicleAdd: (vehicle: Omit<Vehicle, "id">) => void
}

export function AddVehicleDialog({ open, onOpenChange, customerName, onVehicleAdd }: AddVehicleDialogProps) {
  const [formData, setFormData] = useState({
    licensePlate: "",
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    color: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onVehicleAdd(formData)
    setFormData({
      licensePlate: "",
      brand: "",
      model: "",
      year: new Date().getFullYear(),
      color: "",
    })
    onOpenChange(false)
  }

  const handleCancel = () => {
    setFormData({
      licensePlate: "",
      brand: "",
      model: "",
      year: new Date().getFullYear(),
      color: "",
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Vehicle</DialogTitle>
          <DialogDescription>
            Add a new vehicle for customer: {customerName}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="licensePlate" className="text-right">
                License Plate *
              </Label>
              <div className="col-span-3">
                <Input
                  id="licensePlate"
                  value={formData.licensePlate}
                  onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                  placeholder="License plate number"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="brand" className="text-right">
                Brand *
              </Label>
              <div className="col-span-3">
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  placeholder="Vehicle brand"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="model" className="text-right">
                Model *
              </Label>
              <div className="col-span-3">
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  placeholder="Vehicle model"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="year" className="text-right">
                Year *
              </Label>
              <div className="col-span-3">
                <Input
                  id="year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || new Date().getFullYear() })}
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="color" className="text-right">
                Color
              </Label>
              <div className="col-span-3">
                <Input
                  id="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="Vehicle color"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit">Add Vehicle</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}