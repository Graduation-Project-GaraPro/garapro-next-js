"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navigationTabs = [
  { id: "garage-profile", label: "GARAGE PROFILE", href: "/pages/manager/garageSetting" },
  { id: "ro-settings", label: "RO SETTINGS", href: "/pages/manager/garageSetting/ro-settings" },
  { id: "appointments", label: "APPOINTMENTS", href: "/pages/manager/garageSetting/appointments" },
  { id: "markups", label: "MARKUPS", href: "/pages/manager/garageSetting/markups" },
  { id: "estimates-invoices", label: "ESTIMATES/INVOICES", href: "/pages/manager/garageSetting/estimates-invoices" },
  { id: "marketing", label: "MARKETING", href: "/pages/manager/garageSetting/marketing" },
  { id: "employees", label: "EMPLOYEES", href: "/pages/manager/garageSetting/employees" },
  { id: "ro-label", label: "RO LABELS", href: "/pages/manager/garageSetting/ro-label" },
]

export default function GarageSettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-600 bg-[#154c79] text-white">
        <div className="px-6 py-4">
          <h1 className="text-xl font-semibold">Garage Settings</h1>
        </div>

        <div className="px-6">
          <nav className="flex space-x-8 border-b border-blue-500">
            {navigationTabs.map((tab) => (
              <Link
                key={tab.id}
                href={tab.href}
                className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                  pathname === tab.href
                    ? "border-white text-white"
                    : "border-transparent text-blue-200 hover:text-white hover:border-white-300"
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
      
      {/* Page Content */}
      <div className="p-6">
        {children}
      </div>
    </div>
  )
}
