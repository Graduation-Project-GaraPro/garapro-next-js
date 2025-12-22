# Quotation Completion Enhancement

## Summary
Updated the repair order completion logic to allow completion when **all quotations are rejected**, in addition to the existing logic that allows completion when all quotations are "Good".

## Changes Made

### 1. Service Layer (`src/services/manager/quotation-service.ts`)
- Updated `canCompleteRepairOrder()` comment to reflect new logic
- Updated `completeRepairOrder()` comment to reflect new logic

### 2. Validation Utility (`src/utils/repair-order-status-validation.ts`)
- Added new function: `areAllQuotationsRejected()` - checks if all quotations have "Rejected" status
- Added new function: `areAllQuotationsFinalized()` - checks if quotations are in final state (either all good OR all rejected)
- Updated `validateStatusTransition()` logic for "In Progress → Completed" transition:
  - Now allows completion if: good quotation OR all quotations rejected OR all jobs done
  - Updated error messages to reflect the new options

### 3. UI Component (`src/app/manager/repairOrderManagement/orders/[id]/components/quotation-tab.tsx`)
- **Added client-side validation** to show completion button when all quotations are rejected
- Updated completion check logic to use client-side validation first, then fallback to API
- Added dynamic completion messages based on quotation status:
  - All rejected: "All quotations have been rejected by the customer. You can complete this repair order for administrative closure."
  - All good: "All quotations have been approved with 'Good' status. You can now complete this repair order to enable payment processing."
  - Fallback: "All quotations have been finalized. You can now complete this repair order."

## Implementation Details

### Client-Side Logic (Frontend)
The completion button now shows when:
1. **All quotations are "Good"** (existing logic)
2. **All quotations are "Rejected"** (NEW - client-side check)
3. **Backend API allows completion** (fallback for job completion scenarios)

### Completion Check Flow:
```typescript
// 1. Check client-side validation first
const allQuotationsRejected = areAllQuotationsRejected(quotations);
const hasGoodQuote = hasGoodQuotation(quotations);

if (allQuotationsRejected || hasGoodQuote) {
  // Show completion button immediately
  setCanCompleteRepairOrder(true);
} else {
  // Check with backend API for other scenarios (job completion)
  const result = await quotationService.canCompleteRepairOrder(orderId);
  setCanCompleteRepairOrder(result.canComplete);
}
```

## Business Logic

### Repair Order Can Be Completed When:
1. **All quotations are "Good"** (existing logic)
   - All quotations must be approved
   - All services in each quotation must have `isGood: true`

2. **All quotations are "Rejected"** (NEW)
   - Every quotation must have status "Rejected"
   - Customer has declined all repair work

3. **All jobs are completed** (existing fallback)
   - When quotations don't meet criteria above
   - All jobs must have status = 3 (Completed)

### API Endpoints Used
- `GET /quotations/can-complete-repair-order/{repairOrderId}` - Check if RO can be completed (fallback)
- `POST /quotations/complete-repair-order/{repairOrderId}` - Complete the repair order

## Use Cases

### Scenario 1: Customer Approves All Work
- Manager creates quotation
- Customer approves quotation
- Manager marks all services as "Good"
- ✅ Repair order can be completed (client-side check)

### Scenario 2: Customer Rejects All Work (NEW)
- Manager creates quotation(s)
- Customer rejects all quotations
- ✅ Repair order can be completed (client-side check)

### Scenario 3: Mixed Response
- Manager creates multiple quotations
- Customer approves some, rejects others
- ❌ Repair order cannot be completed (must complete jobs or get all quotations finalized)

### Scenario 4: Job Completion Fallback
- Quotations are not finalized
- All jobs are marked as completed
- ✅ Repair order can be completed (backend API check)

## Notes
- **Client-side implementation**: The completion button now shows immediately for rejected quotations without waiting for backend API updates
- **Backward compatibility**: Still works with existing backend API for job completion scenarios
- **Error handling**: Falls back to client-side validation if API call fails
- **Dynamic messaging**: Shows appropriate message based on quotation status
