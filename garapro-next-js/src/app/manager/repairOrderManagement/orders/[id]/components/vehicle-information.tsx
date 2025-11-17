"use client"

import { useState } from "react"
import { Save, Edit, Car, Calendar, Gauge, FileText, User, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface VehicleInformationProps {
  orderId: string
}

interface VehicleInfo {
  make: string
  model: string
  year: number
  vin: string
  licensePlate: string
  color: string
  mileage: number
  engineType: string
  transmission: string
  lastServiceDate: string
  nextServiceDue: string
  warrantyStatus: string
  insuranceProvider: string
  policyNumber: string
}

interface CustomerInfo {
  name: string
  phone: string
  email: string
  address: string
  emergencyContact: string
  emergencyPhone: string
}

export default function VehicleInformation({ orderId }: VehicleInformationProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [vehicleInfo, setVehicleInfo] = useState<VehicleInfo>({
    make: "Honda",
    model: "CR-V EX",
    year: 2017,
    vin: "2HKRM4H59HH123456",
    licensePlate: "ABC-1234",
    color: "Silver",
    mileage: 87500,
    engineType: "2.4L 4-Cylinder",
    transmission: "CVT Automatic",
    lastServiceDate: "2024-08-15",
    nextServiceDue: "2024-11-15",
    warrantyStatus: "Expired",
    insuranceProvider: "State Farm",
    policyNumber: "SF-987654321"
  })

  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: "Justine Anderson",
    phone: "(555) 123-4567",
    email: "justine.anderson@email.com",
    address: "123 Main St, Anytown, ST 12345",
    emergencyContact: "John Anderson",
    emergencyPhone: "(555) 987-6543"
  })

  const handleSave = () => {
    // In a real app, this would save to API
    console.log("Saving vehicle information...", { vehicleInfo, customerInfo })
    setIsEditing(false)
  }

  const handleCancel = () => {
    // Reset to original values if needed
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      {/* Header with Action Buttons */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Vehicle Information - RO #{orderId}</h2>
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                className="text-white"
                style={{ backgroundColor: "#154c79" }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#123a5c"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#154c79"}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </>
          ) : (
            <Button 
              onClick={() => setIsEditing(true)}
              variant="outline"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Information
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vehicle Details Card */}
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <Car className="w-5 h-5 mr-2 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Vehicle Details</h3>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="make">Make</Label>
                {isEditing ? (
                  <Input
                    id="make"
                    value={vehicleInfo.make}
                    onChange={(e) => setVehicleInfo(prev => ({ ...prev, make: e.target.value }))}
                  />
                ) : (
                  <div className="p-2 border rounded-md bg-gray-50">{vehicleInfo.make}</div>
                )}
              </div>
              <div>
                <Label htmlFor="model">Model</Label>
                {isEditing ? (
                  <Input
                    id="model"
                    value={vehicleInfo.model}
                    onChange={(e) => setVehicleInfo(prev => ({ ...prev, model: e.target.value }))}
                  />
                ) : (
                  <div className="p-2 border rounded-md bg-gray-50">{vehicleInfo.model}</div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="year">Year</Label>
                {isEditing ? (
                  <Input
                    id="year"
                    type="number"
                    value={vehicleInfo.year}
                    onChange={(e) => setVehicleInfo(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                  />
                ) : (
                  <div className="p-2 border rounded-md bg-gray-50">{vehicleInfo.year}</div>
                )}
              </div>
              <div>
                <Label htmlFor="color">Color</Label>
                {isEditing ? (
                  <Input
                    id="color"
                    value={vehicleInfo.color}
                    onChange={(e) => setVehicleInfo(prev => ({ ...prev, color: e.target.value }))}
                  />
                ) : (
                  <div className="p-2 border rounded-md bg-gray-50">{vehicleInfo.color}</div>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="vin">VIN</Label>
              {isEditing ? (
                <Input
                  id="vin"
                  value={vehicleInfo.vin}
                  onChange={(e) => setVehicleInfo(prev => ({ ...prev, vin: e.target.value }))}
                />
              ) : (
                <div className="p-2 border rounded-md bg-gray-50 font-mono">{vehicleInfo.vin}</div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="licensePlate">License Plate</Label>
                {isEditing ? (
                  <Input
                    id="licensePlate"
                    value={vehicleInfo.licensePlate}
                    onChange={(e) => setVehicleInfo(prev => ({ ...prev, licensePlate: e.target.value }))}
                  />
                ) : (
                  <div className="p-2 border rounded-md bg-gray-50">{vehicleInfo.licensePlate}</div>
                )}
              </div>
              <div>
                <Label htmlFor="mileage">Current Mileage</Label>
                {isEditing ? (
                  <Input
                    id="mileage"
                    type="number"
                    value={vehicleInfo.mileage}
                    onChange={(e) => setVehicleInfo(prev => ({ ...prev, mileage: parseInt(e.target.value) }))}
                  />
                ) : (
                  <div className="p-2 border rounded-md bg-gray-50 flex items-center">
                    <Gauge className="w-4 h-4 mr-2 text-gray-500" />
                    {vehicleInfo.mileage.toLocaleString()} miles
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="engineType">Engine</Label>
                {isEditing ? (
                  <Input
                    id="engineType"
                    value={vehicleInfo.engineType}
                    onChange={(e) => setVehicleInfo(prev => ({ ...prev, engineType: e.target.value }))}
                  />
                ) : (
                  <div className="p-2 border rounded-md bg-gray-50">{vehicleInfo.engineType}</div>
                )}
              </div>
              <div>
                <Label htmlFor="transmission">Transmission</Label>
                {isEditing ? (
                  <Input
                    id="transmission"
                    value={vehicleInfo.transmission}
                    onChange={(e) => setVehicleInfo(prev => ({ ...prev, transmission: e.target.value }))}
                  />
                ) : (
                  <div className="p-2 border rounded-md bg-gray-50">{vehicleInfo.transmission}</div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Customer Information Card */}
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <User className="w-5 h-5 mr-2 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Customer Information</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="customerName">Customer Name</Label>
              {isEditing ? (
                <Input
                  id="customerName"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                />
              ) : (
                <div className="p-2 border rounded-md bg-gray-50">{customerInfo.name}</div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone</Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                  />
                ) : (
                  <div className="p-2 border rounded-md bg-gray-50">{customerInfo.phone}</div>
                )}
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                  />
                ) : (
                  <div className="p-2 border rounded-md bg-gray-50">{customerInfo.email}</div>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              {isEditing ? (
                <Textarea
                  id="address"
                  value={customerInfo.address}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
                  rows={2}
                />
              ) : (
                <div className="p-2 border rounded-md bg-gray-50 flex items-start">
                  <MapPin className="w-4 h-4 mr-2 text-gray-500 mt-0.5" />
                  {customerInfo.address}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="emergencyContact">Emergency Contact</Label>
                {isEditing ? (
                  <Input
                    id="emergencyContact"
                    value={customerInfo.emergencyContact}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, emergencyContact: e.target.value }))}
                  />
                ) : (
                  <div className="p-2 border rounded-md bg-gray-50">{customerInfo.emergencyContact}</div>
                )}
              </div>
              <div>
                <Label htmlFor="emergencyPhone">Emergency Phone</Label>
                {isEditing ? (
                  <Input
                    id="emergencyPhone"
                    value={customerInfo.emergencyPhone}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, emergencyPhone: e.target.value }))}
                  />
                ) : (
                  <div className="p-2 border rounded-md bg-gray-50">{customerInfo.emergencyPhone}</div>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Service History and Insurance Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Service History Card */}
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <Calendar className="w-5 h-5 mr-2 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Service History</h3>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lastService">Last Service Date</Label>
                {isEditing ? (
                  <Input
                    id="lastService"
                    type="date"
                    value={vehicleInfo.lastServiceDate}
                    onChange={(e) => setVehicleInfo(prev => ({ ...prev, lastServiceDate: e.target.value }))}
                  />
                ) : (
                  <div className="p-2 border rounded-md bg-gray-50">
                    {new Date(vehicleInfo.lastServiceDate).toLocaleDateString()}
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="nextService">Next Service Due</Label>
                {isEditing ? (
                  <Input
                    id="nextService"
                    type="date"
                    value={vehicleInfo.nextServiceDue}
                    onChange={(e) => setVehicleInfo(prev => ({ ...prev, nextServiceDue: e.target.value }))}
                  />
                ) : (
                  <div className="p-2 border rounded-md bg-gray-50">
                    {new Date(vehicleInfo.nextServiceDue).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="warranty">Warranty Status</Label>
              {isEditing ? (
                <select
                  id="warranty"
                  value={vehicleInfo.warrantyStatus}
                  onChange={(e) => setVehicleInfo(prev => ({ ...prev, warrantyStatus: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="Active">Active</option>
                  <option value="Expired">Expired</option>
                  <option value="Extended">Extended</option>
                </select>
              ) : (
                <div className="p-2 border rounded-md bg-gray-50">
                  <Badge 
                    variant={vehicleInfo.warrantyStatus === "Active" ? "default" : "secondary"}
                    className={vehicleInfo.warrantyStatus === "Active" ? "bg-green-500" : ""}
                  >
                    {vehicleInfo.warrantyStatus}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Insurance Information Card */}
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <FileText className="w-5 h-5 mr-2 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900">Insurance Information</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="insuranceProvider">Insurance Provider</Label>
              {isEditing ? (
                <Input
                  id="insuranceProvider"
                  value={vehicleInfo.insuranceProvider}
                  onChange={(e) => setVehicleInfo(prev => ({ ...prev, insuranceProvider: e.target.value }))}
                />
              ) : (
                <div className="p-2 border rounded-md bg-gray-50">{vehicleInfo.insuranceProvider}</div>
              )}
            </div>

            <div>
              <Label htmlFor="policyNumber">Policy Number</Label>
              {isEditing ? (
                <Input
                  id="policyNumber"
                  value={vehicleInfo.policyNumber}
                  onChange={(e) => setVehicleInfo(prev => ({ ...prev, policyNumber: e.target.value }))}
                />
              ) : (
                <div className="p-2 border rounded-md bg-gray-50 font-mono">{vehicleInfo.policyNumber}</div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" className="flex items-center">
            <FileText className="w-4 h-4 mr-2" />
            Print Vehicle Summary
          </Button>
          <Button variant="outline" className="flex items-center">
            <Car className="w-4 h-4 mr-2" />
            View Service History
          </Button>
          <Button variant="outline" className="flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Next Service
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center"
            style={{ borderColor: "#154c79", color: "#154c79" }}
          >
            <User className="w-4 h-4 mr-2" />
            Contact Customer
          </Button>
        </div>
      </Card>
    </div>
  )
}