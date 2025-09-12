'use client'

import { useState, useCallback, useMemo, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import Banner from "@/components/admin/Banner"

import { 
  branchService, 
  CreateBranchRequest, 
  BranchStaff, 
  OperatingHours, 
  DaySchedule 
} from '@/services/branch-service'
import { User } from '@/services/user-service'
import { GarageServiceCatalogItem } from '@/services/service-catalog'

// Import components
import { BasicInfoSection } from '@/components/admin/branches/BasicInfoSection'
import { ServicesSection } from '@/components/admin/branches/ServicesSection'
import { StaffSection } from '@/components/admin/branches/StaffSection'
import { OperatingHoursSection } from '@/components/admin/branches/OperatingHoursSection'

// Import hooks and constants
import { useBranchData, useFormValidation, validateForm } from '@/hooks/admin/branches/useBranch'
import { DEFAULT_OPERATING_HOURS } from '@/constants/branch'

// Move initial state outside component to prevent recreating on each render
const INITIAL_FORM_DATA: CreateBranchRequest = {
  name: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  country: 'United States',
  phone: '',
  email: '',
  managerId: '',
  services: [],
  staff: [],
  operatingHours: DEFAULT_OPERATING_HOURS,
}

interface BannerState {
  type: 'success' | 'error'
  message: string
}

export default function CreateBranchPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [shouldValidate, setShouldValidate] = useState(false)
  const [formData, setFormData] = useState<CreateBranchRequest>(INITIAL_FORM_DATA)
  const [banner, setBanner] = useState<BannerState | null>(null)
  
  const { managers, drivers, catalog, loading: dataLoading, error: dataError } = useBranchData()
  const errors = useFormValidation(formData, shouldValidate)

  // Memoize loading state to prevent unnecessary renders
  const isLoading = useMemo(() => isPending || isSubmitting, [isPending, isSubmitting])

  // Optimized input handler with better type safety
  const handleInputChange = useCallback(<K extends keyof CreateBranchRequest>(
    field: K, 
    value: CreateBranchRequest[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (!shouldValidate) setShouldValidate(true)
  }, [shouldValidate])

  // Optimized operating hours handler
  const handleOperatingHoursChange = useCallback((
    day: keyof OperatingHours, 
    field: keyof DaySchedule, 
    value: string | boolean
  ) => {
    setFormData(prev => ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours,
        [day]: {
          ...prev.operatingHours[day],
          [field]: value,
        },
      },
    }))
  }, [])

  // Optimized service toggle with reduced object creation
  const handleServiceToggle = useCallback((item: GarageServiceCatalogItem, selected: boolean) => {
    if (!shouldValidate) setShouldValidate(true)
    
    setFormData(prev => {
      if (selected) {
        // Check if service already exists to prevent duplicates
        const exists = prev.services.some(s => s.id === item.id)
        if (exists) return prev
        
        const newService = {
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.basePrice,
          duration: item.duration,
          isAvailable: true,
        }
        return { ...prev, services: [...prev.services, newService] }
      } else {
        return { 
          ...prev, 
          services: prev.services.filter(s => s.id !== item.id) 
        }
      }
    })
  }, [shouldValidate])

  const handleServiceRemove = useCallback((index: number) => {
    if (!shouldValidate) setShouldValidate(true)
    
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index),
    }))
  }, [shouldValidate])

  // Optimized staff toggle with better duplicate checking
  const handleStaffToggle = useCallback((driver: User, selected: boolean) => {
    if (!shouldValidate) setShouldValidate(true)
    
    setFormData(prev => {
      if (selected) {
        // Check if staff member already exists
        const exists = prev.staff.some(s => s.id === String(driver.id))
        if (exists) return prev
        
        const member: BranchStaff = {
          id: String(driver.id),
          name: driver.name,
          role: 'technician',
          email: driver.email,
          phone: driver.phone,
          isActive: true,
        }
        return { ...prev, staff: [...prev.staff, member] }
      } else {
        return { 
          ...prev, 
          staff: prev.staff.filter(s => s.id !== String(driver.id)) 
        }
      }
    })
  }, [shouldValidate])

  const handleStaffRemove = useCallback((index: number) => {
    if (!shouldValidate) setShouldValidate(true)
    
    setFormData(prev => ({
      ...prev,
      staff: prev.staff.filter((_, i) => i !== index),
    }))
  }, [shouldValidate])

  // Improved form submission with better error handling
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    setShouldValidate(true)
    
    // Prevent double submission
    if (isLoading) return
    
    // Validate form
    const formErrors = validateForm(formData)
    const validationErrors = Object.keys(formErrors)
    
    if (validationErrors.length > 0) {
      setBanner({ 
        type: 'error', 
        message: `Please fix the following errors: ${validationErrors.join(', ')}` 
      })
      return
    }

    setIsSubmitting(true)
    
    try {
      await branchService.createBranch(formData)
      setBanner({ type: 'success', message: 'Branch created successfully.' })
      
      // Use startTransition for navigation to prevent blocking UI
      startTransition(() => {
        setTimeout(() => {
          router.push('/admin/branches')
        }, 1000)
      })
    } catch (error) {
      console.error('Failed to create branch:', error)
      setBanner({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'Failed to create branch. Please try again.' 
      })
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, isLoading, router])

  // Memoized loading skeleton to prevent recreating on each render
  const LoadingSkeleton = useMemo(() => (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/branches">
          <Button variant="ghost" size="sm" disabled>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Branches
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Branch</h1>
          <p className="text-muted-foreground">Loading required data...</p>
        </div>
      </div>
      
      <Banner banner={banner} onClose={() => setBanner(null)} />
      
      <div className="space-y-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-32 bg-gray-200 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  ), [banner])

  // Memoized error state
  const ErrorState = useMemo(() => (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/branches">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Branches
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Branch</h1>
          <p className="text-muted-foreground text-red-600">Failed to load required data</p>
        </div>
      </div>
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-red-500 mb-4">{dataError}</p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </CardContent>
      </Card>
    </div>
  ), [dataError])

  // Early returns for loading and error states
  if (dataLoading) return LoadingSkeleton
  if (dataError) return ErrorState

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/branches">
          <Button variant="ghost" size="sm" disabled={isLoading}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Branches
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Branch</h1>
          <p className="text-muted-foreground">
            Set up a new garage branch with location, services, and staff
          </p>
        </div>
      </div>

      <Banner banner={banner} onClose={() => setBanner(null)} />

      <form onSubmit={handleSubmit} className="space-y-6">
        <BasicInfoSection
          formData={formData}
          errors={errors}
          managers={managers}
          onChange={handleInputChange}
        />

        <ServicesSection
          formData={formData}
          errors={errors}
          catalog={catalog}
          onServiceToggle={handleServiceToggle}
          onServiceRemove={handleServiceRemove}
        />

        <StaffSection
          formData={formData}
          errors={errors}
          drivers={drivers}
          onStaffToggle={handleStaffToggle}
          onStaffRemove={handleStaffRemove}
        />

        <OperatingHoursSection
          formData={formData}
          onOperatingHoursChange={handleOperatingHoursChange}
        />

        <div className="flex justify-end gap-4">
          <Link href="/admin/branches">
            <Button variant="outline" type="button" disabled={isLoading}>
              Cancel
            </Button>
          </Link>
          <Button 
            type="submit" 
            disabled={isLoading}
            data-testid="submit-button"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Create Branch
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}