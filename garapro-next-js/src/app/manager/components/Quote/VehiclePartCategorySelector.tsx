"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Package, X, Search, Car, Filter, ChevronDown } from "lucide-react"
import { useVehiclePartCategories } from "@/hooks/use-part-categories"
import { formatVND } from "@/lib/currency"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { PartCategory } from "@/types/manager/part-category"

interface VehicleInfo {
  modelId: string
  modelName: string
  brandId: string
  brandName: string
}

interface VehiclePartCategorySelectorProps {
  serviceId: string
  serviceName: string
  servicePrice: number
  vehicleInfo?: VehicleInfo
  onConfirm: (selectedCategories: PartCategory[]) => void
  onCancel: () => void
}

export function VehiclePartCategorySelector({ 
  serviceId, 
  serviceName, 
  servicePrice,
  vehicleInfo,
  onConfirm, 
  onCancel 
}: VehiclePartCategorySelectorProps) {
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState("")
  const [filterMode, setFilterMode] = useState<'all' | 'model' | 'brand'>('all')
  
  // Determine which filter to apply based on filterMode and vehicleInfo
  const modelId = filterMode === 'model' && vehicleInfo ? vehicleInfo.modelId : undefined
  const brandId = filterMode === 'brand' && vehicleInfo ? vehicleInfo.brandId : undefined
  
  const { categories, loading, error, refetch } = useVehiclePartCategories(modelId, brandId)

  // Filter categories by search term
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.modelName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.brandName?.toLowerCase().includes(searchTerm.toLowerCase())
  )

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

  const handleFilterModeChange = (mode: 'all' | 'model' | 'brand') => {
    setFilterMode(mode)
    setSelectedCategories(new Set()) // Clear selections when changing filter
  }

  const getFilterDescription = () => {
    if (!vehicleInfo) return "Showing all part categories"
    
    switch (filterMode) {
      case 'model':
        return `Showing categories for ${vehicleInfo.brandName} ${vehicleInfo.modelName}`
      case 'brand':
        return `Showing categories for all ${vehicleInfo.brandName} models`
      default:
        return "Showing all part categories"
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[80vh] flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">{serviceName}</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Service Price: {formatVND(servicePrice)}
              </p>
              {vehicleInfo && (
                <p className="text-sm text-blue-600 mt-1 flex items-center gap-1">
                  <Car className="w-4 h-4" />
                  {vehicleInfo.brandName} {vehicleInfo.modelName}
                </p>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden p-6 flex flex-col">
          {/* Search and Filter Controls */}
          <div className="space-y-4 mb-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              {vehicleInfo && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant={filterMode !== 'all' ? "default" : "outline"}
                      className="min-w-[160px] gap-2"
                    >
                      <Filter className="w-4 h-4" />
                      {filterMode === 'all' && 'All Categories'}
                      {filterMode === 'model' && 'This Model'}
                      {filterMode === 'brand' && 'This Brand'}
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => handleFilterModeChange('all')}>
                      All Categories
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleFilterModeChange('model')}>
                      This Model Only
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleFilterModeChange('brand')}>
                      This Brand Only
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">{getFilterDescription()}</p>
              <Badge variant="secondary">
                {filteredCategories.length} categor{filteredCategories.length !== 1 ? 'ies' : 'y'}
              </Badge>
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
                <Button onClick={refetch} className="mt-4">
                  Try Again
                </Button>
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>No part categories found</p>
                {searchTerm && (
                  <p className="text-sm mt-2">Try adjusting your search or filter settings</p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredCategories.map((category) => (
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
                              <Car className="w-3 h-3 mr-1" />
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