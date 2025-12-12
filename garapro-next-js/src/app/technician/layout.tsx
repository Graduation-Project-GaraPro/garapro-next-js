"use client";

import * as React from "react";
import TechnicianHeader from "@/components/technician/TechnicianHeader";
import TechnicianSidebar from "@/components/technician/TechnicianSidebar";
import AccessDenied from "@/app/access-denied/page";
import { useAuth } from "@/contexts/auth-context";
import { usePathname, useRouter } from "next/navigation";
import { authService } from "@/services/authService";

import { Sheet, SheetContent } from "@/components/ui/sheet";

export default function TechnicianLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname() || "";

  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const isTechnicianRoute = pathname.startsWith("/technician");

  const roles = React.useMemo(() => {
    const ctx = (user as any)?.roles ?? [];
    const store = authService.getCurrentUserRoles();
    return ctx.length ? ctx : store;
  }, [user]);

  const isTechnician = roles.includes("Technician");

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace("/login");
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
          <p className="text-muted-foreground">Checking access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;
  if (isTechnicianRoute && !isTechnician) return <AccessDenied />;

  return (
    <div className="min-h-screen bg-muted flex flex-col">
      <TechnicianHeader onMenuClick={() => setSidebarOpen(true)} />

      <div className="flex flex-1">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-64 shrink-0 border-r bg-background">
          <TechnicianSidebar />
        </aside>

        {/* Mobile sidebar (Sheet) */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="p-0 w-72">
            <TechnicianSidebar onClose={() => setSidebarOpen(false)} />
          </SheetContent>
        </Sheet>

        <main className="flex-1 p-3">{children}</main>
      </div>
    </div>
  );
}
