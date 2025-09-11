"use client"

import { useState } from "react"
import LaborRatesTab from "./tabs/labor-rates-tab"
import LaborManagementTab from "./tabs/labor-management-tab"

const TABS = [
  { id: "laborRate", name: "Labor Rates", component: LaborRatesTab },
  { id: "labor", name: "Labor Management", component: LaborManagementTab },
]

export default function ROSettingsPage() {
  const [activeTab, setActiveTab] = useState<string>(TABS[0].id)

  const Active = TABS.find((t) => t.id === activeTab)?.component || LaborRatesTab

  return (
    <div>
      <div className="bg-white rounded-lg shadow">
        <div className="border-b px-4 py-2 flex gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`px-3 py-1 text-sm rounded ${activeTab === t.id ? "bg-[#154c79] text-white" : "bg-gray-100 text-gray-700"}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.name}
            </button>
          ))}
        </div>
        <div className="p-6">
          <Active />
        </div>
      </div>
    </div>
  )
}


