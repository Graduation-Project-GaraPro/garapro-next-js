import { useState, useEffect } from 'react'
import { PartCategoryService } from '@/services/manager/part-category-service'
import type { PartCategory, Part, Service } from '@/types/manager/part-category'

export function usePartCategories() {
  const [categories, setCategories] = useState<PartCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadCategories = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await PartCategoryService.getAllCategories()
      setCategories(data)
    } catch (err) {
      setError('Failed to load categories')
      console.error('Error loading categories:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  return {
    categories,
    loading,
    error,
    refetch: loadCategories
  }
}

export function useParts() {
  const [parts, setParts] = useState<Part[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadParts = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await PartCategoryService.getAllParts()
      setParts(data)
    } catch (err) {
      setError('Failed to load parts')
      console.error('Error loading parts:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadParts()
  }, [])

  return {
    parts,
    loading,
    error,
    refetch: loadParts
  }
}

export function useServiceParts(serviceId: string | null) {
  const [parts, setParts] = useState<Part[]>([])
  const [categories, setCategories] = useState<PartCategory[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadServiceData = async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      const [partsData, categoriesData] = await Promise.all([
        PartCategoryService.getPartsForService(id),
        PartCategoryService.getServiceCategories(id)
      ])
      setParts(partsData)
      setCategories(categoriesData)
    } catch (err) {
      setError('Failed to load service data')
      console.error('Error loading service data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (serviceId) {
      loadServiceData(serviceId)
    } else {
      setParts([])
      setCategories([])
    }
  }, [serviceId])

  return {
    parts,
    categories,
    loading,
    error,
    refetch: serviceId ? () => loadServiceData(serviceId) : () => {}
  }
}