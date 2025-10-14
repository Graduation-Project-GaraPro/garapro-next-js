# SignalR Integration for Real-Time Updates

## Overview
This document explains how the SignalR real-time communication is integrated into the repair order kanban board for drag and drop functionality.

## Implementation Details

### 1. SignalR Service
Created `src/services/manager/repair-order-hub.ts` with the following features:

#### Connection Management
- Connects to `/api/repairorderhub` endpoint
- Automatic reconnection handling
- Connection state management

#### Event Listeners
- `RepairOrderMoved` - Updates UI when a repair order is moved
- `RepairOrderCreated` - Adds new repair orders to the UI
- `RepairOrderUpdated` - Updates existing repair orders in the UI
- `RepairOrderDeleted` - Removes deleted repair orders from the UI
- `Connected` - Handles successful connection events

#### API Integration
- `updateRepairOrderStatus()` - Calls `/api/RepairOrder/status/update` endpoint
- `batchUpdateRepairOrderStatuses()` - Calls `/api/RepairOrder/status/batch-update` endpoint

### 2. Drag and Drop Workflow

#### Frontend Implementation
1. User drags a repair order card to a new column
2. `handleDrop()` in RoColumn triggers `handleMoveRepairOrder()` in the main page
3. `handleMoveRepairOrder()` calls `repairOrderHubService.updateRepairOrderStatus()`
4. API call is made to `/api/RepairOrder/status/update`
5. Backend processes the request and broadcasts `RepairOrderMoved` event via SignalR
6. All connected clients receive the event and update their UI accordingly

#### Real-Time Benefits
- All users see immediate updates when any user makes changes
- No need to poll the server for updates
- Consistent state across all connected clients
- Improved user experience with instant feedback

### 3. Data Structures

#### RoBoardCardDto
Used in real-time updates:
```json
{
  "repairOrderId": "string (GUID)",
  "receiveDate": "datetime",
  "statusName": "string",
  "vehicleInfo": "string",
  "customerInfo": "string",
  "serviceName": "string",
  "estimatedAmount": "decimal",
  "branchName": "string",
  "label": {
    "labelId": "number",
    "labelName": "string",
    "color": "string"
  }
}
```

### 4. Key Components

#### BoardPage Component
- Initializes SignalR connection on mount
- Registers all event listeners
- Handles drag and drop operations
- Updates UI based on SignalR events

#### RoDragDropBoard Component
- Manages the overall board layout
- Coordinates drag and drop operations between columns

#### RoColumn Component
- Handles drop events for individual columns
- Manages drag over states for visual feedback

#### RepairOrderCard Component
- Handles drag start events for individual cards
- Provides visual feedback during drag operations

### 5. API Endpoints Used

#### SignalR Hub
- Endpoint: `/api/repairorderhub`
- Provides real-time notifications for all repair order operations

#### Status Update Endpoints
- `POST /api/RepairOrder/status/update` - Update single repair order status
- `POST /api/RepairOrder/status/batch-update` - Update multiple repair orders

### 6. Error Handling

#### Connection Issues
- Automatic reconnection attempts
- Maximum retry limit to prevent infinite loops
- Visual indicator for connection status

#### API Failures
- Revert UI changes if API calls fail
- Error logging for debugging
- Graceful degradation when real-time updates fail

## Testing

### Verification Steps
1. Open multiple browser windows to the same board
2. Drag a card in one window
3. Verify the card moves in all other windows instantly
4. Check browser console for SignalR connection messages
5. Verify no errors in the console

### Debugging Information
- Connection status indicator in the header (green dot when connected)
- Console logging for all SignalR events
- Error messages for failed operations

## Future Enhancements

### Additional Real-Time Features
- Live cursor positions of other users
- Real-time chat within the board
- Notification system for mentions and updates

### Performance Optimizations
- Selective updates for only changed data
- Connection pooling for better scalability
- Compression of large data transfers