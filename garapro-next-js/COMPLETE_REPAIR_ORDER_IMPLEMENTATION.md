# Complete Repair Order Implementation

## Overview
Added functionality to complete repair orders when all quotations have "Good" status and the repair order is in "In Progress" status (StatusId = 2).

## Implementation Details

### API Integration
Added two new methods to `quotationService`:

1. **`canCompleteRepairOrder(repairOrderId: string)`**
   - Endpoint: `GET /api/quotations/can-complete-repair-order/{repairOrderId}`
   - Returns: `{ canComplete: boolean, repairOrderId: string }`
   - Checks if all quotations are "Good" and RO is "In Progress"

2. **`completeRepairOrder(repairOrderId: string)`**
   - Endpoint: `POST /api/quotations/complete-repair-order/{repairOrderId}`
   - Returns: `{ message: string, repairOrderId: string }`
   - Changes repair order status to completed (StatusId = 3)

### UI Components

#### Quotation Tab Enhancement
- Added complete repair order button in the quotation tab
- Button only shows when:
  - Repair order status is "In Progress" (StatusId = 2)
  - All quotations have "Good" status
  - Repair order is not archived
- Green-themed card with clear messaging
- Loading states and error handling

#### Props Added
- `repairOrderStatus?: number` - Current repair order status
- `isArchived?: boolean` - Whether the repair order is archived
- `onRepairOrderCompleted?: () => void` - Callback when completion succeeds

### Files Modified

1. **`src/services/manager/quotation-service.ts`**
   - Added `canCompleteRepairOrder()` method
   - Added `completeRepairOrder()` method

2. **`src/app/manager/repairOrderManagement/orders/[id]/components/quotation-tab.tsx`**
   - Added complete repair order functionality
   - Added state management for completion status
   - Added UI components for the complete button
   - Added error handling and loading states

3. **`src/app/manager/repairOrderManagement/orders/[id]/page.tsx`**
   - Updated QuotationTab props to pass repair order status and callbacks

## User Flow

1. Manager creates quotations for a repair order
2. Quotations are sent to customers and approved (status becomes "Good")
3. When all quotations have "Good" status, the complete button appears in the quotation tab
4. Manager clicks "Complete Repair Order" button
5. System changes repair order status to "Completed" (StatusId = 3)
6. Payment processing becomes available in the payment tab

## Error Handling

- Validates repair order is in correct status before completion
- Handles archived repair orders appropriately
- Shows appropriate error messages for various failure scenarios
- Includes loading states during API calls

## Security

- Requires Manager role authentication (handled by backend)
- Validates repair order ownership and permissions
- Prevents completion of inappropriate repair orders

## Testing

To test the implementation:

1. Create a repair order with "In Progress" status (StatusId = 2)
2. Create quotations for the repair order
3. Set all quotations to "Good" status
4. Navigate to the quotation tab
5. Verify the complete repair order button appears
6. Click the button and verify the repair order status changes to "Completed"
7. Verify payment processing becomes available

## API Requirements

The backend must implement these endpoints:

- `GET /api/quotations/can-complete-repair-order/{repairOrderId}`
- `POST /api/quotations/complete-repair-order/{repairOrderId}`

Both endpoints require Manager role authentication and should validate:
- Repair order exists and belongs to manager's branch
- Repair order is in "In Progress" status
- All quotations for the repair order have "Good" status