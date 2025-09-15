"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export type LaborRate = {
  id: string
  name: string
  rate: number
}

export const LABOR_RATES_STORAGE_KEY = "garagepro.laborRates"

export default function LaborRatesTab() {
  const [rates, setRates] = useState<LaborRate[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(LABOR_RATES_STORAGE_KEY) : null
      if (raw) {
        const parsed = JSON.parse(raw) as LaborRate[]
        setRates(parsed)
      } else {
        setRates([
          { id: crypto.randomUUID(), name: "Standard Rate", rate: 125 },
          { id: crypto.randomUUID(), name: "Euro rate", rate: 155 },
        ])
      }
    } catch (e) {
      console.error("Failed to load labor rates", e)
    }
  }, [])

  const handleAdd = () => {
    setRates((prev) => [...prev, { id: crypto.randomUUID(), name: "", rate: 0 }])
  }

  const handleRemove = (id: string) => {
    setRates((prev) => prev.filter((r) => r.id !== id))
  }

  const updateRate = (id: string, partial: Partial<LaborRate>) => {
    setRates((prev) => prev.map((r) => (r.id === id ? { ...r, ...partial } : r)))
  }

  const handleSave = () => {
    try {
      setSaving(true)
      localStorage.setItem(LABOR_RATES_STORAGE_KEY, JSON.stringify(rates))
    } finally {
      setSaving(false)
    }
  }

  const exampleLaborCharge = useMemo(() => {
    const hours = 2.5
    const first = rates[0]?.rate ?? 0
    const charge = hours * first
    return { hours, rate: first, charge }
  }, [rates])

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Labor Rates</h3>
      <p className="text-gray-600 mb-4">
        The shop labor rate is the hourly rate you charge your customers. Customers will never see this rate and you can
        enter multiple rates to use for different kinds of customers.
      </p>

      <div className="border rounded-md divide-y">
        {rates.map((r) => (
          <div key={r.id} className="grid grid-cols-12 items-center gap-3 px-3 py-2">
            <div className="col-span-8 flex items-center gap-2">
              <span className="inline-block w-4 h-4 bg-gray-200 rounded-sm" />
              <Label className="sr-only">Labor Rate Name</Label>
              <Input
                value={r.name}
                onChange={(e) => updateRate(r.id, { name: e.target.value })}
                placeholder="Labor Rate Name"
              />
            </div>
            <div className="col-span-3">
              <Label className="sr-only">Labor Rate</Label>
              <div className="relative">
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={Number.isFinite(r.rate) ? r.rate : 0}
                  onChange={(e) => updateRate(r.id, { rate: Number(e.target.value) || 0 })}
                  className="pr-10"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              </div>
            </div>
            <div className="col-span-1 text-right">
              <button
                className="text-gray-500 hover:text-red-600"
                type="button"
                onClick={() => handleRemove(r.id)}
                aria-label="Remove rate"
              >
                ×
              </button>
            </div>
          </div>
        ))}
        <div className="px-3 py-2">
          <Button type="button" variant="outline" className="bg-transparent" onClick={handleAdd}>
            + Add Labor Rate
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-600">
          Example: Labor Charge = repair time (hours) × Labor Rate → {exampleLaborCharge.hours} × ${exampleLaborCharge.rate.toFixed(2)} =
          <span className="font-semibold"> ${exampleLaborCharge.charge.toFixed(2)}</span>
        </div>
        <Button onClick={handleSave} className="bg-[#154c79] hover:bg-[#123a5c]" disabled={saving}>
          Save Labor Rates
        </Button>
      </div>
    </div>
  )
}









