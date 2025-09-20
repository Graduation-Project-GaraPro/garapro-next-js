"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  ArrowLeft,
  FileText,
  Clipboard,
  Calculator,
  Wrench,
  CreditCard,
  Settings,
  MessageSquare,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  VehicleInformation, 
  InspectionsTab, 
  EstimateTab, 
  WorkProgressTab, 
  PaymentTab 
} from "./components"

interface OrderDetailsProps {
  params: Promise<{ id: string }>
}

export default function OrderDetailsPage({ params }: OrderDetailsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState("vehicle-info")
  const [orderId, setOrderId] = useState<string>("")

  // Handle async params
  useEffect(() => {
    params.then((resolvedParams) => {
      setOrderId(resolvedParams.id)
    })
  }, [params])

  // Apply tab from query when available
  useEffect(() => {
    const tab = searchParams?.get("tab")
    if (tab) {
      setActiveTab(tab)
    }
  }, [searchParams])

  // Show loading while params are being resolved
  if (!orderId) {
    return (
             <div className="min-h-screen bg-gray-100 flex items-center justify-center">
         <div className="text-center">
           <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4" style={{ borderColor: "#154c79" }}></div>
           <p className="text-gray-600">Loading order details...</p>
         </div>
       </div>
    )
  }

  // Mock data - in real app this would come from API
  const orderData = {
    id: orderId,
    customer: "Justine Anderson",
    vehicle: "2017 Honda CR-V EX",
    status: "Requires Authorization",
    inOdometer: "Add odometer",
    outOdometer: "Add odometer",
    createdDate: "2024-01-15",
    estimatedCompletion: "2024-01-17",
  }

  const tabs = [
    { id: "vehicle-info", label: "VEHICLE INFO", icon: FileText },
    { id: "inspections", label: "INSPECTIONS", icon: Clipboard },
    { id: "estimate", label: "ESTIMATE", icon: Calculator },
    { id: "work-in-progress", label: "WORK-IN-PROGRESS", icon: Wrench },
    { id: "payment", label: "PAYMENT", icon: CreditCard },
  ]

  const renderTabContent = () => {
    const tabComponents = {
      "vehicle-info": <VehicleInformation orderId={orderId} />,
      inspections: <InspectionsTab orderId={orderId} />,
      estimate: <EstimateTab orderId={orderId} />,
      "work-in-progress": <WorkProgressTab orderId={orderId} />,
      payment: <PaymentTab orderId={orderId} />
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
                RO #{orderData.id}: {orderData.customer}&apos;s {orderData.vehicle}
              </h1>
              <div className="flex items-center space-x-4 mt-1">
                <Badge variant="secondary" className="bg-green-500 text-white">
                  {orderData.status}
                </Badge>
                <span className="text-sm">In: {orderData.inOdometer}</span>
                <span className="text-sm">Out: {orderData.outOdometer}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="text-white hover:bg-opacity-80" style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}>
              <FileText className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-white hover:bg-opacity-80" style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}>
              <MessageSquare className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-white hover:bg-opacity-80" style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}>
              <Calculator className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-white hover:bg-opacity-80" style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}>
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-t" style={{ borderColor: "rgba(255, 255, 255, 0.2)" }}>
          <div className="flex space-x-0 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-white text-white"
                      : "border-transparent text-blue-200 hover:text-white"
                  }`}
                  style={{
                    backgroundColor: activeTab === tab.id ? "rgba(255, 255, 255, 0.1)" : "transparent"
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== tab.id) {
                      e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)"
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== tab.id) {
                      e.currentTarget.style.backgroundColor = "transparent"
                    }
                  }}
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
    </div>
  )
}
