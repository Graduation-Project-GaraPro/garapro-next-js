"use client"

import { useState, useEffect } from "react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { vehicleService } from "@/services/manager/vehicle-service"
import type { VehicleBrand, VehicleModel, VehicleColor } from "@/types/manager/vehicle"
import { Loader2 } from "lucide-react"

interface AddVehicleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customerId: string
  customerName: string
  onVehicleAdded: () => void
}

export function AddVehicleDialog({ 
  open, 
  onOpenChange, 
  customerId,
  customerName, 
  onVehicleAdded 
}: AddVehicleDialogProps) {
  // Dropdown data
  const [brands, setBrands] = useState<VehicleBrand[]>([])
  const [models, setModels] = useState<VehicleModel[]>([])
  const [colors, setColors] = useState<VehicleColor[]>([])
  
  // Loading states
  const [loadingBrands, setLoadingBrands] = useState(false)
  const [loadingModels, setLoadingModels] = useState(false)
  const [loadingColors, setLoadingColors] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Form data
  const [formData, setFormData] = useState({
    brandID: "",
    modelID: "",
    colorID: "",
    licensePlate: "",
    year: new Date().getFullYear(),
    vin: "",
    odometer: null as number | null,
  })

  // Load brands when dialog opens
  useEffect(() => {
    if (open) {
      loadBrands()
    } else {
      // Reset form when dialog closes
      resetForm()
    }
  }, [open])

  // Load models when brand changes
  useEffect(() => {
    if (formData.brandID) {
      loadModels(formData.brandID)
      // Reset model and color when brand changes
      setFormData(prev => ({ ...prev, modelID: "", colorID: "" }))
      setColors([])
    } else {
      setModels([])
      setColors([])
    }
  }, [formData.brandID])

  // Load colors when model changes
  useEffect(() => {
    if (formData.modelID) {
      loadColors(formData.modelID)
      // Reset color when model changes
      setFormData(prev => ({ ...prev, colorID: "" }))
    } else {
      setColors([])
    }
  }, [formData.modelID])

  const loadBrands = async () => {
    setLoadingBrands(true)
    try {
      const data = await vehicleService.getAllBrands()
      setBrands(data)
    } catch (error) {
      console.error("Failed to load brands:", error)
      toast.error("Failed to load vehicle brands")
    } finally {
      setLoadingBrands(false)
    }
  }

  const loadModels = async (brandId: string) => {
    setLoadingModels(true)
    try {
      const data = await vehicleService.getModelsByBrand(brandId)
      setModels(data)
    } catch (error) {
      console.error("Failed to load models:", error)
      toast.error("Failed to load vehicle models")
    } finally {
      setLoadingModels(false)
    }
  }

  const loadColors = async (modelId: string) => {
    setLoadingColors(true)
    try {
      const data = await vehicleService.getColorsByModel(modelId)
      setColors(data)
    } catch (error) {
      console.error("Failed to load colors:", error)
      toast.error("Failed to load vehicle colors")
    } finally {
      setLoadingColors(false)
    }
  }

  const resetForm = () => {
    setFormData({
      brandID: "",
      modelID: "",
      colorID: "",
      licensePlate: "",
      year: new Date().getFullYear(),
      vin: "",
      odometer: null,
    })
    setBrands([])
    setModels([])
    setColors([])
  }

  const validateForm = (): string | null => {
    if (!formData.brandID) {
      return "Please select a brand"
    }
    
    if (!formData.modelID) {
      return "Please select a model"
    }
    
    if (!formData.colorID) {
      return "Please select a color"
    }
    
    if (!formData.licensePlate.trim()) {
      return "License plate is required"
    }
    
    // Validate license plate format (Vietnamese format)
    const licensePlateRegex = /^[0-9]{2}[A-Z]{1,2}-[0-9]{4,5}$/
    if (!licensePlateRegex.test(formData.licensePlate)) {
      return "Invalid license plate format (e.g., 51F-12345)"
    }
    
    if (!formData.year || formData.year < 1900 || formData.year > new Date().getFullYear() + 1) {
      return `Please enter a valid year between 1900 and ${new Date().getFullYear() + 1}`
    }
    
    if (formData.vin && formData.vin.trim()) {
      // Validate VIN format (17 characters, excluding I, O, Q)
      const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/
      if (!vinRegex.test(formData.vin)) {
        return "VIN must be 17 characters and exclude I, O, Q"
      }
    }
    
    if (formData.odometer !== null && formData.odometer < 0) {
      return "Odometer reading cannot be negative"
    }
    
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validationError = validateForm()
    if (validationError) {
      toast.error(validationError)
      return
    }
    
    setIsSubmitting(true)
    
    try {
      await vehicleService.createVehicle({
        brandID: formData.brandID,
        modelID: formData.modelID,
        colorID: formData.colorID,
        userID: customerId,
        licensePlate: formData.licensePlate,
        year: formData.year,
        vin: formData.vin || "",
        odometer: formData.odometer,
      })
      
      toast.success("Vehicle added successfully")
      onVehicleAdded()
      onOpenChange(false)
    } catch (error: any) {
      console.error("Failed to create vehicle:", error)
      toast.error(error.message || "Failed to add vehicle")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    resetForm()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Vehicle</DialogTitle>
          <DialogDescription>
            Add a new vehicle for {customerName}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Brand Selection */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="brand" className="text-right">
                Brand *
              </Label>
              <div className="col-span-3">
                <Select
                  value={formData.brandID}
                  onValueChange={(value) => setFormData({ ...formData, brandID: value })}
                  disabled={loadingBrands || isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingBrands ? "Loading brands..." : "Select brand"} />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((brand) => (
                      <SelectItem key={brand.brandID} value={brand.brandID}>
                        {brand.brandName} ({brand.country})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Model Selection */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="model" className="text-right">
                Model *
              </Label>
              <div className="col-span-3">
                <Select
                  value={formData.modelID}
                  onValueChange={(value) => setFormData({ ...formData, modelID: value })}
                  disabled={!formData.brandID || loadingModels || isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue 
                      placeholder={
                        !formData.brandID 
                          ? "Select brand first" 
                          : loadingModels 
                          ? "Loading models..." 
                          : "Select model"
                      } 
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((model) => (
                      <SelectItem key={model.modelID} value={model.modelID}>
                        {model.modelName} ({model.manufacturingYear})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Color Selection */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="color" className="text-right">
                Color *
              </Label>
              <div className="col-span-3">
                <Select
                  value={formData.colorID}
                  onValueChange={(value) => setFormData({ ...formData, colorID: value })}
                  disabled={!formData.modelID || loadingColors || isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue 
                      placeholder={
                        !formData.modelID 
                          ? "Select model first" 
                          : loadingColors 
                          ? "Loading colors..." 
                          : "Select color"
                      } 
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {colors.map((color) => (
                      <SelectItem key={color.colorID} value={color.colorID}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded border" 
                            style={{ backgroundColor: color.hexCode }}
                          />
                          {color.colorName}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* License Plate */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="licensePlate" className="text-right">
                License Plate *
              </Label>
              <div className="col-span-3">
                <Input
                  id="licensePlate"
                  value={formData.licensePlate}
                  onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value.toUpperCase() })}
                  placeholder="e.g., 51F-12345"
                  required
                  disabled={isSubmitting}
                />
                <p className="text-xs text-gray-500 mt-1">Format: 51F-12345</p>
              </div>
            </div>

            {/* Year */}
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
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* VIN (Optional) */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="vin" className="text-right">
                VIN
              </Label>
              <div className="col-span-3">
                <Input
                  id="vin"
                  value={formData.vin}
                  onChange={(e) => setFormData({ ...formData, vin: e.target.value.toUpperCase() })}
                  placeholder="17 characters (optional)"
                  maxLength={17}
                  disabled={isSubmitting}
                />
                <p className="text-xs text-gray-500 mt-1">Optional: 17 characters, no I, O, Q</p>
              </div>
            </div>

            {/* Odometer (Optional) */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="odometer" className="text-right">
                Odometer (km)
              </Label>
              <div className="col-span-3">
                <Input
                  id="odometer"
                  type="number"
                  min="0"
                  value={formData.odometer || ""}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    odometer: e.target.value ? parseInt(e.target.value) : null 
                  })}
                  placeholder="Current mileage (optional)"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isSubmitting ? "Adding..." : "Add Vehicle"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
