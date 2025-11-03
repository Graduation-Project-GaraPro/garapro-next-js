# Required Services Functionality Verification

This document outlines how to verify that the required services functionality has been correctly implemented.

## Verification Steps

### 1. Manager Quotation Creation

1. Navigate to the manager quotation creation dialog
2. Select several services from the service tree
3. Mark at least one service as "Required" using the button next to the service
4. Verify that:
   - Required services show a lock icon
   - Required services cannot be deselected
   - Required services appear in the summary with a "Required" badge
   - Normal services can still be selected/deselected

### 2. Customer Quotation Review

1. Access the customer quotations page at `/customer/quotations`
2. Select a quotation that contains required services
3. Verify that:
   - Required services are clearly marked with a lock icon
   - Required services show a "Required" badge
   - Required services cannot be modified
   - Optional services can be selected/deselected normally

### 3. API Data Verification

1. Check that the API requests include the `isRequired` flag for services
2. Verify that the backend correctly processes required services
3. Confirm that customer responses properly enforce required services

## Expected Behavior

### Manager Side
- Managers can mark services as required during quotation creation
- Required services are automatically selected
- Required services cannot be deselected
- Visual indicators clearly show which services are required

### Customer Side
- Customers can see which services are required
- Required services cannot be deselected by customers
- Optional services can be selected/deselected normally
- Clear visual distinction between required and optional services

## Components to Verify

1. `CreateQuotationDialog` - Main quotation creation interface
2. `ServicesTree` - Service selection with required service functionality
3. `ServicesSummary` - Summary view showing selected services and required status
4. `CustomerQuotationDetails` - Customer view of quotations with required services enforcement

## Data Flow Verification

1. Service selection state properly tracks required services
2. Required services are included in API requests
3. Backend correctly stores and retrieves required service information
4. Customer interface properly displays required services
5. Customer actions properly enforce required service selection

## Edge Cases

1. Quotations with no required services
2. Quotations with all required services
3. Mixed quotations with both required and optional services
4. Customer attempting to deselect required services (should be prevented)