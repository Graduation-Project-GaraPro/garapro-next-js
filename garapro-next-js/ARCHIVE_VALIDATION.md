# Repair Order Archive Validation

## Overview
This document describes the archive validation rules for repair orders. Archive functionality allows completed or cancelled repair orders to be moved out of the active board while preserving their data for historical reference.

## Archive Requirements

### Rule: Completed Orders Must Be Fully Paid

A repair order can only be archived if it meets **ONE** of the following conditions:

1. **Cancelled Orders** ✅
   - Any cancelled repair order can be archived
   - Payment status doesn't matter for cancelled orders
   - Reason: Cancelled orders are already closed and won't have further transactions

2. **Completed AND Fully Paid** ✅
   - Status must be "Completed" (statusId = "3")
   - Payment status must be "Paid" (paidStatus = "Paid")
   - Reason: Ensures all financial transactions are complete before archiving

### Blocked Scenarios

| Status | Payment Status | Can Archive? | Reason |
|--------|---------------|--------------|--------|
| Pending | Any | ❌ No | Not completed |
| In Progress | Any | ❌ No | Not completed |
| Completed | Unpaid | ❌ No | Must be fully paid |
| Completed | Partial | ❌ No | Must be fully paid |
| Completed | Paid | ✅ Yes | Meets all requirements |
| Any | Any (Cancelled) | ✅ Yes | Cancelled orders can always be archived |

## Implementation

### Files Modified

#### 1. `src/utils/repair-order-status-validation.ts`
Added `canArchiveRepairOrder()` function:

```typescript
export function canArchiveRepairOrder(repairOrder: RepairOrder): {
  canArchive: boolean
  reason?: string
}
```

**Logic:**
1. Check if cancelled → Allow
2. Check if completed → If not, block with message
3. Check if fully paid → If not, block with message
4. Allow archive

#### 2. `src/app/manager/repairOrderManagement/ro-board/ro-card.tsx`
Updated archive button visibility:

```typescript
// Show archive icon only for:
// 1. Cancelled ROs, OR
// 2. Completed ROs that are fully paid
const canArchive = repairOrder.isCancelled || 
  (isCompleted && repairOrder.paidStatus === PaidStatus.Paid)
```

#### 3. `src/app/manager/repairOrderManagement/ro-board/page.tsx`
Added validation in `handleArchiveRepairOrder()`:

```typescript
// Validate archive requirements
const archiveValidation = canArchiveRepairOrder(repairOrder)

if (!archiveValidation.canArchive) {
  toast.error(`Cannot archive repair order. ${archiveValidation.reason}`)
  return
}
```

## User Experience

### Visual Indicators
- Archive button (📦 icon) only appears on cards that can be archived
- Button is hidden for orders that don't meet requirements
- Prevents user confusion by not showing unavailable actions

### Validation Flow
```
User clicks Archive button
        │
        ▼
┌─────────────────────┐
│ Find repair order   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ canArchiveRepairOrder()│
│ - Check cancelled   │
│ - Check completed   │
│ - Check paid        │
└──────────┬──────────┘
           │
           ├──► canArchive = false
           │    │
           │    ▼
           │    ┌─────────────────────┐
           │    │ toast.error()       │
           │    │ Show reason         │
           │    │ Close dialog        │
           │    └─────────────────────┘
           │
           └──► canArchive = true
                │
                ▼
                ┌─────────────────────┐
                │ Show archive dialog │
                │ User enters reason  │
                └──────┬──────────────┘
                       │
                       ▼
                ┌─────────────────────┐
                │ API Call            │
                │ archiveRepairOrder()│
                └──────┬──────────────┘
                       │
                       ▼
                ┌─────────────────────┐
                │ toast.success()     │
                │ Refresh list        │
                └─────────────────────┘
```

## Error Messages

### Clear and Actionable Messages

1. **Not Completed**
   ```
   "Cannot archive repair order. Only completed or cancelled orders can be archived."
   ```
   - Tells user what status is required
   - Clear about the two valid scenarios

2. **Not Fully Paid**
   ```
   "Cannot archive repair order. Completed orders must be fully paid before archiving."
   ```
   - Explains the payment requirement
   - Indicates what needs to be done (complete payment)

## Testing Scenarios

### Test Case 1: Archive Cancelled Order (Should Succeed)
1. Create a repair order
2. Cancel it with a reason
3. Click archive button
4. **Expected**: Archive dialog opens, can archive successfully

