"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  ArrowLeft,
  FileText,
  Clipboard,
  Calculator,
  CreditCard,
  Settings,
  MessageSquare,
  Edit,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  VehicleInformation, 
  InspectionsTab, 
  JobsTab, 
  PaymentTab,
  QuotationTab,
  EditRepairOrderDialog
} from "./components"
import { repairOrderService, setBranchIdGetter } from "@/services/manager/repair-order-service"
import type { RepairOrder } from "@/types/manager/repair-order"
import { useManagerSession } from "@/contexts/manager-session-context"

interface OrderDetailsProps {
  params: Promise<{ id: string }>
}

export default function OrderDetailsPage({ params }: OrderDetailsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState("vehicle-info")
  const [orderId, setOrderId] = useState<string>("")
  const [repairOrder, setRepairOrder] = useState<RepairOrder | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isLoadingOrder, setIsLoadingOrder] = useState(true)
  const [allJobsCompleted, setAllJobsCompleted] = useState(false)
  const { getBranchId, isLoading: sessionLoading } = useManagerSession()
  const userBranchId = getBranchId()

  // Handle async params
  useEffect(() => {
    params.then((resolvedParams) => {
      setOrderId(resolvedParams.id)
    })
  }, [params])

  // Set up branch ID getter and fetch repair order data
  useEffect(() => {
    setBranchIdGetter(getBranchId);
  }, [getBranchId]);

  // Fetch repair order data
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (orderId) {
          const orderData = await repairOrderService.getRepairOrderById(orderId)
          setRepairOrder(orderData)
        }
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setIsLoadingOrder(false)
      }
    }

    if (orderId && !sessionLoading) {
      fetchData()
    }
  }, [orderId, sessionLoading])

  const handleOrderUpdated = async () => {
    // Refresh repair order data after update
    if (orderId) {
      const orderData = await repairOrderService.getRepairOrderById(orderId)
      setRepairOrder(orderData)
    }
  }

  const handleAllJobsCompleted = async () => {
    console.log("All jobs completed, reloading repair order...")
    setAllJobsCompleted(true)
    
    // Automatically reload the repair order when all jobs are completed
    await handleOrderUpdated()
  }

  const handleProcessPayment = () => {
    // Switch to payment tab
    setActiveTab("payment")
    
    // Also update URL to reflect the tab change
    const currentUrl = new URL(window.location.href)
    currentUrl.searchParams.set("tab", "payment")
    window.history.pushState({}, "", currentUrl.toString())
  }

  // Apply tab from query when available
  useEffect(() => {
    const tab = searchParams?.get("tab")
    if (tab) {
      console.log("Switching to tab from URL:", tab)
      setActiveTab(tab)
    }
  }, [searchParams])

  // Force switch to vehicle-info tab if RO is cancelled and user is on a disabled tab
  useEffect(() => {
    if (repairOrder?.isCancelled) {
      const disabledTabs = ["inspections", "quotation", "jobs", "payment"]
      if (disabledTabs.includes(activeTab)) {
        console.log("RO is cancelled, switching to vehicle-info tab")
        setActiveTab("vehicle-info")
      }
    }
  }, [repairOrder?.isCancelled, activeTab])

  // Show loading while params are being resolved
  if (!orderId || sessionLoading || isLoadingOrder) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4" style={{ borderColor: "#154c79" }}></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    )
  }

  // Get display data from repair order
  const getOrderDisplayData = () => {
    if (!repairOrder) {
      return {
        shortId: orderId.substring(0, 4),
        customer: "Loading...",
        vehicle: "Loading...",
        status: "Loading...",
        labels: []
      }
    }
    
    return {
      shortId: repairOrder.repairOrderId.substring(0, 4),
      customer: repairOrder.customerName || "Unknown Customer",
      vehicle: repairOrder.vehicleName || `Vehicle #${repairOrder.vehicleId.substring(0, 4)}`,
      status: repairOrder.statusId || "Unknown",
      labels: repairOrder.assignedLabels || []
    }
  }
  
  const orderData = getOrderDisplayData()

  const isCancelled = repairOrder?.isCancelled || false

  const tabs = [
    { id: "vehicle-info", label: "VEHICLE INFO", icon: FileText, disabled: false },
    { id: "inspections", label: "INSPECTIONS", icon: Clipboard, disabled: isCancelled },
    { id: "quotation", label: "QUOTATION", icon: Clipboard, disabled: isCancelled },
    { id: "jobs", label: "JOBS", icon: Calculator, disabled: isCancelled },
    { id: "payment", label: "PAYMENT", icon: CreditCard, disabled: isCancelled },
  ]

  const renderTabContent = () => {
    const highlightInspectionId = searchParams?.get("highlightInspection") || undefined
    
    const tabComponents = {
      "vehicle-info": <VehicleInformation orderId={orderId} />,
      inspections: <InspectionsTab orderId={orderId} highlightInspectionId={highlightInspectionId} />,
      quotation: <QuotationTab orderId={orderId} />,
      jobs: <JobsTab 
        orderId={orderId} 
        branchId={userBranchId || undefined} 
        isArchived={repairOrder?.isArchived}
        onAllJobsCompleted={handleAllJobsCompleted}
        onProcessPayment={handleProcessPayment}
      />,
      payment: <PaymentTab orderId={orderId} repairOrderStatus={repairOrder ? parseInt(repairOrder.statusId) : undefined} paidStatus={repairOrder?.paidStatus} isArchived={repairOrder?.isArchived} onPaymentSuccess={handleOrderUpdated} />
    }

    return tabComponents[activeTab as keyof typeof tabComponents] || null
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className=" text-white" style={{ backgroundColor: "#154c79" }}>
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
                             className="text-white hover:bg-opacity-80"
               style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
              onClick={() => router.back()}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">
                RO #{orderData.shortId} • {orderData.customer} • {orderData.vehicle}
              </h1>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                {repairOrder?.isCancelled && (
                  <Badge variant="secondary" className="bg-red-500 text-white">
                    Cancelled
                  </Badge>
                )}
                {repairOrder?.isArchived && (
                  <Badge variant="secondary" className="bg-gray-500 text-white">
                    Archived
                  </Badge>
                )}
                {orderData.labels.length > 0 && (
                  <div className="flex items-center gap-2">
                    {orderData.labels.map((label, index) => (
                      <Badge 
                        key={`label-${label.labelId}-${index}`}
                        variant="secondary"
                        style={{ backgroundColor: label.hexCode, color: '#fff' }}
                        className="text-xs"
                      >
                        {label.labelName}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {!repairOrder?.isArchived && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white hover:bg-opacity-80" 
                style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                onClick={() => setIsEditDialogOpen(true)}
                title="Edit Repair Order"
              >
                <Edit className="w-4 h-4" />
              </Button>
            )}
            <Button variant="ghost" size="sm" className="text-white hover:bg-opacity-80" style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}>
              <FileText className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-white hover:bg-opacity-80" style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }} disabled={repairOrder?.isArchived}>
              <MessageSquare className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-white hover:bg-opacity-80" style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }} disabled={repairOrder?.isArchived}>
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-t" style={{ borderColor: "rgba(255, 255, 255, 0.2)" }}>
          <div className="flex space-x-0 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isDisabled = tab.disabled
              return (
                <button
                  key={tab.id}
                  onClick={() => !isDisabled && setActiveTab(tab.id)}
                  disabled={isDisabled}
                  className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    isDisabled
                      ? "border-transparent text-blue-300 opacity-50 cursor-not-allowed"
                      : activeTab === tab.id
                      ? "border-white text-white"
                      : "border-transparent text-blue-200 hover:text-white"
                  }`}
                  style={{
                    backgroundColor: activeTab === tab.id && !isDisabled ? "rgba(255, 255, 255, 0.1)" : "transparent"
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== tab.id && !isDisabled) {
                      e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)"
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== tab.id && !isDisabled) {
                      e.currentTarget.style.backgroundColor = "transparent"
                    }
                  }}
                  title={isDisabled ? "This tab is disabled for cancelled repair orders" : ""}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">{renderTabContent()}</div>

      {/* Edit Repair Order Dialog */}
      {repairOrder && (
        <EditRepairOrderDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          orderId={orderId}
          currentStatusId={parseInt(repairOrder.statusId)}
          currentNote={repairOrder.note}
          onSuccess={handleOrderUpdated}
        />
      )}
    </div>
  )
}