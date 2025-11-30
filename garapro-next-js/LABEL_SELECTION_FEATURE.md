# Label Selection Feature

## Overview
Users can now click on labels displayed on repair order cards to open a dialog and manage which labels are assigned to that repair order.

## Features

### 1. Clickable Label Area
- Labels on repair order cards are now clickable
- Clicking opens a label selection dialog
- If no labels are assigned, shows "Add Label" badge with tag icon
- If default label exists, it's displayed when no labels are assigned

### 2. Label Selection Dialog
**Location**: `src/app/manager/repairOrderManagement/ro-board/label-selection-dialog.tsx`

Features:
- Shows only labels for the current status of the repair order
- Pre-selects currently assigned labels
- Checkbox interface for easy selection/deselection
- Visual feedback with checkmarks
- Default labels are marked with "Default" badge
- Empty state when no labels exist for the status

### 3. Default Label Display
- Each status can have one default label
- If a repair order has no labels assigned, the default label is shown
- Default labels are loaded on page initialization
- Clicking on default label opens dialog to select other labels

### 4. Label Update Flow
1. User clicks on label area on repair order card
2. Dialog opens showing available labels for current status
3. User selects/deselects labels
4. Clicks "Save Labels"
5. API call to `PUT /api/RepairOrder/{id}/labels`
6. Labels update in real-time on the card
7. Dialog closes

## API Integration

### Update Labels Endpoint
```typescript
PUT /api/RepairOrder/{id}/labels

Request:
{
  "labelIds": [1, 2, 3]  // Array of label IDs, can be empty
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
      { "labelName": "Waiting for Parts", "hexCode": "#FF9900" },
      { "labelName": "Under Repair", "hexCode": "#00CC66" }
    ]
  }
}
```

### Validation
- Labels must belong to the current status of the repair order
- Backend validates this and returns error if invalid

## UI Components Updated

### 1. RepairOrderCard (`ro-card.tsx`)
- Added clickable label area with `data-label-area` attribute
- Shows assigned labels or default label
- Shows "Add Label" badge if no labels
- Opens label selection dialog on click
- Prevents card navigation when clicking labels

### 2. RoColumn (`ro-column.tsx`)
- Passes `onLabelsUpdated` callback to cards
- Passes `defaultLabel` for the status

### 3. RoDragDropBoard (`ro-drag-drop-board.tsx`)
- Accepts `defaultLabels` map (statusId -> default label)
- Passes default label to each column

### 4. Board Page (`page.tsx`)
- Loads default labels on initialization
- Maintains default labels state
- Handles label updates and updates repair order state

## User Experience

### Visual Design
- Labels displayed as colored badges with semi-transparent background
- Hover effect on label area indicates clickability
- "Add Label" badge with tag icon when no labels assigned
- Default labels shown in lighter style

### Interaction
- Click anywhere in label area to open dialog
- Dialog shows loading state while fetching labels
- Empty state with helpful message if no labels exist
- Checkboxes for easy multi-selection
- Save button disabled while saving

### Feedback
- Toast notification on successful save
- Toast notification on error
- Real-time update of labels on card
- Dialog closes automatically after save

## Files Created/Modified

### Created
- `src/app/manager/repairOrderManagement/ro-board/label-selection-dialog.tsx`
- `LABEL_SELECTION_FEATURE.md`

### Modified
- `src/app/manager/repairOrderManagement/ro-board/ro-card.tsx`
- `src/app/manager/repairOrderManagement/ro-board/ro-column.tsx`
- `src/app/manager/repairOrderManagement/ro-board/ro-drag-drop-board.tsx`
- `src/app/manager/repairOrderManagement/ro-board/page.tsx`
- `LABEL_INTEGRATION.md`

## Testing Checklist

- [ ] Click on label area opens dialog
- [ ] Dialog shows only labels for current status
- [ ] Currently assigned labels are pre-selected
- [ ] Can select/deselect multiple labels
- [ ] Save button updates labels via API
- [ ] Labels update on card after save
- [ ] Default label shows when no labels assigned
- [ ] "Add Label" badge shows when no labels and no default
- [ ] Empty state shows when no labels exist for status
- [ ] Toast notifications work correctly
- [ ] Clicking label area doesn't navigate to detail page
- [ ] Dialog closes after successful save
