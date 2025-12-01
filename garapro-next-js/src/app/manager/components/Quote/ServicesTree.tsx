// src/app/manager/components/Quote/ServicesTree.tsx
"use client"

import { useState, useEffect } from "react"
import { ChevronRight, Folder, Wrench, Home, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  quotationTreeService, 
  type ServiceCategory as TreeServiceCategory, 
  type ServiceItem,
  type BreadcrumbItem 
} from "@/services/manager/quotation-tree-service"

interface ServicesTreeProps {
  onServiceSelect: (serviceId: string, serviceName: string, price: number) => void
}

export function ServicesTree({ onServiceSelect }: ServicesTreeProps) {
  const [currentCategoryId, setCurrentCategoryId] = useState<string | null>(null)
  const [categories, setCategories] = useState<TreeServiceCategory[]>([])
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
    <Card className="lg:col-span-1 p-6 h-fit max-h-[calc(100vh-200px)] overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Browse Services</h2>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-4 text-sm text-gray-600 flex-wrap pb-4 border-b">
        {breadcrumb.map((item, index) => (
          <div key={item.categoryId || 'root'} className="flex items-center gap-2">
            {index > 0 && <ChevronRight className="w-4 h-4" />}
            <button
              type="button"
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
              type="button"
              onClick={() => loadCategory(category.serviceCategoryId)}
              className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
            >
              <Folder className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <span className="font-medium text-sm">{category.categoryName}</span>
              <ChevronRight className="w-4 h-4 ml-auto text-gray-400" />
            </button>
          ))}

          {/* Services */}
          {services.map((service) => (
            <button
              key={service.serviceId}
              type="button"
              onClick={() => onServiceSelect(service.serviceId, service.serviceName, service.price)}
              className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-green-500 hover:bg-green-50 transition-colors text-left"
            >
              <Wrench className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div className="flex-1">
                <div className="font-medium text-sm">{service.serviceName}</div>
                <div className="text-xs text-gray-600">{new Intl.NumberFormat('vi-VN').format(service.price)}₫</div>
              </div>
            </button>
          ))}

          {categories.length === 0 && services.length === 0 && (
            <div className="text-center py-8 text-gray-500 text-sm">
              No categories or services found
            </div>
          )}
        </div>
      )}
    </Card>
  )
}