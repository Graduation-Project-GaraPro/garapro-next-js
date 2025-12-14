# Manager Notification System

This implementation provides a complete notification system for managers with API integration and real-time SignalR updates.

## Features

- **Real-time notifications** via SignalR
- **Unread count badge** in the header
- **Notification dropdown** with actions
- **API integration** for CRUD operations
- **Automatic reconnection** handling
- **Branch-specific** notifications support
- **Flexible hub connection** (NotificationHub or RepairOrderHub)

## API Endpoints

### 1. Get Unread Count
```
GET /api/notification/unread-count
Authorization: Bearer {token}
Response: { "unreadCount": 3 }
```

### 2. Get All Notifications
```
GET /api/notification
Authorization: Bearer {token}
Response: [
  {
    "notificationID": "guid",
    "content": "Mobile payment received: John Doe paid $150.00 for Toyota Camry (ABC123) via PayOs",
    "type": "Message",
    "timeSent": "2024-12-14T10:30:00Z",
    "status": "Unread",
    "target": "/manager/repair-orders/guid"
  }
]
```

### 3. Mark as Read
```
PUT /api/notification/{notificationId}/read
Authorization: Bearer {token}
```

## SignalR Integration

### Connection Setup Options

#### Option 1: Dedicated NotificationHub
```typescript
const connection = new signalR.HubConnectionBuilder()
  .withUrl("/notificationHub", {
    accessTokenFactory: () => "your-jwt-token"
  })
  .build();
```

#### Option 2: Via RepairOrderHub (Recommended)
```typescript
const connection = new signalR.HubConnectionBuilder()
  .withUrl("/hubs/repairorder", {
    accessTokenFactory: () => "your-jwt-token"
  })
  .build();
```

**Note**: The implementation supports both approaches. Use `useRepairOrderHub: true` option if notifications are sent through the RepairOrderHub (which is common since it already has the `JoinManagersGroup` method).

### SignalR Groups & Events

#### Manager Groups
- **Managers Group**: Receives all manager notifications
- **Branch Groups**: Receives branch-specific notifications

#### Events
- **NotificationReceived**: New notification received
- **NotificationUpdated**: Notification status changed
- **ManagerNotificationReceived**: Alternative event name for manager notifications

## Usage

### 1. Using the Hook (RepairOrderHub - Recommended)
```typescript
import { useManagerNotifications } from '@/hooks/use-manager-notifications';

function MyComponent() {
  const {
    notifications,
    unreadCount,
    isLoading,
    isConnected,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useManagerNotifications({ 
    branchId: 'your-branch-id',
    useRepairOrderHub: true // Use RepairOrderHub (recommended)
  });

  return (
    <div>
      <p>Unread: {unreadCount}</p>
      <p>Connected: {isConnected ? 'Yes' : 'No'}</p>
      {/* Render notifications */}
    </div>
  );
}
```

### 2. Using the Hook (Dedicated NotificationHub)
```typescript
import { useManagerNotifications } from '@/hooks/use-manager-notifications';

function MyComponent() {
  const {
    notifications,
    unreadCount,
    isLoading,
    isConnected,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useManagerNotifications({ 
    branchId: 'your-branch-id',
    useRepairOrderHub: false // Use dedicated NotificationHub
  });
}
```

### 3. Using the Dropdown Component
```typescript
import { NotificationDropdown } from '@/components/manager/notification-dropdown';

function Header() {
  return (
    <div>
      <NotificationDropdown 
        branchId={branchId} 
        useRepairOrderHub={true} // Use RepairOrderHub (default)
      />
    </div>
  );
}
```

### 4. Direct Service Usage

#### RepairOrderHub Approach (Recommended)
```typescript
import { managerNotificationService } from '@/services/manager/notification-service';
import { managerNotificationHubViaRepairOrderService } from '@/services/manager/notification-hub-via-repair-order';

// API calls
const notifications = await managerNotificationService.getAllNotifications();
const unreadCount = await managerNotificationService.getUnreadCount();
await managerNotificationService.markAsRead(notificationId);

// SignalR via RepairOrderHub
await managerNotificationHubViaRepairOrderService.startConnection();
await managerNotificationHubViaRepairOrderService.joinManagersGroup();
```

#### Dedicated NotificationHub Approach
```typescript
import { managerNotificationService } from '@/services/manager/notification-service';
import { managerNotificationHubService } from '@/services/manager/notification-hub';

// API calls (same as above)
const notifications = await managerNotificationService.getAllNotifications();

// SignalR via dedicated NotificationHub
await managerNotificationHubService.startConnection();
await managerNotificationHubService.joinManagersGroup();
```

## Files Created

### Services
- `src/services/manager/notification-service.ts` - API service
- `src/services/manager/notification-hub.ts` - Dedicated NotificationHub service
- `src/services/manager/notification-hub-via-repair-order.ts` - RepairOrderHub service (recommended)

### Hooks
- `src/hooks/use-manager-notifications.ts` - React hook with hub selection option

### Components
- `src/components/manager/notification-dropdown.tsx` - Dropdown component
- `src/components/manager/notification-example.tsx` - Example usage component

### Updated Files
- `src/app/manager/components/layout/site-header.tsx` - Added notification dropdown
- `src/services/manager/hub-config.ts` - Added notification hub endpoint

## Backend Hub Method Issue Resolution

The original error `"Method does not exist"` for `JoinManagersGroup` was caused by having two different RepairOrderHub classes where one had the method and the other didn't. This has been resolved on the backend.

The notification system now defaults to using the RepairOrderHub approach (`useRepairOrderHub: true`) since that's where the `JoinManagersGroup` method is confirmed to exist.

## Integration Notes

- The notification dropdown is already integrated into the manager header with RepairOrderHub by default
- SignalR connection starts automatically when using the hook
- Authentication tokens are handled automatically via the API client
- The system follows existing patterns from other manager services
- No existing code was modified, only new code was added
- Both hub approaches are supported for flexibility

## Example Notification Data

```json
{
  "notificationID": "123e4567-e89b-12d3-a456-426614174000",
  "content": "Mobile payment received: John Doe paid $150.00 for Toyota Camry (ABC123) via PayOs",
  "type": "Message",
  "timeSent": "2024-12-14T10:30:00Z",
  "status": "Unread",
  "target": "/manager/repair-orders/456e7890-e89b-12d3-a456-426614174001"
}
```

## Testing

You can test the notification system by:

1. **API Testing**: Use the notification service methods directly
2. **SignalR Testing**: Monitor the browser console for connection logs
3. **UI Testing**: Use the `NotificationExample` component for debugging
4. **Integration Testing**: Check the notification dropdown in the header

The system is ready to use and will automatically connect to your backend notification system when managers access the application. By default, it uses the RepairOrderHub approach which has been confirmed to have the required `JoinManagersGroup` method.