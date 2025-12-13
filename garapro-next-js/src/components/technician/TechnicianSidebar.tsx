"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import {
  Home,
  ClipboardList,
  Wrench,
  History,
  Car,
  BarChart3,
  ClipboardCheck,
  Cog,
  ChevronDown,
} from "lucide-react";
import {FaUserCircle}from "react-icons/fa";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

import { authService } from "@/services/authService";

interface TechnicianSidebarProps {
  onClose?: () => void;
}

type Item = {
  id: string;
  label: string;
  icon: React.ElementType;
  href?: string;
  children?: { id: string; label: string; icon: React.ElementType; href: string }[];
};

const sidebarItems: Item[] = [
  { id: "home", label: "Home", icon: Home, href: "/technician" },
  { id: "task-management", label: "My Task", icon: ClipboardList, href: "/technician/taskManagement" },
  {
    id: "condition-inspection",
    label: "Inspection & Repair",
    icon: Wrench,
    children: [
      { id: "vehicle-inspection", label: "Vehicle Inspection", icon: ClipboardCheck, href: "/technician/inspectionAndRepair/inspection" },
      { id: "repair-progress", label: "Repair Progress", icon: Cog, href: "/technician/inspectionAndRepair/repair" },
    ],
  },
  { id: "repair-history", label: "Repair History", icon: History, href: "/technician/repairHistory" },
  { id: "vehicle-lookup", label: "Information Lookup", icon: Car, href: "/technician/vehicleLookup" },
  { id: "statistical", label: "Statistical", icon: BarChart3, href: "/technician/statistical" },
];

export default function TechnicianSidebar({ onClose }: TechnicianSidebarProps) {
  const pathname = usePathname() || "";
  const [expanded, setExpanded] = React.useState<string | null>(null);
  const [userFullName, setUserFullName] = React.useState("");

  const activeClass =
  "bg-primary/15 text-primary font-semibold hover:bg-primary/20";

  const handleNavClick = () => {
    if (onClose && window.innerWidth < 1024) onClose();
  };

  const userInfo = React.useMemo(() => {
    if (typeof window === "undefined") return { fullName: "Technician", email: "technician@example.com" };
    const currentUser = authService.getCurrentUser();
    return {
      fullName: userFullName || currentUser.fullName || "Technician",
      email: currentUser.email || "technician@example.com",
    };
  }, [userFullName]);

  React.useEffect(() => {
    const handler = (event: CustomEvent) => setUserFullName(event.detail?.fullName ?? "");
    window.addEventListener("profileUpdated", handler as EventListener);
    return () => window.removeEventListener("profileUpdated", handler as EventListener);
  }, []);

  // auto expand parent khi route nằm trong children
  React.useEffect(() => {
    const parent = sidebarItems.find((it) => it.children?.some((c) => pathname.startsWith(c.href)));
    if (parent?.id) setExpanded(parent.id);
  }, [pathname]);

  return (
    <div className="h-full bg-background flex flex-col rounded">
      <div className="px-4 py-4">
        <div className="flex items-center gap-2">
          <Wrench className="h-6 w-6 text-muted-foreground" />
          <p className="text-base font-bold tracking-wide text-muted-foreground italic">TECHNICIAN</p>
        </div>
      </div>

      <Separator />

      <ScrollArea className="flex-1">
        <div className="p-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;

            if (item.children?.length) {
              const isParentActive = item.children.some((c) => pathname.startsWith(c.href));
              const open = expanded === item.id;

              return (
                <Collapsible
                  key={item.id}
                  open={open}
                  onOpenChange={() => setExpanded(open ? null : item.id)}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-between h-11 text-[16px]",
                        isParentActive ? activeClass : "hover:bg-muted"
                      )}
                    >
                      <span className="flex items-center gap-3">
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </span>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform",
                          open && "rotate-180"
                        )}
                      />
                    </Button>
                  </CollapsibleTrigger>

                  <CollapsibleContent className="mt-1 space-y-1 pl-4">
                    {item.children.map((child) => {
                      const ChildIcon = child.icon;
                      const active = pathname.startsWith(child.href);

                      return (
                        <Link
                          key={child.id}
                          href={child.href}
                          onClick={handleNavClick}
                        >
                          <Button
                            variant="ghost"
                            className={cn(
                              "w-full justify-start h-10",
                              active
                                ? activeClass : "hover:bg-muted" ,active && "font-bold text-[15px]"                              
                            )}
                          >
                            <ChildIcon className="h-4 w-4 mr-3" />
                            {child.label}
                          </Button>
                        </Link>
                      );
                    })}
                  </CollapsibleContent>
                </Collapsible>
              );
            }

            const active = item.href ? pathname === item.href : false;

            return (
              <Link key={item.id} href={item.href!} onClick={handleNavClick}>
                <Button
                  variant={active ? "secondary" : "ghost"}
                  className={cn("w-full justify-start h-15 text-[16px] font-semibold", active && "font-bold text-[17px] bg-stone-200 ")}
                >
                  <Icon className="h-4 w-4 mr-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </div>
      </ScrollArea>

      <Separator />

      <div className="p-4 flex items-center gap-3">
        <FaUserCircle className="h-9 w-9 text-muted-foreground" />
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{userInfo.fullName}</p>
          <p className="text-xs text-muted-foreground truncate">{userInfo.email}</p>
        </div>
      </div>
    </div>
  );
}
