  "use client";
  import { useState, useRef, useEffect } from "react";
  import { useRouter } from "next/navigation";
  import Image from "next/image";
  import { Toaster, toast } from "react-hot-toast";
  import ProfileModal from "@/components/technician/ProfileModal"; 
  import {
    FaUserCircle, FaUser, FaCog, FaChartBar, FaSignOutAlt,
    FaBell, FaTimes, FaCheckCircle, FaCommentDots
  } from "react-icons/fa";
  import { authService } from "@/services/authService";
  import {
    getAllNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    NotificationDto,
  } from "@/services/technician/notificationService";
  import notificationSignalRService, {
    ReceiveNotificationData,
    UnreadCountUpdatedData,
    NotificationReadData,
    AllNotificationsReadData,
    NotificationDeletedData
  } from "@/services/technician/notificationSignalRService";

  interface Notification {
    id: string;
    content: string;
    timeSent: string;
    type: 'message' | 'warning';
    isRead: boolean;
    target?: string;
  }

  export default function TechnicianHeader() {
    const router = useRouter();
    const [showAccountMenu, setShowAccountMenu] = useState(false);
    const [showNotificationMenu, setShowNotificationMenu] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
    const [signalRConnected, setSignalRConnected] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);

    const dropdownRef = useRef<HTMLDivElement>(null);
    const accountRef = useRef<HTMLDivElement>(null);
    const notificationRef = useRef<HTMLDivElement>(null);

    const setupSignalREvents = () => {
    const getNotificationType = (typeValue: unknown): 'message' | 'warning' => {
      const typeStr = String(typeValue);
      if (typeStr === 'Warning' || typeStr === '0') {
        return 'warning';
      }
      return 'message';
    };

    const handleReceiveNotification = async (data: ReceiveNotificationData) => {
      console.log("New notification received:", data);

      const notificationType = getNotificationType(data.notificationType);
      
      if (notificationType === 'warning') {
        toast.error(data.content, {
          duration: 4000,
          icon: '⚠️',
          style: {
            background: '#FEF2F2',
            color: '#DC2626',
            border: '1px solid #FECACA',
          },
        });
      } else {
        toast.success(data.content, {
          duration: 3000,
          icon: '🔔',
          style: {
            background: '#F0F9FF',
            color: '#0369A1',
            border: '1px solid #BAE6FD',
          },
        });
      }

      const newNotification: Notification = {
        id: data.notificationId,
        content: data.content,
        timeSent: data.timeSent,
        type: notificationType,
        isRead: false,
        target: data.target,
      };

      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1); 
      
      await loadUnreadCount();
    };

      const handleUnreadCountUpdated = (data: UnreadCountUpdatedData) => {
        console.log("Unread count updated:", data);
        setUnreadCount(data.unreadCount);
      };

      const handleNotificationRead = async (data: NotificationReadData) => {
        console.log("Notification read:", data);
        
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === data.notificationId 
              ? { ...notif, isRead: true }
              : notif
          )
        );
        
        setUnreadCount(prev => Math.max(0, prev - 1));
        await loadUnreadCount();
      };

      const handleAllNotificationsRead = async (data: AllNotificationsReadData) => {
        console.log("All notifications read:", data);
        
        setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
        setUnreadCount(0);
      };

      const handleNotificationDeleted = async (data: NotificationDeletedData) => {
        console.log("Notification deleted:", data);
        
        setNotifications(prev => {
          const deletedNotif = prev.find(n => n.id === data.notificationId);
          if (deletedNotif && !deletedNotif.isRead) {
            setUnreadCount(prevCount => Math.max(0, prevCount - 1));
          }
          return prev.filter(notif => notif.id !== data.notificationId);
        });
        
        await loadUnreadCount();
      };

      return {
        handleReceiveNotification,
        handleUnreadCountUpdated,
        handleNotificationRead,
        handleAllNotificationsRead,
        handleNotificationDeleted
      };
    };

    // SignalR Connection
    useEffect(() => {
      let isMounted = true;

      const setupSignalR = async () => {
        try {
          await notificationSignalRService.startConnection();
          
          if (!isMounted) return;
          
          setSignalRConnected(true);
          const {
            handleReceiveNotification,
            handleUnreadCountUpdated,
            handleNotificationRead,
            handleAllNotificationsRead,
            handleNotificationDeleted
          } = setupSignalREvents();

          notificationSignalRService.onReceiveNotification(handleReceiveNotification);
          notificationSignalRService.onUnreadCountUpdated(handleUnreadCountUpdated);
          notificationSignalRService.onNotificationRead(handleNotificationRead);
          notificationSignalRService.onAllNotificationsRead(handleAllNotificationsRead);
          notificationSignalRService.onNotificationDeleted(handleNotificationDeleted);

        } catch (error) {
          console.error("SignalR setup failed:", error);
          if (isMounted) setSignalRConnected(false);
        }
      };

      setupSignalR();

      return () => {
        isMounted = false;
        notificationSignalRService.offAllEvents();
      };
    }, []);

    const loadNotifications = async () => {
      try {
        setIsLoadingNotifications(true);
        const data = await getAllNotifications();

        console.log("RAW API RESPONSE");
        console.log("Full response:", data);
        console.log("Is Array:", Array.isArray(data));
        console.log("Length:", data?.length);

        const notifications = Array.isArray(data) ? data : ((data as { value?: NotificationDto[] })?.value || []);

        console.log("Notifications to map:", notifications);

      const mappedNotifications: Notification[] = notifications.map((notif: NotificationDto) => {
      console.log("Mapping notification:", notif);
      
      const notifType = typeof notif.type === 'string' ? parseInt(notif.type) : notif.type;
      const notifStatus = typeof notif.status === 'string' ? parseInt(notif.status) : notif.status;
      
      return {
        id: notif.notificationID,
        content: notif.content,
        timeSent: notif.timeSent,
        type: notifType === 0 ? 'warning' : 'message',  
        isRead: notifStatus === 1,
        target: notif.target,
      };
    });

        setNotifications(mappedNotifications);
        console.log("Notifications loaded:", mappedNotifications.length);
        console.log("Mapped notifications:", mappedNotifications);
      } catch (error) {
        console.error("Error loading notifications:", error);
        if (error instanceof Error) {
          console.error("Error message:", error.message);
          console.error("Error stack:", error.stack);
        }
      } finally {
        setIsLoadingNotifications(false);
      }
    };

    const loadUnreadCount = async () => {
      try {
        const count = await getUnreadCount();
        setUnreadCount(count);
        console.log("Unread count loaded:", count);
      } catch (error) {
        console.error("Error loading unread count:", error);
      }
    };

    useEffect(() => {
      loadNotifications();
      loadUnreadCount();
    }, []);

    useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node) &&
          accountRef.current &&
          !accountRef.current.contains(event.target as Node)
        ) {
          setShowAccountMenu(false);
        }
        if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
          setShowNotificationMenu(false);
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

    const toggleAccountMenu = () => {
      setShowAccountMenu(!showAccountMenu);
    };

    const toggleNotificationMenu = async () => {
      if (!showNotificationMenu) {
        await loadNotifications();
        await loadUnreadCount();
      }
      setShowNotificationMenu(!showNotificationMenu);
    };

    const handleNotificationClick = async (notificationId: string) => {
      try {
        setNotifications(prev =>
          prev.map((notif) => (notif.id === notificationId ? { ...notif, isRead: true } : notif))
        );
        setUnreadCount(prev => Math.max(0, prev - 1));

        await markAsRead(notificationId);

        const notification = notifications.find((n) => n.id === notificationId);
        if (notification?.target) {
          router.push(notification.target);
          setShowNotificationMenu(false);
        }
      } catch (error) {
        console.error("Error marking notification as read:", error);
        await loadNotifications();
        await loadUnreadCount();
      }
    };

    const handleDeleteNotification = async (notificationId: string, event: React.MouseEvent) => {
      event.stopPropagation();

      try {
        const notification = notifications.find((n) => n.id === notificationId);
        const wasUnread = notification && !notification.isRead;

        setNotifications(prev => prev.filter((notif) => notif.id !== notificationId));
        if (wasUnread) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }

        await deleteNotification(notificationId);

      } catch (error) {
        console.error("Error deleting notification:", error);
        await loadNotifications();
        await loadUnreadCount();
      }
    };

    const handleReadAll = async () => {
      try {
        setNotifications(prev => prev.map((notif) => ({ ...notif, isRead: true })));
        setUnreadCount(0);

        await markAllAsRead();
        
      } catch (error) {
        console.error("Error marking all as read:", error);
        await loadNotifications();
        await loadUnreadCount();
      }
    };

    const formatTime = (timeString: string) => {
      const date = new Date(timeString);
      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

      if (diffInMinutes < 1) return "Just now";
      if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
      return `${Math.floor(diffInMinutes / 1440)} days ago`;
    };

  const handleLogout = async () => {
    try {
      await notificationSignalRService.stopConnection();
      await authService.logout();
      setShowAccountMenu(false);
      
      window.location.href = "/login";
      
    } catch (error) {
      console.error("Logout error:", error);
      window.location.href = "/login";
    }
  };

