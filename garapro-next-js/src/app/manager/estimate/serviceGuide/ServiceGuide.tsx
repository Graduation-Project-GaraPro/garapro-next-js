"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Search,
  Clock,
  DollarSign,
  Filter,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Plus,
  Minus,
  ShoppingCart,
  ArrowRight,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LABOR_RATES_STORAGE_KEY, type LaborRate } from "@/app/manager/garageSetting/ro-settings/tabs/labor-rates-tab"
import { Separator } from "@/components/ui/separator"

// Define TypeScript interfaces based on API response
interface ServicePart {
  partId: string
  name: string
  price: number
  stock: number
}

interface Service {
  serviceId: string
  serviceName: string
  description: string
  price: number
  estimatedDuration: number
  isAdvanced: boolean
  parts: ServicePart[]
}

interface ServiceCategory {
  serviceCategoryId: string
  categoryName: string
  description: string
  services: Service[]
}

interface SelectedService {
  id: string
  serviceName: string
  estimatedDuration: number
  price: number
  parts: ServicePart[]
}

export default function ServiceGuide({ onClose, onSave }: { onClose?: () => void; onSave?: (services: SelectedService[]) => void }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([])
  const [rates, setRates] = useState<LaborRate[]>([])
  const [selectedRateId, setSelectedRateId] = useState<string>("")
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch service categories from API
  useEffect(() => {
    const fetchServiceCategories = async () => {
      try {
        setLoading(true)
        const response = await fetch('http://localhost:5117/api/ServiceCategories', {
          headers: {
            'accept': 'application/json;odata.metadata=minimal;odata.streaming=true',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5NDJhNzUyMC00YjMyLTQxMTgtOGExNy1hMDc4MDNkMDMxNWIiLCJqdGkiOiI0OGMxNGMxMi0wY2JkLTRmODctYWZkMy1lNzM1N2M5YzYzNTIiLCJlbWFpbCI6IjA5MDAwMDAwMDJAbXlhcHAuY29tIiwibmFtZWlkIjoiOTQyYTc1MjAtNGIzMi00MTE4LThhMTctYTA3ODAzZDAzMTViIiwidW5pcXVlX25hbWUiOiIwOTAwMDAwMDAyIiwiRmlyc3ROYW1lIjoiU3lzdGVtIiwiTGFzdE5hbWUiOiJNYW5hZ2VyIiwiTGFzdExvZ2luIjoiMTAvMjUvMjAyNSA3OjM0OjI2IEFNIiwicm9sZSI6Ik1hbmFnZXIiLCJuYmYiOjE3NjEzNzc2NjYsImV4cCI6MTc2MTM5NzQ2NiwiaWF0IjoxNzYxMzc3NjY2LCJpc3MiOiJNeUF1dGhBcHAiLCJhdWQiOiJNeUF1dGhBcHBVc2VycyJ9.eYOxVk2D9L17rNc3_Ib9Cy0ph-6Fm19uNpxoDjq1VBQ'
          }
        })
        
        if (!response.ok) {
          throw new Error(`Failed to fetch service categories: ${response.status}`)
        }
        
        const data = await response.json()
        setServiceCategories(data)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching service categories:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch service categories")
        setLoading(false)
      }
    }

    fetchServiceCategories()
  }, [])

  const filteredCategories = useMemo(() => {
    return serviceCategories.filter((category) => {
      const matchesSearch = 
        category.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.services.some(
          (service) =>
            service.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            service.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
      const matchesCategory = selectedCategory === "All" || category.categoryName === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [serviceCategories, searchTerm, selectedCategory])

  // Load labor rates from RO Settings
  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(LABOR_RATES_STORAGE_KEY) : null
      if (raw) {
        const parsed = JSON.parse(raw) as LaborRate[]
        setRates(parsed)
        if (parsed[0]) setSelectedRateId(parsed[0].id)
      }
    } catch (e) {
      console.error("Failed to load labor rates", e)
    }
  }, [])

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  const addService = (service: Service) => {
    const newService: SelectedService = {
      id: service.serviceId,
      serviceName: service.serviceName,
      estimatedDuration: service.estimatedDuration,
      price: service.price,
      parts: service.parts,
    }
    setSelectedServices((prev) => [...prev, newService])
  }

  const removeService = (serviceId: string) => {
    setSelectedServices((prev) => prev.filter((service) => service.id !== serviceId))
  }

  const isServiceSelected = (serviceId: string) => {
    return selectedServices.some((service) => service.id === serviceId)
  }

  const totalHours = selectedServices.reduce((sum, service) => sum + service.estimatedDuration, 0)
  const activeRate = rates.find((r) => r.id === selectedRateId)?.rate ?? 0
  const totalCost = selectedServices.reduce((sum, service) => sum + service.estimatedDuration * activeRate, 0)

  const categories = ["All", ...serviceCategories.map(cat => cat.categoryName)]

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p>Loading services...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-red-500">Error: {error}</p>
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div className="border-b bg-[#154c79] text-white shadow-lg">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 ">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">John Smith 2018 Honda Civic</h1>
                <p className="text-white/80 text-xs sm:text-sm">Order #12345 - Service Builder</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                onClick={() => {
                  if (onClose) {
                    onClose()
                    return
                  }
                  const returnUrl = searchParams?.get("return")
                  if (returnUrl) {
                    router.push(returnUrl)
                  } else {
                    router.back()
                  }
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="border-b bg-muted/30 px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search Services"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedRateId} onValueChange={setSelectedRateId}>
            <SelectTrigger className="w-full sm:w-48">
              <DollarSign className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Labor Rate" />
            </SelectTrigger>
            <SelectContent>
              {rates.map((r) => (
                <SelectItem key={r.id} value={r.id}>{r.name} - ${r.rate}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex gap-4 p-3 sm:p-4 overflow-hidden">
          <div className="flex-[7] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Service Categories ({filteredCategories.length})</h2>
              <Button variant="outline" size="sm">
                Export List
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
              {filteredCategories.length === 0 ? (
                <Card>
                  <CardContent className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No services found matching your criteria</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {filteredCategories.map((category) => (
                    <Card key={category.serviceCategoryId} className="overflow-hidden">
                      <CardContent className="p-0">
                        <div
                          className="p-4 cursor-pointer hover:bg-accent/50 transition-colors border-b"
                          onClick={() => toggleCategory(category.serviceCategoryId)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {expandedCategories.has(category.serviceCategoryId) ? (
                                <ChevronDown className="h-5 w-5 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                              )}
                              <div>
                                <h3 className="font-semibold text-foreground">{category.categoryName}</h3>
                                <p className="text-sm text-muted-foreground">{category.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">{category.categoryName}</Badge>
                              <Badge variant="outline">{category.services.length} services</Badge>
                            </div>
                          </div>
                        </div>

                        {expandedCategories.has(category.serviceCategoryId) && (
                          <div className="bg-muted/30">
                            {category.services.map((service) => (
                              <div
                                key={service.serviceId}
                                className="p-4 border-b last:border-b-0 hover:bg-accent/30 transition-colors"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <h4 className="font-medium text-foreground">{service.serviceName}</h4>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-3">{service.description}</p>
                                    <div className="flex items-center gap-4 text-sm">
                                      <div className="flex items-center gap-1">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        <span>{service.estimatedDuration} hrs</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                                        <span>${service.price}</span>
                                      </div>
                                      <div className="text-muted-foreground">Parts: {service.parts.length}</div>
                                    </div>
                                  </div>
                                  <div className="ml-4">
                                    {isServiceSelected(service.serviceId) ? (
                                      <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => removeService(service.serviceId)}
                                        className="flex items-center gap-1"
                                      >
                                        <Minus className="h-4 w-4" />
                                        Remove
                                      </Button>
                                    ) : (
                                      <Button
                                        variant="default"
                                        size="sm"
                                        onClick={() => addService(service)}
                                        className="flex items-center gap-1"
                                      >
                                        <Plus className="h-4 w-4" />
                                        Add
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </>
              )}
            </div>
          </div>

          <div className="flex-[3] flex flex-col min-h-0">
            <h2 className="text-lg font-semibold mb-4">Service Summary</h2>

            <Card className="flex-1 flex flex-col min-h-0">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-base">
                  <ShoppingCart className="h-5 w-5" />
                  Selected Services
                </CardTitle>
                <CardDescription>
                  {selectedServices.length} service{selectedServices.length !== 1 ? "s" : ""} selected
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col space-y-4 overflow-y-auto">
                {selectedServices.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No services selected</p>
                      <p className="text-sm text-muted-foreground">Add services from the list to see summary</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 space-y-3 pr-2">
                      {selectedServices.map((service) => (
                        <div key={service.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">{service.serviceName}</h4>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                              <span>{service.estimatedDuration} hrs</span>
                              <span>${service.price}</span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeService(service.id)}
                            className="h-8 w-8 p-0 ml-2 flex-shrink-0"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Total Hours</span>
                        </div>
                        <span className="font-semibold">{totalHours.toFixed(1)} hrs</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Total Labor Cost</span>
                        </div>
                        <span className="font-semibold text-lg">${totalCost.toFixed(2)}</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Button className="w-full" disabled={selectedServices.length === 0}>
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Proceed to Parts Selection
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full bg-transparent mb-1"
                        onClick={() => {
                          if (onSave) {
                            // Return services with cost computed using selected rate
                            const servicesWithCost = selectedServices.map((s) => ({
                              ...s,
                              price: s.estimatedDuration * activeRate,
                            }))
                            onSave(servicesWithCost)
                          }
                          if (onClose) {
                            onClose()
                            return
                          }
                          const returnUrl = searchParams?.get("return")
                          if (returnUrl) {
                            router.push(returnUrl)
                          } else {
                            router.back()
                          }
                        }}
                      >
                        Save Estimate
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}