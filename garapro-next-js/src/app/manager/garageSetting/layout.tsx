"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navigationTabs = [
  { id: "garage-profile", label: "GARAGE PROFILE", href: "/manager/garageSetting" },
  { id: "ro-label", label: "RO LABELS", href: "/manager/garageSetting/ro-label" },
]

export default function GarageSettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="bg-gray-50">
      {/* Header - Fixed at top */}
      <div className="bg-[#154c79] text-white sticky top-0 z-10">
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
      
      {/* Page Content - Scrollable */}
      <div className="p-6">
        {children}
      </div>
    </div>
  )
}