const handleGoToRepair = () => {
  setShowAccountMenu(false); 
  router.push("/technician/inspectionAndRepair/repair");
};

const handleGoToStatistical = () => {
  setShowAccountMenu(false); 
  router.push("/technician/statistical");
};
    return (
      <>
      <header className="bg-gradient-to-r from-blue-100 to-teal-100 shadow-sm border-b border-teal-200 p-4 w-full text-white">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-12">
            <div className="flex items-center space-x-2">
              <Image
                src="/logo.png"
                alt="GaragePro Logo"
                width={40}
                height={40}
                className="object-contain rounded-xl"
              /> 
              <span className="text-xl font-bold text-gray-800">GaragePro</span>
            </div>
            <div className="h-8 w-px bg-gray-300" style={{ marginLeft: "58px" }}></div>
          </div>
          <div className="flex items-center space-x-4 bg-white/70 rounded-xl px-5 py-1">
            {/* SignalR Connection Indicator */}
            <div className="flex items-center gap-2 mr-2">
              <div 
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  signalRConnected 
                    ? "bg-green-500 animate-pulse shadow-lg shadow-green-400" 
                    : "bg-red-500 shadow-lg shadow-red-400"
                }`}
                title={signalRConnected ? "Real-time Connected" : "Disconnected"}
              />
              <span className="text-xs text-gray-600 hidden sm:block">
                {signalRConnected ? "Live" : "Offline"}
              </span>
            </div>

            {/* Notification Menu */}
            <div className="relative" ref={notificationRef}>
              <button
                className="relative text-blue-600 hover:text-blue-800 transition-colors duration-200"
                onClick={toggleNotificationMenu}
              >
                <FaBell className="text-3xl text-gray-500 hover:text-gray-700" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {showNotificationMenu && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden">
                  {/* Header */}
                  <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-teal-50">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <FaBell className="text-3xl text-blue-600" />
                        <h3 className="text-sm font-bold text-gray-800">Notifications</h3>
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleReadAll}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="max-h-72 overflow-y-auto">
                    {isLoadingNotifications ? (
                      <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="text-sm text-gray-500 mt-2">Loading...</p>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">
                        <FaCommentDots className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                        <p className="text-sm">No notifications</p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-all cursor-pointer relative rounded-xl
                            ${
                              !notification.isRead
                                ? notification.type === "message"
                                  ? "bg-blue-100 border-l-4 border-l-blue-500"
                                  : "bg-red-100 border-l-4 border-l-red-500"
                                : "bg-gray-100 border-l-4 border-l-gray-500"
                            }`}
                          onClick={() => handleNotificationClick(notification.id)}
                        >
                          <div className="flex items-start justify-between">
                        <div className="flex-1 pr-10">
                          <p
                            className={`text-sm leading-relaxed ${
                              !notification.isRead ? "font-semibold text-gray-900" : "text-gray-600"
                            }`}
                          >
                            {notification.content.length > 150 
                              ? `${notification.content.substring(0, 150)}...` 
                              : notification.content
                            }
                          </p>
                          <p className="text-xs text-gray-500 mt-1.5">
                            {formatTime(notification.timeSent)}
                          </p>
                        </div>
                            {/* Unread icon */}
                            {!notification.isRead && (
                              <FaCheckCircle className="text-green-500 text-lg flex-shrink-0" />
                            )}

                            {/* Delete button */}
                            <button
                              onClick={(e) => handleDeleteNotification(notification.id, e)}
                              className="ml-3 text-gray-400 hover:text-red-600 transition"
                            >
                              <FaTimes className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Footer */}
                  {notifications.length > 0 && (
                    <div className="p-2 border-t border-gray-100 bg-gray-50">
                      <button                      
                        className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        ...
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="h-8 w-px bg-gray-400/50"></div>

            {/* Account Menu */}
            <div className="relative" ref={accountRef}>
              <button
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
                onClick={toggleAccountMenu}
              >
                <FaUserCircle className="text-3xl text-gray-500 hover:text-gray-700" />
              </button>
              {showAccountMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {typeof window !== "undefined"
                          ? (localStorage.getItem("userFullName") || "U")
                              .split(" ")
                              .map((n) => n.charAt(0).toUpperCase())
                              .slice(-2)
                              .join("")
                          : "U"}
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-gray-800">
                          {typeof window !== "undefined"
                            ? localStorage.getItem("userFullName") || "User"
                            : "User"}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {typeof window !== "undefined"
                            ? localStorage.getItem("userEmail") || "user@example.com"
                            : "user@example.com"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="py-2 px-2">
                    <button 
                        onClick={() => {
                          setShowProfileModal(true);
                          setShowAccountMenu(false);
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-blue-50 transition-colors duration-200 rounded-xl"
                      >
                        <FaUser className="text-gray-700" />
                        <span className="text-sm font-semibold">Profile</span>
                      </button>
<button 
  onClick={handleGoToRepair}
  className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-blue-50 transition-colors duration-200 rounded-xl"
>
  <FaCog className="text-gray-700" />
  <span className="text-sm font-semibold">Repair</span>
</button>

<button 
  onClick={handleGoToStatistical}
  className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-blue-50 transition-colors duration-200 rounded-xl"
>
  <FaChartBar className="text-gray-700" />
  <span className="text-sm font-semibold">Statistical</span>
</button>
                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors duration-200 rounded-xl"
                      >
                        <FaSignOutAlt className="text-red-700" />
                        <span className="text-sm font-bold">Log out</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 5000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </header>
         <ProfileModal 
      isOpen={showProfileModal} 
      onClose={() => setShowProfileModal(false)} 
    />
  </>
    );
  }