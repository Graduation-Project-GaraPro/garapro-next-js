"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronDown, ChevronRight, Star, Plus, X } from "lucide-react"

interface ServiceCategory {
  id: string
  name: string
  price?: number
  children?: ServiceCategory[]
}

interface CustomItem {
  id: string
  name: string
  price: number
  recommended: boolean
}

interface ServiceItem {
  id: string
  name: string
  price: number
}

const SERVICE_ITEMS: Record<string, ServiceItem[]> = {
  "ui-design": [
    { id: "wireframes", name: "Wireframes", price: 500 },
    { id: "prototypes", name: "Interactive Prototypes", price: 800 },
    { id: "design-system", name: "Design System", price: 1200 },
    { id: "user-testing", name: "User Testing", price: 600 },
  ],
  "graphic-design": [
    { id: "logo", name: "Logo Design", price: 400 },
    { id: "brochure", name: "Brochure Design", price: 300 },
    { id: "packaging", name: "Packaging Design", price: 600 },
    { id: "illustrations", name: "Custom Illustrations", price: 500 },
  ],
  branding: [
    { id: "brand-guide", name: "Brand Guidelines", price: 800 },
    { id: "color-palette", name: "Color Palette Development", price: 400 },
    { id: "typography", name: "Typography Selection", price: 300 },
    { id: "brand-voice", name: "Brand Voice & Messaging", price: 600 },
  ],
  "web-design": [
    { id: "responsive", name: "Responsive Design", price: 600 },
    { id: "animations", name: "Animations & Interactions", price: 500 },
    { id: "accessibility", name: "Accessibility Audit", price: 400 },
    { id: "performance", name: "Performance Optimization", price: 450 },
  ],
  frontend: [
    { id: "react-setup", name: "React Setup & Architecture", price: 800 },
    { id: "components", name: "Component Library", price: 1200 },
    { id: "state-mgmt", name: "State Management", price: 600 },
    { id: "testing", name: "Unit Testing", price: 700 },
  ],
  backend: [
    { id: "api-design", name: "API Design & Documentation", price: 900 },
    { id: "database", name: "Database Design", price: 1000 },
    { id: "auth", name: "Authentication & Authorization", price: 800 },
    { id: "deployment", name: "Deployment Setup", price: 600 },
  ],
  fullstack: [
    { id: "architecture", name: "Full Stack Architecture", price: 1500 },
    { id: "integration", name: "Frontend-Backend Integration", price: 1200 },
    { id: "devops", name: "DevOps Setup", price: 1000 },
    { id: "monitoring", name: "Monitoring & Logging", price: 800 },
  ],
  mobile: [
    { id: "ios", name: "iOS Development", price: 2000 },
    { id: "android", name: "Android Development", price: 2000 },
    { id: "cross-platform", name: "Cross-Platform Setup", price: 1500 },
    { id: "app-store", name: "App Store Deployment", price: 500 },
  ],
  seo: [
    { id: "audit", name: "SEO Audit", price: 300 },
    { id: "keywords", name: "Keyword Research", price: 400 },
    { id: "on-page", name: "On-Page Optimization", price: 500 },
    { id: "link-building", name: "Link Building Strategy", price: 600 },
  ],
  "social-media": [
    { id: "strategy", name: "Social Media Strategy", price: 400 },
    { id: "content-calendar", name: "Content Calendar", price: 300 },
    { id: "graphics", name: "Social Graphics", price: 500 },
    { id: "community", name: "Community Management", price: 600 },
  ],
  content: [
    { id: "blog-posts", name: "Blog Posts (5)", price: 600 },
    { id: "whitepapers", name: "Whitepapers", price: 800 },
    { id: "case-studies", name: "Case Studies", price: 700 },
    { id: "video-scripts", name: "Video Scripts", price: 500 },
  ],
  ppc: [
    { id: "campaign-setup", name: "Campaign Setup", price: 500 },
    { id: "ad-copy", name: "Ad Copy Writing", price: 300 },
    { id: "landing-pages", name: "Landing Pages", price: 600 },
    { id: "optimization", name: "Campaign Optimization", price: 400 },
  ],
  strategy: [
    { id: "market-analysis", name: "Market Analysis", price: 800 },
    { id: "roadmap", name: "Strategy Roadmap", price: 1000 },
    { id: "competitive", name: "Competitive Analysis", price: 600 },
    { id: "implementation", name: "Implementation Plan", price: 700 },
  ],
  "tech-consulting": [
    { id: "tech-stack", name: "Tech Stack Selection", price: 900 },
    { id: "architecture-review", name: "Architecture Review", price: 1000 },
    { id: "migration", name: "Migration Planning", price: 800 },
    { id: "security", name: "Security Assessment", price: 1200 },
  ],
  business: [
    { id: "process-improvement", name: "Process Improvement", price: 700 },
    { id: "org-structure", name: "Organizational Structure", price: 800 },
    { id: "training", name: "Team Training", price: 600 },
    { id: "kpi", name: "KPI Development", price: 500 },
  ],
}

