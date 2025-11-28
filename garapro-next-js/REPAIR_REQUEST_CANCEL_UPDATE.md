# Repair Request Cancel Feature Update

## Changes Made

### 1. Display Date Change
- **Changed from**: `arrivalWindowStart` (with `requestDate` as fallback)
- **Changed to**: Always use `requestDate` for displaying repair requests in calendar

### 2. Action Buttons Update
- **Removed**: Approve and Reject buttons
- **Added**: Cancel Request button
- **API Endpoint**: `POST /api/ManagerRepairRequest/{id}/cancel-on-behalf`

### 3. Cancel Button Visibility Rules
The "Cancel Request" button is displayed when:
- Status is NOT "completed" (customer has not arrived)
- Status is NOT "cancelled" (already cancelled)
- Conversion form is not showing

The button is hidden when:
- Status is "completed" (customer already arrived to garage)
- Status is "cancelled" (already cancelled)

### 4. Files Modified

#### `src/services/manager/appointmentService.ts`
- Simplified `enrichRepairRequest()` to always use `requestDate`
- Removed `approveRepairRequest()` method
- Removed `rejectRepairRequest()` method
- Added `cancelRepairRequest()` method that calls the new API endpoint

#### `src/app/manager/CustomerAppointments/repair-request-detail-dialog.tsx`
- Removed `isApproving` and `isRejecting` state variables
- Added `isCancelling` state variable
- Removed `handleApprove()` and `handleReject()` functions
- Added `handleCancel()` function
- Updated action buttons section to show cancel button with proper conditions

## Usage

Managers can now cancel repair requests on behalf of customers by:
1. Opening the repair request details dialog
2. Clicking the "Cancel Request" button (if status allows)
3. The system will call the API to cancel the request
4. The status will update to "cancelled" in the UI

The system automatically handles accept/reject logic, so managers no longer need to manually approve or reject requests.
