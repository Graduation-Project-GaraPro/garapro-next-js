'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, Plus, Edit, Trash2, Users, Building2, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { branchService, GarageBranch, BranchService, BranchStaff, OperatingHours, DaySchedule } from '@/services/branch-service'
import Link from 'next/link'

export default function BranchManagementPage() {
  const params = useParams()
  const branchId = params.id as string
  const [branch, setBranch] = useState<GarageBranch | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'services' | 'staff' | 'hours'>('services')
  const [newService, setNewService] = useState<Omit<BranchService, 'id'>>({
    name: '',
    description: '',
    price: 0,
    duration: 60,
    isAvailable: true,
  })
  const [newStaff, setNewStaff] = useState<Omit<BranchStaff, 'id'>>({
    name: '',
    role: 'technician',
    email: '',
    phone: '',
  })
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    if (branchId) {
      loadBranchData()
    }
  }, [branchId])

  const loadBranchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const branchData = await branchService.getBranchById(branchId);
      setBranch(branchData);
    } catch (error) {
      console.error('Failed to load branch data:', error);
      setError('Failed to load branch data. Please try again later.');
    } finally {
      setLoading(false);
    }
  }

  const addService = async () => {
    if (!branch || !newService.name || !newService.description || newService.price <= 0) return

    try {
      const updatedServices = [...branch.services, { ...newService, id: Date.now().toString() }]
      await branchService.updateBranchServices(branchId, updatedServices)
      setBranch(prev => prev ? { ...prev, services: updatedServices } : null)
      setNewService({
        name: '',
        description: '',
        price: 0,
        duration: 60,
        isAvailable: true,
      })
    } catch (error) {
      console.error('Failed to add service:', error)
    }
  }

  const updateService = async (serviceId: string, updates: Partial<BranchService>) => {
    if (!branch) return

    try {
      const updatedServices = branch.services.map(service =>
        service.id === serviceId ? { ...service, ...updates } : service
      )
      await branchService.updateBranchServices(branchId, updatedServices)
      setBranch(prev => prev ? { ...prev, services: updatedServices } : null)
      setEditingService(null)
    } catch (error) {
      console.error('Failed to update service:', error)
    }
  }

  const removeService = async (serviceId: string) => {
    if (!branch) return

    try {
      const updatedServices = branch.services.filter(service => service.id !== serviceId)
      await branchService.updateBranchServices(branchId, updatedServices)
      setBranch(prev => prev ? { ...prev, services: updatedServices } : null)
    } catch (error) {
      console.error('Failed to remove service:', error)
    }
  }

  const addStaff = async () => {
    if (!branch || !newStaff.name || !newStaff.email || !newStaff.phone) return

    try {
      const updatedStaff = [...branch.staff, { ...newStaff, id: Date.now().toString(), isActive: true }]
      await branchService.updateBranch(branchId, { staff: updatedStaff })
      setBranch(prev => prev ? { ...prev, staff: updatedStaff } : null)
      setNewStaff({
        name: '',
        role: 'technician',
        email: '',
        phone: '',
      })
    } catch (error) {
      console.error('Failed to add staff:', error)
    }
  }

  const updateStaff = async (staffId: string, updates: Partial<BranchStaff>) => {
    if (!branch) return

    try {
      const updatedStaff = branch.staff.map(staff =>
        staff.id === staffId ? { ...staff, ...updates } : staff
      )
      await branchService.updateBranch(branchId, { staff: updatedStaff })
      setBranch(prev => prev ? { ...prev, staff: updatedStaff } : null)
      setEditingStaff(null)
    } catch (error) {
      console.error('Failed to update staff:', error)
    }
  }

  const removeStaff = async (staffId: string) => {
    if (!branch) return

    try {
      const updatedStaff = branch.staff.filter(staff => staff.id !== staffId)
      await branchService.updateBranch(branchId, { staff: updatedStaff })
      setBranch(prev => prev ? { ...prev, staff: updatedStaff } : null)
    } catch (error) {
      console.error('Failed to remove staff:', error)
    }
  }

  const updateOperatingHours = async (day: keyof OperatingHours, field: keyof DaySchedule, value: string | boolean) => {
    if (!branch) return

    try {
      const updatedHours = {
        ...branch.operatingHours,
        [day]: {
          ...branch.operatingHours[day],
          [field]: value,
        },
      }
      await branchService.updateBranchOperatingHours(branchId, updatedHours)
      setBranch(prev => prev ? { ...prev, operatingHours: updatedHours } : null)
    } catch (error) {
      console.error('Failed to update operating hours:', error)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">Loading branch data...</div>
      </div>
    )
  }
  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8 text-red-600">{error}</div>
      </div>
    )
  }
  if (!branch) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">Branch not found</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/branches">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Branches
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Branch Management</h1>
          <p className="text-muted-foreground">
            Manage services, staff, and operations for {branch.name}
          </p>
        </div>
      </div>

      {/* Branch Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Branch Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Branch Name</div>
              <div className="text-lg font-semibold">{branch.name}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Location</div>
              <div className="text-sm">{branch.city}, {branch.state}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Manager</div>
              <div className="text-sm">{branch.managerName}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Management Tabs */}
      <Card>
        <CardHeader>
          <div className="flex space-x-4">
            <Button
              variant={activeTab === 'services' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('services')}
            >
              <Building2 className="mr-2 h-4 w-4" />
              Services
            </Button>
            <Button
              variant={activeTab === 'staff' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('staff')}
            >
              <Users className="mr-2 h-4 w-4" />
              Staff
            </Button>
            <Button
              variant={activeTab === 'hours' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('hours')}
            >
              <Clock className="mr-2 h-4 w-4" />
              Operating Hours
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Services Tab */}
          {activeTab === 'services' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Add New Service</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="space-y-2">
                    <Label>Service Name</Label>
                    <Input
                      value={newService.name}
                      onChange={(e) => setNewService(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Oil Change"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input
                      value={newService.description}
                      onChange={(e) => setNewService(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Full synthetic oil change"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Price ($)</Label>
                    <Input
                      type="number"
                      value={newService.price}
                      onChange={(e) => setNewService(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                      placeholder="29.99"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Duration (min)</Label>
                    <Input
                      type="number"
                      value={newService.duration}
                      onChange={(e) => setNewService(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                      placeholder="60"
                      min="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Available</Label>
                    <div className="pt-2">
                      <Switch
                        checked={newService.isAvailable}
                        onCheckedChange={(checked) => setNewService(prev => ({ ...prev, isAvailable: checked }))}
                      />
                    </div>
                  </div>
                </div>
                <Button onClick={addService} className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Service
                </Button>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Current Services</h3>
                <div className="space-y-3">
                  {branch.services.map((service) => (
                    <div key={service.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{service.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {service.description} - ${service.price} ({service.duration} min)
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={service.isAvailable}
                          onCheckedChange={(checked) => updateService(service.id, { isAvailable: checked })}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingService(service)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeService(service.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Staff Tab */}
          {activeTab === 'staff' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Add New Staff Member</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      value={newStaff.name}
                      onChange={(e) => setNewStaff(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Select value={newStaff.role} onValueChange={(value: 'technician' | 'receptionist' | 'manager') => setNewStaff(prev => ({ ...prev, role: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technician">Technician</SelectItem>
                        <SelectItem value="receptionist">Receptionist</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={newStaff.email}
                      onChange={(e) => setNewStaff(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="john@garage.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      value={newStaff.phone}
                      onChange={(e) => setNewStaff(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Active</Label>
                    <div className="pt-2">
                      <Switch
                        checked={newStaff.isActive}
                        onCheckedChange={(checked) => setNewStaff(prev => ({ ...prev, isActive: checked }))}
                      />
                    </div>
                  </div>
                </div>
                <Button onClick={addStaff} className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Staff Member
                </Button>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Current Staff</h3>
                <div className="space-y-3">
                  {branch.staff.map((staff) => (
                    <div key={staff.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{staff.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {staff.role} - {staff.email} - {staff.phone}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={staff.isActive}
                          onCheckedChange={(checked) => updateStaff(staff.id, { isActive: checked })}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingStaff(staff)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeStaff(staff.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Operating Hours Tab */}
          {activeTab === 'hours' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Operating Hours</h3>
                <div className="space-y-4">
                  {(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const).map((day) => (
                    <div key={day} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="w-24 font-medium capitalize">{day}</div>
                      <Switch
                        checked={branch.operatingHours[day].isOpen}
                        onCheckedChange={(checked) => updateOperatingHours(day, 'isOpen', checked)}
                      />
                      {branch.operatingHours[day].isOpen && (
                        <>
                          <div className="flex items-center gap-2">
                            <Label>Open:</Label>
                            <Input
                              type="time"
                              value={branch.operatingHours[day].openTime}
                              onChange={(e) => updateOperatingHours(day, 'openTime', e.target.value)}
                              className="w-32"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Label>Close:</Label>
                            <Input
                              type="time"
                              value={branch.operatingHours[day].closeTime}
                              onChange={(e) => updateOperatingHours(day, 'closeTime', e.target.value)}
                              className="w-32"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
