"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Loader2, Package, X, ExternalLink } from "lucide-react"
import { useServiceParts } from "@/hooks/use-part-categories"
import { formatVND } from "@/lib/currency"
import type { Part, PartCategory } from "@/types/manager/part-category"

interface EnhancedPartCategorySelectorProps {
  serviceId: string
  serviceName: string
  servicePrice: number
  onConfirm: (selectedParts: Part[], selectedCategories: PartCategory[]) => void
  onCancel: () => void
  onManageCategories?: () => void // Optional callback to open part management
}

export function EnhancedPartCategorySelector({ 
  serviceId, 
  serviceName, 
  servicePrice,
  onConfirm, 
  onCancel,
  onManageCategories
}: EnhancedPartCategorySelectorProps) {
  const { parts, categories, loading, error } = useServiceParts(serviceId)
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set())
  const [selectedParts, setSelectedParts] = useState<Set<string>>(new Set())

  const toggleCategory = (categoryId: string) => {
    const newSelected = new Set(selectedCategories)
    const newSelectedParts = new Set(selectedParts)
    
    if (newSelected.has(categoryId)) {
      newSelected.delete(categoryId)
      // Remove all parts from this category
      parts.forEach(part => {
        if (part.id === categoryId) {
          newSelectedParts.delete(part.id)
        }
      })
    } else {
      newSelected.add(categoryId)
      // Add all parts from this category
      parts.forEach(part => {
        if (part.id === categoryId) {
          newSelectedParts.add(part.id)
        }
      })
    }
    
    setSelectedCategories(newSelected)
    setSelectedParts(newSelectedParts)
  }

  const togglePart = (partId: string, categoryId: string) => {
    const newSelectedParts = new Set(selectedParts)
    const newSelectedCategories = new Set(selectedCategories)
    
    if (newSelectedParts.has(partId)) {
      newSelectedParts.delete(partId)
      
      // Check if this was the last part in the category
      const categoryParts = parts.filter(p => p.id === categoryId)
      const remainingSelected = categoryParts.filter(p => 
        p.id !== partId && newSelectedParts.has(p.id)
      )
      
      if (remainingSelected.length === 0) {
        newSelectedCategories.delete(categoryId)
      }
    } else {
      newSelectedParts.add(partId)
      newSelectedCategories.add(categoryId)
    }
    
    setSelectedParts(newSelectedParts)
    setSelectedCategories(newSelectedCategories)
  }

  const handleConfirm = () => {
    const selectedPartsList = parts.filter(part => selectedParts.has(part.id))
    const selectedCategoriesList = categories.filter(cat => selectedCategories.has(cat.id))
    onConfirm(selectedPartsList, selectedCategoriesList)
  }

  const getTotalPrice = () => {
    let total = servicePrice
    parts.forEach(part => {
      if (selectedParts.has(part.id)) {
        total += part.price
      }
    })
    return total
  }

  const getPartsByCategory = (categoryId: string) => {
    return parts.filter(part => part.id === categoryId)
  }

  const isCategoryFullySelected = (categoryId: string) => {
    const categoryParts = getPartsByCategory(categoryId)
    return categoryParts.length > 0 && categoryParts.every(part => selectedParts.has(part.id))
  }

  const isCategoryPartiallySelected = (categoryId: string) => {
    const categoryParts = getPartsByCategory(categoryId)
    return categoryParts.some(part => selectedParts.has(part.id)) && !isCategoryFullySelected(categoryId)
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={onCancel}>Close</Button>
              {onManageCategories && (
                <Button onClick={onManageCategories}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Manage Categories
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
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
            </div>
            <div className="flex gap-2">
              {onManageCategories && (
                <Button variant="outline" size="sm" onClick={onManageCategories}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Manage
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={onCancel}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No part categories available for this service</p>
              {onManageCategories && (
                <Button className="mt-4" onClick={onManageCategories}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Set up Categories
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                Select parts to include in the quotation. You can select entire categories or individual parts.
              </p>

              {categories.map((category) => {
                const categoryParts = getPartsByCategory(category.id)
                const isFullySelected = isCategoryFullySelected(category.id)
                const isPartiallySelected = isCategoryPartiallySelected(category.id)
                
                return (
                  <div 
                    key={category.id}
                    className="border rounded-lg p-4 hover:border-blue-500 transition-colors"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <Checkbox
                        checked={
                          isFullySelected 
                            ? true 
                            : isPartiallySelected 
                              ? "indeterminate" 
                              : false
                        }
                        onCheckedChange={() => toggleCategory(category.id)}
                        className="mt-1"
                      />

                      <div className="flex-1">
                        <label 
                          htmlFor={category.id}
                          className="font-medium cursor-pointer block"
                        >
                          {category.name}
                        </label>
                        <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary">
                            {categoryParts.length} part{categoryParts.length !== 1 ? 's' : ''}
                          </Badge>
                          {(isFullySelected || isPartiallySelected) && (
                            <Badge variant="default">
                              {categoryParts.filter(p => selectedParts.has(p.id)).length} selected
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {categoryParts.length > 0 && (
                      <div className="ml-8 space-y-2">
                        {categoryParts.map((part) => (
                          <div 
                            key={part.id}
                            className="flex items-center gap-3 p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                          >
                            <Checkbox
                              id={part.id}
                              checked={selectedParts.has(part.id)}
                              onCheckedChange={() => togglePart(part.id, category.id)}
                            />
                            <div className="flex-1">
                              <label 
                                htmlFor={part.id}
                                className="cursor-pointer block font-medium text-sm"
                              >
                                {part.name}
                              </label>
                              <div className="flex items-center gap-4 text-xs text-gray-600 mt-1">
                                <span>Qty: {part.stock}</span>
                                <span className="font-medium">{formatVND(part.price)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>

        <div className="border-t p-6 bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm text-gray-600">
                Selected: {selectedCategories.size} categor{selectedCategories.size !== 1 ? 'ies' : 'y'}, {selectedParts.size} part{selectedParts.size !== 1 ? 's' : ''}
              </div>
              <div className="text-lg font-bold mt-1">
                Total: {formatVND(getTotalPrice())}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button 
                onClick={handleConfirm}
                disabled={selectedParts.size === 0}
              >
                Add to Quotation
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}