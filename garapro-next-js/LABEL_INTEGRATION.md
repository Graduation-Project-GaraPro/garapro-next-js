# Label Integration for Repair Order Board

## Overview
This document describes the implementation of the label system for repair orders, allowing managers to create, manage, and automatically assign labels to repair orders based on their status.

## Features Implemented

### 1. Label Types and Service
- **Location**: `src/types/manager/label.ts`
- **Service**: `src/services/manager/label-service.ts`
- Defines label structure with color, status association, and default flag
- Provides CRUD operations for labels

### 2. Label Display on Cards
- **Location**: `src/app/manager/repairOrderManagement/ro-board/ro-card.tsx`
- Labels are displayed as colored badges below the repair order description
- Colors are applied using the hexCode from the backend
- Multiple labels can be displayed per repair order

### 3. Label Management Page (Manager Only)
- **Location**: `src/app/manager/garageSetting/ro-label/page.tsx`
- **URL**: `/manager/garageSetting/ro-label`
- Accessible via "RO Label" button in the board header (navigates to settings page)
- Features:
  - Create new labels with name, description, color, and status
  - Edit existing labels
  - Delete labels
  - Set default label per status (only one default per status)
  - Preset color palette for easy selection
  - Labels organized by status
  - Search and filter functionality

### 4. Automatic Label Assignment
- When a repair order is moved to a new status via drag & drop
- Backend automatically assigns the default label for that status
- No dialog needed - seamless UX
- Labels are updated via SignalR real-time notifications

## API Integration

### Status Update Endpoint
```typescript
POST /api/RepairOrder/status/update
{
  "repairOrderId": "guid",
  "newStatusId": 2
}

Response:
{
  "success": true,
  "updatedCard": {
    "repairOrderId": "guid",
    "statusId": 2,
    "statusName": "In Progress",
    "assignedLabels": [
      { "labelName": "Under Repair", "hexCode": "#00CC66" }
    ]
  }
}
```

### Label CRUD Endpoints
```typescript
// Get all labels
GET /api/label

// Get labels by status
GET /api/label/by-orderstatus/1

// Create label
POST /api/label
{
  "labelName": "Customer Arriving",
  "description": "Customer is on the way",
  "colorName": "Blue",
  "hexCode": "#0066CC",
  "orderStatusId": 1,
  "isDefault": true
}

// Update label
PUT /api/label/{id}
{
  "labelName": "...",
  "hexCode": "...",
  "orderStatusId": 1,
  "isDefault": true
}

// Delete label
DELETE /api/label/{id}
```

## Key Points

1. **No Dialog on Drop**: When dragging a repair order to a new status, the backend automatically assigns the default label - no user interaction needed

2. **Default Labels**: Only ONE default label per status. When set, it's automatically assigned to repair orders moved to that status. If no labels are assigned, the default label is displayed.

3. **Clickable Labels**: Users can click on labels on the repair order card to open a dialog and select/deselect labels for that repair order

4. **Label Selection**: The label selection dialog shows only labels for the current status of the repair order

5. **Manager Control**: Label management is restricted to managers via the "RO Label" button

6. **Real-time Updates**: Labels are updated via SignalR, ensuring all users see changes immediately

7. **Visual Feedback**: Labels use the hexCode for consistent branding and easy identification

## Usage

### For Managers
1. Click "RO Label" button in the board header (navigates to `/manager/garageSetting/ro-label`)
2. Or navigate directly to Garage Settings > RO LABELS tab
3. Create labels for each status with appropriate colors
4. Set one label as default per status
5. Labels will be automatically assigned when repair orders change status

### For All Users
- View labels on repair order cards
- Click on labels to open selection dialog
- Select/deselect labels for a repair order
- Labels update automatically when status changes
- If no labels are assigned, the default label is shown

## Color Palette
Preset colors available:
- Red: #EF4444
- Orange: #F97316
- Yellow: #EAB308
- Green: #22C55E
- Blue: #3B82F6
- Indigo: #6366F1
- Purple: #A855F7
- Pink: #EC4899

## Future Enhancements
- Filter repair orders by label
- Custom color picker
- Label templates
- Bulk label operations
- Label analytics
