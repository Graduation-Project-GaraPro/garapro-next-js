# Inspection & Quotation Updates - Manager Frontend

## Overview
Updated the manager frontend to support new inspection and quotation API changes including part quantities, service condition status (isGood), and "Good" quotation status.

## API Changes Implemented

### 1. InspectionDto - Quantity Field
- **Location**: `src/types/manager/inspection.ts`
- **Change**: Added `quantity` field to `InspectionPartDto`
- **Usage**: Displays how many parts are needed for each service
- **Display**: Shows in inspection detail dialog with quantity multiplier

### 2. QuotationServiceDto - isGood Field
- **Location**: `src/types/manager/quotation.ts`
- **Change**: Added `isGood: boolean` field to `QuotationServiceDto`
- **Purpose**: Indicates services in good condition that don't need repair
- **Values**:
  - `true` = Service is in good condition, view only, no repair needed
  - `false` = Service needs attention/repair

### 3. QuotationDto - "Good" Status
- **Location**: `src/types/manager/quotation.ts`
- **Change**: Added "Good" to status union type
- **Purpose**: Indicates entire quotation is informational (all services good)
- **Behavior**: View-only quotation, no payment needed

## Frontend Components Updated

### 1. Type Definitions
**File**: `src/types/manager/quotation.ts`
- Added `isGood?: boolean` to `QuotationServiceDto`
- Added `isGood?: boolean` to `QuotationServiceCreateDto`
- Added "Good" to `QuotationDto` status type

### 2. Quotation Details View
**File**: `src/app/manager/repairOrderManagement/orders/[id]/components/quotation-details-view.tsx`

**Changes**:
- Added "Good" status badge (green with checkmark)
- Display "All services in good condition" message for Good status
- Service-level indicators:
  - ✓ Good Condition (green badge) - for `isGood: true`
  - ⚠️ Required (red badge) - for `isRequired: true, isGood: false`
  - Optional (gray badge) - for `isRequired: false, isGood: false`
- Hide financial summary for "Good" status quotations
- Disable actions for "Good" status quotations
- Visual styling: Green background for good services

### 3. Quotation Tab
**File**: `src/app/manager/repairOrderManagement/orders/[id]/components/quotation-tab.tsx`

**Changes**:
- Added "✓ All Good" status badge for Good quotations
- Updated status badge function to handle "Good" status
- Good status quotations are view-only (no send/delete actions)

### 4. Services Table
**File**: `src/app/manager/components/Quote/quotePreview/servicesTable.tsx`

**Changes**:
- Added `isGood?: boolean` to Service interface
- Visual indicators for service status:
  - Green background for good services
  - Checkmark icon for good services
  - "Good Condition" badge
  - "Required" badge for required services
  - "Optional" badge for optional services
- Display "$0 (No repair needed)" for good services
- Lock icon for required services

### 5. Quote Preview Dialog
**File**: `src/app/manager/components/Quote/QuotePreviewDialog.tsx`

**Changes**:
- Added prominent "All Services in Good Condition" message for Good status
- Pass `isGood` property to services data
- Hide action buttons for Good status quotations
- Green-themed informational banner

### 6. Inspection Detail Dialog
**File**: `src/app/manager/repairOrderManagement/orders/[id]/components/inspection-detail-dialog.tsx`

**Status**: Already supports quantity display
- Shows part quantity with multiplier (x2, x3, etc.)
- Displays total price when available
- Shows unit price breakdown

## Business Logic Implementation

### Service Display Rules

#### If `isGood = true`:
- Display: "✓ Good Condition"
- Style: Green background, green text
- Price: $0 or "No repair needed"
- Interaction: View-only, cannot be selected
- Badge: Green "Good Condition"

#### If `isGood = false` and `isRequired = true`:
- Display: "⚠️ Required"
- Style: Normal background
- Price: Actual service price
- Interaction: Must be selected (pre-checked, disabled)
- Badge: Red "Required"

#### If `isGood = false` and `isRequired = false`:
- Display: "Optional"
- Style: Normal background
- Price: Actual service price
- Interaction: Can be selected/deselected
- Badge: Gray "Optional"

### Quotation-Level Rules

#### If `status = "Good"`:
- Display: Prominent green banner with message
- Financial Summary: Hidden or shows $0
- Actions: Hidden (no send, delete, copy to jobs)
- Purpose: Informational only
- Customer Response: Not required

#### If `status != "Good"`:
- Display: Normal quotation flow
- Financial Summary: Shows actual totals
- Actions: Available based on status
- Purpose: Requires customer response
- Payment: Required if approved

### Payment Calculation Logic

```typescript
// Exclude Good services from total
let total = 0;
quotation.services.forEach(service => {
  if (!service.isGood && service.isSelected) {
    total += service.price;
    service.parts.forEach(part => {
      if (part.isSelected) {
        total += part.price * part.quantity; // Use quantity
      }
    });
  }
});
```

## Visual Design

### Color Scheme
- **Good Services**: Green (#10b981, #dcfce7)
- **Required Services**: Red (#ef4444, #fee2e2)
- **Optional Services**: Gray (#6b7280, #f3f4f6)
- **Good Status**: Green banner with checkmark

### Icons
- ✓ Checkmark - Good condition
- ⚠️ Warning - Required service
- 🔒 Lock - Required (cannot deselect)

### Badges
- Green badge: "Good Condition" / "✓ All Good"
- Red badge: "Required"
- Gray badge: "Optional"

## Testing Checklist

### Inspection Display
- [ ] Part quantities display correctly
- [ ] Quantity multiplier shows (x2, x3, etc.)
- [ ] Total price calculation includes quantity
- [ ] Convert to quotation preserves quantities

### Quotation Display
- [ ] Good services show green styling
- [ ] Good services show "✓ Good Condition" badge
- [ ] Required services show "⚠️ Required" badge
- [ ] Optional services show "Optional" badge
- [ ] Good services excluded from total

### Good Status Quotations
- [ ] "All Good" status badge displays
- [ ] Green banner message shows
- [ ] Financial summary hidden or shows $0
- [ ] Action buttons hidden
- [ ] View-only mode enforced

### Status Badges
- [ ] Pending - Yellow
- [ ] Sent - Blue
- [ ] Approved - Green
- [ ] Rejected - Red
- [ ] Expired - Gray
- [ ] Good - Green with checkmark

## Future Enhancements

### Inspection Fee Logic (Not Yet Implemented)
```typescript
// Future implementation
interface InspectionType {
  inspectionTypeId: number;
  typeName: string;
  fee: number;
}

// Charging rule:
// IF any service has IsAdvanced = true
// THEN charge Advanced fee ($80)
// ELSE charge Basic fee ($30)

// When to charge:
// - Customer rejects quotation after inspection
// - Create Payment record with inspection fee
// - Customer must pay before leaving
```

## Notes
- All changes are backward compatible
- Existing quotations without `isGood` field will default to `false`
- Good status quotations are informational and don't require payment
- Part quantities are used in price calculations
- Manager can still view and download Good status quotations

## Related Files
- `src/types/manager/quotation.ts` - Type definitions
- `src/types/manager/inspection.ts` - Inspection types
- `src/services/manager/quotation-service.ts` - API service
- `src/app/manager/repairOrderManagement/orders/[id]/components/` - UI components
- `src/app/manager/components/Quote/` - Quote components
