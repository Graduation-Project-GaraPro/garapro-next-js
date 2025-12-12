"use client";

import { Bell, PanelLeft, User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { authService } from "@/services/authService";
import { useUserProfile } from "@/hooks/use-user-profile";
import { useCurrentBranch } from "@/hooks/use-current-branch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useSidebar } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
// import TechnicianAssignmentNotification from "@/components/manager/technician-assignment-notification"

export function SiteHeader() {
  const { toggleSidebar } = useSidebar();
  const { user, loading } = useUserProfile();
  const { branch, loading: branchLoading } = useCurrentBranch();

  const handleLogout = async () => {
      try {
        
        await authService.logout();
        
        
        window.location.href = "/login";
        
      } catch (error) {
        console.error("Logout error:", error);
        window.location.href = "/login";
      }
    };
  return (
    <header
      className="flex sticky top-0 z-50 w-full items-center border-b"
      style={{ backgroundColor: "#154c79" }}
    >
      <div className="flex h-[--header-height] w-full items-center gap-2 px-4 py-3">
        <Button
          className="h-8 w-8 text-white hover:text-white hover:bg-white/10"
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
        >
          <PanelLeft />
        </Button>
        <Separator orientation="vertical" className="mr-2 h-4 bg-white/30" />

        {/* GaragePro Logo */}
        <Link
          href="/manager"
          className="flex items-center gap-0 select-none cursor-pointer hover:opacity-90 transition-opacity"
          style={{ WebkitUserSelect: "none", userSelect: "none" }}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg overflow-hidden">
            <Image
              src="/gr_logo.png"
              alt="GaragePro Logo"
              width={32}
              height={32}
              className="h-full w-full object-contain pointer-events-none"
            />
          </div>
          <span className="font-semibold text-lg text-white pointer-events-none">
            Garage
            <span className="text-600 text-xl font-semibold italic">Pro</span>
          </span>
        </Link>

        {/* Branch Name next to logo */}
        <div className="ml-4 flex items-center">
          <span className="text-white/80 text-sm font-medium">
            {branchLoading ? "Loading..." : (branch?.branchName || "No Branch")}
          </span>
        </div>

        {/* Spacer to push content to edges */}
        <div className="flex-1" />

        {/* Right side buttons */}
        <div className="flex items-center gap-2">
          {/* Settings Button */}
          {/* <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white hover:text-white hover:bg-white/10"
          >
            <Settings className="h-4 w-4" />
          </Button> */}


          {/* General Notifications Button with Badge */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:text-white hover:bg-white/10"
            >
              <Bell className="h-4 w-4" />
            </Button>
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-[#ae2621]"
            >
              1
            </Badge>
          </div>

          <Separator orientation="vertical" className="h-4 bg-white/30" />

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 px-2 gap-2 text-white hover:text-white hover:bg-white/10"
                disabled={loading}
              >
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs font-medium bg-primary text-primary-foreground">
                    {loading ? "..." : (user?.initials || "U")}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">
                  {loading ? "Loading..." : (user?.fullName || "User")}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {user && (
                <DropdownMenuItem asChild>
                  <Link href="/manager/profile" className="flex items-center gap-3 py-2 cursor-pointer">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-sm font-medium">
                        {user.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col leading-tight">
                      <span className="font-medium">{user.fullName}</span>
                      <span className="text-sm text-muted-foreground">{user.email}</span>
                    </div>
                  </Link>
                </DropdownMenuItem>
              )}

              {!user && !loading && (
                <DropdownMenuItem className="flex items-center gap-3 py-2">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div className="flex flex-col leading-tight">
                    <span className="font-medium">Profile unavailable</span>
                    <span className="text-sm text-muted-foreground">Please try again</span>
                  </div>
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleLogout()}
                className="text-red-600"
              >
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