const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: "design",
    name: "Design Services",
    children: [
      { id: "ui-design", name: "UI/UX Design", price: 2500 },
      { id: "graphic-design", name: "Graphic Design", price: 1500 },
      { id: "branding", name: "Branding", price: 3000 },
      { id: "web-design", name: "Web Design", price: 2000 },
    ],
  },
  {
    id: "development",
    name: "Development Services",
    children: [
      { id: "frontend", name: "Frontend Development", price: 3500 },
      { id: "backend", name: "Backend Development", price: 4000 },
      { id: "fullstack", name: "Full Stack Development", price: 6000 },
      { id: "mobile", name: "Mobile Development", price: 5000 },
    ],
  },
  {
    id: "marketing",
    name: "Marketing Services",
    children: [
      { id: "seo", name: "SEO Optimization", price: 1200 },
      { id: "social-media", name: "Social Media Marketing", price: 1500 },
      { id: "content", name: "Content Marketing", price: 1800 },
      { id: "ppc", name: "PPC Advertising", price: 2000 },
    ],
  },
  {
    id: "consulting",
    name: "Consulting Services",
    children: [
      { id: "strategy", name: "Strategy Consulting", price: 2500 },
      { id: "tech-consulting", name: "Technology Consulting", price: 3000 },
      { id: "business", name: "Business Consulting", price: 2800 },
    ],
  },
]

interface ItemSelectionModalProps {
  serviceId: string
  serviceName: string
  items: ServiceItem[]
  onSelect: (item: ServiceItem) => void
  onClose: () => void
}

function ItemSelectionModal({ serviceId, serviceName, items, onSelect, onClose }: ItemSelectionModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Select Items for {serviceName}</h3>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onSelect(item)
                onClose()
              }}
              className="w-full text-left p-3 border border-border rounded hover:bg-muted transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{item.name}</span>
                <span className="text-sm font-semibold text-primary">${item.price.toLocaleString()}</span>
              </div>
            </button>
          ))}
        </div>

        <Button variant="outline" onClick={onClose} className="w-full mt-4 bg-transparent">
          Close
        </Button>
      </Card>
    </div>
  )
}

