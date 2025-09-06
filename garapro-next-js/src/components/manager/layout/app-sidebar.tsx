"use client"

import type * as React from "react"
import {
  BarChart3,
  Calendar,
  CalendarDays,
  CircuitBoard,
  ClipboardCheck,
  CreditCard,
  FileText,
  // Grid3X3,
  Package,
  Settings,
  Star,
  Truck,
  Users,
  // Wrench,
  LayoutDashboard,
} from "lucide-react"

import { NavMain } from "@/components/manager/layout/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

// Updated data structure to match your requirements
const data = {
  // Top level navigation items
  topNav: [
    {
      title: "Job Board",
      url: "/pages/manager/repairOrderManagement/jobBoard",
      icon: Calendar,
    },
    {
      title: "Tech Board",
      url: "/pages/manager/tech-board",
      icon: CircuitBoard,
    },
  ],
  // Main section
  mainNav: [
    {
      title: "Appointments",
      url: "/pages/manager/appointments",
      icon: CalendarDays,
    },
    {
      title: "Inventory",
      url: "/pages/manager/inventory",
      icon: Package,
    },
    {
      title: "Orders",
      url: "/pages/manager/orders",
      icon: FileText,
    },
    {
      title: "Reports",
      url: "/pages/manager/reports",
      icon: BarChart3,
    },
  ],
  // Manage section
  manageNav: [
    {
      title: "Customers",
      url: "/pages/manager/customers",
      icon: Users,
    },
    {
      title: "Vendors",
      url: "/pages/manager/vendors",
      icon: Truck,
    },
    {
      title: "Canned Jobs",
      url: "/pages/manager/canned-jobs",
      icon: Star,
    },
    {
      title: "Inspections",
      url: "/pages/manager/inspections",
      icon: ClipboardCheck,
    },
  ],
  // Admin section
  adminNav: [
    {
      title: "Employees",
      url: "/pages/manager/accountManagement",
      icon: Users,
    },
    {
      title: "Garage Settings",
      url: "/pages/manager/garageSetting",
      icon: Settings,
    },
    {
      title: "Billing",
      url: "/pages/manager/billing",
      icon: CreditCard,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" className="border-r" {...props}>
      <SidebarHeader className="border-b mt-14 py-0">
        {/* Company Logo/Brand */}
        <SidebarMenu >
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="px-2 pl-2" asChild>
              <a href="/pages/manager/dashboard">
                <div className="flex aspect-square size-6 items-center justify-center rounded-sm bg-[#ae2621] text-sidebar-primary-foreground">
                  <LayoutDashboard className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Garage</span>
                  <span className="truncate text-xs">Dashboard</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="gap-0">
        {/* Top Navigation Items */}
        <NavMain items={data.topNav} groupLabel="" />

        {/* Main Section */}
        <NavMain items={data.mainNav} groupLabel="MAIN" />

        {/* Manage Section */}
        <NavMain items={data.manageNav} groupLabel="MANAGE" />

        {/* Admin Section */}
        <NavMain items={data.adminNav} groupLabel="ADMIN" />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
