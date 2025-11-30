// src/app/manager/components/Quote/ServiceTreeNavigator.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronRight, Folder, Wrench, Loader2, Home } from "lucide-react"
import { 
  quotationTreeService, 
  type ServiceCategory, 
  type ServiceItem,
  type BreadcrumbItem 
} from "@/services/manager/quotation-tree-service"

interface ServiceTreeNavigatorProps {
  onServiceSelect: (serviceId: string, serviceName: string, price: number) => void
}

export function ServiceTreeNavigator({ onServiceSelect }: ServiceTreeNavigatorProps) {
  const [currentCategoryId, setCurrentCategoryId] = useState<string | null>(null)
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [services, setServices] = useState<ServiceItem[]>([])
  const [breadcrumb, setBreadcrumb] = useState<BreadcrumbItem[]>([])
  const [loading, setLoading] = useState(true)

  // Load root on mount
  useEffect(() => {
    loadRoot()
  }, [])

  const loadRoot = async () => {
    try {
      setLoading(true)
      const data = await quotationTreeService.getRoot()
      setCategories(data.childCategories)
      setServices(data.services)
      setBreadcrumb(data.breadcrumb.items)
      setCurrentCategoryId(null)
    } catch (error) {
      console.error("Failed to load root:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadCategory = async (categoryId: string) => {
    try {
      setLoading(true)
      const data = await quotationTreeService.getCategory(categoryId)
      setCategories(data.childCategories)
      setServices(data.services)
      setBreadcrumb(data.breadcrumb.items)
      setCurrentCategoryId(categoryId)
    } catch (error) {
      console.error(`Failed to load category ${categoryId}:`, error)
    } finally {
      setLoading(false)
    }
  }

  const handleBreadcrumbClick = (categoryId: string | null) => {
    if (categoryId === null) {
      loadRoot()
    } else {
      loadCategory(categoryId)
    }
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg">Browse Services</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-4 text-sm text-gray-600 flex-wrap">
          {breadcrumb.map((item, index) => (
            <div key={item.categoryId || 'root'} className="flex items-center gap-2">
              {index > 0 && <ChevronRight className="w-4 h-4" />}
              <button
                onClick={() => handleBreadcrumbClick(item.categoryId)}
                className="hover:text-blue-600 hover:underline flex items-center gap-1"
              >
                {index === 0 && <Home className="w-4 h-4" />}
                {item.categoryName}
              </button>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="space-y-2">
            {/* Categories */}
            {categories.map((category) => (
              <button
                key={category.serviceCategoryId}
                onClick={() => loadCategory(category.serviceCategoryId)}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
              >
                <Folder className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <span className="font-medium">{category.categoryName}</span>
                <ChevronRight className="w-4 h-4 ml-auto text-gray-400" />
              </button>
            ))}

            {/* Services */}
            {services.map((service) => (
              <button
                key={service.serviceId}
                onClick={() => onServiceSelect(service.serviceId, service.serviceName, service.price)}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-green-500 hover:bg-green-50 transition-colors text-left"
              >
                <Wrench className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-medium">{service.serviceName}</div>
                  <div className="text-sm text-gray-600">${service.price.toFixed(2)}</div>
                </div>
              </button>
            ))}

            {categories.length === 0 && services.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No categories or services found
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
