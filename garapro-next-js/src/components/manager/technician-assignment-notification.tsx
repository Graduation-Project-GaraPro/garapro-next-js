"use client";

import { useState } from "react";
import { 
  Wrench, 
  Eye, 
  CheckCircle, 
  X
} from "lucide-react";
import { useTechnicianAssignmentNotifications } from "@/hooks/manager/useTechnicianAssignmentNotifications";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function TechnicianAssignmentNotification() {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    removeNotification, 
    clearAll 
  } = useTechnicianAssignmentNotifications();

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative h-8 w-8 text-white hover:text-white hover:bg-white/10"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Wrench className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] text-white">
            {unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-md bg-white shadow-lg z-50 border border-gray-200">
          <div className="p-3 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-sm font-semibold">Technician Assignments</h3>
            <div className="flex space-x-1">
              {unreadCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 px-2 text-xs"
                  onClick={markAllAsRead}
                >
                  Mark all read
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 px-2 text-xs"
                onClick={clearAll}
              >
                Clear all
              </Button>
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">
                No assignment notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`m-2 ${!notification.read ? 'border-l-4 border-l-blue-500' : ''}`}
                >
                  <CardContent className="p-3 relative">
                    <button
                      onClick={() => removeNotification(notification.id)}
                      className="absolute top-1 right-1 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-0.5">
                        {notification.type.includes("job") ? (
                          <Wrench className="h-4 w-4 text-blue-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                      
                      <div className="ml-2 flex-1">
                        <p className="text-sm text-gray-800">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {notification.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      
                      {!notification.read && (
                        <button 
                          onClick={() => markAsRead(notification.id)}
                          className="flex-shrink-0 ml-2 text-blue-500 hover:text-blue-700"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
          
          <div className="p-2 border-t border-gray-200 text-center">
            <Button variant="ghost" size="sm" className="text-xs text-gray-500">
              View assignment history
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}