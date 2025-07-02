"use client"

import { useState } from "react"

const navigationTabs = [
  { id: "garage-profile", label: "GARAGE PROFILE", active: true },
  { id: "ro-settings", label: "RO SETTINGS", active: false },
  { id: "appointments", label: "APPOINTMENTS", active: false },
  { id: "markups", label: "MARKUPS", active: false },
  { id: "estimates-invoices", label: "ESTIMATES/INVOICES", active: false },
  { id: "marketing", label: "MARKETING", active: false },
  { id: "employees", label: "EMPLOYEES", active: false },
  { id: "integrations", label: "INTEGRATIONS", active: false },
]

export default function GarageSettingsPage() {
  const [activeTab, setActiveTab] = useState("shop-profile")

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-600 bg-[#154c79] text-white">
        <div className="px-6 py-4">
          <h1 className="text-xl font-semibold">Garage Settings</h1>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6">
          <nav className="flex space-x-8 border-b border-blue-500">
            {navigationTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-white text-white"
                    : "border-transparent text-blue-200 hover:text-white hover:border-white-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      
    </div>
  )
}
