"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaHome,
  FaClipboardList,
  FaTools,
  FaHistory,
  FaBell,
  FaCar,
  FaWrench,
  FaUserCircle,
  FaChartBar
} from "react-icons/fa";
import { Dispatch, SetStateAction } from "react"; // Import Dispatch and SetStateAction

// Define the props interface for TechnicianSidebar
interface TechnicianSidebarProps {
  activeSection: string;
  setActiveSection: Dispatch<SetStateAction<string>>;
}

const sidebarItems = [
  { id: "home", label: "Home", icon: FaHome, href: "/technician" },
  { id: "task-management", label: "Task Management", icon: FaClipboardList, href: "/technician/taskManagement" },
  { id: "condition-inspection", label: "Condition Inspection", icon: FaTools, href: "/technician/conditionInspection" },
  { id: "repair-history", label: "Repair History", icon: FaHistory, href: "/technician/repairHistory" },
  { id: "notifications", label: "Notifications", icon: FaBell, href: "/technician/notifications" },
  { id: "vehicle-lookup", label: "Information Lookup", icon: FaCar, href: "/technician/vehicleLookup" },
  { id: "statistical", label: "Statistical", icon: FaChartBar, href: "/technician/statistical" }
];

// Update the component to accept props with the defined interface
export default function TechnicianSidebar({ activeSection, setActiveSection }: TechnicianSidebarProps) {
  const pathname = usePathname();
  return (
    <div className="w-64 bg-gradient-to-r from-gray-300 to-teal-100 shadow-lg flex flex-col">
      <nav className="mt-6 flex-1">
        <div className="px-4">
          <p className="text-[16px] font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center italic">
            <FaWrench className="text-xl text-gray-500 mr-2" />
            TECHNICIAN
          </p>
          {sidebarItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setActiveSection(item.id)} // Update activeSection on click
                className={`w-full flex items-center px-4 py-4 text-left rounded-lg mb-2 transition-colors bg-white/10 ${
                  isActive || activeSection === item.id
                    ? "bg-gradient-to-r from-blue-300 to-teal-300 text-blue-800 border-r-2 border-blue-600"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <IconComponent className="mr-3 text-lg" />
                <span className="text-[15px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          <FaUserCircle className="text-3xl text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-800">John Technician</p>
            <p className="text-xs text-gray-500">Senior Mechanic</p>
          </div>
        </div>
      </div>
    </div>
  );
}