// Demo page for the service selection dialog
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ServiceSelectionDialog } from "@/components/manager/service-selection-dialog"

export default function ServiceDialogDemo() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Service Selection Dialog Demo</h1>
          <p className="text-gray-600">Demonstration of the new service selection dialog with search functionality</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Service Selection Demo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <p>
                This demo showcases the new service selection dialog component that can be used in the repair order creation flow.
                The dialog includes:
              </p>
              
              <ul className="list-disc pl-5 space-y-2">
                <li>Search functionality to quickly find services</li>
                <li>Friendly UI for easy viewing and selection</li>
                <li>Real-time calculation of totals</li>
                <li>Select All / Clear All functionality</li>
              </ul>
              
              <div className="pt-4">
                <Button onClick={() => setIsDialogOpen(true)}>
                  Open Service Selection Dialog
                </Button>
              </div>
              
              {selectedServiceIds.length > 0 && (
                <div className="p-4 bg-gray-50 rounded-md">
                  <h3 className="font-medium mb-2">Selected Services:</h3>
                  <p>You have selected {selectedServiceIds.length} service(s).</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Implementation Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
              <li>The dialog fetches real services from the backend API</li>
              <li>Search works on both service name and description</li>
              <li>Visual feedback is provided for selected services</li>
              <li>Responsive design works on all screen sizes</li>
              <li>Reusable component that can be used anywhere in the application</li>
            </ul>
          </CardContent>
        </Card>
      </div>
      
      <ServiceSelectionDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        selectedServiceIds={selectedServiceIds}
        onSelectionChange={setSelectedServiceIds}
        title="Select Services for Repair Order"
      />
    </div>
  )
}