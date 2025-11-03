// src/app/manager/components/Quote/ServicesTree.tsx
"use client"

import type React from "react"
import { ChevronDown, ChevronRight, Lock } from "lucide-react"
import { Card } from "@/components/ui/card"
import { SERVICE_CATEGORIES } from "./constants"
import { ServiceCategory } from "./types"

interface ServicesTreeProps {
  expandedCategories: Set<string>
  selectedServices: Set<string>
  requiredServices?: Set<string> // Add required services prop
  onToggleCategory: (categoryId: string) => void
  onToggleService: (serviceId: string) => void
  onToggleRequiredService?: (serviceId: string) => void // Add toggle required service prop
  serviceCategories?: ServiceCategory[]
  loadingCategories?: boolean
}

export function ServicesTree({
  expandedCategories,
  selectedServices,
  requiredServices = new Set(), // Default to empty set
  onToggleCategory,
  onToggleService,
  onToggleRequiredService, // Destructure the new prop
  serviceCategories = SERVICE_CATEGORIES,
  loadingCategories = false
}: ServicesTreeProps) {
  const renderCategoryTree = (categories: ServiceCategory[], level = 0) => {
    if (loadingCategories) {
      return (
        <div className="py-4 text-center">
          <p className="text-sm text-muted-foreground">Loading service categories...</p>
        </div>
      )
    }

    return categories.map((category) => (
      <div key={category.id}>
        <div className="flex items-center gap-2 py-2">
          {category.children && category.children.length > 0 ? (
            <button
              type="button"
              onClick={() => onToggleCategory(category.id)}
              className="p-0 hover:bg-muted rounded transition-colors"
            >
              {expandedCategories.has(category.id) ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          ) : (
            <div className="w-4" />
          )}
          {category.children && category.children.length > 0 ? (
            <span className="font-medium text-sm">{category.name}</span>
          ) : (
            <div className="flex items-center gap-2 flex-1">
              <input
                type="checkbox"
                id={category.id}
                checked={selectedServices.has(category.id)}
                onChange={() => onToggleService(category.id)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                disabled={requiredServices.has(category.id)} // Disable if required
              />
              <label htmlFor={category.id} className="text-sm cursor-pointer flex-1">
                {category.name}
                {requiredServices.has(category.id) && (
                  <Lock className="w-3 h-3 inline-block ml-1 text-red-500" />
                )}
              </label>
              {onToggleRequiredService && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleRequiredService(category.id);
                  }}
                  className={`p-1 rounded text-xs ${
                    requiredServices.has(category.id)
                      ? "bg-red-100 text-red-600"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  title={requiredServices.has(category.id) ? "Remove required flag" : "Mark as required"}
                >
                  Required
                </button>
              )}
            </div>
          )}
        </div>
        {category.children && expandedCategories.has(category.id) && (
          <div className="ml-4 border-l border-border">{renderCategoryTree(category.children, level + 1)}</div>
        )}
      </div>
    ))
  }

  return (
    <Card className="lg:col-span-1 p-6 h-fit max-h-[calc(100vh-200px)] overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Select Services</h2>
      </div>
      <div className="space-y-1">{renderCategoryTree(serviceCategories)}</div>
      {selectedServices.size > 0 && (
        <div className="mt-6 pt-4 border-t border-border">
          <p className="text-sm font-medium mb-2">Selected: {selectedServices.size}</p>
          <div className="flex flex-wrap gap-2">
            {Array.from(selectedServices).map((serviceId) => {
              // Find the service name
              let serviceName = "";
              for (const category of serviceCategories) {
                if (category.children) {
                  const service = category.children.find((s) => s.id === serviceId);
                  if (service) {
                    serviceName = service.name;
                    break;
                  }
                }
              }
              return (
                <div key={serviceId} className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded flex items-center">
                  {serviceName || serviceId}
                  {requiredServices.has(serviceId) && (
                    <Lock className="w-3 h-3 ml-1" />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </Card>
  )
}