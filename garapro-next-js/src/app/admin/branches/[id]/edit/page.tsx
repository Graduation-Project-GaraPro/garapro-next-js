'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { branchService, GarageBranch, BranchService as BranchServiceItem, BranchStaff, OperatingHours, DaySchedule } from '@/services/branch-service'
import { userService, User } from '@/services/user-service'
import { serviceCatalog, GarageServiceCatalogItem } from '@/services/service-catalog'

export default function EditBranchPage() {
  const params = useParams()
  const router = useRouter()
  const branchId = params.id as string
  const [loading, setLoading] = useState(false)
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [branch, setBranch] = useState<GarageBranch | null>(null)
  const [managers, setManagers] = useState<User[]>([])
  const [drivers, setDrivers] = useState<User[]>([])
  const [catalog, setCatalog] = useState<GarageServiceCatalogItem[]>([])

  useEffect(() => {
    ;(async () => {
      console.log('Loading branch data...')
      try {
        const [mgrs, drvs, cats, data] = await Promise.all([
          userService.getManagers(),
          userService.getDrivers(),
          serviceCatalog.list({ isActive: true }),
          branchService.getBranchById(branchId)
        ])
        setManagers(mgrs)
        setDrivers(drvs)
        setCatalog(cats)
        setBranch(data)
      } catch (e) {
        setBanner({ type: 'error', message: 'Failed to load branch data.' })
      }
    })()
  }, [branchId])

  const handleInputChange = (field: keyof GarageBranch, value: any) => {
    setBranch(prev => prev ? { ...prev, [field]: value } : prev)
  }

  const handleOperatingHoursChange = (day: keyof OperatingHours, field: keyof DaySchedule, value: string | boolean) => {
    if (!branch) return
    setBranch({
      ...branch,
      operatingHours: {
        ...branch.operatingHours,
        [day]: {
          ...branch.operatingHours[day],
          [field]: value,
        },
      },
    })
  }

  const removeService = (index: number) => {
    if (!branch) return
    setBranch({ ...branch, services: branch.services.filter((_, i) => i !== index) })
  }

  const removeStaff = (index: number) => {
    if (!branch) return
    setBranch({ ...branch, staff: branch.staff.filter((_, i) => i !== index) })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!branch) return
    try {
      setLoading(true)
      await branchService.updateBranch(branch.id, {
        name: branch.name,
        address: branch.address,
        city: branch.city,
        state: branch.state,
        zipCode: branch.zipCode,
        country: branch.country,
        phone: branch.phone,
        email: branch.email,
        managerId: branch.managerId,
        services: branch.services,
        staff: branch.staff,
        operatingHours: branch.operatingHours,
        isActive: branch.isActive,
      })
      setBanner({ type: 'success', message: 'Branch updated successfully.' })
      router.push('/admin/branches')
    } catch (error) {
      setBanner({ type: 'error', message: 'Failed to update branch.' })
    } finally {
      setLoading(false)
    }
  }

  if (!branch) return <div className="space-y-6"><div className="text-center py-8">Loading...</div></div>

  const states = ['Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming']

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
          <h1 className="text-3xl font-bold tracking-tight">Edit Branch</h1>
          <p className="text-muted-foreground">Update location, services, and staff</p>
        </div>
      </div>

      {banner && (
        <div className={`${banner.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'} border rounded p-3`}>
          {banner.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Provide the essential details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Branch Name *</Label>
                <Input id="name" value={branch.name} onChange={(e) => handleInputChange('name', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Manager *</Label>
                <Select value={branch.managerId} onValueChange={(value) => handleInputChange('managerId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Manager" />
                  </SelectTrigger>
                  <SelectContent>
                    {managers.map((m) => (
                      <SelectItem key={m.id} value={String(m.id)}>
                        {m.name} ({m.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input id="address" value={branch.address} onChange={(e) => handleInputChange('address', e.target.value)} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input id="city" value={branch.city} onChange={(e) => handleInputChange('city', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Select value={branch.state} onValueChange={(value) => handleInputChange('state', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select State" />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip">ZIP Code *</Label>
                <Input id="zip" value={branch.zipCode} onChange={(e) => handleInputChange('zipCode', e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone *</Label>
                <Input value={branch.phone} onChange={(e) => handleInputChange('phone', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input type="email" value={branch.email} onChange={(e) => handleInputChange('email', e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Services</CardTitle>
            <CardDescription>Select services from the catalog</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {catalog.map((item) => {
                const selectedIndex = branch.services.findIndex(s => s.id === item.id)
                const isSelected = selectedIndex !== -1
                return (
                  <label key={item.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        if (e.target.checked) {
                          const newItem: BranchServiceItem = { id: item.id, name: item.name, description: item.description, price: item.basePrice, duration: item.duration, isAvailable: true }
                          setBranch(prev => prev ? { ...prev, services: [...prev.services, newItem] } : prev)
                        } else {
                          removeService(selectedIndex)
                        }
                      }}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-muted-foreground">{item.description}</div>
                    </div>
                  </label>
                )
              })}
            </div>

            {branch.services.length > 0 && (
              <div className="space-y-2">
                <Label>Selected Services</Label>
                <div className="space-y-2">
                  {branch.services.map((service, index) => (
                    <div key={service.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{service.name}</div>
                        <div className="text-sm text-muted-foreground">{service.description} - ${service.price} ({service.duration} min)</div>
                      </div>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeService(index)} className="text-red-600">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Staff Members</CardTitle>
            <CardDescription>Select staff from existing accounts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {drivers.map((d) => {
                const exists = branch.staff.some(s => s.email === d.email)
                return (
                  <label key={d.id} className="flex items-center gap-2 p-2 border rounded">
                    <input
                      type="checkbox"
                      checked={exists}
                      onChange={(e) => {
                        if (e.target.checked) {
                          const member: BranchStaff = { id: String(d.id), name: d.name, role: 'technician', email: d.email, phone: d.phone, isActive: true }
                          setBranch(prev => prev ? { ...prev, staff: [...prev.staff, member] } : prev)
                        } else {
                          setBranch(prev => prev ? { ...prev, staff: prev.staff.filter(s => s.email !== d.email) } : prev)
                        }
                      }}
                    />
                    <span className="text-sm">{d.name} ({d.email})</span>
                  </label>
                )
              })}
            </div>

            {branch.staff.length > 0 && (
              <div className="space-y-2">
                <Label>Added Staff</Label>
                <div className="space-y-2">
                  {branch.staff.map((staff, index) => (
                    <div key={staff.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{staff.name}</div>
                        <div className="text-sm text-muted-foreground">{staff.role} - {staff.email} - {staff.phone}</div>
                      </div>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeStaff(index)} className="text-red-600">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Operating Hours</CardTitle>
            <CardDescription>Set weekly schedule</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(['monday','tuesday','wednesday','thursday','friday','saturday','sunday'] as const).map(day => (
                <div key={day} className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className="w-24 font-medium capitalize">{day}</div>
                  <Switch checked={branch.operatingHours[day].isOpen} onCheckedChange={(checked) => handleOperatingHoursChange(day, 'isOpen', checked)} />
                  {branch.operatingHours[day].isOpen && (
                    <>
                      <div className="flex items-center gap-2">
                        <Label>Open:</Label>
                        <Input type="time" value={branch.operatingHours[day].openTime} onChange={(e) => handleOperatingHoursChange(day, 'openTime', e.target.value)} className="w-32" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Label>Close:</Label>
                        <Input type="time" value={branch.operatingHours[day].closeTime} onChange={(e) => handleOperatingHoursChange(day, 'closeTime', e.target.value)} className="w-32" />
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Link href="/admin/branches">
            <Button variant="outline" type="button">Cancel</Button>
          </Link>
          <Button type="submit" disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  )
}


