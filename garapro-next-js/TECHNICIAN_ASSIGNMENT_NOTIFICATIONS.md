# Technician Assignment Notifications Implementation

This document explains how to implement real-time technician assignment notifications using SignalR in the GaragePro application.

## Overview

The technician assignment notification system provides real-time updates when technicians are assigned to jobs or inspections. It uses SignalR to push notifications from the server to connected clients.

## Components

### 1. Technician Assignment Hub Service (`src/services/manager/technician-assignment-hub.ts`)

This service handles the SignalR connection and manages event listeners for technician assignment notifications.

#### Key Features:
- Connection management with automatic reconnection
- Event listeners for job and inspection assignments/reassignments
- Listener management for adding/removing notification handlers

#### Notification Types:
1. **Job Assigned** - When a technician is assigned to one or more jobs
2. **Job Reassigned** - When a job is reassigned to a different technician
3. **Inspection Assigned** - When a technician is assigned to one or more inspections
4. **Inspection Reassigned** - When an inspection is reassigned to a different technician

### 2. Notification Hook (`src/hooks/manager/useTechnicianAssignmentNotifications.ts`)

This React hook manages the notification state and provides functions to interact with notifications.

#### Features:
- Automatic SignalR connection on component mount
- Notification state management
- Functions to mark notifications as read, remove them, or clear all
- Cleanup of event listeners on component unmount

### 3. Notification Component (`src/components/manager/technician-assignment-notification.tsx`)

A UI component that displays technician assignment notifications in a dropdown format.

#### Features:
- Real-time notification display
- Mark individual or all notifications as read
- Remove notifications
- Clear all notifications
- Unread notification count badge

### 4. Header Integration (`src/app/manager/components/layout/site-header.tsx`)

The notification component is integrated into the manager header for easy access.

## Implementation Details

### Backend Requirements

The backend must implement a SignalR hub with the following methods:

1. **JobAssigned** - Sends notification when jobs are assigned
   - Parameters: `technicianId`, `technicianName`, `jobCount`, `jobNames[]`

2. **JobReassigned** - Sends notification when a job is reassigned
   - Parameters: `jobId`, `oldTechnicianId`, `newTechnicianId`, `jobName`

3. **InspectionAssigned** - Sends notification when inspections are assigned
   - Parameters: `technicianId`, `technicianName`, `inspectionCount`, `inspectionNames[]`

4. **InspectionReassigned** - Sends notification when an inspection is reassigned
   - Parameters: `inspectionId`, `oldTechnicianId`, `newTechnicianId`, `inspectionName`

### Frontend Integration

#### 1. Using the Hook

```typescript
import { useTechnicianAssignmentNotifications } from "@/hooks/manager/useTechnicianAssignmentNotifications";

export default function MyComponent() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll
  } = useTechnicianAssignmentNotifications();

  return (
    <div>
      {/* Display notifications */}
      {notifications.map(notification => (
        <div key={notification.id}>
          <p>{notification.message}</p>
          <button onClick={() => markAsRead(notification.id)}>
            Mark as read
          </button>
        </div>
      ))}
    </div>
  );
}
```

#### 2. Using the Component

The component is already integrated into the manager header. To use it elsewhere:

```typescript
import TechnicianAssignmentNotification from "@/components/manager/technician-assignment-notification";

export default function MyPage() {
  return (
    <div>
      <TechnicianAssignmentNotification />
    </div>
  );
}
```

## Usage Examples

### Simulating Notifications (for testing)

To test the notification system, you can simulate events by dispatching custom events:

```typescript
// Simulate a job assigned notification
const event = new CustomEvent('technicianAssignment', {
  detail: {
    type: 'jobAssigned',
    technicianId: '123',
    technicianName: 'John Doe',
    jobCount: 2,
    jobNames: ['Oil Change', 'Tire Rotation']
  }
});
window.dispatchEvent(event);
```

## Error Handling

The service includes automatic reconnection logic that attempts to reconnect to the SignalR hub if the connection is lost. It will retry up to 5 times with a 5-second delay between attempts.

## Customization

### Notification Display

You can customize the notification display by modifying the `TechnicianAssignmentNotification` component.

### Notification Types

Additional notification types can be added by:
1. Extending the interfaces in the hub service
2. Adding new event listeners
3. Updating the hook to handle new notification types
4. Modifying the component to display new notification types

## Troubleshooting

### Connection Issues

If notifications are not appearing:
1. Check browser console for SignalR connection errors
2. Verify the backend hub URL is correct
3. Ensure the user is authenticated with a valid token
4. Check that the backend hub is properly configured

### Notification Not Showing

If the connection is working but notifications aren't appearing:
1. Verify the backend is sending the correct event names
2. Check that event parameters match the expected interface
3. Ensure the notification component is properly integrated

## Future Enhancements

1. **Persistent Storage** - Store notifications in localStorage for persistence across sessions
2. **Notification Categories** - Filter notifications by type (jobs vs inspections)
3. **Priority Levels** - Implement priority levels for different types of assignments
4. **Sound Notifications** - Add audio cues for urgent assignments
5. **Detailed Views** - Create detailed views for notification history