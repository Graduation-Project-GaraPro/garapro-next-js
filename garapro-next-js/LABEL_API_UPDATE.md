# Label API Update - Backend Integration Complete

## Backend Changes

The backend has been updated to properly include labels in repair order responses:

### Repository Changes
- Added `.Include(ro => ro.Labels)` to all RepairOrder queries
- Labels are now eagerly loaded with repair orders

### Service Layer Changes
- Fixed `AssignedLabels` mapping to use `repairOrder.Labels` instead of `repairOrder.OrderStatus.Labels`
- Labels are now correctly mapped from the repair order's actual labels

### DTO Mapping
- Added `ColorName`, `HexCode`, `OrderStatusId` to label mapping
- Full label information is now included in API responses

## Frontend Changes

### Updated Types

**AssignedLabel Interface** (both in `label.ts` and `repair-order.ts`):
```typescript
export interface AssignedLabel {
  labelId: string
  labelName: string
  colorName: string
  hexCode: string
  orderStatusId: number
}
```

### Updated Components

1. **label-selection-dialog.tsx**
   - Now passes full label objects instead of just names and hex codes
   - Pre-selects labels by `labelId` instead of `labelName`
   - Sends `labelIds` as strings to API

2. **ro-card.tsx**
   - Updated `onLabelsUpdated` callback to accept full label objects
   - Passes `labelId` array to dialog instead of label names

3. **ro-column.tsx**, **ro-drag-drop-board.tsx**, **page.tsx**
   - Updated type signatures to match new label structure

## API Response Structure

### Repair Order with Labels
```json
{
  "repairOrderId": "guid",
  "statusId": 2,
  "statusName": "In Progress",
  "assignedLabels": [
    {
      "labelId": "guid",
      "labelName": "Waiting for Parts",
      "colorName": "Orange",
      "hexCode": "#FF9900",
      "orderStatusId": 2
    },
    {
      "labelId": "guid",
      "labelName": "Under Repair",
      "colorName": "Green",
      "hexCode": "#00CC66",
      "orderStatusId": 2
    }
  ],
  // ... other repair order fields
}
```

### Update Labels Endpoint
```
PUT /api/RepairOrder/{id}/labels

Request:
{
  "labelIds": ["guid1", "guid2"]  // Array of label GUIDs as strings
}

Response:
{
  "success": true,
  "message": "Labels updated successfully",
  "updatedCard": {
    "repairOrderId": "guid",
    "statusId": 2,
    "statusName": "In Progress",
    "assignedLabels": [
      {
        "labelId": "guid",
        "labelName": "Waiting for Parts",
        "colorName": "Orange",
        "hexCode": "#FF9900",
        "orderStatusId": 2
      }
    ]
  }
}
```

## What's Working Now

✅ Labels are included when fetching repair orders
✅ `assignedLabels` array contains the actual labels assigned to each RO
✅ Kanban board shows correct labels per card
✅ List view shows correct labels per row
✅ Label selection dialog pre-selects current labels correctly
✅ Label updates work with full label information
✅ Default labels display when no labels are assigned

## Testing

1. **View Labels**: Labels now display on repair order cards with correct colors
2. **Click Labels**: Opens dialog showing available labels for current status
3. **Select Labels**: Can select/deselect multiple labels
4. **Save Labels**: Updates via API and reflects immediately on card
5. **Default Labels**: Shows when no labels are assigned to a repair order

## Files Modified

- `src/types/manager/label.ts` - Updated AssignedLabel interface
- `src/types/manager/repair-order.ts` - Updated AssignedLabel interface
- `src/app/manager/repairOrderManagement/ro-board/label-selection-dialog.tsx` - Updated to use labelId
- `src/app/manager/repairOrderManagement/ro-board/ro-card.tsx` - Updated label handling
- `src/app/manager/repairOrderManagement/ro-board/ro-column.tsx` - Updated type signatures
- `src/app/manager/repairOrderManagement/ro-board/ro-drag-drop-board.tsx` - Updated type signatures
- `src/app/manager/repairOrderManagement/ro-board/page.tsx` - Updated label update handler
