import { useState, useEffect, useMemo } from 'react'
import { CreateBranchRequest } from '@/services/branch-service'
import { userService, User } from '@/services/user-service'
import { serviceCatalog, GarageServiceCatalogItem } from '@/services/service-catalog'

// Form validation hook
export const useFormValidation = (formData: CreateBranchRequest, validateOnMount: boolean = false) => {
  return useMemo(() => {
    // Don't validate on initial render unless explicitly requested
    if (!validateOnMount) return {}
    
    const errors: Record<string, string> = {}

    if (!formData.name.trim()) errors.name = 'Branch name is required'
    if (!formData.address.trim()) errors.address = 'Address is required'
    if (!formData.city.trim()) errors.city = 'City is required'
    if (!formData.state.trim()) errors.state = 'State is required'
    if (!formData.zipCode.trim()) errors.zipCode = 'ZIP code is required'
    if (!formData.phone.trim()) errors.phone = 'Phone number is required'
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address'
    }

    if (!formData.managerId.trim()) errors.managerId = 'Manager is required'
    if (formData.services.length === 0) errors.services = 'At least one service is required'
    if (formData.staff.length === 0) errors.staff = 'At least one staff member is required'

    return errors
  }, [formData, validateOnMount])
}

// Standalone validation function
export function validateForm(formData: CreateBranchRequest) {
  const errors: Record<string, string> = {}

  if (!formData.name.trim()) errors.name = 'Branch name is required'
  if (!formData.address.trim()) errors.address = 'Address is required'
  if (!formData.city.trim()) errors.city = 'City is required'
  if (!formData.state.trim()) errors.state = 'State is required'
  if (!formData.zipCode.trim()) errors.zipCode = 'ZIP code is required'
  if (!formData.phone.trim()) errors.phone = 'Phone number is required'

  if (!formData.email.trim()) {
    errors.email = 'Email is required'
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    errors.email = 'Please enter a valid email address'
  }

  if (!formData.managerId.trim()) errors.managerId = 'Manager is required'
  if (formData.services.length === 0) errors.services = 'At least one service is required'
  if (formData.staff.length === 0) errors.staff = 'At least one staff member is required'

  return errors
}

// Data loading hook
export const useBranchData = () => {
  const [managers, setManagers] = useState<User[]>([])
  const [drivers, setDrivers] = useState<User[]>([])
  const [catalog, setCatalog] = useState<GarageServiceCatalogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Try to load data with fallback
        const [mgrs, drvs, cats] = await Promise.all([
          userService.getManagers().catch(() => []),
          userService.getDrivers().catch(() => []),
          serviceCatalog.list({ isActive: true }).catch(() => [])
        ])

        if (isMounted) {
          setManagers(mgrs)
          setDrivers(drvs)
          setCatalog(cats)
          setLoading(false)
        }
      } catch (err) {
        console.error('Failed to load initial data:', err)
        if (isMounted) {
          setError('Failed to load data. Please refresh the page.')
          setLoading(false)
        }
      }
    }

    // Add a small delay to prevent flash
    const timeoutId = setTimeout(() => {
      loadData()
    }, 100)

    return () => {
      isMounted = false
      clearTimeout(timeoutId)
    }
  }, [])

  return { managers, drivers, catalog, loading, error }
}