// src/components/manager/notification-example.tsx
"use client";

import React from 'react';
import { useManagerNotifications } from '@/hooks/use-manager-notifications';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Wifi, WifiOff } from 'lucide-react';

interface NotificationExampleProps {
  branchId?: string;
  useRepairOrderHub?: boolean;
}

export function NotificationExample({ branchId, useRepairOrderHub = true }: NotificationExampleProps) {
  const {
    notifications,
    unreadCount,
    isLoading,
    isConnected,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useManagerNotifications({ branchId, useRepairOrderHub });

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Manager Notifications
          {unreadCount > 0 && (
            <Badge variant="destructive">{unreadCount}</Badge>
          )}
        </CardTitle>
        <CardDescription className="flex items-center gap-2">
          SignalR Connection: 
          {isConnected ? (
            <Badge variant="default" className="flex items-center gap-1">
              <Wifi className="h-3 w-3" />
              Connected
            </Badge>
          ) : (
            <Badge variant="destructive" className="flex items-center gap-1">
              <WifiOff className="h-3 w-3" />
              Disconnected
            </Badge>
          )}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={refreshNotifications} 
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? 'Loading...' : 'Refresh'}
          </Button>
          
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} variant="outline">
              Mark All Read ({unreadCount})
            </Button>
          )}
        </div>

        <div className="space-y-2">
          {notifications.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No notifications
            </p>
          ) : (
            notifications.slice(0, 5).map((notification) => (
              <div
                key={notification.notificationID}
                className={`p-3 border rounded-lg ${
                  notification.status === 'Unread' 
                    ? 'bg-blue-50 border-blue-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">{notification.type}</Badge>
                      {notification.status === 'Unread' && (
                        <Badge variant="destructive" className="text-xs">New</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mb-2">
                      {notification.content}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(notification.timeSent).toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="flex gap-1">
                    {notification.status === 'Unread' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markAsRead(notification.notificationID)}
                      >
                        Mark Read
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteNotification(notification.notificationID)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
          
          {notifications.length > 5 && (
            <p className="text-sm text-muted-foreground text-center">
              ... and {notifications.length - 5} more notifications
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}