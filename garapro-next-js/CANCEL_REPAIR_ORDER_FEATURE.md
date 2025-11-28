# Cancel Repair Order Feature

## Overview
Added the ability to cancel repair orders from the RO board. The cancel button appears in the 3-dots menu only for repair orders in "Pending" status.

## Implementation Details

### 1. API Integration
- **Endpoint**: `POST /api/RepairOrder/cancel`
- **Request Body**: 
  ```json
  {
    "repairOrderId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "cancelReason": "Customer requested cancellation"
  }
  ```

### 2. Files Modified

#### Type Definitions (`src/types/manager/repair-order.ts`)
- Added `CancelRepairOrderDto` interface

#### Service Layer (`src/services/manager/repair-order-service.ts`)
- Added `cancelRepairOrder()` method to call the cancel API

#### UI Components
- **`cancel-ro-dialog.tsx`** (NEW): Dialog component for entering cancellation reason
- **`ro-card.tsx`**: Added cancel button in dropdown menu (only visible for pending status)
- **`ro-column.tsx`**: Pass cancel handler and pending status to cards
- **`ro-drag-drop-board.tsx`**: Detect pending status and pass cancel handler
- **`page.tsx`**: Main page with cancel dialog integration and state management

### 3. Features
- Cancel button only appears for repair orders in "Pending" status
- Requires a cancellation reason (mandatory field)
- Shows confirmation dialog before canceling
- Displays loading state during API call
- Shows success/error toast notifications
- Automatically refreshes the repair orders list after successful cancellation

### 4. Visual Indicators
When a repair order is cancelled:
- **"CANCELLED" badge** appears prominently at the top of the card (red background)
- **Card styling changes**: Red border and slightly faded background
- **Cancel reason** is displayed below the description in red italic text
- Card remains visible on the board but is visually distinct

### 5. Archive Feature
Added the ability to archive repair orders that are either cancelled or completed.

**Archive API Integration:**
- **Endpoint**: `POST /api/RepairOrder/archive`
- **Request Body**:
  ```json
  {
    "repairOrderId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "archiveReason": "string",
    "archivedByUserId": "string"
  }
  ```

**Archive Icon:**
- Small archive icon appears next to "Est. completion" date
- Only visible for cancelled or completed repair orders
- Has a tooltip: "Archive this repair order"
- Blue color to indicate it's an action button

**Files Added:**
- `archive-ro-dialog.tsx`: Dialog for entering archive reason

### 6. User Flow

**Cancel Flow:**
1. User clicks the 3-dots menu on a pending repair order card
2. "Cancel" option appears in the dropdown (orange color)
3. User clicks "Cancel"
4. Dialog opens asking for cancellation reason
5. User enters reason and clicks "Cancel Order"
6. API is called with repair order ID and reason
7. Success/error message is displayed
8. Board refreshes to show updated data with cancelled status visible

**Archive Flow:**
1. User sees archive icon on cancelled or completed RO cards
2. User hovers over icon to see tooltip
3. User clicks archive icon
4. Dialog opens asking for archive reason
5. User enters reason and clicks "Archive Order"
6. API is called with repair order ID, reason, and current user ID
7. Success/error message is displayed
8. Board refreshes and archived RO is removed from view
