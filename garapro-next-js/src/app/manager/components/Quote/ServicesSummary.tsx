// src/app/manager/components/Quote/ServicesSummary.tsx
"use client"

import type React from "react"
import { Plus, X, Lock } from "lucide-react"
import { SERVICE_CATEGORIES } from "./constants"
import { CustomItem, ServiceCategory } from "./types"

interface ServicesSummaryProps {
  selectedServices: Set<string>
  requiredServices?: Set<string> // Add required services prop
  customItems: Record<string, CustomItem[]>
  onRemoveCustomItem: (serviceId: string, itemId: string) => void
  onAddParts?: (serviceId: string) => void // Add this prop
  serviceCategories?: ServiceCategory[] // Add this prop to receive dynamic categories
}

export function ServicesSummary({
  selectedServices,
  requiredServices = new Set(), // Default to empty set
  customItems,
  onRemoveCustomItem,
  onAddParts, // Destructure the new prop
  serviceCategories = SERVICE_CATEGORIES // Default to constants if not provided
}: ServicesSummaryProps) {
  // Helper function to get service by ID from dynamic categories
  const getServiceById = (serviceId: string) => {
    for (const category of serviceCategories) {
      if (category.children) {
        const service = category.children.find((s) => s.id === serviceId)
        if (service) return service
      }
    }
    return null
  }

  // Calculate total
  const calculateTotal = () => {
    let total = 0
    Array.from(selectedServices).forEach((serviceId) => {
      const service = getServiceById(serviceId)
      total += service?.price || 0
    })
    Object.values(customItems).forEach((items) => {
      items.forEach((item) => {
        total += item.price
      })
    })
    return total
  }

  if (selectedServices.size === 0) {
    return (
      <div className="p-4 bg-muted rounded-md text-center">
        <p className="text-sm text-muted-foreground">Select services to see quotation summary</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Services List with Custom Items */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-muted-foreground">Services & Parts</h4>
        {Array.from(selectedServices).map((serviceId) => {
          const service = getServiceById(serviceId)
          const serviceCustomItems = customItems[serviceId] || []
          const isRequired = requiredServices.has(serviceId)

          return (
            <div key={serviceId} className="border border-border rounded-md p-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium flex items-center">
                    {service?.name}
                    {isRequired && (
                      <Lock className="w-3 h-3 ml-1 text-red-500" />
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">${service?.price?.toLocaleString()}</p>
                </div>
                {isRequired && (
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                    Required
                  </span>
                )}
              </div>

              {/* Custom Items for this Service */}
              {serviceCustomItems.length > 0 && (
                <div className="bg-muted/50 rounded p-2 space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Parts</p>
                  {serviceCustomItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 flex-1">
                        <span>{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">${item.price.toLocaleString()}</span>
                        <button
                          type="button"
                          onClick={() => onRemoveCustomItem(serviceId, item.id)}
                          className="p-1 hover:bg-background rounded transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Parts Button */}
              {onAddParts && (
                <button
                  type="button"
                  onClick={() => onAddParts(serviceId)}
                  className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  Add parts
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Removed Recommended Items Summary */}

      {/* Price Summary */}
      <div className="bg-primary/10 p-4 rounded-md border border-primary/20">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">
            Subtotal ({selectedServices.size} services
            {Object.values(customItems).flat().length > 0 &&
              ` + ${Object.values(customItems).flat().length} parts`}
            )
          </span>
          <span className="text-sm font-semibold">${calculateTotal().toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-primary/20">
          <span className="font-semibold">Total Quote</span>
          <span className="text-lg font-bold text-primary">${calculateTotal().toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}