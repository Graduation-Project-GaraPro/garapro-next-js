"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaHome,
  FaClipboardList,
  FaTools,
  FaHistory,
  FaCar,
  FaWrench,
  FaChartBar,
  FaClipboardCheck,
  FaCog,
  FaUserCircle,
} from "react-icons/fa";
import { useState, useMemo, useCallback, memo } from "react";
import { IconType } from "react-icons";

// Types
interface ChildItem {
  id: string;
  label: string;
  icon: IconType;
  href: string;
}

interface SidebarItem {
  id: string;
  label: string;
  icon: IconType;
  href?: string;
  children?: ChildItem[];
}

// Sidebar configuration
const sidebarItems: SidebarItem[] = [
  { id: "home", label: "Home", icon: FaHome, href: "/technician" },
  {
    id: "task-management",
    label: "My Task",
    icon: FaClipboardList,
    href: "/technician/taskManagement",
  },
  {
    id: "condition-inspection",
    label: "Inspection & Repair",
    icon: FaTools,
    children: [
      {
        id: "vehicle-inspection",
        label: "Vehicle Inspection",
        icon: FaClipboardCheck,
        href: "/technician/inspectionAndRepair/inspection",
      },
      {
        id: "repair-progress",
        label: "Repair Progress",
        icon: FaCog,
        href: "/technician/inspectionAndRepair/repair",
      },
    ],
  },
  {
    id: "repair-history",
    label: "Repair History",
    icon: FaHistory,
    href: "/technician/repairHistory",
  },
  {
    id: "vehicle-lookup",
    label: "Information Lookup",
    icon: FaCar,
    href: "/technician/vehicleLookup",
  },
  {
    id: "statistical",
    label: "Statistical",
    icon: FaChartBar,
    href: "/technician/statistical",
  },
];

// Child Menu Item Component (Memoized)
const ChildMenuItem = memo(({ child, isActive }: { child: ChildItem; isActive: boolean }) => {
  const ChildIcon = child.icon;
  
  return (
    <Link
      href={child.href}
      className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
        isActive
          ? "bg-blue-200 text-blue-800 font-medium"
          : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      <ChildIcon className="mr-2" />
      {child.label}
    </Link>
  );
});

ChildMenuItem.displayName = "ChildMenuItem";

// Parent Menu Item Component (Memoized)
const ParentMenuItem = memo(({
  item,
  isExpanded,
  isParentActive,
  pathname,
  onToggle,
}: {
  item: SidebarItem;
  isExpanded: boolean;
  isParentActive: boolean;
  pathname: string;
  onToggle: () => void;
}) => {
  const IconComponent = item.icon;

  return (
    <div>
      <button
        onClick={onToggle}
        className={`w-full flex items-center px-4 py-4 text-left rounded-lg mb-2 transition-colors bg-white/10 ${
          isParentActive
            ? "bg-gradient-to-r from-blue-300 to-teal-300 text-blue-800 border-r-2 border-blue-600"
            : "text-gray-600 hover:bg-gray-100"
        }`}
      >
        <IconComponent className="mr-3 text-lg" />
        <span className="text-[15px] font-medium">{item.label}</span>
      </button>
      {isExpanded && item.children && (
        <div className="ml-8 mt-1 space-y-1">
          {item.children.map((child) => (
            <ChildMenuItem
              key={child.id}
              child={child}
              isActive={pathname === child.href}
            />
          ))}
        </div>
      )}
    </div>
  );
});

ParentMenuItem.displayName = "ParentMenuItem";

// Simple Menu Item Component (Memoized)
const SimpleMenuItem = memo(({
  item,
  isActive,
}: {
  item: SidebarItem;
  isActive: boolean;
}) => {
  const IconComponent = item.icon;

  return (
    <Link
      href={item.href!}
      className={`w-full flex items-center px-4 py-4 text-left rounded-lg mb-2 transition-colors bg-white/10 ${
        isActive
          ? "bg-gradient-to-r from-blue-300 to-teal-300 text-blue-800 border-r-2 border-blue-600"
          : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      <IconComponent className="mr-3 text-lg" />
      <span className="text-[15px] font-medium">{item.label}</span>
    </Link>
  );
});

SimpleMenuItem.displayName = "SimpleMenuItem";

// User Profile Component (Memoized)
const UserProfile = memo(({ fullName, email }: { fullName: string; email: string }) => (
  <div className="p-4 border-t border-gray-200 bg-white">
    <div className="flex items-center space-x-3">
      <FaUserCircle className="text-3xl text-gray-400" />
      <div>
        <p className="text-sm font-medium text-gray-800">{fullName}</p>
        <p className="text-xs text-gray-500">{email}</p>
      </div>
    </div>
  </div>
));

UserProfile.displayName = "UserProfile";

// Main Sidebar Component
export default function TechnicianSidebar() {
  const pathname = usePathname();
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  // Get user info (only once)
  const userInfo = useMemo(() => {
    if (typeof window === "undefined") {
      return {
        fullName: "User",
        email: "user@example.com",
      };
    }
    return {
      fullName: localStorage.getItem("userFullName") || "User",
      email: localStorage.getItem("userEmail") || "user@example.com",
    };
  }, []);

  // Memoize active parent check
  const activeParentMap = useMemo(() => {
    const map = new Map<string, boolean>();
    sidebarItems.forEach((item) => {
      if (item.children) {
        map.set(item.id, item.children.some((child) => pathname === child.href));
      }
    });
    return map;
  }, [pathname]);

  // Toggle handler with useCallback
  const handleToggle = useCallback((itemId: string) => {
    setExpandedMenu((prev) => (prev === itemId ? null : itemId));
  }, []);

  return (
    <div className="w-64 bg-gradient-to-r from-gray-300 to-teal-100 shadow-lg flex flex-col">
      <nav className="mt-6 flex-1">
        <div className="px-4">
          <p className="text-[16px] font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center italic">
            <FaWrench className="text-xl text-gray-500 mr-2" />
            TECHNICIAN
          </p>

          {sidebarItems.map((item) => {
            if (item.children) {
              return (
                <ParentMenuItem
                  key={item.id}
                  item={item}
                  isExpanded={expandedMenu === item.id}
                  isParentActive={activeParentMap.get(item.id) || false}
                  pathname={pathname}
                  onToggle={() => handleToggle(item.id)}
                />
              );
            }

            return (
              <SimpleMenuItem
                key={item.id}
                item={item}
                isActive={pathname === item.href}
              />
            );
          })}
        </div>
      </nav>

      <UserProfile fullName={userInfo.fullName} email={userInfo.email} />
    </div>
  );
}