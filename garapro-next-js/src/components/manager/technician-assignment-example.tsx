"use client";

import { useTechnicianAssignmentNotifications } from "@/hooks/manager/useTechnicianAssignmentNotifications";
import { Button } from "@/components/ui/button";

export default function TechnicianAssignmentExample() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll
  } = useTechnicianAssignmentNotifications();

  return (
    <div className="p-4 border rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Technician Assignment Notifications</h2>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              Mark all read ({unreadCount} unread)
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={clearAll}>
            Clear all
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {notifications.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No technician assignment notifications
          </p>
        ) : (
          notifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`p-3 rounded border ${
                !notification.read 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">{notification.message}</p>
                  <p className="text-sm text-gray-500">
                    {notification.timestamp.toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  {!notification.read && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => markAsRead(notification.id)}
                    >
                      Mark as read
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => removeNotification(notification.id)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}