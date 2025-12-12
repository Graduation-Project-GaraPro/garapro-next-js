"use client";

import type { ReactNode } from "react";
import { useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";

import { useAuth } from "@/contexts/auth-context";
import { AppSidebar } from "@/app/manager/components/layout/app-sidebar";
import { SiteHeader } from "@/app/manager/components/layout/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import AccessDenied from "@/app/access-denied/page";
import { authService } from "@/services/authService";
import { QuotationResponseListener } from "@/components/manager/quotation-response-listener";

export default function ManagerLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname() || "";

  const isManagerRoute = pathname.startsWith("/manager");

  
  const roles = useMemo(() => {
    const ctx = (user as any)?.roles ?? [];
    const store = authService.getCurrentUserRoles();
    return ctx.length ? ctx : store;
  }, [user]);

  const isManager = roles.includes("Manager");
  console.log("roles:", roles, "isManager:", isManager);

  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          <p className="text-gray-600">Checking access...</p>
        </div>
      </div>
    );
  }

  
  if (!isAuthenticated) {
    router.replace("/login");
    return null;
  }

  
  if (isManagerRoute && !isManager) {
    return <AccessDenied />;
  }

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
      <Toaster />
      {isManager && <QuotationResponseListener />}
    </div>
  );
}
