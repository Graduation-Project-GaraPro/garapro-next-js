"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Edit2, Trash2, Loader2, Plus, User, Eye } from "lucide-react"
import { inspectionService, InspectionDto } from "@/services/manager/inspection-service"
import { repairOrderService } from "@/services/manager/repair-order-service"
import { CreateInspectionDialog } from "./create-inspection-dialog"
import { TechnicianSelectionDialog } from "@/components/manager/technician-selection-dialog"
import { InspectionDetailDialog } from "./inspection-detail-dialog"

interface InspectionsTabProps {
  orderId: string
  highlightInspectionId?: string
}

export default function InspectionsTab({ orderId, highlightInspectionId }: InspectionsTabProps) {
  const searchParams = useSearchParams()
  const [inspectionTasks, setInspectionTasks] = useState<InspectionDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [selectedInspectionId, setSelectedInspectionId] = useState<string | null>(null)
  const [detailInspectionId, setDetailInspectionId] = useState<string | null>(null)
  const [branchId, setBranchId] = useState<string | null>(null)
  const [highlightedInspectionId, setHighlightedInspectionId] = useState<string | null>(null)
  const inspectionRefs = useRef<Record<string, HTMLDivElement | null>>({})

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch repair order to get branch ID
        const repairOrder = await repairOrderService.getRepairOrderById(orderId)
        if (repairOrder) {
          setBranchId(repairOrder.branchId)
        }
        
        // Fetch inspections
        const inspections = await inspectionService.getInspectionsByRepairOrderId(orderId)
        setInspectionTasks(inspections)
      } catch (err) {
        console.error("Failed to fetch data:", err)
        setError("Failed to load data. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    if (orderId) {
      fetchData()
    }
  }, [orderId])

  // Handle highlighting inspection from query params or prop
  useEffect(() => {
    const inspectionIdToHighlight = highlightInspectionId || searchParams?.get("highlightInspection")
    
    if (inspectionIdToHighlight && inspectionTasks.length > 0) {
      setHighlightedInspectionId(inspectionIdToHighlight)
      
      // Scroll to the highlighted inspection after a short delay
      setTimeout(() => {
        const element = inspectionRefs.current[inspectionIdToHighlight]
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" })
        }
      }, 300)
      
      // Remove highlight after 3 seconds
      setTimeout(() => {
        setHighlightedInspectionId(null)
      }, 3000)
    }
  }, [highlightInspectionId, searchParams, inspectionTasks])

  const getStatusDisplayName = (status: string): string => {
    switch (status.toLowerCase()) {
      case "new":
        return "New"
      case "pending":
        return "Pending"
      case "inprogress":
        return "In Progress"
      case "completed":
        return "Completed"
      default:
        return status
    }
  }

  const getStatusBadgeClass = (status: string): string => {
    switch (status.toLowerCase()) {
      case "new":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "inprogress":
        return "bg-purple-100 text-purple-800"
      case "completed":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleInspectionCreated = () => {
    // Refresh the inspections list
    const fetchInspections = async () => {
      try {
        const inspections = await inspectionService.getInspectionsByRepairOrderId(orderId)
        setInspectionTasks(inspections)
      } catch (err) {
        console.error("Failed to refresh inspections:", err)
      }
    }

    fetchInspections()
  }

  const handleAssignTech = (inspectionId: string) => {
    setSelectedInspectionId(inspectionId)
    setIsAssignDialogOpen(true)
  }

  const handleViewDetails = (inspectionId: string) => {
    setDetailInspectionId(inspectionId)
    setIsDetailDialogOpen(true)
  }

  const handleAssignTechnician = async (technicianId: string) => {
    if (!selectedInspectionId) return

    try {
      // Assign technician to inspection
      await inspectionService.assignTechnician(selectedInspectionId, technicianId)
      
      // Refresh the inspections list to show the change
      const inspections = await inspectionService.getInspectionsByRepairOrderId(orderId)
      setInspectionTasks(inspections)
      
      setIsAssignDialogOpen(false)
      setSelectedInspectionId(null)
    } catch (err) {
      console.error("Failed to assign technician:", err)
      // Handle error appropriately
    }
  }

  // Get technician monogram from name
  const getTechnicianMonogram = (name: string | null): string => {
    if (!name) return ""
    const names = name.split(" ")
    if (names.length === 1) return names[0].substring(0, 2).toUpperCase()
    return (names[0][0] + names[names.length - 1][0]).toUpperCase()
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Created Inspection Forms Section */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Inspection Forms</CardTitle>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Inspection
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {inspectionTasks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No inspections found for this repair order.</p>
              <Button 
                className="mt-4" 
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Inspection
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {inspectionTasks.map((task) => (
                <div 
                  key={task.inspectionId} 
                  ref={(el) => {
                    inspectionRefs.current[task.inspectionId] = el
                  }}
                  className={`border rounded-lg p-4 transition-all duration-300 ${
                    highlightedInspectionId === task.inspectionId 
                      ? "ring-2 ring-blue-500 shadow-lg bg-blue-50" 
                      : ""
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">Inspection #{task.inspectionId.slice(0, 8)}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadgeClass(task.status)}`}>
                          {getStatusDisplayName(task.status)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Assign Tech Button - Show for all non-completed inspections */}
                      {task.status.toLowerCase() !== "completed" && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleAssignTech(task.inspectionId)}
                          className="flex items-center gap-2"
                        >
                          {task.technicianName ? (
                            <>
                              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-medium text-xs">
                                {getTechnicianMonogram(task.technicianName)}
                              </div>
                              <span>{task.technicianName}</span>
                            </>
                          ) : (
                            <>
                              <User className="h-4 w-4" />
                              <span>Assign Tech</span>
                            </>
                          )}
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleViewDetails(task.inspectionId)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
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
                    {task.updatedAt && ` • Updated: ${new Date(task.updatedAt).toLocaleDateString()}`}
                  </div>
                  
                  {task.finding && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="text-sm font-medium text-gray-700 mb-2">Findings</div>
                      <p className="text-sm text-gray-600">{task.finding}</p>
                    </div>
                  )}
                  
                  {task.customerConcern && (
                    <div className="mt-3">
                      <div className="text-sm font-medium text-gray-700 mb-2">Customer Concern</div>
                      <p className="text-sm text-gray-600">{task.customerConcern}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      <CreateInspectionDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        repairOrderId={orderId}
        onInspectionCreated={handleInspectionCreated}
      />
      
      <TechnicianSelectionDialog
        open={isAssignDialogOpen}
        onOpenChange={setIsAssignDialogOpen}
        onAssign={handleAssignTechnician}
        jobIds={selectedInspectionId ? [selectedInspectionId] : []}
        branchId={branchId || undefined}
      />
      
      <InspectionDetailDialog
        inspectionId={detailInspectionId}
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
      />
    </div>
  )
}