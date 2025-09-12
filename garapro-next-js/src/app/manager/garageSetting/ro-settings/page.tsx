"use client"

import { useState } from "react"
import LaborRatesTab from "./tabs/labor-rates-tab"
import LaborManagementTab from "./tabs/labor-management-tab"
import { Clock, DollarSign, Tag, Receipt, Folder, Car, Settings, Users } from "lucide-react"

const MENU_ITEMS = [
  { id: "laborRate", name: "Labor Rates", icon: Clock, component: LaborRatesTab },
  { id: "laborManagement", name: "Labor Management", icon: Users, component: LaborManagementTab },
  { id: "shopFees", name: "Shop Fees", icon: DollarSign, component: LaborRatesTab },
  { id: "discounts", name: "Discounts", icon: Tag, component: LaborRatesTab },
  { id: "taxes", name: "Taxes", icon: Receipt, component: LaborRatesTab },
  { id: "jobCategories", name: "Job Categories", icon: Folder, component: LaborRatesTab },
  { id: "paymentSettings", name: "Payment Settings", icon: DollarSign, component: LaborRatesTab },
  { id: "roNumbering", name: "RO Numbering", icon: Car, component: LaborRatesTab },
  { id: "advancedSettings", name: "Advanced Settings", icon: Settings, component: LaborRatesTab },
]

export default function ROSettingsPage() {
  const [activeTab, setActiveTab] = useState<string>(MENU_ITEMS[0].id)

  const ActiveComponent = MENU_ITEMS.find((item) => item.id === activeTab)?.component || LaborRatesTab

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">RO Settings</h2>
        </div>
        <nav className="mt-4">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                className={`w-full flex items-center px-6 py-3 text-left hover:bg-gray-50 transition-colors ${
                  activeTab === item.id
                    ? "bg-[#154c79] text-white"
                    : "text-gray-700"
                }`}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon className="w-5 h-5 mr-3" />
                <span className="text-sm font-medium">{item.name}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <ActiveComponent />
        </div>
      </div>
    </div>
  )
}


