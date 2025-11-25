# Technician Assignment Notification Feature

## Overview

This feature implements real-time notifications for technician job and inspection assignments using SignalR. When a manager assigns a job or inspection to a technician, all connected managers will receive an immediate notification.

## Implementation Files

### Services
- `src/services/manager/technician-assignment-hub.ts` - SignalR hub service for technician assignments

### Hooks
- `src/hooks/manager/useTechnicianAssignmentNotifications.ts` - React hook for managing assignment notifications

### Components
- `src/components/manager/technician-assignment-notification.tsx` - UI component for displaying notifications

### Pages
- `src/app/manager/technician-assignment-demo.tsx` - Demo page for testing notifications

### Integrations
- `src/app/manager/components/layout/site-header.tsx` - Integrated notification component into manager header
- `src/app/manager/page.tsx` - Added link to demo page in manager dashboard

## How It Works

1. **SignalR Connection**: The service establishes a connection to the backend SignalR hub at `/api/technicianassignmenthub`

2. **Event Listeners**: The service listens for four types of events:
   - `JobAssigned` - When a technician is assigned to jobs
   - `JobReassigned` - When a job is reassigned to a different technician
   - `InspectionAssigned` - When a technician is assigned to inspections
   - `InspectionReassigned` - When an inspection is reassigned to a different technician

3. **Notification Display**: Notifications are displayed in a dropdown component accessible from the manager header

4. **State Management**: The hook manages notification state, including unread counts and read status

## Usage

### Viewing Notifications

1. Navigate to the Manager Dashboard
2. Click on the wrench icon in the top right corner
3. View real-time assignment notifications as they arrive

### Testing the Feature

1. Navigate to the Manager Dashboard
2. Click on "Technician Assignments" -> "View Demo"
3. Use the forms to simulate different types of assignment notifications

## Backend Requirements

The backend must implement a SignalR hub that sends the following events:

1. **JobAssigned**
   ```csharp
   await Clients.All.SendAsync("JobAssigned", technicianId, technicianName, jobCount, jobNames);
   ```

2. **JobReassigned**
   ```csharp
   await Clients.All.SendAsync("JobReassigned", jobId, oldTechnicianId, newTechnicianId, jobName);
   ```

3. **InspectionAssigned**
   ```csharp
   await Clients.All.SendAsync("InspectionAssigned", technicianId, technicianName, inspectionCount, inspectionNames);
   ```

4. **InspectionReassigned**
   ```csharp
   await Clients.All.SendAsync("InspectionReassigned", inspectionId, oldTechnicianId, newTechnicianId, inspectionName);
   ```

## Customization

### Adding New Notification Types

1. Add new interfaces to `technician-assignment-hub.ts`
2. Add new listener arrays to the listeners object
3. Add new registration methods in `registerEventListeners()`
4. Add new management methods (add/remove listeners)
5. Update the hook to handle new notification types
6. Modify the component to display new notification types

### Styling

The notification component can be customized by modifying the Tailwind classes in `technician-assignment-notification.tsx`

## Troubleshooting

### No Notifications Appearing

1. Check browser console for SignalR connection errors
2. Verify the backend hub URL is correct
3. Ensure the user is authenticated with a valid token
4. Check that the backend hub is properly configured and sending events

### Connection Issues

The service includes automatic reconnection logic that attempts to reconnect to the SignalR hub if the connection is lost. It will retry up to 5 times with a 5-second delay between attempts.

## Future Enhancements

1. **Persistent Storage** - Store notifications in localStorage for persistence across sessions
2. **Notification Categories** - Filter notifications by type (jobs vs inspections)
3. **Priority Levels** - Implement priority levels for different types of assignments
4. **Sound Notifications** - Add audio cues for urgent assignments
5. **Detailed Views** - Create detailed views for notification history