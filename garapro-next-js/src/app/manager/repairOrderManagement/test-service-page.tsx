// Test page for service selection functionality
"use client"

import TestServiceSelection from "./test-service-selection"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function TestServicePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4 flex items-center">
        <Link href="/manager/repairOrderManagement/ro-board">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Repair Order Board
          </Button>
        </Link>
        <h1 className="text-xl font-semibold text-gray-900 ml-4">Service Selection Test</h1>
      </div>
      <TestServiceSelection />
    </div>
  )
}