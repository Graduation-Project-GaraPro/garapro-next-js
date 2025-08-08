'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  Building2,
  Shield,
  Settings,
  BarChart3,
  FileText,
  UserCheck,
  ChevronDown,
  ChevronRight,
  FileCheck
} from 'lucide-react'

const menuItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'User Management',
    href: '/admin/users',
    icon: Users,
    submenu: [
      { title: 'All Users', href: '/admin/users' },
      { title: 'Banned Users', href: '/admin/users/banned' },
      { title: 'User Roles', href: '/admin/users/roles' },
    ]
  },
  {
    title: 'Garage Management',
    href: '/admin/garages',
    icon: Building2,
    submenu: [
      { title: 'All Garages', href: '/admin/garages' },
      { title: 'Banned Garages', href: '/admin/garages/banned' },
      { title: 'Domain Management', href: '/admin/garages/domains' },
    ]
  },
  {
    title: 'Policies',
    href: '/admin/policies',
    icon: FileCheck,
    submenu: [
      { title: 'All Policies', href: '/admin/policies' },
      { title: 'Compliance', href: '/admin/policies/compliance' },
      { title: 'Audit Logs', href: '/admin/policies/audit' },
    ]
  },
  {
    title: 'Statistics',
    href: '/admin/statistics',
    icon: BarChart3,
    submenu: [
      { title: 'Overview', href: '/admin/statistics' },
      { title: 'Advanced Analytics', href: '/admin/statistics/advanced' },
      { title: 'Real-time Analytics', href: '/admin/statistics/realtime' },
      { title: 'Performance Analytics', href: '/admin/statistics/performance' }
    ]
  },
  {
    title: 'System Logs',
    href: '/admin/logs',
    icon: FileText,
    submenu: [
      { title: 'All Logs', href: '/admin/logs' },
      { title: 'Log Analytics', href: '/admin/logs/analytics' },
      { title: 'Log Management', href: '/admin/logs/management' },
    ]
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    )
  }

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-sm text-gray-600">System Administration</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const isExpanded = expandedItems.includes(item.title)
          const hasSubmenu = item.submenu && item.submenu.length > 0

          return (
            <div key={item.title}>
              {hasSubmenu ? (
                <button
                  onClick={() => toggleExpanded(item.title)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </div>
                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </div>
                </Link>
              )}

              {hasSubmenu && isExpanded && (
                <div className="ml-6 mt-1 space-y-1">
                  {item.submenu.map((subItem) => {
                    const isSubActive = pathname === subItem.href
                    return (
                      <Link
                        key={subItem.title}
                        href={subItem.href}
                        className={cn(
                          "block px-3 py-2 text-sm rounded-md transition-colors",
                          isSubActive
                            ? "bg-blue-50 text-blue-700"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        )}
                      >
                        {subItem.title}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <UserCheck className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Admin User</p>
            <p className="text-xs text-gray-500">System Administrator</p>
          </div>
        </div>
      </div>
    </div>
  )
} 