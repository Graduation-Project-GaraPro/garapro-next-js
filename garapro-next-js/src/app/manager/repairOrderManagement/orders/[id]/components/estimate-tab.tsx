"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Settings, ClipboardList, PlusCircle, ChevronDown, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import ServiceGuide from "@/app/manager/estimate/serviceGuide/ServiceGuide"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LABOR_RATES_STORAGE_KEY, type LaborRate } from "@/app/manager/garageSetting/ro-settings/tabs/labor-rates-tab"

interface EstimateTabProps {
  orderId: string
}

export default function EstimateTab({}: EstimateTabProps) {
  const [isLaborGuideOpen, setIsLaborGuideOpen] = useState(false)
  const [jobs, setJobs] = useState<Array<{ id: string; title: string; hours?: number; cost?: number; laborRate?: number; parts?: Array<{ id: string; name: string; qty: number; cost: number; retail: number }> }>>([])
  const [isJobsExpanded, setIsJobsExpanded] = useState(true)
  const [isPartsPickerOpen, setIsPartsPickerOpen] = useState(false)
  const [partsPickerJobId, setPartsPickerJobId] = useState<string | null>(null)
  const [rates, setRates] = useState<LaborRate[]>([])
  const [selectedGlobalRateId, setSelectedGlobalRateId] = useState<string>("")

  useEffect(() => {
    const fetchRates = async () => {
      const storedRates = localStorage.getItem(LABOR_RATES_STORAGE_KEY)
      if (storedRates) {
        setRates(JSON.parse(storedRates))
      }
    }
    fetchRates()
  }, [])

  const options = [
    { key: "add-job", label: "Add Job", icon: <PlusCircle className="w-5 h-5 mr-2" /> },
    { key: "canned-job", label: "Add Canned Job", icon: <ClipboardList className="w-5 h-5 mr-2" /> },
  ]


  // Load jobs for selection
  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("jobs") : null
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
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">0</span>
            </button>
            <button className="text-sm font-medium text-gray-500 pb-2 flex items-center gap-2">
              DECLINED JOBS
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">0</span>
            </button>
            <button className="text-sm font-medium text-gray-500 pb-2">JOB HISTORY</button>
          </div>
          
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 gap-6">

            {/* Jobs Section */}
            <div className="rounded-lg border bg-white">
              <div className="flex items-center justify-between p-3 border-b bg-gray-100 rounded-t-lg">
                <h3 className="text-sm font-medium text-gray-900">Jobs</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">Global Labor Rate</span>
                  <Select value={selectedGlobalRateId} onValueChange={(v) => {
                    setSelectedGlobalRateId(v)
                    const rate = rates.find((r) => r.id === v)?.rate || 0
                    setJobs((prev) => prev.map((j) => ({ ...j, laborRate: rate, cost: j.hours && typeof j.hours === 'number' ? rate * j.hours : j.cost })))
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
                  <div className="p-2 text-sm text-gray-500">No jobs added yet</div>
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
                                const rate = Number(v) || 0
                                setJobs((prev) => prev.map((j) => j.id === job.id ? { ...j, laborRate: rate, cost: j.hours && typeof j.hours === 'number' ? rate * j.hours : j.cost } : j))
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
                <span>+</span>
                CREATE JOB
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl p-8">
              <DialogHeader>
                <DialogTitle className="text-xl">Build Job</DialogTitle>
              </DialogHeader>
              <div className="grid gap-3">
                {options.map((opt) => (
                  <DialogClose asChild key={opt.key}>
                    <Button
                      variant="outline"
                      size="lg"
                      className="justify-start h-12 text-base [&_svg]:size-5 bg-transparent"
                      onClick={() => {
                        if (opt.key === "add-job") {
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

          {/* Services Modal */}
          <Dialog open={isLaborGuideOpen} onOpenChange={setIsLaborGuideOpen}>
            <DialogContent
              showCloseButton={false}
              className="sm:max-w-none max-w-[1400px] w-[92vw] h-[92vh] p-0 overflow-hidden gap-0"
            >
              <DialogTitle className="sr-only">Services</DialogTitle>
              <ServiceGuide
                onClose={() => setIsLaborGuideOpen(false)}
                onSave={(services) => {
                  // Append multiple jobs rather than replacing
                  setJobs((prev) => [
                    ...prev,
                    ...services.map((s) => ({
                      id: `${s.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                      title: s.serviceName,
                      hours: s.estimatedDuration,
                      laborRate: rates.find((r) => r.id === selectedGlobalRateId)?.rate,
                      cost: (rates.find((r) => r.id === selectedGlobalRateId)?.rate || 0) * s.estimatedDuration,
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
    </div>
  )
}