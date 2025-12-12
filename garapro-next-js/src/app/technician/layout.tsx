"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { useState, useMemo } from "react";
import { FaBars } from "react-icons/fa"; 
import TechnicianSidebar from "@/components/technician/TechnicianSidebar";
import TechnicianHeader from "@/components/technician/TechnicianHeader";
import AccessDenied from "@/app/access-denied/page";
import { authService } from "@/services/authService";

export default function TechnicianLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname() || "";
  const [sidebarOpen, setSidebarOpen] = useState(false); 
  const isTechnicianRoute = pathname.startsWith("/technician");

  const roles = useMemo(() => {
    const ctx = (user as any)?.roles ?? [];
    const store = authService.getCurrentUserRoles();
    return ctx.length ? ctx : store;
  }, [user]);

  const isTechnician = roles.includes("Technician");
  console.log("role",isTechnician)

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
  if (isTechnicianRoute && !isTechnician) {
    return <AccessDenied />;
  }

// return (
//     <div className="min-h-screen bg-gray-100 flex flex-col">
//       <TechnicianHeader />
//       <div className="flex flex-1">
//         <TechnicianSidebar/>
//         <main className="flex-1 p-3">{children}</main>
//       </div>
//     </div>
//   );
  return (
  <div className="min-h-screen bg-gray-100 flex flex-col">
    {/* Header với menu button cho mobile */}
    <TechnicianHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
    
    <div className="flex flex-1">
        <TechnicianSidebar />   
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-black opacity-50" />
        </div>
      )}
    
      <div className={`
        fixed top-0 left-0 h-full w-64 z-50 bg-white shadow-xl
        transform transition-transform duration-300 ease-in-out
        lg:hidden
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="font-semibold text-lg">Menu</h2>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            <FaBars className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto full">
          <TechnicianSidebar onClose={() => setSidebarOpen(false)} />
        </div>
      </div>
      <main className="flex-1 p-3">{children}</main>
    </div>
  </div>
);
}
