"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Copy, Settings, Search, ClipboardList, PlusCircle, Receipt, Percent, MoreVertical, X, ChevronDown, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import LaborGuide from "@/app/manager/estimate/laborGuide/LaborGuide"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LABOR_RATES_STORAGE_KEY, type LaborRate } from "@/app/manager/garageSetting/ro-settings/tabs/labor-rates-tab"

interface EstimateTabProps {
  orderId: string
}

interface Concern {
  id: string
  title: string
  description: string
  finding: string
  createdAt: Date
  status: "critical" | "warning" | "info" | "normal"
}

interface ConcernFormData {
  title: string
  description: string
  finding: string
}

type Status = "critical" | "warning" | "info" | "normal"

export default function EstimateTab({}: EstimateTabProps) {
  const [isLaborGuideOpen, setIsLaborGuideOpen] = useState(false)
  const [isConcernsExpanded, setIsConcernsExpanded] = useState(true)
  const [jobs, setJobs] = useState<Array<{ id: string; title: string; hours?: number; cost?: number; laborRate?: number; parts?: Array<{ id: string; name: string; qty: number; cost: number; retail: number }> }>>([])
  const [isJobsExpanded, setIsJobsExpanded] = useState(true)
  const [isRoFeeExpanded, setIsRoFeeExpanded] = useState(true)
  const [isPartsPickerOpen, setIsPartsPickerOpen] = useState(false)
  const [partsPickerJobId, setPartsPickerJobId] = useState<string | null>(null)
  const [rates, setRates] = useState<LaborRate[]>([])
  const [selectedGlobalRateId, setSelectedGlobalRateId] = useState<string>("")

  const [customerConcerns, setCustomerConcerns] = useState<Concern[]>([
    {
      id: "1",
      title: "No start. No crank but light are coming on.",
      description: "Vehicle will not start or crank, but electrical systems are functioning",
      finding: "Tech Noted: The starter is looking at times and sparking or on fire!!",
      createdAt: new Date(),
      status: "critical",
    },
    {
      id: "2",
      title: "The steering wheel is off center",
      description: "Steering wheel position is not aligned when driving straight",
      finding: "Start with an alignment",
      createdAt: new Date(),
      status: "warning",
    },
  ])

  const [technicianConcerns, setTechnicianConcerns] = useState<Concern[]>([
    {
      id: "3",
      title: "Concern 1",
      description: "Starter Failure",
      finding: "Failing",
      createdAt: new Date(),
      status: "critical",
    },
    {
      id: "4",
      title: "Paint",
      description: "Paint condition assessment",
      finding: "Seeping",
      createdAt: new Date(),
      status: "warning",
    },
    {
      id: "5",
      title: "Fluids",
      description: "Fluid level check",
      finding: "Very dirty",
      createdAt: new Date(),
      status: "warning",
    },
    {
      id: "6",
      title: "Cabin Air Filter",
      description: "Air filter inspection",
      finding: "Starter Failure",
      createdAt: new Date(),
      status: "critical",
    },
  ])

  const [isAddCustomerConcernOpen, setIsAddCustomerConcernOpen] = useState(false)
  const [isAddTechnicianConcernOpen, setIsAddTechnicianConcernOpen] = useState(false)
  const [editingConcern, setEditingConcern] = useState<{ type: "customer" | "technician"; concern: Concern } | null>(
    null,
  )
  const [selectedConcerns, setSelectedConcerns] = useState<Set<string>>(new Set())

  const options = [
    { key: "labor-guide", label: "Search Labor Guide", icon: <Search className="w-5 h-5 mr-2" /> },
    { key: "canned-job", label: "Add Canned Job", icon: <ClipboardList className="w-5 h-5 mr-2" /> },
    { key: "add-job", label: "Add Job", icon: <PlusCircle className="w-5 h-5 mr-2" /> },
    { key: "ro-fee", label: "Add RO Fee", icon: <Receipt className="w-5 h-5 mr-2" /> },
    { key: "ro-discount", label: "Add RO Discount", icon: <Percent className="w-5 h-5 mr-2" /> },
  ]

  const addConcern = (
    type: "customer" | "technician",
    formData: ConcernFormData & { status?: Status },
  ) => {
    const newConcern: Concern = {
      id: Date.now().toString(),
      ...formData,
      status: formData.status || "normal",
      createdAt: new Date(),
    }

    if (type === "customer") {
      setCustomerConcerns((prev) => [...prev, newConcern])
      setIsAddCustomerConcernOpen(false)
    } else {
      setTechnicianConcerns((prev) => [...prev, newConcern])
      setIsAddTechnicianConcernOpen(false)
    }
  }

  const updateConcern = (
    type: "customer" | "technician",
    concernId: string,
    formData: ConcernFormData & { status?: Status },
  ) => {
    const updateFn = (concerns: Concern[]) => concerns.map((c) => (c.id === concernId ? { ...c, ...formData } : c))

    if (type === "customer") {
      setCustomerConcerns(updateFn)
    } else {
      setTechnicianConcerns(updateFn)
    }
    setEditingConcern(null)
  }

  const deleteConcern = (type: "customer" | "technician", concernId: string) => {
    if (type === "customer") {
      setCustomerConcerns((prev) => prev.filter((c) => c.id !== concernId))
    } else {
      setTechnicianConcerns((prev) => prev.filter((c) => c.id !== concernId))
    }
    setSelectedConcerns((prev) => {
      const newSet = new Set(prev)
      newSet.delete(concernId)
      return newSet
    })
  }

  const toggleConcernSelection = (concernId: string) => {
    setSelectedConcerns((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(concernId)) {
        newSet.delete(concernId)
      } else {
        newSet.add(concernId)
      }
      return newSet
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "critical":
        return (
          <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
            <X className="w-3 h-3 text-white" />
          </div>
        )
      case "warning":
        return (
          <div className="w-4 h-4 bg-yellow-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">!</span>
          </div>
        )
      case "info":
        return (
          <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">i</span>
          </div>
        )
      default:
        return <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
    }
  }

  const ConcernForm = ({
    onSubmit,
    onCancel,
    initialData,
  }: {
    onSubmit: (data: ConcernFormData & { status?: Status }) => void
    onCancel: () => void
    initialData?: ConcernFormData & { status?: Status }
  }) => {
    const [formData, setFormData] = useState<ConcernFormData & { status?: Status }>(
      initialData || { title: "", description: "", finding: "", status: "normal" },
    )

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      if (formData.title.trim() && formData.description.trim()) {
        onSubmit(formData)
        setFormData({ title: "", description: "", finding: "", status: "normal" })
      }
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title">Concern Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="Enter concern title"
            required
          />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Describe the concern in detail"
            rows={3}
            required
          />
        </div>
        <div>
          <Label htmlFor="finding">Finding</Label>
          <Input
            id="finding"
            value={formData.finding}
            onChange={(e) => setFormData((prev) => ({ ...prev, finding: e.target.value }))}
            placeholder="Enter finding or diagnosis"
          />
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            value={formData.status ?? "normal"}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, status: e.target.value as Status }))
            }
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="normal">Normal</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
          </select>
        </div>
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" style={{ backgroundColor: "#154c79" }}>
            {initialData ? "Update" : "Add"} Concern
          </Button>
        </div>
      </form>
    )
  }

  // Load labor rates for selection
  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(LABOR_RATES_STORAGE_KEY) : null
      if (raw) {
        const parsed = JSON.parse(raw) as LaborRate[]
        setRates(parsed)
        if (parsed[0]) setSelectedGlobalRateId(parsed[0].id)
      }
    } catch (e) {
      console.error("Failed to load labor rates", e)
    }
  }, [])

  // Simple in-modal Parts Picker for adding parts to a job or via Parts Hub
  type PartItem = { id: string; name: string; cost: number; retail: number; qty: number }
  const partsCatalog: Array<Omit<PartItem, "qty">> = [
    { id: "p1", name: "Front Brake Pads", cost: 40, retail: 65 },
    { id: "p2", name: "Brake Rotor", cost: 55, retail: 95 },
    { id: "p3", name: "Engine Oil (1qt)", cost: 4, retail: 9 },
    { id: "p4", name: "Oil Filter", cost: 6, retail: 14 },
    { id: "p5", name: "Spark Plug", cost: 5, retail: 12 },
  ]

  const PartsPicker = ({
    initialJobId,
    onCancel,
    onSave,
  }: {
    initialJobId: string | null
    onCancel: () => void
    onSave: (jobId: string, parts: PartItem[]) => void
  }) => {
    const [selectedJobId, setSelectedJobId] = useState<string | null>(initialJobId)
    const [selectedParts, setSelectedParts] = useState<Record<string, PartItem>>({})

    const togglePart = (catalogId: string) => {
      setSelectedParts((prev) => {
        const next = { ...prev }
        if (next[catalogId]) {
          delete next[catalogId]
        } else {
          const base = partsCatalog.find((p) => p.id === catalogId)!
          next[catalogId] = { ...base, qty: 1 }
        }
        return next
      })
    }

    const updateQty = (catalogId: string, qty: number) => {
      setSelectedParts((prev) => ({ ...prev, [catalogId]: { ...prev[catalogId], qty } }))
    }

    const totalRetail = Object.values(selectedParts).reduce((s, p) => s + p.retail * (p.qty || 0), 0)

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="font-medium">Select Job</div>
          <div className="flex-1">
            <Select value={selectedJobId ?? undefined} onValueChange={(v) => setSelectedJobId(v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a job" />
              </SelectTrigger>
              <SelectContent>
                {jobs.map((j) => (
                  <SelectItem key={j.id} value={j.id}>
                    {j.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="border rounded-md">
          <div className="px-3 py-2 border-b text-sm font-medium bg-gray-50">Parts Catalog</div>
          <div className="max-h-[40vh] overflow-auto divide-y">
            {partsCatalog.map((p) => {
              const selected = !!selectedParts[p.id]
              const qty = selectedParts[p.id]?.qty ?? 0
              return (
                <div key={p.id} className="flex items-center gap-3 px-3 py-2">
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => togglePart(p.id)}
                    className="h-4 w-4"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-900 truncate">{p.name}</div>
                    <div className="text-xs text-gray-600">Cost ${p.cost.toFixed(2)} · Retail ${p.retail.toFixed(2)}</div>
                  </div>
                  {selected && (
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`qty-${p.id}`}>Qty</Label>
                      <Input
                        id={`qty-${p.id}`}
                        type="number"
                        min={1}
                        value={qty}
                        onChange={(e) => updateQty(p.id, Math.max(1, Number(e.target.value) || 1))}
                        className="w-20 h-8"
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">Selected Retail Total: ${totalRetail.toFixed(2)}</div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel}>Cancel</Button>
            <Button
              disabled={!selectedJobId || Object.keys(selectedParts).length === 0}
              onClick={() => {
                if (!selectedJobId) return
                onSave(selectedJobId, Object.values(selectedParts))
              }}
              style={{ backgroundColor: "#154c79" }}
            >
              Add Parts to Job
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Vehicle Issues Section */}
      <div className="bg-white rounded-lg border">
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div className="flex space-x-6">
            <button
              className="text-sm font-medium text-gray-900 border-b-2 pb-2 flex items-center gap-2"
              style={{ borderColor: "#154c79" }}
            >
              VEHICLE ISSUES
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">{customerConcerns.length}</span>
            </button>
            <button className="text-sm font-medium text-gray-500 pb-2 flex items-center gap-2">
              DECLINED JOBS
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">{technicianConcerns.length}</span>
            </button>
            <button className="text-sm font-medium text-gray-500 pb-2">JOB HISTORY</button>
          </div>
          
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Concerns Section (collapsible) */}
            <div className="rounded-lg border bg-white">
              <div className="flex items-center justify-between p-3 border-b bg-gray-50 rounded-t-lg">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-gray-900">Concerns</h3>
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {customerConcerns.length + technicianConcerns.length}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => setIsConcernsExpanded((prev) => !prev)}
                  aria-label={isConcernsExpanded ? "Collapse" : "Expand"}
                >
                  {isConcernsExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="space-y-6 p-4" style={{ display: isConcernsExpanded ? "block" : "none" }}>
              {/* Customer Concerns */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-sm font-medium text-gray-700">Customer Concerns</h3>
                  <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">?</span>
                  </div>
                </div>

                {/* Column Headers */}
                <div className="pl-1 ml-7 grid grid-cols-2  text-xs font-medium text-gray-500 mb-2">
                  <div></div>
                  <div>Finding</div>
                </div>
                <div className="border-b border-gray-200 mb-2" />

                <div className="space-y-2">
                  {customerConcerns.map((concern, idx) => (
                    <div key={concern.id}>
                      <div className={"p-3 border-l-4 hover:bg-gray-50 border-l-gray-200"}>
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            className="mt-1"
                            checked={selectedConcerns.has(concern.id)}
                            onChange={(e) => {
                              e.stopPropagation()
                              toggleConcernSelection(concern.id)
                            }}
                          />
                          {getStatusIcon(concern.status)}
                          <div className="flex-1 grid grid-cols-2 gap-4 items-start">
                            <div className="text-sm text-gray-900 truncate">
                              {concern.finding || "-"}
                            </div>
                            <p className="text-sm text-gray-900 truncate">{concern.title}</p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <MoreVertical className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setEditingConcern({ type: "customer", concern })}>
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => deleteConcern("customer", concern.id)}>
                                Remove
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      {idx < customerConcerns.length - 1 && (
                        <div className="border-b border-gray-200 mb-2" />
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <Button
                    onClick={() => setIsAddCustomerConcernOpen(true)}
                    variant="ghost"
                    className="text-sm font-medium text-gray-700 hover:bg-gray-100"
                  >
                    <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center mr-2">
                      <span className="text-white text-xs">+</span>
                    </div>
                    ADD CONCERN
                  </Button>
                </div>
              </div>

              {/* Technician Concerns */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-4">Technician Concerns</h3>
                {/* Column Headers */}
                <div className="pl-8 ml-7 grid grid-cols-2 gap-4 text-xs font-medium text-gray-500 mb-2">
                  <div></div>
                  <div>Finding</div>
                </div>
                <div className="border-b border-gray-200 mb-2" />
                <div className="space-y-2">
                  {technicianConcerns.map((concern, idx) => (
                    <div key={concern.id}>
                      <div className={"p-3 border-l-4 hover:bg-gray-50 border-l-gray-200"}>
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            className="mt-1"
                            checked={selectedConcerns.has(concern.id)}
                            onChange={(e) => {
                              e.stopPropagation()
                              toggleConcernSelection(concern.id)
                            }}
                          />
                          {getStatusIcon(concern.status)}
                          <div className="flex-1 grid grid-cols-2 gap-4 items-start">
                            <div className="text-sm text-gray-900 truncate">
                              {concern.finding || "-"}
                            </div>
                            <p className="text-sm text-gray-900 truncate">{concern.title}</p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <MoreVertical className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setEditingConcern({ type: "technician", concern })}>
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => deleteConcern("technician", concern.id)}>
                                Remove
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      {idx < technicianConcerns.length - 1 && (
                        <div className="border-b border-gray-200 mb-2" />
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <Button
                    onClick={() => setIsAddTechnicianConcernOpen(true)}
                    variant="ghost"
                    className="text-sm font-medium text-gray-700 hover:bg-gray-100"
                  >
                    <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center mr-2">
                      <span className="text-white text-xs">+</span>
                    </div>
                    ADD CONCERN
                  </Button>
                </div>
              </div>
              </div>
            </div>

            {/* Jobs Section */}
            <div className="rounded-lg border bg-white">
              <div className="flex items-center justify-between p-3 border-b bg-gray-100 rounded-t-lg">
                <h3 className="text-sm font-medium text-gray-900">Jobs</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">Global Labor Rate</span>
                  <Select value={selectedGlobalRateId} onValueChange={(v) => {
                    setSelectedGlobalRateId(v)
                    const rate = rates.find((r) => r.id === v)?.rate || 0
                    setJobs((prev) => prev.map((j) => ({ ...j, laborRate: rate, cost: j.hours ? rate * j.hours : j.cost })))
                  }}>
                    <SelectTrigger className="h-8 w-44">
                      <SelectValue placeholder="Select rate" />
                    </SelectTrigger>
                    <SelectContent>
                      {rates.map((r) => (
                        <SelectItem key={r.id} value={r.id}>{r.name} - ${r.rate}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => setIsJobsExpanded((prev) => !prev)}
                  aria-label={isJobsExpanded ? "Collapse" : "Expand"}
                >
                  {isJobsExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="p-4" style={{ display: isJobsExpanded ? "block" : "none" }}>
                {jobs.length === 0 ? (
                  <div className="p-2 text-sm text-gray-500">No jobs added yet. Use Build Estimate → Labor Guide to add.</div>
                ) : (
                  <div className="space-y-4">

                    {jobs.map((job) => {
                      const laborRate = job.hours && job.cost ? job.cost / job.hours : undefined
                      const parts = job.parts || []
                      const partsTotal = parts.reduce((sum, p) => sum + p.retail * p.qty, 0)
                      const laborTotal = job.cost || 0
                      const jobSubtotal = laborTotal + partsTotal
                      return (
                        <div key={job.id} className="rounded-md border bg-gray-50/50">
                          {/* Job Header */}
                          <div className="flex items-center justify-between px-3 py-2 bg-gray-100 border-b rounded-t-md">
                            <div className="flex items-center gap-2 min-w-0">
                              <input type="checkbox" className="h-4 w-4" />
                              <p className="text-sm font-medium text-gray-900 truncate">{job.title}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" className="h-8 px-2 bg-transparent">ADD CATEGORY</Button>
                              <Button variant="outline" size="sm" className="h-8 px-2 bg-transparent">ASSIGN TECH</Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">✎</Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setJobs((prev) => prev.filter((j) => j.id !== job.id))}>🗑</Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">⋮</Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>Edit</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => setJobs((prev) => prev.filter((j) => j.id !== job.id))}>Delete</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>

                          {/* Labor Row */}
                                              <div className="hidden md:grid grid-cols-12 text-xs font-medium text-gray-600 px-3 mb-2">
                      <div className="col-span-8">Labor</div>
                      <div className="col-span-1 text-right">Hours</div>
                      <div className="col-span-1 text-right">Rate</div>
                      <div className="col-span-2 text-right">Total</div>
                    </div>
                    <div className="hidden md:block border-b" />

                          <div className="grid grid-cols-12 items-center gap-2 px-3 py-2 border-b text-sm bg-white">
                            <div className="col-span-8 text-gray-800">
                              <div className="font-medium">Labor</div>
                              <div className="text-gray-600 text-xs md:text-sm truncate">{job.title}</div>
                            </div>
                            <div className="col-span-1 text-right text-gray-700">{job.hours?.toFixed(2) ?? "-"}</div>
                            <div className="col-span-1 text-right text-gray-700">
                              <Select value={String(job.laborRate ?? rates.find(r=>r.id===selectedGlobalRateId)?.rate ?? "")} onValueChange={(v) => {
                                const rate = Number(v)
                                setJobs((prev) => prev.map((j) => j.id === job.id ? { ...j, laborRate: rate, cost: j.hours ? rate * j.hours : j.cost } : j))
                              }}>
                                <SelectTrigger className="h-7 text-xs">
                                  <SelectValue placeholder={laborRate ? `$${laborRate.toFixed(2)}` : "-"} />
                                </SelectTrigger>
                                <SelectContent>
                                  {rates.map((r) => (
                                    <SelectItem key={r.id} value={String(r.rate)}>{r.name} - ${r.rate}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="col-span-2 text-right font-medium">{job.cost ? `$${job.cost.toFixed(2)}` : "$0.00"}</div>
                          </div>

                          {/* Parts Table or Warning */}
                          {parts.length === 0 ? (
                            <div className="px-3 py-3 text-sm text-red-600 bg-red-50 border-b">
                              No parts added, <button className="underline" onClick={() => { setPartsPickerJobId(job.id); setIsPartsPickerOpen(true) }}>click here</button> to add parts.
                            </div>
                          ) : (
                            <div className="px-3 py-2 border-b">
                              <div className="hidden md:grid grid-cols-12 text-xs font-medium text-gray-600 mb-1">
                                <div className="col-span-8">Part</div>
                                <div className="col-span-1 text-right">Qty</div>
                                <div className="col-span-1 text-right">Cost</div>
                                <div className="col-span-2 text-right">Total</div>
                              </div>
                              <div className="space-y-1 text-sm">
                                {parts.map((p) => {
                                  const rowTotal = p.retail * p.qty
                                  return (
                                    <div key={p.id} className="grid grid-cols-12">
                                      <div className="col-span-8 truncate">{p.name}</div>
                                      <div className="col-span-1 text-right">{p.qty}</div>
                                      <div className="col-span-1 text-right">${p.cost.toFixed(2)}</div>
                                      <div className="col-span-2 text-right">${rowTotal.toFixed(2)}</div>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )}

                          {/* Footer Summary */}
                          <div className="grid grid-cols-12 items-center gap-2 px-3 py-2 text-xs text-gray-700">
                            <div className="col-span-2">
                              <div>GP% 100%</div>
                              <div>GP$ {job.cost ? `$${job.cost.toFixed(2)}` : "$0.00"}</div>
                              <div>GP/Hr {laborRate ? `$${laborRate.toFixed(2)}` : "-"}</div>
                            </div>
                            <div className="col-span-3 text-right ml-auto">
                              <div className="font-medium">Subtotal <span className="ml-2">${jobSubtotal.toFixed(2)}</span></div>
                            </div>
                            <div className="col-span-2 flex items-center justify-center">
                              <input type="checkbox" className="h-4 w-4" />
                              <span className="ml-2">Labor Tax</span>
                            </div>
                            <div className="col-span-2 text-right">Parts Tax est. $0.00</div>
                            <div className="col-span-3 text-right font-semibold">JOB TOTAL ${jobSubtotal.toFixed(2)}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* RO Fee Section */}
            <div className="rounded-lg border bg-white">
              <div className="flex items-center justify-between p-3 border-b bg-gray-100 rounded-t-lg">
                <h3 className="text-sm font-medium text-gray-900">RO Fee</h3>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="bg-transparent">Add Fee</Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => setIsRoFeeExpanded((prev) => !prev)}
                    aria-label={isRoFeeExpanded ? "Collapse" : "Expand"}
                  >
                    {isRoFeeExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="p-4" style={{ display: isRoFeeExpanded ? "block" : "none" }}>
                <div className="text-sm text-gray-500">No fees added.</div>
              </div>
              
            </div>

            {/* Right Column removed: findings shown inline with each concern */}
          </div>

          {/* Bottom Action Bar */}
          <div className="mt-8 pt-4 border-t flex items-center justify-end">
            <Button className="flex items-center gap-2 text-sm">
              <Copy className="w-4 h-4" />
              COPY TO ESTIMATE ({selectedConcerns.size})
            </Button>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-center space-x-4 p-6 border-t bg-gray-50">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                className="text-white px-6"
                style={{ backgroundColor: "#154c79" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#123a5c")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#154c79")}
              >
                <span className="mr-2">+</span>
                BUILD ESTIMATE
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl p-8">
              <DialogHeader>
                <DialogTitle className="text-xl">Build Estimate</DialogTitle>
              </DialogHeader>
              <div className="grid gap-3">
                {options.map((opt) => (
                  <DialogClose asChild key={opt.key}>
                    <Button
                      variant="outline"
                      size="lg"
                      className="justify-start h-12 text-base [&_svg]:size-5 bg-transparent"
                      onClick={() => {
                        if (opt.key === "labor-guide") {
                          setIsLaborGuideOpen(true)
                        }
                      }}
                    >
                      {opt.icon}
                      {opt.label}
                    </Button>
                  </DialogClose>
                ))}
              </div>
            </DialogContent>
          </Dialog>

          {/* Labor Guide Modal */}
          <Dialog open={isLaborGuideOpen} onOpenChange={setIsLaborGuideOpen}>
            <DialogContent
              showCloseButton={false}
              className="sm:max-w-none max-w-[1400px] w-[92vw] h-[92vh] p-0 overflow-hidden gap-0"
            >
              <DialogTitle className="sr-only">Labor Guide</DialogTitle>
              <LaborGuide
                onClose={() => setIsLaborGuideOpen(false)}
                onSave={(labors) => {
                  // Append multiple jobs rather than replacing
                  setJobs((prev) => [
                    ...prev,
                    ...labors.map((l) => ({
                      id: `${l.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                      title: l.operation,
                      hours: l.laborHours,
                      laborRate: rates.find((r) => r.id === selectedGlobalRateId)?.rate,
                      cost: (rates.find((r) => r.id === selectedGlobalRateId)?.rate || 0) * l.laborHours,
                      parts: [],
                    })),
                  ])
                  setIsLaborGuideOpen(false)
                }}
              />
            </DialogContent>
          </Dialog>

          <Button variant="outline" className="relative bg-transparent" onClick={() => { setPartsPickerJobId(jobs[0]?.id ?? null); setIsPartsPickerOpen(true) }}>
            <Settings className="w-4 h-4 mr-2" />
            PARTS HUB
            <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-bold">4</span>
            </div>
          </Button>
        </div>
      </div>

      {/* Parts Picker Dialog */}
      <Dialog open={isPartsPickerOpen} onOpenChange={setIsPartsPickerOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Parts</DialogTitle>
          </DialogHeader>
          <PartsPicker
            initialJobId={partsPickerJobId}
            onCancel={() => setIsPartsPickerOpen(false)}
            onSave={(jobId, parts) => {
              setJobs((prev) => prev.map((j) => {
                if (j.id !== jobId) return j
                const existingParts = j.parts ?? []
                // Merge by id: add new or update qty
                const idToIndex: Record<string, number> = {}
                existingParts.forEach((p, idx) => { idToIndex[p.id] = idx })
                const merged = [...existingParts]
                parts.forEach((p) => {
                  const hitIdx = idToIndex[p.id]
                  if (hitIdx != null) {
                    const hit = merged[hitIdx]
                    merged[hitIdx] = { ...hit, qty: hit.qty + p.qty, cost: p.cost, retail: p.retail }
                  } else {
                    merged.push({ id: p.id, name: p.name, qty: p.qty, cost: p.cost, retail: p.retail })
                  }
                })
                return { ...j, parts: merged }
              }))
              setIsPartsPickerOpen(false)
              setPartsPickerJobId(null)
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isAddCustomerConcernOpen} onOpenChange={setIsAddCustomerConcernOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Customer Concern</DialogTitle>
          </DialogHeader>
          <ConcernForm
            onSubmit={(data) => addConcern("customer", data)}
            onCancel={() => setIsAddCustomerConcernOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isAddTechnicianConcernOpen} onOpenChange={setIsAddTechnicianConcernOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Technician Concern</DialogTitle>
          </DialogHeader>
          <ConcernForm
            onSubmit={(data) => addConcern("technician", data)}
            onCancel={() => setIsAddTechnicianConcernOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {editingConcern && (
        <Dialog open={!!editingConcern} onOpenChange={() => setEditingConcern(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit {editingConcern.type === "customer" ? "Customer" : "Technician"} Concern</DialogTitle>
            </DialogHeader>
            <ConcernForm
              initialData={{
                title: editingConcern.concern.title,
                description: editingConcern.concern.description,
                finding: editingConcern.concern.finding,
                status: editingConcern.concern.status,
              }}
              onSubmit={(data) => updateConcern(editingConcern.type, editingConcern.concern.id, data)}
              onCancel={() => setEditingConcern(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
