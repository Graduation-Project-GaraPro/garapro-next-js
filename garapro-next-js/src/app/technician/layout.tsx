"use client";

import { useState } from "react";
import TechnicianSidebar from "@/components/technician/TechnicianSidebar";
import TechnicianHeader from "@/components/technician/TechnicianHeader";

export default function TechnicianLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeSection, setActiveSection] = useState("home");

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <TechnicianHeader />
      <div className="flex flex-1">
        <TechnicianSidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
        />
        <main className="flex-1 p-3">{children}</main>
      </div>
    </div>
  );
}