### Test Case 2: Archive Completed + Paid (Should Succeed)
1. Create a repair order
2. Move to Completed status
3. Mark as fully paid (paidStatus = "Paid")
4. Click archive button
5. **Expected**: Archive dialog opens, can archive successfully

### Test Case 3: Archive Completed + Unpaid (Should Fail)
1. Create a repair order
2. Move to Completed status
3. Leave as unpaid or partial payment
4. Try to click archive button
5. **Expected**: Archive button should not appear on card

### Test Case 4: Archive Completed + Partial Payment (Should Fail)
1. Create a repair order
2. Move to Completed status
3. Add partial payment (paidStatus = "Partial")
4. Try to click archive button
5. **Expected**: Archive button should not appear on card

### Test Case 5: Archive Pending Order (Should Fail)
1. Create a repair order in Pending status
2. Try to click archive button
3. **Expected**: Archive button should not appear on card

### Test Case 6: Archive In Progress Order (Should Fail)
1. Create a repair order in In Progress status
2. Try to click archive button
3. **Expected**: Archive button should not appear on card

## Business Logic Rationale

### Why Require Full Payment?

1. **Financial Integrity**
   - Prevents archiving orders with outstanding balances
   - Ensures all revenue is collected before closing

2. **Audit Trail**
   - Active orders with pending payments remain visible
   - Easier to track and follow up on unpaid orders

3. **Workflow Enforcement**
   - Encourages proper completion of the payment process
   - Maintains clear separation between active and archived orders

### Why Allow Cancelled Orders?

1. **Workflow Flexibility**
   - Cancelled orders won't have further transactions
   - No need to wait for payment on cancelled work

2. **Board Cleanliness**
   - Removes cancelled orders from active view
   - Reduces clutter while preserving history

3. **Business Reality**
   - Cancelled orders may never be paid
   - Still need to be archived for record-keeping

## Code Examples

### Check if Order Can Be Archived

```typescript
import { canArchiveRepairOrder } from '@/utils/repair-order-status-validation'

const repairOrder = {
  repairOrderId: '123',
  statusId: '3', // Completed
  paidStatus: 'Paid',
  isCancelled: false
  // ... other fields
}

const result = canArchiveRepairOrder(repairOrder)

if (result.canArchive) {
  console.log('Can archive!')
} else {
  console.log('Cannot archive:', result.reason)
}
```

### Conditional UI Rendering

```typescript
// In ro-card.tsx
const canArchive = repairOrder.isCancelled || 
  (isCompleted && repairOrder.paidStatus === PaidStatus.Paid)

{canArchive && onArchive && (
  <Button onClick={onArchive}>
    <Archive className="w-3 h-3" />
  </Button>
)}
```

## Integration with Status Transitions

Archive validation works alongside status transition validation:

1. **Status Transitions** - Control how orders move between statuses
2. **Archive Validation** - Control when orders can be removed from active board

Both systems work together to maintain data integrity and enforce business rules.

## API Considerations

The frontend validation should match backend validation:

```csharp
// Backend should validate:
// 1. Order exists
// 2. Order is cancelled OR (completed AND fully paid)
// 3. User has permission to archive
```

Frontend validation provides immediate feedback, but backend validation is the final authority.

## Future Enhancements

Potential improvements:

1. **Unarchive Functionality**
   - Allow bringing archived orders back to active board
   - Useful for reopening completed work

2. **Archive Filters**
   - Filter archived orders by date range
   - Search archived orders by customer

3. **Archive Analytics**
   - Track archive reasons
   - Analyze completion rates

4. **Bulk Archive**
   - Archive multiple orders at once
   - Useful for end-of-period cleanup

5. **Archive Warnings**
   - Show warning if trying to archive recent orders
   - Confirm before archiving high-value orders

## Dependencies

- `@/types/manager/repair-order` - RepairOrder type, PaidStatus enum
- `@/services/manager/repair-order-service` - Archive API calls
- `@/services/authService` - User authentication
- `sonner` - Toast notifications

## Summary

Archive validation ensures:
- ✅ Only completed or cancelled orders can be archived
- ✅ Completed orders must be fully paid
- ✅ Clear error messages guide users
- ✅ Visual indicators prevent invalid actions
- ✅ Financial integrity is maintained
- ✅ Workflow rules are enforced
