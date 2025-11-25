"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Search,
  Clock,
  DollarSign,
  Wrench,
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

interface ChildOperation {
  id: number
  operation: string
  laborHours: number
  description: string
  parts: string[]
  estimatedCost: number
}

interface MainOperation {
  id: number
  mainCategory: string
  category: string
  skillLevel: string
  description: string
  children: ChildOperation[]
}

interface SelectedLabor {
  id: number
  operation: string
  laborHours: number
  estimatedCost: number
  parts: string[]
}

const laborGuideData: MainOperation[] = [
  {
    id: 1,
    mainCategory: "Brake Service",
    category: "Brakes",
    skillLevel: "Intermediate",
    description: "Complete brake system maintenance and repairs",
    children: [
      {
        id: 11,
        operation: "Front Brake Pad Replacement",
        laborHours: 1.5,
        description: "Replace front brake pads and inspect rotors",
        parts: ["Front Brake Pads", "Brake Cleaner"],
        estimatedCost: 120,
      },
      {
        id: 12,
        operation: "Rear Brake Pad Replacement",
        laborHours: 1.2,
        description: "Replace rear brake pads and inspect drums/rotors",
        parts: ["Rear Brake Pads", "Brake Cleaner"],
        estimatedCost: 100,
      },
      {
        id: 13,
        operation: "Brake Rotor Resurfacing",
        laborHours: 2.0,
        description: "Remove and resurface brake rotors",
        parts: ["Brake Cleaner"],
        estimatedCost: 150,
      },
      {
        id: 14,
        operation: "Brake Fluid Flush",
        laborHours: 0.8,
        description: "Complete brake fluid system flush",
        parts: ["Brake Fluid"],
        estimatedCost: 80,
      },
    ],
  },
  {
    id: 2,
    mainCategory: "Engine Maintenance",
    category: "Engine",
    skillLevel: "Intermediate",
    description: "Routine engine maintenance and service",
    children: [
      {
        id: 21,
        operation: "Oil Change (Standard)",
        laborHours: 0.5,
        description: "Standard oil and filter change",
        parts: ["Oil Filter", "Engine Oil (5qt)"],
        estimatedCost: 45,
      },
      {
        id: 22,
        operation: "Oil Change (Synthetic)",
        laborHours: 0.5,
        description: "Synthetic oil and filter change",
        parts: ["Oil Filter", "Synthetic Oil (5qt)"],
        estimatedCost: 65,
      },
      {
        id: 23,
        operation: "Air Filter Replacement",
        laborHours: 0.3,
        description: "Replace engine air filter",
        parts: ["Air Filter"],
        estimatedCost: 25,
      },
      {
        id: 24,
        operation: "Spark Plug Replacement (4-cyl)",
        laborHours: 1.0,
        description: "Replace spark plugs for 4-cylinder engine",
        parts: ["Spark Plugs (4)"],
        estimatedCost: 85,
      },
      {
        id: 25,
        operation: "Spark Plug Replacement (6-cyl)",
        laborHours: 1.5,
        description: "Replace spark plugs for 6-cylinder engine",
        parts: ["Spark Plugs (6)"],
        estimatedCost: 120,
      },
    ],
  },
  {
    id: 3,
    mainCategory: "Transmission Service",
    category: "Transmission",
    skillLevel: "Advanced",
    description: "Transmission maintenance and repair services",
    children: [
      {
        id: 31,
        operation: "Transmission Fluid Change",
        laborHours: 1.5,
        description: "Drain and refill transmission fluid",
        parts: ["Transmission Fluid", "Drain Plug Gasket"],
        estimatedCost: 120,
      },
      {
        id: 32,
        operation: "Transmission Filter Replacement",
        laborHours: 2.5,
        description: "Replace transmission filter and fluid",
        parts: ["Transmission Filter", "Transmission Fluid", "Pan Gasket"],
        estimatedCost: 200,
      },
      {
        id: 33,
        operation: "Transmission Flush",
        laborHours: 2.0,
        description: "Complete transmission system flush",
        parts: ["Transmission Fluid (12qt)"],
        estimatedCost: 180,
      },
    ],
  },
  {
    id: 4,
    mainCategory: "Electrical System",
    category: "Electrical",
    skillLevel: "Advanced",
    description: "Electrical system diagnostics and repairs",
    children: [
      {
        id: 41,
        operation: "Battery Replacement",
        laborHours: 0.5,
        description: "Replace car battery and test charging system",
        parts: ["Battery"],
        estimatedCost: 40,
      },
      {
        id: 42,
        operation: "Alternator Replacement",
        laborHours: 2.5,
        description: "Remove and replace alternator",
        parts: ["Alternator", "Belt"],
        estimatedCost: 220,
      },
      {
        id: 43,
        operation: "Starter Replacement",
        laborHours: 2.0,
        description: "Remove and replace starter motor",
        parts: ["Starter Motor"],
        estimatedCost: 180,
      },
    ],
  },
]

const categories = ["All", "Brakes", "Engine", "Transmission", "Electrical"]
const skillLevels = ["All", "Basic", "Intermediate", "Advanced"]

