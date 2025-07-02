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
  Wrench,
} from "lucide-react"

import { NavMain } from "@/components/layout/nav-main"
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
      url: "/pages/manager/repairOrderManagement",
      icon: Calendar,
    },
    {
      title: "Tech Board",
      url: "/tech-board",
      icon: CircuitBoard,
    },
  ],
  // Main section
  mainNav: [
    {
      title: "Appointments",
      url: "/appointments",
      icon: CalendarDays,
    },
    {
      title: "Inventory",
      url: "/inventory",
      icon: Package,
    },
    {
      title: "Orders",
      url: "/orders",
      icon: FileText,
    },
    {
      title: "Reports",
      url: "/reports",
      icon: BarChart3,
    },
  ],
  // Manage section
  manageNav: [
    {
      title: "Customers",
      url: "/customers",
      icon: Users,
    },
    {
      title: "Vendors",
      url: "/vendors",
      icon: Truck,
    },
    {
      title: "Canned Jobs",
      url: "/canned-jobs",
      icon: Star,
    },
    {
      title: "Inspections",
      url: "/inspections",
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
      url: "/billing",
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
              <a href="/dashboard">
                <div className="flex aspect-square size-6 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Wrench className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Multi Garage</span>
                  <span className="truncate text-xs">Dasboard</span>
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
