# API Connection Fix

## Problem
The repair order board was failing to fetch order statuses with the error:
```
Error: Failed to fetch order statuses: {}
```

## Root Cause
The issue was with the endpoint URL case sensitivity. The service was using `/api/orderstatus` (lowercase 'o') but the actual API endpoint is `/api/OrderStatus` (uppercase 'O').

## Solution
Updated the repair order service to use the correct endpoint URL:
- Changed from: `/api/orderstatus/columns`
- Changed to: `/api/OrderStatus/columns`

## Files Modified

### 1. `src/services/manager/repair-order-service.ts`
```typescript
// Before
private orderStatusBaseUrl = "/api/orderstatus"

// After
private orderStatusBaseUrl = "/api/OrderStatus"
```

### 2. `src/types/manager/order-status.ts`
Updated the `OrderStatus` interface to include all fields from the API response:
```typescript
export interface OrderStatus {
  orderStatusId: string
  statusName: string
  orderIndex: number
  repairOrderCount: number
  cards: unknown[]
  availableLabels: unknown[]
}
```

## API Endpoints

### Working Endpoints
1. `GET https://localhost:7113/api/OrderStatus/columns` - Fetch order statuses
2. `GET https://localhost:7113/api/RepairOrder` - Fetch all repair orders

### Response Structure
The `/api/OrderStatus/columns` endpoint returns:
```json
{
  "pending": [
    {
      "orderStatusId": "af46cd56-37c3-4bc3-a8fc-cea5b6312534",
      "statusName": "Pending",
      "repairOrderCount": 1,
      "orderIndex": 0,
      "cards": [],
      "availableLabels": []
    }
  ],
  "inProgress": [
    {
      "orderStatusId": "d944cdf3-d3aa-403c-90cf-ded27d1ff66a",
      "statusName": "In Progress",
      "repairOrderCount": 0,
      "orderIndex": 0,
      "cards": [],
      "availableLabels": []
    }
  ],
  "completed": [
    {
      "orderStatusId": "86fe8c62-4257-41d3-87bd-ac5eac4a843e",
      "statusName": "Completed",
      "repairOrderCount": 0,
      "orderIndex": 0,
      "cards": [],
      "availableLabels": []
    }
  ]
}
```

## Testing
To verify the fix:
1. Navigate to `/manager/repairOrderManagement/ro-board/test-api`
2. The page should display both order statuses and repair orders
3. Check the browser console for any errors

## Verification
The fix can be verified by:
1. Successful API calls without errors
2. Correct display of order status and repair order data
3. No more "Failed to fetch order statuses" errors in the console