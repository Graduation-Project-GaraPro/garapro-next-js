"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Loader2, Package, X, Search, Car, Filter, Tag } from "lucide-react"
import { PartCategoryService } from "@/services/manager/part-category-service"
import { formatVND } from "@/lib/currency"
import type { PartCategory, SearchParams } from "@/types/manager/part-category"

interface ModelNamePartCategorySelectorProps {
  serviceId: string
  serviceName: string
  servicePrice: number
  onConfirm: (selectedCategories: PartCategory[]) => void
  onCancel: () => void
}

export function ModelNamePartCategorySelector({ 
  serviceId, 
  serviceName, 
  servicePrice,
  onConfirm, 
  onCancel 
}: ModelNamePartCategorySelectorProps) {
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState("")
  const [modelNameFilter, setModelNameFilter] = useState("")
  const [brandNameFilter, setBrandNameFilter] = useState("")
  const [categories, setCategories] = useState<PartCategory[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load categories based on filters
  const loadCategories = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params: SearchParams = {
        page: 1,
        pageSize: 100, // Load more for better filtering
        searchTerm: searchTerm.trim() || undefined,
        modelName: modelNameFilter.trim() || undefined,
        brandName: brandNameFilter.trim() || undefined,
        sortBy: 'categoryName',
        sortOrder: 'asc'
      }

      const response = await PartCategoryService.searchCategories(params)
      setCategories(response.items)
    } catch (err) {
      setError('Failed to load categories')
      console.error('Error loading categories:', err)
    } finally {
      setLoading(false)
    }
  }

  // Load categories on mount and when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadCategories()
    }, 300) // Debounce search

    return () => clearTimeout(timeoutId)
  }, [searchTerm, modelNameFilter, brandNameFilter])

  const toggleCategory = (categoryId: string) => {
    const newSelected = new Set(selectedCategories)
    if (newSelected.has(categoryId)) {
      newSelected.delete(categoryId)
    } else {
      newSelected.add(categoryId)
    }
    setSelectedCategories(newSelected)
  }

  const handleConfirm = () => {
    const selectedCategoriesList = categories.filter(cat => selectedCategories.has(cat.id))
    onConfirm(selectedCategoriesList)
  }

  const clearFilters = () => {
    setSearchTerm("")
    setModelNameFilter("")
    setBrandNameFilter("")
    setSelectedCategories(new Set())
  }

  const hasActiveFilters = searchTerm || modelNameFilter || brandNameFilter

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-5xl max-h-[80vh] flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">{serviceName}</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Service Price: {formatVND(servicePrice)}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden p-6 flex flex-col">
          {/* Search and Filter Controls */}
          <div className="space-y-4 mb-6">
            {/* Main Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search categories and descriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Vehicle Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Car className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Filter by model name (e.g., Mustang, Camry)"
                  value={modelNameFilter}
                  onChange={(e) => setModelNameFilter(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Filter by brand name (e.g., Ford, Toyota)"
                  value={brandNameFilter}
                  onChange={(e) => setBrandNameFilter(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            {/* Filter Status and Clear */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {categories.length} categor{categories.length !== 1 ? 'ies' : 'y'}
                </Badge>
                {hasActiveFilters && (
                  <Badge variant="outline" className="text-blue-600">
                    <Filter className="w-3 h-3 mr-1" />
                    Filtered
                  </Badge>
                )}
              </div>
              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          {/* Categories List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-500">
                <p>{error}</p>
                <Button onClick={loadCategories} className="mt-4">
                  Try Again
                </Button>
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>No part categories found</p>
                {hasActiveFilters ? (
                  <p className="text-sm mt-2">Try adjusting your search filters</p>
                ) : (
                  <p className="text-sm mt-2">No categories available for this service</p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {categories.map((category) => (
                  <div 
                    key={category.id}
                    className="border rounded-lg p-4 hover:border-blue-500 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id={category.id}
                        checked={selectedCategories.has(category.id)}
                        onCheckedChange={() => toggleCategory(category.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <label 
                          htmlFor={category.id}
                          className="font-medium cursor-pointer block mb-2"
                        >
                          {category.description || category.name || 'No description available'}
                        </label>
                        
                        <div className="flex items-center gap-2 flex-wrap">
                          {category.modelName && (
                            <Badge variant="outline" className="text-xs">
                              <Car className="w-3 h-3 mr-1" />
                              {category.brandName} {category.modelName}
                            </Badge>
                          )}
                          {category.brandName && !category.modelName && (
                            <Badge variant="outline" className="text-xs">
                              <Tag className="w-3 h-3 mr-1" />
                              {category.brandName}
                            </Badge>
                          )}
                          <Badge variant="secondary" className="text-xs">
                            {new Date(category.createdAt).toLocaleDateString()}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>

        <div className="border-t p-6 bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm text-gray-600">
                Selected: {selectedCategories.size} categor{selectedCategories.size !== 1 ? 'ies' : 'y'}
              </div>
              <div className="text-lg font-bold mt-1">
                Service Total: {formatVND(servicePrice)}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button 
                onClick={handleConfirm}
                disabled={selectedCategories.size === 0}
              >
                Add Categories
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}