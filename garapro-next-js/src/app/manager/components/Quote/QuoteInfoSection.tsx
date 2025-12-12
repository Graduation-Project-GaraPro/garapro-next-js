// src/app/manager/components/Quote/QuoteInfoSection.tsx
"use client"

import type React from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface QuoteInfoSectionProps {
  roData?: {
    roNumber?: string
    customerName?: string
    customerPhone?: string
    vehicleInfo?: string
    dateCreated?: string
  }
  formData: {
    dateCreated: string
    customerName: string
    customerPhone: string
    validUntil: string
  }
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function QuoteInfoSection({ roData, formData, onInputChange }: QuoteInfoSectionProps) {
  // Get today's date in YYYY-MM-DD format for min date validation
  const today = new Date().toISOString().split('T')[0];

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Quote Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="flex flex-col">
          <Label className="text-xs font-medium text-muted-foreground">RO Number</Label>
          <div className="text-medium mt-1">
            {roData?.roNumber ? `#${roData.roNumber.slice(0, 4)}` : "Not available"}
          </div>
        </div>

        <div className="flex flex-col">
          <Label className="text-xs font-medium text-muted-foreground">Date Created</Label>
          <div className="text-sm mt-1">
            {formData.dateCreated}
          </div>
        </div>

        <div className="flex flex-col">
          <Label className="text-xs font-medium text-muted-foreground">Customer</Label>
          <div className="text-sm mt-1">
            {formData.customerName}
          </div>
        </div>

        <div className="flex flex-col">
          <Label className="text-xs font-medium text-muted-foreground">Phone</Label>
          <div className="text-sm mt-1">
            {formData.customerPhone || "Not provided"}
          </div>
        </div>

        <div className="flex flex-col">
          <Label className="text-xs font-medium text-muted-foreground">Vehicle</Label>
          <div className="text-sm mt-1">
            {roData?.vehicleInfo || "Not available"}
          </div>
        </div>

        <div className="flex flex-col">
          <Label htmlFor="validUntil" className="text-xs font-medium text-muted-foreground">
            Valid Until
          </Label>
          <Input
            id="validUntil"
            name="validUntil"
            type="date"
            value={formData.validUntil}
            onChange={onInputChange}
            min={today} // Prevent selecting past dates
            className="mt-1 text-sm p-2 h-8"
            required
          />
        </div>
      </div>
    </div>
  )
}