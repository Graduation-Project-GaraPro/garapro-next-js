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
import { toast } from "sonner"

interface Vehicle {
  id: string
  licensePlate: string
  brand: string
  model: string
  year: number
  color: string
  vin?: string
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
    vin: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const validateForm = (): string | null => {
    if (!formData.licensePlate.trim()) {
      return "License plate is required"
    }
    
    // Validate license plate format
    const licensePlateRegex = /^[0-9]{2}[A-Z]{1,2}-[0-9]{4,5}$/
    if (!licensePlateRegex.test(formData.licensePlate)) {
      return "Invalid license plate format (e.g., 51F-12345)"
    }
    
    if (!formData.brand.trim()) {
      return "Brand is required"
    }
    
    if (!formData.model.trim()) {
      return "Model is required"
    }
    
    if (!formData.year || formData.year < 1900 || formData.year > new Date().getFullYear() + 1) {
      return `Please enter a valid year between 1900 and ${new Date().getFullYear() + 1}`
    }
    
    if (!formData.vin.trim()) {
      return "VIN is required"
    }
    
    // Validate VIN format (17 characters, excluding I, O, Q)
    const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/
    if (!vinRegex.test(formData.vin)) {
      return "VIN must be 17 characters and exclude I, O, Q"
    }
    
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    const validationError = validateForm()
    if (validationError) {
      toast.error(validationError)
      setIsLoading(false)
      return
    }
    
    const vehicle: Omit<Vehicle, "id"> = {
      licensePlate: formData.licensePlate,
      brand: formData.brand,
      model: formData.model,
      year: formData.year,
      color: formData.color,
      vin: formData.vin
    }
    
    onVehicleAdd(vehicle)
    setFormData({
      licensePlate: "",
      brand: "",
      model: "",
      year: new Date().getFullYear(),
      color: "",
      vin: "",
    })
    onOpenChange(false)
    setIsLoading(false)
  }

  const handleCancel = () => {
    setFormData({
      licensePlate: "",
      brand: "",
      model: "",
      year: new Date().getFullYear(),
      color: "",
      vin: "",
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Vehicle</DialogTitle>
          <DialogDescription>
            Add a new vehicle for {customerName}. All fields are required.
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
                  placeholder="Enter license plate"
                  required
                  disabled={isLoading}
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
                  placeholder="Enter brand"
                  required
                  disabled={isLoading}
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
                  placeholder="Enter model"
                  required
                  disabled={isLoading}
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
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || new Date().getFullYear() })}
                  placeholder="Enter year"
                  required
                  disabled={isLoading}
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
                  placeholder="Enter color"
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="vin" className="text-right">
                VIN
              </Label>
              <div className="col-span-3">
                <Input
                  id="vin"
                  value={formData.vin}
                  onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                  placeholder="Enter VIN"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Vehicle"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}