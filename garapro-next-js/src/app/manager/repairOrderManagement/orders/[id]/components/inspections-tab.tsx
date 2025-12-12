"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Plus, User, Eye, FileText } from "lucide-react"
import { toast } from "sonner"
import { inspectionService } from "@/services/manager/inspection-service"
import type { InspectionDto } from "@/types/manager/inspection"
import { repairOrderService } from "@/services/manager/repair-order-service"
import { quotationService } from "@/services/manager/quotation-service"
import { CreateInspectionDialog } from "./create-inspection-dialog"
import { TechnicianSelectionDialog } from "@/components/manager/technician-selection-dialog"
import { InspectionDetailDialog } from "./inspection-detail-dialog"
import { useInspectionHub } from "@/hooks/use-inspection-hub"
import type { 
  InspectionStatusUpdatedNotification, 
  InspectionStartedNotification, 
  InspectionCompletedNotification,
  InspectionRetrievedNotification 
} from "@/services/manager/inspection-hub"

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
  const [convertingInspectionId, setConvertingInspectionId] = useState<string | null>(null)
  const [inspectionQuotations, setInspectionQuotations] = useState<Record<string, boolean>>({})
  const inspectionRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const [, forceUpdate] = useState({})

  // Debug: Log whenever inspectionTasks changes
  useEffect(() => {
    console.log("🔄 InspectionTasks state changed:", inspectionTasks.map(t => ({ 
      id: t.inspectionId.slice(0, 8), 
      status: t.status 
    })))
  }, [inspectionTasks])

  // Helper function to highlight an inspection
  const highlightInspection = useCallback((inspectionId: string) => {
    setHighlightedInspectionId(inspectionId)
    setTimeout(() => {
      const element = inspectionRefs.current[inspectionId]
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" })
      }
    }, 300)
    setTimeout(() => setHighlightedInspectionId(null), 3000)
  }, [])

  const handleInspectionStatusUpdated = useCallback((notification: InspectionStatusUpdatedNotification) => {
    console.log(" Received InspectionStatusUpdated:", notification)
    console.log(" Notification structure:", {
      inspectionId: notification.inspectionId,
      repairOrderId: notification.repairOrderId,
      newStatus: notification.newStatus,
      hasInspectionObject: !!notification.inspection,
      inspectionObject: notification.inspection
    })
    
    // Only update if this notification is for the current repair order
    if (notification.repairOrderId === orderId) {
      console.log("Updating inspection status in UI")
      
      setInspectionTasks(prev => {
        const updated = prev.map(task => {
          if (task.inspectionId === notification.inspectionId) {
            const updatedTask = {
              ...task,
              ...(notification.inspection || {}),
              status: notification.newStatus || task.status,
              technicianId: notification.technicianId || task.technicianId,
              technicianName: notification.technicianName || task.technicianName,
              updatedAt: notification.updatedAt || new Date().toISOString()
            }
            console.log("Updated task:", { old: task, new: updatedTask })
            return updatedTask
          }
          return task
        })
        console.log("All inspections after update:", updated)
        return updated
      })
      
      // Show toast notification
      toast.info(`Inspection status changed to ${notification.newStatus}`, {
        description: `By ${notification.technicianName}`
      })
    } else {
      console.log("Skipping update - different repair order", {
        notificationOrderId: notification.repairOrderId,
        currentOrderId: orderId
      })
    }
  }, [orderId])

  const handleInspectionCompleted = useCallback((notification: InspectionCompletedNotification) => {
    console.log("Received InspectionCompleted:", notification)
    console.log("Completion notification structure:", {
      inspectionId: notification.inspectionId,
      repairOrderId: notification.repairOrderId,
      hasInspectionDetails: !!notification.inspectionDetails,
      inspectionDetails: notification.inspectionDetails
    })
    
    // Only update if this notification is for the current repair order
    if (notification.repairOrderId === orderId) {
      console.log(" Updating completed inspection in UI")
      
      setInspectionTasks(prev => {
        const updated = prev.map(task => {
          if (task.inspectionId === notification.inspectionId) {
            const updatedTask = {
              ...task,
              ...(notification.inspectionDetails || {}),
              status: "Completed",
              finding: notification.finding || task.finding,
              issueRating: notification.issueRating ?? task.issueRating,
              updatedAt: notification.completedAt || new Date().toISOString()
            }
            console.log("Completed task:", { old: task, new: updatedTask })
            return updatedTask
          }
          return task
        })
        console.log("All inspections after completion:", updated)
        return updated
      })
      
      // Show success toast
      toast.success(notification.message || "Inspection completed successfully", {
        description: `${notification.serviceCount || 0} services, ${notification.partCount || 0} parts identified`,
        duration: 10000
      })
      
      // Highlight the completed inspection
      highlightInspection(notification.inspectionId)
    } else {
      console.log("⏭️ Skipping update - different repair order", {
        notificationOrderId: notification.repairOrderId,
        currentOrderId: orderId
      })
    }
  }, [orderId, highlightInspection])

  const handleInspectionRetrieved = useCallback((notification: InspectionRetrievedNotification) => {
    console.log("Received InspectionRetrieved:", notification)
    
    setInspectionTasks(prev => {
      const inspection = prev.find(t => t.inspectionId === notification.inspectionId)
      
      if (inspection) {
        console.log("Updating retrieved inspection in UI")
        
        toast.info("Inspection retrieved by technician", {
          description: `Technician is now working on this inspection`
        })
        
        return prev.map(task => 
          task.inspectionId === notification.inspectionId 
            ? { ...task, ...notification.inspection }
            : task
        )
      }
      
      console.log("Skipping update - inspection not in current list")
      return prev
    })
  }, [])

  const handleInspectionStarted = useCallback((notification: InspectionStartedNotification) => {
    console.log("Received InspectionStarted:", notification)
    console.log("Started notification structure:", {
      inspectionId: notification.inspectionId,
      repairOrderId: notification.repairOrderId,
      technicianName: notification.technicianName,
      startedAt: notification.startedAt
    })
    
    if (notification.repairOrderId === orderId) {
      console.log(" Updating inspection to In Progress")

      setInspectionTasks(prev => {
        console.log("Current inspections before update:", prev.map(t => ({ 
          id: t.inspectionId.slice(0, 8), 
          status: t.status 
        })))
        
        const updated = prev.map(task => {
          if (task.inspectionId === notification.inspectionId) {
            const updatedTask = {
              ...task,
              status: "InProgress", 
              technicianId: notification.technicianId || task.technicianId,
              technicianName: notification.technicianName || task.technicianName,
              updatedAt: notification.startedAt || new Date().toISOString()
            }
            console.log("🔄 Started task update:", { 
              inspectionId: task.inspectionId.slice(0, 8),
              oldStatus: task.status, 
              newStatus: updatedTask.status,
              technicianName: updatedTask.technicianName
            })
            return updatedTask
          }
          return task
        })
        
        console.log("📊 All inspections after start:", updated.map(t => ({ 
          id: t.inspectionId.slice(0, 8), 
          status: t.status 
        })))
        
        // Verify the update happened
        const updatedInspection = updated.find(t => t.inspectionId === notification.inspectionId)
        console.log("🔍 Verification - Updated inspection:", {
          id: updatedInspection?.inspectionId.slice(0, 8),
          status: updatedInspection?.status,
          technicianName: updatedInspection?.technicianName
        })
        
        return updated
      })
      
      // Show toast notification
      toast.info(`Inspection started`, {
        description: `${notification.technicianName} is now working on this inspection`
      })
      
      // Highlight the inspection that was started
      highlightInspection(notification.inspectionId)
      
      // Force a re-render to ensure UI updates
      forceUpdate({})
    } else {
      console.log("Skipping update - different repair order", {
        notificationOrderId: notification.repairOrderId,
        currentOrderId: orderId
      })
    }
  }, [orderId, highlightInspection])

  // Real-time SignalR updates for inspections
  useInspectionHub({
    isManager: true,
    autoConnect: true,
    onInspectionStatusUpdated: handleInspectionStatusUpdated,
    onInspectionStarted: handleInspectionStarted,
    onInspectionCompleted: handleInspectionCompleted,
    onInspectionRetrieved: handleInspectionRetrieved
  })

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
        console.log("Loaded inspections:", inspections)
        console.log("Inspection statuses:", inspections.map(i => ({ id: i.inspectionId.slice(0, 8), status: i.status })))
        setInspectionTasks(inspections)
        
        // Check which inspections have quotations
        const quotationChecks: Record<string, boolean> = {}
        for (const inspection of inspections) {
          try {
            const quotations = await quotationService.getQuotationsByInspectionId(inspection.inspectionId)
            quotationChecks[inspection.inspectionId] = quotations.length > 0
          } catch (err: unknown) {
            console.error("Failed to check quotation for inspection:", inspection.inspectionId, err)
            quotationChecks[inspection.inspectionId] = false
          }
        }
        setInspectionQuotations(quotationChecks)
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
      highlightInspection(inspectionIdToHighlight)
    }
  }, [highlightInspectionId, searchParams, inspectionTasks.length, highlightInspection])

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
        console.log("Refreshed inspections after creation:", inspections)
        setInspectionTasks(inspections)
        
        // Refresh quotation checks
        const quotationChecks: Record<string, boolean> = {}
        for (const inspection of inspections) {
          try {
            const quotations = await quotationService.getQuotationsByInspectionId(inspection.inspectionId)
            quotationChecks[inspection.inspectionId] = quotations.length > 0
          } catch (err: unknown) {
            console.error("Failed to refresh quotation check for inspection:", inspection.inspectionId, err)
            quotationChecks[inspection.inspectionId] = false
          }
        }
        setInspectionQuotations(quotationChecks)
      } catch (err) {
        console.error("Failed to refresh inspections:", err)
      }
    }

    fetchInspections()
  }
  
  const handleConvertToQuotation = async (inspectionId: string) => {
    setConvertingInspectionId(inspectionId)
    try {
      await quotationService.convertInspectionToQuotation(inspectionId)
      toast.success("Inspection converted to quotation successfully")
      
      setInspectionQuotations(prev => ({
        ...prev,
        [inspectionId]: true
      }))
      
      // Optionally refresh the inspections list
      handleInspectionCreated()
    } catch (err: unknown) {
      console.error("Failed to convert inspection to quotation:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to convert inspection to quotation"
      toast.error(errorMessage)
    } finally {
      setConvertingInspectionId(null)
    }
  }

  const handleAssignTech = (inspectionId: string) => {
    // Check if inspection is in progress
    const inspection = inspectionTasks.find(t => t.inspectionId === inspectionId)
    if (inspection && inspection.status.toLowerCase() === "inprogress") {
      toast.error("Cannot reassign technician", {
        description: "This inspection is currently in progress. Please wait until it's completed or ask the technician to pause it."
      })
      return
    }
    
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
      console.log("Refreshed inspections after assignment:", inspections)
      setInspectionTasks(inspections)
      
      toast.success("Technician assigned successfully")
      
      setIsAssignDialogOpen(false)
      setSelectedInspectionId(null)
    } catch (err: unknown) {
      console.error("Failed to assign technician:", err)
      
      // Check if it's a validation error from backend
      const getErrorMessage = (error: unknown): string => {
        if (error && typeof error === 'object' && 'response' in error) {
          const apiError = error as { response?: { data?: { message?: string } } };
          return apiError.response?.data?.message || "Failed to assign technician";
        }
        if (error instanceof Error) {
          return error.message;
        }
        return "Failed to assign technician";
      };
      
      const errorMessage = getErrorMessage(err);
      
      toast.error("Assignment Failed", {
        description: errorMessage
      })
    }
  }

  // Get technician monogram from name
  const getTechnicianMonogram = (name: string | null): string => {
    if (!name) return ""
    const names = name.split(" ")
    if (names.length === 1) return names[0].substring(0, 2).toUpperCase()
    return (names[0][0] + names[names.length - 1][0]).toUpperCase()
  }

  const handleCreateButtonClick = () => {
    setIsCreateDialogOpen(true)
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
            <Button 
              onClick={handleCreateButtonClick}
              disabled={loading || !orderId}
              type="button"
            >
              Create New Inspection
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {inspectionTasks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No inspections found for this repair order.</p>
              <Button 
                className="mt-4" 
                onClick={handleCreateButtonClick}
                disabled={loading || !orderId}
                type="button"
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
                      {/* Convert to Quotation Button - Show only for completed inspections without quotation */}
                      {task.status.toLowerCase() === "completed" && !inspectionQuotations[task.inspectionId] && (
                        <Button 
                          variant="default"
                          size="sm" 
                          onClick={() => handleConvertToQuotation(task.inspectionId)}
                          disabled={convertingInspectionId === task.inspectionId}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {convertingInspectionId === task.inspectionId ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Converting...
                            </>
                          ) : (
                            <>
                              <FileText className="h-4 w-4 mr-2" />
                              Convert to Quotation
                            </>
                          )}
                        </Button>
                      )}
                      
                      {/* Show badge if quotation exists */}
                      {inspectionQuotations[task.inspectionId] && (
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                          Quotation Created
                        </span>
                      )}
                      
                      {/* Assign Tech Button - Show for all non-completed inspections */}
                      {task.status.toLowerCase() !== "completed" && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleAssignTech(task.inspectionId)}
                          disabled={task.status.toLowerCase() === "inprogress"}
                          className="flex items-center gap-2"
                          title={task.status.toLowerCase() === "inprogress" ? "Cannot reassign while in progress" : ""}
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