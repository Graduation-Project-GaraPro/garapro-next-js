# Label Feature Troubleshooting Guide

## Issue: Cannot Assign Labels - Dialog Opens RO Details Instead

### Problem
When clicking on labels to open the selection dialog, the repair order details page opens instead, preventing label assignment.

### Root Causes
1. **Event Propagation**: Click events on label area were bubbling up to the card click handler
2. **Type Mismatch**: Label IDs were being compared as numbers when they're actually GUID strings

### Solutions Applied

#### 1. Fixed Event Propagation
**File**: `ro-card.tsx`

```typescript
// Added preventDefault and stopPropagation
<div 
  onClick={(e) => {
    e.preventDefault()
    e.stopPropagation()
    setShowLabelDialog(true)
  }}
  onMouseDown={(e) => {
    e.stopPropagation()
  }}
>
```

**Also added dialog state check**:
```typescript
const handleCardClick = (e: React.MouseEvent) => {
  // Don't navigate if dialog is open
  if (showLabelDialog) {
    return
  }
  // ... rest of the code
}
```

#### 2. Fixed Type Mismatch
**File**: `label-selection-dialog.tsx`

Changed from:
```typescript
const [selectedLabelIds, setSelectedLabelIds] = useState<number[]>([])
```

To:
```typescript
const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([])
```

**Updated all label ID comparisons**:
```typescript
// Before
selectedLabelIds.includes(label.labelId)

// After
selectedLabelIds.includes(label.labelId.toString())
```

**Updated API call**:
```typescript
// Before
labelIds: selectedLabelIds.map(id => id.toString())

// After
labelIds: selectedLabelIds // Already strings (GUIDs)
```

## Testing Steps

1. **Open Board**: Navigate to `/manager/repairOrderManagement/ro-board`
2. **Click Label Area**: Click on the label badges or "Add Label" badge
3. **Verify Dialog Opens**: Label selection dialog should open WITHOUT navigating
4. **Select Labels**: Click checkboxes to select/deselect labels
5. **Save**: Click "Save Labels" button
6. **Verify Update**: Labels should update on the card immediately
7. **Check Console**: Look for console logs showing label IDs being sent

## Console Debugging

When the dialog opens, you should see:
```
Current labels: ["guid1", "guid2"]
Available labels: [{id: "guid1", name: "Label 1"}, ...]
Pre-selected: ["guid1", "guid2"]
```

When saving:
```
Sending label IDs: ["guid1", "guid2"]
```

## Common Issues

### Issue: Dialog doesn't open
**Check**: 
- Event handlers have `e.stopPropagation()`
- `showLabelDialog` state is being set correctly

### Issue: Labels not pre-selected
**Check**:
- `currentLabels` prop contains label IDs (not names)
- Label IDs are strings (GUIDs)
- Comparison uses `.toString()` for consistency

### Issue: Save doesn't work
**Check**:
- API endpoint is correct: `/RepairOrder/{id}/labels`
- Label IDs are sent as strings
- Authentication token is valid
- Network tab shows 200 response

### Issue: Labels don't update after save
**Check**:
- `onLabelsUpdated` callback is being called
- Parent component updates state correctly
- Response from API includes `updatedCard.assignedLabels`

## API Response Validation

Expected response structure:
```json
{
  "success": true,
  "message": "Labels updated successfully",
  "updatedCard": {
    "assignedLabels": [
      {
        "labelId": "guid",
        "labelName": "Label Name",
        "colorName": "Red",
        "hexCode": "#EF4444",
        "orderStatusId": 1
      }
    ]
  }
}
```

## Browser Console Commands

Check label state:
```javascript
// In browser console
localStorage.getItem('authToken') // Should show token
```

Check API call:
```javascript
// Network tab -> Filter by "labels"
// Should see PUT request to /api/RepairOrder/{id}/labels
```

## Quick Fixes

### If dialog still navigates to details:
1. Clear browser cache
2. Hard refresh (Ctrl+Shift+R)
3. Check for multiple click handlers
4. Verify `data-label-area` attribute exists

### If labels don't save:
1. Check network tab for errors
2. Verify API base URL in `.env.local`
3. Check authentication token
4. Verify label IDs are valid GUIDs

### If labels don't display:
1. Check `assignedLabels` in repair order data
2. Verify label structure matches interface
3. Check console for errors
4. Verify hexCode is valid color

## Environment Check

Ensure `.env.local` has:
```env
NEXT_PUBLIC_API_BASE_URL=https://localhost:7113/api
```

Restart dev server after changing environment variables:
```bash
npm run dev
```

## Success Indicators

✅ Clicking label area opens dialog (no navigation)
✅ Dialog shows available labels for current status
✅ Current label is pre-selected with radio button
✅ Clicking a label selects it and deselects others (single selection)
✅ Save button sends API request
✅ Toast notification shows success
✅ Label updates on card immediately
✅ Dialog closes after save
