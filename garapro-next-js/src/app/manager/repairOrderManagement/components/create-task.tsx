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
import { AddCustomerDialog } from "./add-customer-dialog"
import { AddVehicleDialog } from "./add-vehicle-dialog"
import { customerService } from "@/services/manager/customer-service"
import { vehicleService } from "@/services/manager/vehicle-service"
import { toast } from "sonner"
import { ServiceSelectionDialog } from "@/components/manager/service-selection-dialog"

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

// Define type for additional repair order properties
interface RepairOrderProperties {
  customerId: string
  vehicleId: string
  receiveDate: string
  roType: number
  estimatedCompletionDate: string
  note: string
  selectedServiceIds: string[]
}

export default function CreateTask({ onClose, onSubmit }: CreateTaskProps) {
  const [formData, setFormData] = useState({
    repairOrderType: "walkin",
    vehicleConcern: "",
    estimatedCompletionDate: "",
  })

  const [customerSearch, setCustomerSearch] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  
  // Service selection state
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([])
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false)
  
  // Dialog states
  const [isAddCustomerDialogOpen, setIsAddCustomerDialogOpen] = useState(false)
  const [isAddVehicleDialogOpen, setIsAddVehicleDialogOpen] = useState(false)
  
  // Loading states
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false)
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(false)
  const [customerResults, setCustomerResults] = useState<Customer[]>([])
  const [vehicleOptions, setVehicleOptions] = useState<Vehicle[]>([])



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
    const requestData: RepairOrderProperties = {
      customerId: selectedCustomer.id,
      vehicleId: selectedVehicle.id,
      receiveDate: new Date().toISOString(),
      roType: formData.repairOrderType === "walkin" ? 0 : formData.repairOrderType === "scheduled" ? 1 : 2, // 0: walkin, 1: scheduled, 2: breakdown
      estimatedCompletionDate: formData.estimatedCompletionDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Default to 7 days from now
      note: formData.vehicleConcern || "",
      selectedServiceIds: selectedServiceIds
    }
    
    // Submit with the correct data structure
    onSubmit({
      // Job properties
      jobId: "",
      serviceId: "",
      repairOrderId: "",
      jobName: "Repair Order",
      status: 0, // 0 = pending
      deadline: null,
      // note is included in requestData
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      level: 0,
      assignedByManagerId: null,
      assignedAt: null,
      parts: [],
      // Additional properties for repair order creation
      ...requestData
    } as Omit<Job, "id"> & RepairOrderProperties)

    handleReset()
  }

  const handleReset = () => {
    setFormData({
      repairOrderType: "walkin",
      vehicleConcern: "",
      estimatedCompletionDate: "",
    })
    setCustomerSearch("")
    setSelectedCustomer(null)
    setSelectedVehicle(null)
    setCustomerResults([])
    setSelectedServiceIds([])
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
        email: customerData.email
      }
      
      const newApiCustomer = await customerService.quickCreateCustomer(apiCustomerData)
      
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
    } catch (error: unknown) {
      // Extract detailed error message from API response
      let errorMessage = "Failed to create customer. Please try again."
      
      if (error && typeof error === 'object') {
        // Check for details.details (nested error message from API)
        if ('details' in error && error.details && typeof error.details === 'object' && 'details' in error.details) {
          errorMessage = (error.details as any).details
        }
        // Check for message property
        else if ('message' in error && typeof error.message === 'string') {
          errorMessage = error.message
        }
      } else if (error instanceof Error) {
        errorMessage = error.message
      }
      
      toast.error(errorMessage)
    }
  }

  // Handle adding a new vehicle - called after successful vehicle creation
  const handleAddVehicle = async () => {
    if (!selectedCustomer) {
      return
    }
    
    try {
      console.log('Refreshing vehicle list after adding new vehicle...');
      // Refresh the vehicle list for the selected customer
      const vehicleData = await vehicleService.getVehiclesByCustomerId(selectedCustomer.id)
      const formattedVehicles: Vehicle[] = vehicleData.map(v => ({
        id: v.vehicle.vehicleID,
        licensePlate: v.vehicle.licensePlate,
        brand: v.vehicle.brandName,
        model: v.vehicle.modelName,
        year: v.vehicle.year,
        color: v.vehicle.colorName
      }))
      
      console.log('Updated vehicle list:', formattedVehicles);
      setVehicleOptions(formattedVehicles)
      
      // Auto-select the newly added vehicle (last one in the list)
      if (formattedVehicles.length > 0) {
        const newVehicle = formattedVehicles[formattedVehicles.length - 1]
        console.log('Auto-selecting new vehicle:', newVehicle);
        setSelectedVehicle(newVehicle)
      }
    } catch (error) {
      console.error("Failed to refresh vehicles:", error)
      // Don't show error toast here since the vehicle was already created successfully
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
                  ADD NEW CUSTOMER
                </Button>
              </div>
              
              {/* Customer search results */}
              {customerSearch && !selectedCustomer && (
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
                          console.log('=== CUSTOMER SELECTED ===');
                          console.log('Customer Data:', customer);
                          console.log('Customer ID (userId):', customer.id);
                          console.log('Customer Name:', customer.name);
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
                        <SelectItem key={`vehicle-${vehicle.id}`} value={vehicle.id}>
                          {vehicle.licensePlate} - {vehicle.brand} {vehicle.model} ({vehicle.year})
                        </SelectItem>
                      ))
                    ) : selectedCustomer ? (
                      <SelectItem key="no-vehicles" value="__no-vehicles__" disabled>
                        No vehicles found. Add a new vehicle.
                      </SelectItem>
                    ) : (
                      <SelectItem key="select-customer-first" value="__select-customer-first__" disabled>
                        Select a customer first
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="whitespace-nowrap bg-transparent"
                  onClick={() => {
                    if (selectedCustomer) {
                      console.log('=== OPENING ADD VEHICLE DIALOG ===');
                      console.log('Selected Customer ID:', selectedCustomer.id);
                      console.log('Selected Customer Name:', selectedCustomer.name);
                      setIsAddVehicleDialogOpen(true)
                    }
                  }}
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

          {/* Service Selection */}
          <div className="space-y-2">
            <h3 className="text-base font-medium text-gray-700">Select services (Optional):</h3>
            <p className="text-sm text-gray-500">Services can be added later if the customer is unsure</p>
            <div>
              <div className="mt-1">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full justify-between py-6"
                  onClick={() => setIsServiceDialogOpen(true)}
                >
                  <div className="flex flex-col items-start">
                    <span className="font-medium">
                      {selectedServiceIds.length > 0 
                        ? `${selectedServiceIds.length} service(s) selected` 
                        : "Select services (optional)..."}
                    </span>
                    {selectedServiceIds.length > 0 && (
                      <span className="text-sm text-gray-500">
                        Click to modify selection
                      </span>
                    )}
                  </div>
                  <Plus className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Repair Order Information */}
          <div className="space-y-4">
            <h3 className="text-base font-medium text-gray-700">Repair order information:</h3>
            
            {/* Estimated Completion Date */}
            <div>
              <Label className="text-sm text-gray-600">Estimated Completion Date</Label>
              <Input
                type="date"
                value={formData.estimatedCompletionDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, estimatedCompletionDate: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            {/* Repair Order Type */}
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
                  <SelectItem key="ro-type-walkin" value="walkin">Walk-in</SelectItem>
                  <SelectItem key="ro-type-scheduled" value="scheduled">Scheduled</SelectItem>
                  <SelectItem key="ro-type-breakdown" value="breakdown">Breakdown</SelectItem>
                </SelectContent>
              </Select>
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
          customerId={selectedCustomer.id}
          customerName={selectedCustomer.name}
          onVehicleAdded={handleAddVehicle}
        />
      )}
      
      {/* Service Selection Dialog */}
      <ServiceSelectionDialog
        open={isServiceDialogOpen}
        onOpenChange={setIsServiceDialogOpen}
        selectedServiceIds={selectedServiceIds}
        onSelectionChange={setSelectedServiceIds}
        title="Select Services for Repair Order"
      />
      
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