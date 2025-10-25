"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, X, Edit3 } from "lucide-react"
import type { Job } from "@/types/job"
import { labelService } from "@/services/manager/label-service"
import type { Label as LabelType } from "@/types/manager/label"
import { AddCustomerDialog } from "./add-customer-dialog"
import { AddVehicleDialog } from "./add-vehicle-dialog"
import { customerService } from "@/services/manager/customer-service"
import { vehicleService } from "@/services/manager/vehicle-service"
import { toast } from "sonner"

// Define types for customer and vehicle
interface Customer {
  id: string
  name: string
  phone: string
  email: string
  address: string
  vehicles: Vehicle[]
  birthday?: string // Add optional birthday field
}

interface Vehicle {
  id: string
  licensePlate: string
  brand: string
  model: string
  year: number
  color: string
  vin?: string // Add optional VIN property
}

interface CreateTaskProps {
  onClose: () => void
  onSubmit: (job: Omit<Job, "id">) => void
}

export default function CreateTask({ onClose, onSubmit }: CreateTaskProps) {
  const [formData, setFormData] = useState({
    repairOrderType: "walkin",
    vehicleConcern: "",
    estimatedCompletionDate: "",
    estimatedAmount: "",
    estimatedRepairTime: "",
  })

  const [customerSearch, setCustomerSearch] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [labels, setLabels] = useState<LabelType[]>([])
  const [selectedLabelId, setSelectedLabelId] = useState<string>("")
  
  // Dialog states
  const [isAddCustomerDialogOpen, setIsAddCustomerDialogOpen] = useState(false)
  const [isAddVehicleDialogOpen, setIsAddVehicleDialogOpen] = useState(false)
  
  // Loading states
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false)
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(false)
  const [customerResults, setCustomerResults] = useState<Customer[]>([])
  const [vehicleOptions, setVehicleOptions] = useState<Vehicle[]>([])

  useEffect(() => {
    labelService
      .getAllLabels()
      .then((ls) => {
        setLabels(ls)
        const def = ls.find((l) => l.isDefault)
        if (def) setSelectedLabelId(String(def.id))
      })
      .catch((e) => console.error("Failed to load labels", e))
  }, [])

  // Search customers when search term changes
  useEffect(() => {
    if (customerSearch.trim() === "") {
      setCustomerResults([])
      return
    }

    const delayDebounceFn = setTimeout(() => {
      searchCustomersFromApi(customerSearch)
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [customerSearch])

  // Fetch vehicles when customer is selected
  useEffect(() => {
    if (selectedCustomer) {
      fetchVehiclesForCustomer(selectedCustomer.id)
    } else {
      setVehicleOptions([])
      setSelectedVehicle(null)
    }
  }, [selectedCustomer])

  const searchCustomersFromApi = async (searchTerm: string) => {
    setIsLoadingCustomers(true)
    try {
      const apiCustomers = await customerService.searchCustomers(searchTerm)
      const formattedCustomers: Customer[] = apiCustomers.map(apiCustomer => {
        // Ensure we don't show "undefined undefined" in the name
        const customerName = apiCustomer.lastName 
          ? `${apiCustomer.firstName} ${apiCustomer.lastName}` 
          : apiCustomer.firstName;
          
        return {
          id: apiCustomer.userId,
          name: customerName || "Unknown Customer", // Provide fallback name
          phone: apiCustomer.phoneNumber || "", // Ensure phone is never undefined
          email: apiCustomer.email || "", // Ensure email is never undefined
          address: "", // Address not provided in API response
          vehicles: [] // Vehicles would need to be fetched separately
        }
      })
      setCustomerResults(formattedCustomers)
    } catch (error) {
      console.error("Failed to search customers:", error)
      toast.error("Failed to search customers. Please try again.")
      setCustomerResults([])
    } finally {
      setIsLoadingCustomers(false)
    }
  }

  const fetchVehiclesForCustomer = async (customerId: string) => {
    setIsLoadingVehicles(true)
    try {
      const vehicleData = await vehicleService.getVehiclesByCustomerId(customerId)
      const formattedVehicles: Vehicle[] = vehicleData.map(v => ({
        id: v.vehicle.vehicleID,
        licensePlate: v.vehicle.licensePlate,
        brand: v.vehicle.brandName,
        model: v.vehicle.modelName,
        year: v.vehicle.year,
        color: v.vehicle.colorName
      }))
      setVehicleOptions(formattedVehicles)
    } catch (error) {
      console.error("Failed to fetch vehicles:", error)
      toast.error("Failed to load vehicles. Please try again.")
      setVehicleOptions([])
    } finally {
      setIsLoadingVehicles(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    if (!selectedCustomer?.id) {
      toast.error("Please select a customer")
      return
    }
    
    if (!selectedVehicle?.id) {
      toast.error("Please select a vehicle")
      return
    }
    
    // Prepare data to match backend request structure
    const requestData = {
      customerId: selectedCustomer.id,
      vehicleId: selectedVehicle.id,
      receiveDate: new Date().toISOString(),
      roType: formData.repairOrderType === "walkin" ? 0 : formData.repairOrderType === "scheduled" ? 1 : 2, // 0: walkin, 1: scheduled, 2: breakdown
      estimatedCompletionDate: formData.estimatedCompletionDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Default to 7 days from now
      estimatedAmount: parseFloat(formData.estimatedAmount) || 0,
      note: formData.vehicleConcern || "",
      estimatedRepairTime: parseInt(formData.estimatedRepairTime) || 0
    }
    
    // Submit with the correct data structure
    onSubmit({
      title: "Repair Order",
      company: selectedCustomer.name || "",
      contact: selectedCustomer.phone || "",
      location: selectedCustomer.address || "",
      status: "requires-auth" as const,
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...requestData
    })
    handleReset()
  }

  const handleReset = () => {
    setFormData({
      repairOrderType: "walkin",
      vehicleConcern: "",
      estimatedCompletionDate: "",
      estimatedAmount: "",
      estimatedRepairTime: "",
    })
    setCustomerSearch("")
    setSelectedCustomer(null)
    setSelectedVehicle(null)
    setSelectedLabelId("")
    setCustomerResults([])
  }

  const handleClose = () => {
    handleReset()
    onClose()
  }

  // Handle adding a new customer
  const handleAddCustomer = async (customerData: Omit<Customer, "id" | "vehicles">) => {
    try {
      // Convert to API format
      const nameParts = customerData.name.trim().split(' ')
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''
      
      // Validate that we have valid name parts
      if (!firstName || firstName === 'undefined' || firstName.trim() === '') {
        toast.error("Please enter a valid first name")
        return
      }
      
      // Format birthday - handle empty values properly
      const birthdayValue: string | null = null
      // The birthday is not in customerData, so we'll leave it as null
      
      const apiCustomerData = {
        firstName,
        lastName,
        phoneNumber: customerData.phone,
        email: customerData.email,
        birthday: birthdayValue
      }
      
      const newApiCustomer = await customerService.createCustomer(apiCustomerData)
      
      // Convert back to our format with proper name handling
      // Ensure we don't show "undefined undefined" in the name
      const customerName = newApiCustomer.lastName 
        ? `${newApiCustomer.firstName} ${newApiCustomer.lastName}` 
        : newApiCustomer.firstName;
        
      const newCustomer: Customer = {
        id: newApiCustomer.userId,
        name: customerName || "Unknown Customer", // Provide fallback name
        phone: newApiCustomer.phoneNumber || "", // Ensure phone is never undefined
        email: newApiCustomer.email || "", // Ensure email is never undefined
        address: "", // Address not provided in API response
        vehicles: []
      }
      
      // Auto-select the newly created customer
      setSelectedCustomer(newCustomer)
      setCustomerSearch(newCustomer.name) // Set to the actual name, not undefined
      
      // Show success toast with properly formatted name
      toast.success(`Customer "${newCustomer.name}" created and selected successfully`)
    } catch (error) {
      console.error("Failed to create customer:", error)
      toast.error("Failed to create customer. Please try again.")
    }
  }

  // Handle adding a new vehicle
  const handleAddVehicle = async (vehicleData: Omit<Vehicle, "id">) => {
    if (!selectedCustomer) {
      toast.error("Please select a customer first")
      return
    }
    
    try {
      // Convert to API format with proper validation
      // For now, we'll use default GUIDs for required fields
      // In a real implementation, these would come from dropdown selections
      const apiVehicleData = {
        brandID: "00000000-0000-0000-0000-000000000000", // Placeholder - would need actual brand ID
        userID: selectedCustomer.id,
        modelID: "00000000-0000-0000-0000-000000000000", // Placeholder - would need actual model ID
        colorID: "00000000-0000-0000-0000-000000000000", // Placeholder - would need actual color ID
        licensePlate: vehicleData.licensePlate,
        vin: vehicleData.vin || "00000000000000000", // Default VIN if not provided
        year: vehicleData.year,
        odometer: null // Odometer not in current form
      }
      
      // Validate required fields before sending
      if (!apiVehicleData.licensePlate) {
        toast.error("License plate is required")
        return
      }
      
      if (!apiVehicleData.vin) {
        toast.error("VIN is required")
        return
      }
      
      // Validate VIN format (17 characters, excluding I, O, Q)
      const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/
      if (!vinRegex.test(apiVehicleData.vin)) {
        toast.error("VIN must be 17 characters and exclude I, O, Q")
        return
      }
      
      // Validate license plate format
      const licensePlateRegex = /^[0-9]{2}[A-Z]{1,2}-[0-9]{4,5}$/
      if (!licensePlateRegex.test(apiVehicleData.licensePlate)) {
        toast.error("Invalid license plate format (e.g., 51F-12345)")
        return
      }
      
      const newApiVehicle = await vehicleService.createVehicle(apiVehicleData)
      
      // Convert back to our format
      const newVehicle: Vehicle = {
        id: newApiVehicle.vehicleID,
        licensePlate: newApiVehicle.licensePlate,
        brand: newApiVehicle.brandName,
        model: newApiVehicle.modelName,
        year: newApiVehicle.year,
        color: newApiVehicle.colorName,
        vin: newApiVehicle.vin
      }
      
      // Add to vehicle options and select it
      setVehicleOptions(prev => [...prev, newVehicle])
      setSelectedVehicle(newVehicle)
      
      // Show success toast
      toast.success(`Vehicle "${newVehicle.licensePlate}" added successfully`)
    } catch (error) {
      console.error("Failed to create vehicle:", error)
      toast.error("Failed to create vehicle. Please check the form data and try again.")
    }
  }

  // Handle changing customer selection
  const handleChangeCustomer = () => {
    setSelectedCustomer(null)
    setSelectedVehicle(null)
    setCustomerSearch("")
  }

  // Handle changing vehicle selection
  const handleChangeVehicle = () => {
    setSelectedVehicle(null)
  }

  return (
    <div className="w-full bg-gray-100">
      {/* Header */}
      <div className="bg-[#154c79] text-white px-6 py-4">
        <h1 className="text-xl font-medium">Create new repair order</h1>
      </div>
      <div className="w-full max-w-7xl mt-4 bg-white shadow p-6 mx-auto">      
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Selection */}
          <div className="space-y-2">
            <h3 className="text-base font-medium text-gray-700">Select customer:</h3>
            <div>
              <Label htmlFor="customer" className="text-sm text-gray-600">
                Customer
              </Label>
              <div className="flex gap-2 mt-1">
                <div className="relative flex-1">
                  <Input
                    id="customer"
                    placeholder="Search by name, phone, plate #, VIN or email"
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="pr-10"
                  />
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="whitespace-nowrap bg-transparent"
                  onClick={() => setIsAddCustomerDialogOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  ADD NEW CUSTOMER
                </Button>
              </div>
              
              {/* Customer search results */}
              {customerSearch && (
                <div className="mt-2 border rounded-md max-h-60 overflow-y-auto hide-scrollbar">
                  {isLoadingCustomers ? (
                    <div className="p-3 text-center text-gray-500">
                      Searching...
                    </div>
                  ) : customerResults.length > 0 ? (
                    customerResults.map((customer) => (
                      <div 
                        key={customer.id}
                        className="p-3 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
                        onClick={() => {
                          setSelectedCustomer(customer)
                          // Ensure we don't set undefined value
                          setCustomerSearch(customer.name || "")
                          setSelectedVehicle(null) // Reset vehicle selection when customer changes
                        }}
                      >
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-sm text-gray-600">{customer.phone} | {customer.email}</div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-center text-gray-500">
                      No customers found. Add a new customer.
                    </div>
                  )}
                </div>
              )}
              
              {/* Selected customer display */}
              {selectedCustomer && (
                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md flex justify-between items-center">
                  <div>
                    <div className="font-medium text-green-800">{selectedCustomer.name}</div>
                    <div className="text-sm text-green-600">{selectedCustomer.phone} | {selectedCustomer.email}</div>
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={handleChangeCustomer}
                    className="border-green-300 text-green-700 hover:bg-green-100"
                  >
                    <Edit3 className="w-4 h-4 mr-1" />
                    Change
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Vehicle Selection */}
          <div className="space-y-2">
            <h3 className="text-base font-medium text-gray-700">Select vehicle:</h3>
            <div>
              <Label htmlFor="vehicle" className="text-sm text-gray-600">
                Vehicle
              </Label>
              <div className="flex gap-2 mt-1">
                <Select 
                  value={selectedVehicle?.id || ""} 
                  onValueChange={(value) => {
                    const vehicle = vehicleOptions.find(v => v.id === value)
                    setSelectedVehicle(vehicle || null)
                  }}
                  disabled={!selectedCustomer || isLoadingVehicles}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder={isLoadingVehicles ? "Loading vehicles..." : "Select vehicle..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedCustomer && vehicleOptions.length > 0 ? (
                      vehicleOptions.map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.licensePlate} - {vehicle.brand} {vehicle.model} ({vehicle.year})
                        </SelectItem>
                      ))
                    ) : selectedCustomer ? (
                      <SelectItem value="__no-vehicles__" disabled>
                        No vehicles found. Add a new vehicle.
                      </SelectItem>
                    ) : (
                      <SelectItem value="__select-customer-first__" disabled>
                        Select a customer first
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="whitespace-nowrap bg-transparent"
                  onClick={() => selectedCustomer && setIsAddVehicleDialogOpen(true)}
                  disabled={!selectedCustomer || isLoadingVehicles}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  ADD NEW VEHICLE
                </Button>
              </div>
              
              {/* Selected vehicle display */}
              {selectedVehicle && (
                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md flex justify-between items-center">
                  <div>
                    <div className="font-medium text-green-800">
                      {selectedVehicle.licensePlate} - {selectedVehicle.brand} {selectedVehicle.model} ({selectedVehicle.year})
                    </div>
                    <div className="text-sm text-green-600">Color: {selectedVehicle.color}</div>
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={handleChangeVehicle}
                    className="border-green-300 text-green-700 hover:bg-green-100"
                  >
                    <Edit3 className="w-4 h-4 mr-1" />
                    Change
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Repair Order Information */}
          <div className="space-y-4">
            <h3 className="text-base font-medium text-gray-700">Repair order information:</h3>
            
            {/* Estimated Repair Time */}
            <div>
              <Label className="text-sm text-gray-600">Estimated Repair Time (hours)</Label>
              <Input
                type="number"
                placeholder="Enter estimated repair time"
                value={formData.estimatedRepairTime}
                onChange={(e) => setFormData((prev) => ({ ...prev, estimatedRepairTime: e.target.value }))}
              />
            </div>
            
            {/* Estimated Completion Date and Amount */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-gray-600">Estimated Completion Date</Label>
                <Input
                  type="date"
                  value={formData.estimatedCompletionDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, estimatedCompletionDate: e.target.value }))}
                />
              </div>
              <div>
                <Label className="text-sm text-gray-600">Estimated Amount ($)</Label>
                <Input
                  type="number"
                  placeholder="Enter estimated amount"
                  value={formData.estimatedAmount}
                  onChange={(e) => setFormData((prev) => ({ ...prev, estimatedAmount: e.target.value }))}
                />
              </div>
            </div>
            
            {/* Label and Repair Order Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-gray-600">RO Label</Label>
                <Select value={selectedLabelId} onValueChange={setSelectedLabelId}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select label (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {labels.map((l) => (
                      <SelectItem key={l.id} value={String(l.id)}>
                        {l.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm text-gray-600">Repair Order Type</Label>
                <Select
                  value={formData.repairOrderType}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, repairOrderType: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="walkin">Walk-in</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="breakdown">Breakdown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Vehicle Concern/Note */}
            <div className="space-y-1">
              <Label className="text-sm text-gray-600">Purpose of visit:</Label>
              <Label className="text-sm text-gray-500">Customer states:</Label>
              <Textarea
                placeholder="Enter vehicle concern"
                value={formData.vehicleConcern}
                onChange={(e) => setFormData((prev) => ({ ...prev, vehicleConcern: e.target.value }))}
                rows={2}
                className="mt-1"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-[#154c79] hover:bg-[#123c66]"
              disabled={!selectedCustomer || !selectedVehicle}
            >
              Create Repair Order
            </Button>
          </div>
        </form>
      </div>
      
      {/* Add Customer Dialog */}
      <AddCustomerDialog
        open={isAddCustomerDialogOpen}
        onOpenChange={setIsAddCustomerDialogOpen}
        onCustomerAdd={handleAddCustomer}
      />
      
      {/* Add Vehicle Dialog */}
      {selectedCustomer && (
        <AddVehicleDialog
          open={isAddVehicleDialogOpen}
          onOpenChange={setIsAddVehicleDialogOpen}
          customerName={selectedCustomer.name}
          onVehicleAdd={handleAddVehicle}
        />
      )}
      
      <style jsx>{`
        .hide-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}