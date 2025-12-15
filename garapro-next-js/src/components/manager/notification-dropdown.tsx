// src/components/manager/notification-dropdown.tsx
"use client";

import React from 'react';
import { Bell, Check, CheckCheck, Trash2, ExternalLink, CheckCircle2, AlertTriangle, Info, MessageSquare} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useManagerNotifications } from '@/hooks/use-manager-notifications';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';

interface NotificationDropdownProps {
  branchId?: string;
  useRepairOrderHub?: boolean;
}

export function NotificationDropdown({ branchId, useRepairOrderHub = true }: NotificationDropdownProps) {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    isLoading,
    isConnected,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useManagerNotifications({ branchId, useRepairOrderHub });

  const handleNotificationClick = async (notificationId: string, target?: string, notification?: any) => {
    // Mark as read when clicked
    await markAsRead(notificationId);
    
    // Navigate to target if provided
    if (target && target !== '#') {
      // Fix repair order URLs
      if (target.includes('/manager/repair-orders/')) {
        const repairOrderId = target.split('/manager/repair-orders/')[1];
        router.push(`/manager/repairOrderManagement/orders/${repairOrderId}`);
      } else {
        router.push(target);
      }
    } else if (notification?.type === 'REPAIR_ORDER_COMPLETED' && notification?.repairOrderId) {
      // Fallback for repair order completion notifications
      router.push(`/manager/repairOrderManagement/orders/${notification.repairOrderId}`);
    }
  };

  const handleMarkAsRead = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    await markAsRead(notificationId);
  };

  const handleDelete = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    await deleteNotification(notificationId);
  };

  const handleMarkAllAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await markAllAsRead();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'REPAIR_ORDER_COMPLETED':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'Alert':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'Warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'Info':
        return <Info className="h-4 w-4 text-blue-600" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'REPAIR_ORDER_COMPLETED':
        return 'text-green-600';
      case 'Alert':
        return 'text-red-600';
      case 'Warning':
        return 'text-yellow-600';
      case 'Info':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const getNotificationTitle = (notification: any) => {
    if (notification.type === 'REPAIR_ORDER_COMPLETED') {
      return notification.title || 'Repair Order Completed';
    }
    return notification.type;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          <div className="flex items-center gap-2">
            {!isConnected && (
              <Badge variant="outline" className="text-xs">
                Offline
              </Badge>
            )}
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="h-6 px-2 text-xs"
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        {isLoading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No notifications
          </div>
        ) : (
          <ScrollArea className="h-96">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.notificationID}
                className={`p-3 cursor-pointer ${
                  notification.status === 'Unread' ? 'bg-blue-50 border-l-2 border-l-blue-500' : ''
                }`}
                onClick={() => handleNotificationClick(notification.notificationID, notification.target, notification)}
              >
                <div className="flex items-start gap-3 w-full">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-medium ${getNotificationColor(notification.type)}`}>
                        {getNotificationTitle(notification)}
                      </p>
                      <div className="flex items-center gap-1">
                        {notification.status === 'Unread' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleMarkAsRead(e, notification.notificationID)}
                            className="h-6 w-6 p-0"
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleDelete(e, notification.notificationID)}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-700 mt-1 line-clamp-2">
                      {notification.content}
                    </p>
                    
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.timeSent), { addSuffix: true })}
                      </span>
                      {notification.target && notification.target !== '#' && (
                        <ExternalLink className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}