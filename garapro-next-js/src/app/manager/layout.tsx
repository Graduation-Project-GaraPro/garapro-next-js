"use client"

import type { ReactNode } from "react"
import { AppSidebar } from "@/app/manager/components/layout/app-sidebar"
import { SiteHeader } from "@/app/manager/components/layout/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function ManagerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-screen flex flex-col">
      <SidebarProvider className="flex flex-col flex-1 min-h-0">
        <SiteHeader />
        <div className="flex flex-1 min-h-0">
          <AppSidebar />
          <SidebarInset>
            <div className="flex-1 min-h-0 overflow-y-auto">
              {children}
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  )
}