export default function LaborGuide({ onClose, onSave }: { onClose?: () => void; onSave?: (labors: SelectedLabor[]) => void }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedSkillLevel, setSelectedSkillLevel] = useState("All")
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set())
  const [selectedLabors, setSelectedLabors] = useState<SelectedLabor[]>([])
  const [rates, setRates] = useState<LaborRate[]>([])
  const [selectedRateId, setSelectedRateId] = useState<string>("")

  const filteredOperations = useMemo(() => {
    return laborGuideData.filter((operation) => {
      const matchesSearch =
        operation.mainCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
        operation.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        operation.children.some(
          (child) =>
            child.operation.toLowerCase().includes(searchTerm.toLowerCase()) ||
            child.description.toLowerCase().includes(searchTerm.toLowerCase()),
        )
      const matchesCategory = selectedCategory === "All" || operation.category === selectedCategory
      const matchesSkillLevel = selectedSkillLevel === "All" || operation.skillLevel === selectedSkillLevel

      return matchesSearch && matchesCategory && matchesSkillLevel
    })
  }, [searchTerm, selectedCategory, selectedSkillLevel])

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

  const toggleCategory = (categoryId: number) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  const addLabor = (labor: ChildOperation) => {
    const newLabor: SelectedLabor = {
      id: labor.id,
      operation: labor.operation,
      laborHours: labor.laborHours,
      estimatedCost: labor.estimatedCost,
      parts: labor.parts,
    }
    setSelectedLabors((prev) => [...prev, newLabor])
  }

  const removeLabor = (laborId: number) => {
    setSelectedLabors((prev) => prev.filter((labor) => labor.id !== laborId))
  }

  const isLaborSelected = (laborId: number) => {
    return selectedLabors.some((labor) => labor.id === laborId)
  }

  const totalHours = selectedLabors.reduce((sum, labor) => sum + labor.laborHours, 0)
  const activeRate = rates.find((r) => r.id === selectedRateId)?.rate ?? 0
  const totalCost = selectedLabors.reduce((sum, labor) => sum + labor.laborHours * activeRate, 0)

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case "Basic":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "Intermediate":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "Advanced":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
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
                <p className="text-white/80 text-xs sm:text-sm">Order #12345 - Job Builder</p>
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
              placeholder="Search Labor Guide"
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
          <Select value={selectedSkillLevel} onValueChange={setSelectedSkillLevel}>
            <SelectTrigger className="w-full sm:w-40">
              <Wrench className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Skill Level" />
            </SelectTrigger>
            <SelectContent>
              {skillLevels.map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
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
              <h2 className="text-lg font-semibold">Service Categories ({filteredOperations.length})</h2>
              <Button variant="outline" size="sm">
                Export List
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
              {filteredOperations.length === 0 ? (
                <Card>
                  <CardContent className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No operations found matching your criteria</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {filteredOperations.map((mainOperation) => (
                    <Card key={mainOperation.id} className="overflow-hidden">
                      <CardContent className="p-0">
                        <div
                          className="p-4 cursor-pointer hover:bg-accent/50 transition-colors border-b"
                          onClick={() => toggleCategory(mainOperation.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {expandedCategories.has(mainOperation.id) ? (
                                <ChevronDown className="h-5 w-5 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                              )}
                              <div>
                                <h3 className="font-semibold text-foreground">{mainOperation.mainCategory}</h3>
                                <p className="text-sm text-muted-foreground">{mainOperation.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">{mainOperation.category}</Badge>
                              <Badge className={getSkillLevelColor(mainOperation.skillLevel)}>
                                {mainOperation.skillLevel}
                              </Badge>
                              <Badge variant="outline">{mainOperation.children.length} operations</Badge>
                            </div>
                          </div>
                        </div>

                        {expandedCategories.has(mainOperation.id) && (
                          <div className="bg-muted/30">
                            {mainOperation.children.map((childOperation) => (
                              <div
                                key={childOperation.id}
                                className="p-4 border-b last:border-b-0 hover:bg-accent/30 transition-colors"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <h4 className="font-medium text-foreground">{childOperation.operation}</h4>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-3">{childOperation.description}</p>
                                    <div className="flex items-center gap-4 text-sm">
                                      <div className="flex items-center gap-1">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        <span>{childOperation.laborHours} hrs</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                                        <span>${childOperation.estimatedCost}</span>
                                      </div>
                                      <div className="text-muted-foreground">Parts: {childOperation.parts.length}</div>
                                    </div>
                                  </div>
                                  <div className="ml-4">
                                    {isLaborSelected(childOperation.id) ? (
                                      <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => removeLabor(childOperation.id)}
                                        className="flex items-center gap-1"
                                      >
                                        <Minus className="h-4 w-4" />
                                        Remove
                                      </Button>
                                    ) : (
                                      <Button
                                        variant="default"
                                        size="sm"
                                        onClick={() => addLabor(childOperation)}
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
            <h2 className="text-lg font-semibold mb-4">Labor Summary</h2>

            <Card className="flex-1 flex flex-col min-h-0">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-base">
                  <ShoppingCart className="h-5 w-5" />
                  Selected Operations
                </CardTitle>
                <CardDescription>
                  {selectedLabors.length} operation{selectedLabors.length !== 1 ? "s" : ""} selected
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col space-y-4 overflow-y-auto">
                {selectedLabors.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No operations selected</p>
                      <p className="text-sm text-muted-foreground">Add operations from the list to see summary</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 space-y-3 pr-2">
                      {selectedLabors.map((labor) => (
                        <div key={labor.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">{labor.operation}</h4>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                              <span>{labor.laborHours} hrs</span>
                              <span>${labor.estimatedCost}</span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeLabor(labor.id)}
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
                      <Button className="w-full" disabled={selectedLabors.length === 0}>
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Proceed to Parts Selection
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full bg-transparent mb-1"
                        onClick={() => {
                          if (onSave) {
                            // Return labors with cost computed using selected rate
                            const laborsWithCost = selectedLabors.map((l) => ({
                              ...l,
                              estimatedCost: l.laborHours * activeRate,
                            }))
                            onSave(laborsWithCost)
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