export function CreateQuotePage() {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(["design", "development"]))
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set())
  const [recommendedServices, setRecommendedServices] = useState<Set<string>>(new Set())
  const [customItems, setCustomItems] = useState<Record<string, CustomItem[]>>({})
  const [itemModalOpen, setItemModalOpen] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    dateCreated: new Date().toISOString().split("T")[0],
    customerName: "",
    customerPhone: "",
    validUntil: "",
  })

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  const toggleService = (serviceId: string) => {
    const newSelected = new Set(selectedServices)
    if (newSelected.has(serviceId)) {
      newSelected.delete(serviceId)
      const newCustomItems = { ...customItems }
      delete newCustomItems[serviceId]
      setCustomItems(newCustomItems)
    } else {
      newSelected.add(serviceId)
    }
    setSelectedServices(newSelected)
  }

  const toggleRecommendation = (serviceId: string) => {
    const newRecommended = new Set(recommendedServices)
    if (newRecommended.has(serviceId)) {
      newRecommended.delete(serviceId)
    } else {
      newRecommended.add(serviceId)
    }
    setRecommendedServices(newRecommended)
  }

  const addCustomItem = (serviceId: string, item: ServiceItem) => {
    const newItem: CustomItem = {
      id: `${serviceId}-${Date.now()}`,
      name: item.name,
      price: item.price,
      recommended: false,
    }

    setCustomItems((prev) => ({
      ...prev,
      [serviceId]: [...(prev[serviceId] || []), newItem],
    }))
  }

  const toggleItemRecommendation = (serviceId: string, itemId: string) => {
    setCustomItems((prev) => ({
      ...prev,
      [serviceId]: prev[serviceId].map((item) =>
        item.id === itemId ? { ...item, recommended: !item.recommended } : item,
      ),
    }))
  }

  const removeCustomItem = (serviceId: string, itemId: string) => {
    setCustomItems((prev) => ({
      ...prev,
      [serviceId]: prev[serviceId].filter((item) => item.id !== itemId),
    }))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const getServiceById = (serviceId: string) => {
    for (const category of SERVICE_CATEGORIES) {
      if (category.children) {
        const service = category.children.find((s) => s.id === serviceId)
        if (service) return service
      }
    }
    return null
  }

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log({
      ...formData,
      selectedServices: Array.from(selectedServices),
      recommendedServices: Array.from(recommendedServices),
      customItems,
      totalPrice: calculateTotal(),
    })
    alert("Quote request submitted!")
  }

  const renderCategoryTree = (categories: ServiceCategory[], level = 0) => {
    return categories.map((category) => (
      <div key={category.id}>
        <div className="flex items-center gap-2 py-2">
          {category.children && category.children.length > 0 ? (
            <button
              onClick={() => toggleCategory(category.id)}
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
              <Checkbox
                id={category.id}
                checked={selectedServices.has(category.id)}
                onCheckedChange={() => toggleService(category.id)}
              />
              <label htmlFor={category.id} className="text-sm cursor-pointer flex-1">
                {category.name}
              </label>
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
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Create a Quote</h1>
          <p className="text-muted-foreground">Select the services you need and provide your project details</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Services Tree */}
          <Card className="lg:col-span-1 p-6 h-fit">
            <h2 className="text-lg font-semibold mb-4">Select Services</h2>
            <div className="space-y-1">{renderCategoryTree(SERVICE_CATEGORIES)}</div>
            {selectedServices.size > 0 && (
              <div className="mt-6 pt-4 border-t border-border">
                <p className="text-sm font-medium mb-2">Selected: {selectedServices.size}</p>
                <div className="flex flex-wrap gap-2">
                  {Array.from(selectedServices).map((serviceId) => {
                    const service = getServiceById(serviceId)
                    return (
                      <div key={serviceId} className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                        {service?.name}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </Card>

          <Card className="lg:col-span-2 p-6">
            <div className="space-y-6">
              {/* Quote Info Section - Read Only */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Quote Information</h3>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Date Created</Label>
                    <div className="mt-2 p-2 bg-muted rounded text-sm">{formData.dateCreated}</div>
                  </div>

                  <div>
                    <Label htmlFor="customerName" className="text-sm font-medium">
                      Customer Name
                    </Label>
                    <Input
                      id="customerName"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleInputChange}
                      placeholder="Enter customer name"
                      className="mt-2"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="customerPhone" className="text-sm font-medium">
                      Customer Phone
                    </Label>
                    <Input
                      id="customerPhone"
                      name="customerPhone"
                      type="tel"
                      value={formData.customerPhone}
                      onChange={handleInputChange}
                      placeholder="Enter phone number"
                      className="mt-2"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="validUntil" className="text-sm font-medium">
                      Valid Until
                    </Label>
                    <Input
                      id="validUntil"
                      name="validUntil"
                      type="date"
                      value={formData.validUntil}
                      onChange={handleInputChange}
                      className="mt-2"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <h3 className="text-lg font-semibold mb-4">Quotation Summary</h3>

                {selectedServices.size > 0 ? (
                  <div className="space-y-4">
                    {/* Services List with Recommendation and Custom Items */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-muted-foreground">Services & Recommendations</h4>
                      {Array.from(selectedServices).map((serviceId) => {
                        const service = getServiceById(serviceId)
                        const isRecommended = recommendedServices.has(serviceId)
                        const serviceCustomItems = customItems[serviceId] || []

                        return (
                          <div key={serviceId} className="border border-border rounded-md p-3 space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <p className="text-sm font-medium">{service?.name}</p>
                                <p className="text-xs text-muted-foreground">${service?.price?.toLocaleString()}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => toggleRecommendation(serviceId)}
                                className={`p-2 rounded transition-colors ${
                                  isRecommended
                                    ? "bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
                                    : "bg-background text-muted-foreground hover:bg-muted"
                                }`}
                                title="Recommend to customer"
                              >
                                <Star className="w-4 h-4" fill={isRecommended ? "currentColor" : "none"} />
                              </button>
                            </div>

                            {/* Custom Items for this Service */}
                            {serviceCustomItems.length > 0 && (
                              <div className="bg-muted/50 rounded p-2 space-y-2">
                                <p className="text-xs font-medium text-muted-foreground">Items</p>
                                {serviceCustomItems.map((item) => (
                                  <div key={item.id} className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2 flex-1">
                                      <span>{item.name}</span>
                                      {item.recommended && <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">${item.price.toLocaleString()}</span>
                                      <button
                                        type="button"
                                        onClick={() => toggleItemRecommendation(serviceId, item.id)}
                                        className={`p-1 rounded transition-colors ${
                                          item.recommended
                                            ? "bg-yellow-100 text-yellow-600"
                                            : "bg-background text-muted-foreground hover:bg-muted"
                                        }`}
                                        title="Recommend item"
                                      >
                                        <Star className="w-3 h-3" fill={item.recommended ? "currentColor" : "none"} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => removeCustomItem(serviceId, item.id)}
                                        className="p-1 hover:bg-background rounded transition-colors"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Add Custom Item Button */}
                            <button
                              type="button"
                              onClick={() => setItemModalOpen(serviceId)}
                              className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                              Add item
                            </button>
                          </div>
                        )
                      })}
                    </div>

                    {/* Recommended Services Summary */}
                    {recommendedServices.size > 0 && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                        <p className="text-sm font-medium text-yellow-900 mb-2">
                          Recommended Services ({recommendedServices.size})
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {Array.from(recommendedServices).map((serviceId) => {
                            const service = getServiceById(serviceId)
                            return (
                              <div
                                key={serviceId}
                                className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded flex items-center gap-1"
                              >
                                <Star className="w-3 h-3 fill-current" />
                                {service?.name}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Recommended Items Summary */}
                    {Object.values(customItems).some((items) => items.some((item) => item.recommended)) && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <p className="text-sm font-medium text-blue-900 mb-2">Recommended Items</p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(customItems).map(([serviceId, items]) =>
                            items
                              .filter((item) => item.recommended)
                              .map((item) => (
                                <div
                                  key={item.id}
                                  className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded flex items-center gap-1"
                                >
                                  <Star className="w-3 h-3 fill-current" />
                                  {item.name}
                                </div>
                              )),
                          )}
                        </div>
                      </div>
                    )}

                    {/* Price Summary */}
                    <div className="bg-primary/10 p-4 rounded-md border border-primary/20">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">
                          Subtotal ({selectedServices.size} services
                          {Object.values(customItems).flat().length > 0 &&
                            ` + ${Object.values(customItems).flat().length} items`}
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
                ) : (
                  <div className="p-4 bg-muted rounded-md text-center">
                    <p className="text-sm text-muted-foreground">Select services to see quotation summary</p>
                  </div>
                )}
              </div>

              <Button
                onClick={handleSubmit}
                disabled={
                  selectedServices.size === 0 ||
                  !formData.customerName ||
                  !formData.customerPhone ||
                  !formData.validUntil
                }
                className="w-full"
              >
                Submit Quote Request
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {itemModalOpen && (
        <ItemSelectionModal
          serviceId={itemModalOpen}
          serviceName={getServiceById(itemModalOpen)?.name || ""}
          items={SERVICE_ITEMS[itemModalOpen] || []}
          onSelect={(item) => addCustomItem(itemModalOpen, item)}
          onClose={() => setItemModalOpen(null)}
        />
      )}
    </div>
  )
}
