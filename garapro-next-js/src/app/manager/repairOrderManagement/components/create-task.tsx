"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, X } from "lucide-react"
import type { Job } from "@/types/job"

interface CreateTaskProps {
  onClose: () => void
  onSubmit: (job: Omit<Job, "id">) => void
}

export default function CreateTask({ onClose, onSubmit }: CreateTaskProps) {
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    contact: "",
    location: "",
    odometer: "",
    odometerNotWorking: false,
    appointmentOption: "drop-off",
    laborRate: "standard-150",
    vehicleConcern: "",
    progress: 0,
  })

  const [customerSearch, setCustomerSearch] = useState("")
  const [selectedVehicle, setSelectedVehicle] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "requires-auth"
    })
    handleReset()
  }

  const handleReset = () => {
    setFormData({
      title: "",
      company: "",
      contact: "",
      location: "",
      odometer: "",
      odometerNotWorking: false,
      appointmentOption: "drop-off",
      laborRate: "standard-150",
      vehicleConcern: "",
      progress: 0,
    })
    setCustomerSearch("")
    setSelectedVehicle("")
  }

  const handleClose = () => {
    handleReset()
    onClose()
  }

  return (
    <div className="w-full bg-gray-100 min-h-screen">
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
                <Button type="button" variant="outline" className="whitespace-nowrap bg-transparent">
                  <Plus className="w-4 h-4 mr-2" />
                  ADD NEW CUSTOMER
                </Button>
              </div>
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
                <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select vehicle..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vehicle1">2023 Honda Civic</SelectItem>
                    <SelectItem value="vehicle2">2022 Toyota Camry</SelectItem>
                    <SelectItem value="vehicle3">2021 Ford F-150</SelectItem>
                  </SelectContent>
                </Select>
                <Button type="button" variant="outline" className="whitespace-nowrap bg-transparent">
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
                <Label htmlFor="title">Service Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Oil Change, Brake Repair"
                  required
                />
              </div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-gray-600">Appointment option</Label>
                <Select
                  value={formData.appointmentOption}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, appointmentOption: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="drop-off">Drop-off Vehicle</SelectItem>
                    <SelectItem value="wait">Wait for Service</SelectItem>
                    <SelectItem value="appointment">Scheduled Appointment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm text-gray-600">Labor Rate</Label>
                <Select
                  value={formData.laborRate}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, laborRate: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard-150">Standard Repair - $150.00</SelectItem>
                    <SelectItem value="premium-200">Premium Repair - $200.00</SelectItem>
                    <SelectItem value="diagnostic-120">Diagnostic - $120.00</SelectItem>
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
            <Button type="submit" className="bg-[#154c79] hover:bg-[#123c66]">
              Create Repair Order
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
