"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Edit2, Trash2 } from "lucide-react"

interface InspectionTask {
  id: string
  title: string
  type: "specific-part" | "full-vehicle"
  assignedTo?: {
    id: string
    name: string
    avatar?: string
  }
  status: "pending" | "in-progress" | "completed"
  createdAt: string
  completedAt?: string
  rating?: "critical" | "good" | "fair" | "poor"
  findings?: string
  images?: string[]
  partsNeeded?: {
    id: string
    name: string
    quantity: number
    estimatedCost: number
  }[]
}

interface InspectionsTabProps {
  orderId: string
}

const mockInspectionTasks: InspectionTask[] = [
  {
    id: "1",
    title: "Pre-Repair Inspection",
    type: "full-vehicle",
    status: "completed",
    createdAt: "2024-01-15T09:00:00Z",
    completedAt: "2024-01-15T10:30:00Z",
    rating: "good",
    findings: "Vehicle in good condition overall. Minor wear on brake pads.",
    partsNeeded: [
      {
        id: "1",
        name: "Brake Pads",
        quantity: 1,
        estimatedCost: 85.99
      }
    ]
  },
  {
    id: "2",
    title: "Post-Repair Inspection",
    type: "specific-part",
    status: "pending",
    createdAt: "2024-01-15T09:00:00Z",
    assignedTo: {
      id: "tech-1",
      name: "Mike Rodriguez"
    }
  }
]

export default function InspectionsTab({}: InspectionsTabProps) {
  const [inspectionTasks] = useState<InspectionTask[]>(mockInspectionTasks)

  return (
    <div className="space-y-6">
      {/* Created Inspection Forms Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Created Inspection Forms</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {inspectionTasks.map((task) => (
              <div key={task.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{task.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                        {task.type === "specific-part" ? "Specific Part" : "Full Vehicle"}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        task.status === "completed" ? "bg-green-100 text-green-800" :
                        task.status === "in-progress" ? "bg-yellow-100 text-yellow-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {task.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="mt-3 text-sm text-gray-600">
                  Created: {new Date(task.createdAt).toLocaleDateString()}
                  {task.completedAt && ` • Completed: ${new Date(task.completedAt).toLocaleDateString()}`}
                </div>
                
                {task.partsNeeded && task.partsNeeded.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="text-sm font-medium text-gray-700 mb-2">Parts Needed</div>
                    <div className="space-y-1">
                      {task.partsNeeded.map((part) => (
                        <div key={part.id} className="flex justify-between text-sm">
                          <span>{part.name} (x{part.quantity})</span>
                          <span className="text-gray-600">${part.estimatedCost.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}