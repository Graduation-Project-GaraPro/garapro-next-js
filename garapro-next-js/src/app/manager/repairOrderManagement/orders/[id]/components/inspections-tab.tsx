"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface InspectionsTabProps {
  orderId: string
}

export default function InspectionsTab({ orderId }: InspectionsTabProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Inspections - RO #{orderId}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No inspections recorded yet.</p>
          <Button 
            className="mt-4" 
            style={{ backgroundColor: "#154c79" }} 
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#123a5c"} 
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#154c79"}
          >
            Add Inspection
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
