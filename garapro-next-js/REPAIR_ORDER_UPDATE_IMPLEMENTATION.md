# Repair Order Update Implementation

## Overview
Implemented the PUT endpoint for updating repair orders with a simplified interface that allows updating only the status, note, and services.

## API Endpoint

### PUT /api/RepairOrder/{id}

**Description**: Updates only the status, note, and services of a repair order. All other fields remain immutable.

**Request Parameters**:
- `id` (path parameter): The GUID of the repair order to update

**Request Body**:
```json
{
  "statusId": 2,
  "note": "Updated note for this repair order",
  "selectedServiceIds": [
    "a1b2c3d4-e5f6-7890-g1h2-i3j4k5l6m7n8",
    "b2c3d4e5-f6g7-8901-h2i3-j4k5l6m7n8o9"
  ],
  "updatedAt": "2023-11-20T10:30:00Z"
}
```

**Fields**:
- `statusId` (integer): The new status ID for the repair order
- `note` (string, optional): Updated note for the repair order (max 500 characters)
- `selectedServiceIds` (array of GUIDs): List of service IDs to be associated with this repair order
- `updatedAt` (datetime, optional): Timestamp of when the update occurred

**Response**: Returns the updated RepairOrderDto with all repair order details.

**Response Codes**:
- `200 OK`: Successfully updated the repair order
- `400 Bad Request`: Invalid request data or model state
- `404 Not Found`: Repair order with the specified ID does not exist

## Implementation Details

### 1. Type Definitions

**File**: `src/types/manager/repair-order.ts`

Added new interface for the simplified PUT endpoint:
```typescript
export interface UpdateRepairOrderStatusRequest {
  statusId: number
  note?: string
  selectedServiceIds: string[]
  updatedAt?: string
}
```

Also added `serviceIds?: string[]` to the `RepairOrder` interface to track associated services.

### 2. Service Layer

**File**: `src/services/manager/repair-order-service.ts`

Added new method to handle the simplified update:
```typescript
async updateRepairOrderStatus(
  id: string, 
  updateData: UpdateRepairOrderStatusRequest
): Promise<RepairOrder | null>
```

This method:
- Calls the PUT endpoint with the repair order ID
- Sends only the mutable fields (status, note, services)
- Returns the updated repair order or throws an error

### 3. UI Component

**File**: `src/app/manager/repairOrderManagement/orders/[id]/components/edit-repair-order-dialog.tsx`

Created a new dialog component with the following features:

**Features**:
- Status selection dropdown (loads all available order statuses)
- Note textarea with character counter (500 max)
- Service selection with checkboxes (loads all active services)
- Real-time validation
- Loading states
- Error handling

**Props**:
- `open`: Controls dialog visibility
- `onOpenChange`: Callback for dialog state changes
- `orderId`: The repair order ID to update
- `currentStatusId`: Current status ID
- `currentNote`: Current note text
- `onSuccess`: Callback executed after successful update

**Auto-loading Existing Services**:
The dialog automatically fetches and checks the services that are already associated with the repair order by:
1. Fetching all jobs for the repair order using `jobService.getJobsByRepairOrderId()`
2. Extracting unique service IDs from the jobs
3. Pre-selecting those services in the checkbox list

This allows managers to see what services are currently selected and easily add more or uncheck services as needed.

### 4. Integration

**File**: `src/app/manager/repairOrderManagement/orders/[id]/page.tsx`

Integrated the edit dialog into the repair order details page:

**Changes**:
- Added Edit button in the header toolbar
- Loads repair order data on page load
- Opens edit dialog when Edit button is clicked
- Refreshes repair order data after successful update

**Location**: The Edit button is positioned in the top-right header area, alongside other action buttons (File, Message, Calculator, Settings).

## Usage

### For Users

1. Navigate to a repair order details page
2. Click the Edit button (pencil icon) in the top-right header
3. Update the following fields:
   - **Status**: Select from available order statuses
   - **Note**: Add or modify notes (max 500 characters)
   - **Services**: Check/uncheck services to associate with the order
4. Click "Update Repair Order" to save changes
5. The page will refresh with the updated data

### For Developers

**To use the service method directly**:
```typescript
import { repairOrderService } from "@/services/manager/repair-order-service"

const updateData = {
  statusId: 2,
  note: "Updated note",
  selectedServiceIds: ["service-id-1", "service-id-2"],
  updatedAt: new Date().toISOString()
}

const updatedOrder = await repairOrderService.updateRepairOrderStatus(
  "repair-order-id",
  updateData
)
```

**To use the dialog component**:
```typescript
import { EditRepairOrderDialog } from "./components"

<EditRepairOrderDialog
  open={isOpen}
  onOpenChange={setIsOpen}
  orderId="repair-order-id"
  currentStatusId={2}
  currentNote="Current note"
  onSuccess={() => console.log("Updated!")}
/>
```

Note: The dialog automatically loads existing services from the repair order's jobs, so you don't need to pass them as props.

## Files Modified

1. `src/types/manager/repair-order.ts` - Added UpdateRepairOrderStatusRequest interface
2. `src/services/manager/repair-order-service.ts` - Added updateRepairOrderStatus method
3. `src/app/manager/repairOrderManagement/orders/[id]/page.tsx` - Integrated edit dialog
4. `src/app/manager/repairOrderManagement/orders/[id]/components/index.ts` - Exported new component

## Files Created

1. `src/app/manager/repairOrderManagement/orders/[id]/components/edit-repair-order-dialog.tsx` - Edit dialog component

## Testing Recommendations

1. **Status Update**: Verify status changes are reflected immediately
2. **Note Update**: Test with empty, short, and max-length (500 chars) notes
3. **Service Selection**: Test selecting/deselecting multiple services
4. **Auto-load Existing Services**: Verify that existing services are automatically checked when dialog opens
5. **Add New Services**: Test adding new services to existing ones
6. **Remove Services**: Test unchecking existing services
7. **Validation**: Ensure at least one service must be selected
8. **Error Handling**: Test with invalid IDs and network failures
9. **Loading States**: Verify loading indicators appear during API calls
10. **Refresh**: Confirm page data refreshes after successful update

## Notes

- The API endpoint only allows updating status, note, and services
- All other repair order fields remain immutable
- Service selection requires at least one service to be selected
- The dialog loads fresh data (statuses and services) each time it opens
- **Existing services are automatically loaded and checked** by fetching jobs associated with the repair order
- Managers can add more services or uncheck existing ones as needed
- Character limit for notes is enforced at 500 characters
- The updatedAt timestamp is automatically set to the current time
