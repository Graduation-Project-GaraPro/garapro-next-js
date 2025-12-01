"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useMemo } from "react";

import TechnicianSidebar from "@/components/technician/TechnicianSidebar";
import TechnicianHeader from "@/components/technician/TechnicianHeader";
import AccessDenied from "@/app/access-denied/page";
import { authService } from "@/services/authService";

export default function TechnicianLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname() || "";

  const isTechnicianRoute = pathname.startsWith("/technician");

  // luôn load role từ sessionStorage để chính xác
  const roles = useMemo(() => {
    const ctx = (user as any)?.roles ?? [];
    const store = authService.getCurrentUserRoles();
    return ctx.length ? ctx : store;
  }, [user]);

  const isTechnician = roles.includes("Technician");
  console.log("role",isTechnician)

  // Nếu chưa check xong auth → KHÔNG render layout, KHÔNG render children
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

  // Chưa login → redirect
  if (!isAuthenticated) {
    router.replace("/login");
    return null;
  }

  // Không phải Technician mà cố vào /technician/*
  if (isTechnicianRoute && !isTechnician) {
    return <AccessDenied />;
  }

  // OK → render layout technician
return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <TechnicianHeader />
      <div className="flex flex-1">
        <TechnicianSidebar/>
        <main className="flex-1 p-3">{children}</main>
      </div>
    </div>
  );
  
}
