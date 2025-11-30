// src/app/manager/components/Quote/PartCategorySelector.tsx
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Package, X } from "lucide-react"
import { 
  quotationTreeService, 
  type PartCategory,
  type PartItem 
} from "@/services/manager/quotation-tree-service"
import { formatVND } from "@/lib/currency"

interface PartCategorySelectorProps {
  serviceId: string
  serviceName: string
  servicePrice: number
  onConfirm: (selectedPartCategories: string[], allParts: PartItem[]) => void
  onCancel: () => void
}

export function PartCategorySelector({ 
  serviceId, 
  serviceName, 
  servicePrice,
  onConfirm, 
  onCancel 
}: PartCategorySelectorProps) {
  const [partCategories, setPartCategories] = useState<PartCategory[]>([])
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadServiceDetails()
  }, [serviceId])

  const loadServiceDetails = async () => {
    try {
      setLoading(true)
      const data = await quotationTreeService.getServiceDetails(serviceId)
      setPartCategories(data.partCategories)
    } catch (error) {
      console.error("Failed to load service details:", error)
    } finally {
      setLoading(false)
    }
  }

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
    // Collect all parts from selected categories
    const allParts: PartItem[] = []
    partCategories.forEach(category => {
      if (selectedCategories.has(category.partCategoryId)) {
        allParts.push(...category.parts)
      }
    })
    
    onConfirm(Array.from(selectedCategories), allParts)
  }

  const getTotalParts = () => {
    let total = 0
    partCategories.forEach(category => {
      if (selectedCategories.has(category.partCategoryId)) {
        total += category.parts.length
      }
    })
    return total
  }

  const getTotalPrice = () => {
    let total = servicePrice
    partCategories.forEach(category => {
      if (selectedCategories.has(category.partCategoryId)) {
        category.parts.forEach(part => {
          total += part.price
        })
      }
    })
    return total
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl max-h-[80vh] flex flex-col">
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

        <CardContent className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : partCategories.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No part categories available for this service</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                Select part categories to include in the quotation. All parts from selected categories will be added with isSelected: false.
              </p>

              {partCategories.map((category) => (
                <div 
                  key={category.partCategoryId}
                  className="border rounded-lg p-4 hover:border-blue-500 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id={category.partCategoryId}
                      checked={selectedCategories.has(category.partCategoryId)}
                      onCheckedChange={() => toggleCategory(category.partCategoryId)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <label 
                        htmlFor={category.partCategoryId}
                        className="font-medium cursor-pointer block mb-2"
                      >
                        {category.categoryName}
                      </label>
                      <div className="space-y-1">
                        {category.parts.map((part) => (
                          <div 
                            key={part.partId}
                            className="text-sm text-gray-600 flex justify-between items-center py-1 px-2 bg-gray-50 rounded"
                          >
                            <span>{part.partName}</span>
                            <span className="font-medium">{formatVND(part.price)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        {category.parts.length} part{category.parts.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>

        <div className="border-t p-6 bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm text-gray-600">
                Selected: {selectedCategories.size} categor{selectedCategories.size !== 1 ? 'ies' : 'y'}, {getTotalParts()} part{getTotalParts() !== 1 ? 's' : ''}
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
                disabled={selectedCategories.size === 0}
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
