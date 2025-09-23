"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Car,
  Bell,
  Menu,
  X,
  CheckCircle,
  Home,
  AlertTriangle,
  Info,
  User,
  LogOut,
  Settings,
  Calendar,
  Clock,
  History,
  Star,
  Plus,
  Wrench,
  Mail,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
// Fake CategoryService data
const fakeCategoryServices = [
  { categoryId: 1, name: "Periodic maintenance" },
  { categoryId: 2, name: "Repair" },
  { categoryId: 3, name: "Inspection" },
  { categoryId: 4, name: "Spare part replacement" },
  { categoryId: 5, name: "Car cleaning" },
];

// Notification type
interface Notification {
  id: number;
  type: "success" | "warning" | "info";
  title: string;
  message: string;
  time: string;
  read: boolean;
  target?: string;
}

// CategoryService interface
interface CategoryService {
  categoryId: number;
  name: string;
}

// Fake user data
const fakeUser = {
  name: "Nguyen Van An",
  email: "nguyenvanan@email.com",
  avatar: "/images/avatar-placeholder.png",
  phone: "0123 456 789",
  address: "123 Le Loi, District 1, Ho Chi Minh City"
};

// Static navigation data (excluding services)
const data = {
  mainNav: [
    { id: "home", title: "Home", url: "/customer", icon: Home },
    { id: "about", title: "About", url: "/customer/about", icon: Info },
    { id: "contact", title: "Contact", url: "/customer/contact", icon: Mail },
  ],
  trackingNav: [
    { id: "appointments", title: "Appointments", url: "/customer/services/appointments", icon: Calendar },
    {id: "repairs", title: "Repairs", url: "/customer/repairs/create", icon: Info},
    { id: "progress", title: "Repair progress", url: "/customer/repairs/progress", icon: Clock },
    { id: "history", title: "Repair history", url: "/customer/repairs/history", icon: History },
    { id: "emergency", title: "Emergency", url: "/customer/services/emergency", icon: AlertTriangle },
    {id: "quotation", title: "Quotation", url: "/customer/notifications", icon: History}
  ],
  userNav: [
    { id: "profile", title: "Profile", url: "/customer/profile", icon: User },
    { id: "settings", title: "Settings", url: "/customer/settings", icon: Settings },
    { id: "logout", title: "Logout", url: "/customer/logout", icon: LogOut },
  ]
};

const isLoggedIn = true;

// Mock CategoryService API
const CategoryServiceAPI = {
  async getCategories(): Promise<CategoryService[]> {
    // Simulate API delay
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(fakeCategoryServices);
      }, 500);
    });
  }
};


