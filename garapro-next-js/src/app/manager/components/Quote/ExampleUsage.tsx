// src/app/manager/components/Quote/ExampleUsage.tsx
"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { CreateQuotationDialog } from "./CreateQuotationDialog"
import { QuotationData } from "./types"

export function QuoteExample() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  // Example RO data - in a real app this would come from an API
  const roData = {
    roNumber: "RO-2023-001",
    customerName: "John Doe",
    customerPhone: "+1 (555) 123-4567",
    vehicleInfo: "2023 Toyota Camry",
    dateCreated: "2023-10-15"
  }

  const handleQuoteSubmit = (data: QuotationData) => {
    console.log("Quote submitted:", data)
    // Here you would typically send the data to your backend
    alert("Quote request submitted successfully!")
    setIsDialogOpen(false)
  }

  return (
    <div className="p-4">
      <Button onClick={() => setIsDialogOpen(true)}>
        Create Quote
      </Button>
      
      <CreateQuotationDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        roData={roData}
        onSubmit={handleQuoteSubmit}
      />
    </div>
  )
}