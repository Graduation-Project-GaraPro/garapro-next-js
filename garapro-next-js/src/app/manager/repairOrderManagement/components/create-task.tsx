"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, X } from "lucide-react"
import type { Job } from "@/types/job"
import { labelService } from "@/services/manager/label-service"
import type { Label as LabelType } from "@/types/manager/label"
import { LABOR_RATES_STORAGE_KEY, type LaborRate } from "@/app/manager/garageSetting/ro-settings/tabs/labor-rates-tab"
import { AddCustomerDialog } from "./add-customer-dialog"
import { AddVehicleDialog } from "./add-vehicle-dialog"

// Define types for customer and vehicle
interface Customer {
  id: string
  name: string
  phone: string
  email: string
  address: string
  vehicles: Vehicle[]
}

interface Vehicle {
  id: string
  licensePlate: string
  brand: string
  model: string
  year: number
  color: string
}

interface CreateTaskProps {
  onClose: () => void
  onSubmit: (job: Omit<Job, "id">) => void
}

export default function CreateTask({ onClose, onSubmit }: CreateTaskProps) {
  const [formData, setFormData] = useState({
    company: "",
    contact: "",
    location: "",
    odometer: "",
    odometerNotWorking: false,
    repairOrderType: "walkin",
    vehicleConcern: "",
    progress: 0,
  })

  const [customerSearch, setCustomerSearch] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [labels, setLabels] = useState<LabelType[]>([])
  const [selectedLabelId, setSelectedLabelId] = useState<string>("")
  const [rates, setRates] = useState<LaborRate[]>([])
  const [selectedRateId, setSelectedRateId] = useState<string>("")
  
  // Dialog states
  const [isAddCustomerDialogOpen, setIsAddCustomerDialogOpen] = useState(false)
  const [isAddVehicleDialogOpen, setIsAddVehicleDialogOpen] = useState(false)

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

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(LABOR_RATES_STORAGE_KEY) : null
      if (raw) {
        const parsed = JSON.parse(raw) as LaborRate[]
        setRates(parsed)
        if (parsed[0]) setSelectedRateId(parsed[0].id)
      }
    } catch (e) {
      console.error("Failed to load labor rates", e)
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      title: "Repair Order", // Default title since we removed the input field
      ...formData,
      labelId: selectedLabelId ? Number(selectedLabelId) : undefined,
      laborRateId: selectedRateId || undefined,
      laborRate: rates.find((r) => r.id === selectedRateId)?.rate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "requires-auth"
    })
    handleReset()
  }

  const handleReset = () => {
    setFormData({
      company: "",
      contact: "",
      location: "",
      odometer: "",
      odometerNotWorking: false,
      repairOrderType: "walkin",
      vehicleConcern: "",
      progress: 0,
    })
    setCustomerSearch("")
    setSelectedCustomer(null)
    setSelectedVehicle(null)
    setSelectedLabelId("")
    setSelectedRateId("")
  }

  const handleClose = () => {
    handleReset()
    onClose()
  }

  // Handle adding a new customer
  const handleAddCustomer = (customerData: Omit<Customer, "id" | "vehicles">) => {
    // In a real app, this would call an API to create the customer
    const newCustomer: Customer = {
      id: `cust-${Date.now()}`,
      ...customerData,
      vehicles: []
    }
    setSelectedCustomer(newCustomer)
    setCustomerSearch(customerData.name)
  }

  // Handle adding a new vehicle
  const handleAddVehicle = (vehicleData: Omit<Vehicle, "id">) => {
    if (!selectedCustomer) return
    
    // In a real app, this would call an API to create the vehicle
    const newVehicle: Vehicle = {
      id: `veh-${Date.now()}`,
      ...vehicleData
    }
    
    // Update the selected customer with the new vehicle
    const updatedCustomer = {
      ...selectedCustomer,
      vehicles: [...selectedCustomer.vehicles, newVehicle]
    }
    
    setSelectedCustomer(updatedCustomer)
    setSelectedVehicle(newVehicle)
  }

  // Mock function to simulate searching for customers
  const searchCustomers = (searchTerm: string): Customer[] => {
    // This would be replaced with an actual API call in a real application
    if (!searchTerm) return []
    
    // Mock data for demonstration
    const mockCustomers: Customer[] = [
      {
        id: "1",
        name: "John Smith",
        phone: "555-1234",
        email: "john@example.com",
        address: "123 Main St",
        vehicles: [
          {
            id: "v1",
            licensePlate: "ABC-123",
            brand: "Toyota",
            model: "Camry",
            year: 2020,
            color: "Blue"
          }
        ]
      },
      {
        id: "2",
        name: "Jane Doe",
        phone: "555-5678",
        email: "jane@example.com",
        address: "456 Oak Ave",
        vehicles: [
          {
            id: "v2",
            licensePlate: "XYZ-789",
            brand: "Honda",
            model: "Civic",
            year: 2019,
            color: "Red"
          }
        ]
      }
    ]
    
    return mockCustomers.filter(customer => 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.vehicles.some(vehicle => 
        vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
  }

  // Mock function to get vehicles for a selected customer
  const getVehiclesForCustomer = (customer: Customer): Vehicle[] => {
    return customer.vehicles
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
                  {searchCustomers(customerSearch).map((customer) => (
                    <div 
                      key={customer.id}
                      className="p-3 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        setSelectedCustomer(customer)
                        setCustomerSearch(customer.name)
                        setSelectedVehicle(null) // Reset vehicle selection when customer changes
                      }}
                    >
                      <div className="font-medium">{customer.name}</div>
                      <div className="text-sm text-gray-600">{customer.phone} | {customer.email}</div>
                    </div>
                  ))}
                  {searchCustomers(customerSearch).length === 0 && (
                    <div className="p-3 text-center text-gray-500">
                      No customers found. Add a new customer.
                    </div>
                  )}
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
                    if (selectedCustomer) {
                      const vehicle = getVehiclesForCustomer(selectedCustomer).find(v => v.id === value)
                      setSelectedVehicle(vehicle || null)
                    }
                  }}
                  disabled={!selectedCustomer}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select vehicle..." />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedCustomer && getVehiclesForCustomer(selectedCustomer).length > 0 ? (
                      getVehiclesForCustomer(selectedCustomer).map((vehicle) => (
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
                  disabled={!selectedCustomer}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  ADD NEW VEHICLE
                </Button>
              </div>
            </div>
          </div>

          {/* Repair Order Information */}
          <div className="space-y-4">
            <h3 className="text-base font-medium text-gray-700">Repair order information:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-gray-600">Odometer in</Label>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Enter odometer in"
                    value={formData.odometer}
                    onChange={(e) => setFormData((prev) => ({ ...prev, odometer: e.target.value }))}
                    className="flex-1"
                  />
                  <input
                    type="checkbox"
                    id="odometerNotWorking"
                    checked={formData.odometerNotWorking}
                    onChange={(e) => setFormData((prev) => ({ ...prev, odometerNotWorking: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="odometerNotWorking" className="text-sm">
                    Odometer not working
                  </Label>
                </div>
              </div>
            </div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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