export default function Header() {

  const [pathname, setPathname] = useState("/customer");
  const [categoryServices, setCategoryServices] = useState<CategoryService[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const notificationRef = useRef<HTMLDivElement>(null);

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      type: "success",
      title: "Honda Civic repair completed",
      message: "Periodic maintenance service has been completed.",
      time: "2 hours ago",
      read: false,
      target: "/customer/request-detail?requestId=1",
    },
    {
      id: 2,
      type: "info",
      title: "Appointment scheduled",
      message: "Brake repair appointment at 9:00 AM tomorrow.",
      time: "1 day ago",
      read: false,
      target: "/customer/appointments",
    },
    {
      id: 3,
      type: "warning",
      title: "Maintenance reminder",
      message: "Toyota Camry requires periodic maintenance within 7 days.",
      time: "3 days ago",
      read: true,
      target: "/customer/services/maintenance",
    },
    {
      id: 4,
      type: "success",
      title: "Payment successful",
      message: "Invoice #12345 has been successfully paid.",
      time: "1 week ago",
      read: true,
    },
  ]);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Fetch category services on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const categories = await CategoryServiceAPI.getCategories();
        setCategoryServices(categories);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategoryServices([]);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const unread = notifications.filter(n => !n.read);
  const unreadCount = unread.length;

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success": return <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />;
      case "warning": return <AlertTriangle className="h-4 w-4 text-yellow-500 flex-shrink-0" />;
      case "info": return <Info className="h-4 w-4 text-blue-500 flex-shrink-0" />;
      default: return <Info className="h-4 w-4 text-gray-500 flex-shrink-0" />;
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read: true } : n));
    setNotificationsOpen(false);
    if (notification.target) {
      setPathname(notification.target);
      // In real Next.js app: router.push(notification.target);
    }
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 flex justify-between items-center h-20">
        {/* Logo */}
        <Link
          href="/customer"
          className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
          onClick={() => setPathname("/customer")}
        >
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
              <div className="flex items-center">
                <div className="relative w-20 h-20">
                  <Image
                    src="/gr_logo.png"
                    alt="Garage Pro Logo"
                    fill
                    className="object-cover rounded-xl"
                  />
                </div>
                <h3 className="text-2xl font-bold ml-3">Garage Pro</h3>
              </div>
            </div>
          </div>

        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center space-x-1">
          {data.mainNav.map(item => {
            const isActive = pathname === item.url;
            return (
              <Link
                key={item.id}
                href={item.url}
                className={`px-4 py-2 h-10 rounded-lg font-medium transition-all duration-200 hover:scale-105 inline-flex items-center ${isActive
                    ? "bg-red-50 text-red-700 shadow-sm"
                    : "text-gray-700 hover:bg-red-50 hover:text-red-600"
                  }`}
                onClick={() => setPathname(item.url)}
              >
                <div className="flex items-center space-x-2">
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </div>
              </Link>
            );
          })}

          {/* Dynamic Services dropdown */}
          <div className="relative group">
            <div
              className={`px-4 py-2 h-10 rounded-lg font-medium transition-all duration-200 hover:scale-105 cursor-pointer inline-flex items-center ${pathname?.startsWith("/customer/services")
                  ? "bg-red-50 text-red-700 shadow-sm"
                  : "text-gray-700 hover:bg-red-50 hover:text-red-600"
                }`}
            >
              <div className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Services</span>
                <ChevronDown className="h-3 w-3 opacity-50" />
              </div>
            </div>

            {/* Services dropdown */}
            <div className="absolute left-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="p-2">
                {loadingCategories ? (
                  <div className="p-3 text-center text-gray-500">
                    <div className="animate-spin w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                    <span className="text-sm">Loading...</span>
                  </div>
                ) : categoryServices.length > 0 ? (
                  categoryServices.map(category => (
                    <Link
                      key={category.categoryId}
                      href={`/customer/services/${category.categoryId}`}
                      className="w-full p-3 rounded-lg hover:bg-red-50 flex items-center space-x-3 text-left transition-colors block"
                      onClick={() => setPathname(`/customer/services/${category.categoryId}`)}
                    >
                      <Wrench className="h-4 w-4 text-red-500 flex-shrink-0" />
                      <span className="text-gray-700 hover:text-red-600">{category.name}</span>
                    </Link>
                  ))
                ) : (
                  <div className="p-3 text-center text-gray-500">
                    <span className="text-sm">No services available</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Management dropdown */}
          <div className="relative group">
            <div
              className={`px-4 py-2 h-10 rounded-lg font-medium transition-all duration-200 hover:scale-105 cursor-pointer inline-flex items-center ${pathname?.includes("/customer/repairs")
                  ? "bg-red-50 text-red-700 shadow-sm"
                  : "text-gray-700 hover:bg-red-50 hover:text-red-600"
                }`}
            >
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Management</span>
                <ChevronDown className="h-3 w-3 opacity-50" />
              </div>
            </div>

            <div className="absolute left-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="p-2">
                {data.trackingNav.map(item => (
                  <Link
                    key={item.id}
                    href={item.url}
                    className="w-full p-3 rounded-lg hover:bg-red-50 flex items-center space-x-3 text-left transition-colors block"
                    onClick={() => setPathname(item.url)}
                  >
                    <item.icon className="h-4 w-4 text-red-500" />
                    <span className="text-gray-700 hover:text-red-600">{item.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </nav>

        {/* Right side */}
        <div className="flex items-center space-x-2">
          {!isLoggedIn && (
            <>
              <Link
                href="/auth/login"
                className="px-4 py-2 h-10 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors inline-flex items-center"
                onClick={() => setPathname("/auth/login")}
              >
                Login
              </Link>
              <Link
                href="/auth/register"
                className="px-4 py-2 h-10 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors inline-flex items-center"
                onClick={() => setPathname("/auth/register")}
              >
                Register
              </Link>
            </>
          )}

          {isLoggedIn && (
            <>
              {/* Notifications */}
              <div className="relative" ref={notificationRef}>
                <button
                  className="relative h-10 w-10 rounded-full hover:bg-blue-50 transition-all duration-200 hover:scale-105 flex items-center justify-center"
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                >
                  <Bell className="h-5 w-5 text-gray-600" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {notificationsOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-100 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-xs text-blue-600 hover:text-blue-700 px-2 py-1 rounded"
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Notification List */}
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                          <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                          <p>No notifications</p>
                        </div>
                      ) : (
                        notifications.map(n => (
                          <div
                            key={n.id}
                            onClick={() => handleNotificationClick(n)}
                            className={`flex items-start space-x-3 p-4 cursor-pointer transition-colors hover:bg-red-50 border-b border-gray-50 last:border-b-0 ${!n.read ? "bg-red-25" : ""
                              }`}
                          >
                            {getNotificationIcon(n.type)}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <p className={`font-medium text-sm ${!n.read ? "text-gray-900" : "text-gray-700"}`}>
                                  {n.title}
                                </p>
                                {!n.read && (
                                  <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 mt-2"></div>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{n.message}</p>
                              <p className="text-xs text-gray-400 mt-1">{n.time}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Footer */}
                    <div className="p-3 border-t border-gray-100 bg-gray-50">
                      <Link
                        href="/customer/notifications"
                        className="w-full h-8 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                        onClick={() => {
                          setPathname("/customer/notifications");
                          setNotificationsOpen(false);
                        }}
                      >
                        Xem tất cả thông báo
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile */}
              <div className="relative group">
                <div className="h-10 rounded-full p-0 hover:bg-red-50 transition-all duration-200 hover:scale-105 cursor-pointer">
                  <div className="h-8 w-8 rounded-full bg-red-100 ring-2 ring-red-100 flex items-center justify-center">
                    <span className="text-red-600 font-semibold text-sm">
                      {fakeUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                </div>

                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="p-3 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                        <span className="text-red-600 font-semibold">
                          {fakeUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{fakeUser.name}</p>
                        <p className="text-sm text-gray-500 truncate">{fakeUser.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-2">
                    <Link
                      href="/customer/account"
                      className="w-full p-3 rounded-lg flex items-center space-x-3 hover:bg-gray-50 text-left block"
                      onClick={() => setPathname("/customer/account/profile")}
                    >
                      <User className="h-4 w-4 text-red-500" />
                      <span>Profile</span>
                    </Link>

                    <Link
                      href="/customer/vehicles"
                      className="w-full p-3 rounded-lg flex items-center space-x-3 hover:bg-gray-50 text-left block"
                      onClick={() => setPathname("/customer/account/vehicles")}
                    >
                      <Car className="h-4 w-4 text-red-500" />
                      <span>My Vehicles</span>
                    </Link>

                    <Link
                      href="/customer/account/settings"
                      className="w-full p-3 rounded-lg flex items-center space-x-3 hover:bg-gray-50 text-left block"
                      onClick={() => setPathname("/customer/account/settings")}
                    >
                      <Settings className="h-4 w-4 text-red-500" />
                      <span>Settings</span>
                    </Link>

                    <div className="border-t border-gray-100 my-1"></div>

                    <Link
                      href="/auth/logout"
                      className="w-full p-3 rounded-lg flex items-center space-x-3 text-red-600 hover:bg-red-50 text-left block"
                      onClick={() => setPathname("/auth/logout")}
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </Link>
                  </div>
                </div>
              </div>
            </>)}


          {/* Mobile menu button */}
          <button
            className="lg:hidden h-10 w-10 rounded-lg hover:bg-red-50 transition-all duration-200 flex items-center justify-center"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white shadow-lg">
          <nav className="flex flex-col space-y-1 p-4">
            {data.mainNav.map(item => (
              <Link
                key={item.id}
                href={item.url}
                className={`px-4 py-3 rounded-lg transition-all duration-200 text-left block ${pathname === item.url
                    ? "bg-red-50 text-red-700"
                    : "text-gray-700 hover:bg-red-50 hover:text-red-600"
                  }`}
                onClick={() => {
                  setPathname(item.url);
                  setMobileMenuOpen(false);
                }}
              >
                <div className="flex items-center space-x-3">
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.title}</span>
                </div>
              </Link>
            ))}

            {/* Mobile Services */}
            <div className="border-t border-gray-200 my-3"></div>
            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Dịch vụ
            </div>
            {loadingCategories ? (
              <div className="px-4 py-3 text-center text-gray-500">
                <div className="animate-spin w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                <span className="text-sm">Đang tải...</span>
              </div>
            ) : (
              categoryServices.map(category => (
                <Link
                  key={category.categoryId}
                  href={`/customer/services/${category.categoryId}`}
                  className="w-full px-4 py-3 rounded-lg transition-all duration-200 text-left text-gray-700 hover:bg-red-50 hover:text-red-600 block"
                  onClick={() => {
                    setPathname(`/customer/services/${category.categoryId}`);
                    setMobileMenuOpen(false);
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <Wrench className="h-5 w-5" />
                    <span className="font-medium">{category.name}</span>
                  </div>
                </Link>
              ))
            )}

            <div className="border-t border-gray-200 my-3"></div>
            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Quản lý & Theo dõi
            </div>
            {data.trackingNav.map(item => (
              <Link
                key={item.id}
                href={item.url}
                className={`w-full px-4 py-3 rounded-lg transition-all duration-200 text-left block ${pathname === item.url
                    ? "bg-red-50 text-red-700"
                    : "text-gray-700 hover:bg-red-50 hover:text-red-600"
                  }`}
                onClick={() => {
                  setPathname(item.url);
                  setMobileMenuOpen(false);
                }}
              >
                <div className="flex items-center space-x-3">
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.title}</span>
                </div>
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}