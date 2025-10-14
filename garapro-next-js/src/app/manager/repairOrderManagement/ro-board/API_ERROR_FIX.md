# API Error Fix Documentation

## Problem
The drag and drop functionality was failing with a 400 (Bad Request) error when trying to move repair orders:
```
Failed to move repair order f884e517-4dd2-46bc-9abe-1da43f0b1632 to status d944cdf3-d3aa-403c-90cf-ded27d1ff66a
```

## Root Cause
The issue was caused by two problems:

1. **Authentication**: The direct fetch calls in the repair order hub service were not including authentication headers
2. **API Client Mismatch**: The service was using direct fetch instead of the established API client which handles authentication automatically

## Solution
Updated `src/services/manager/repair-order-hub.ts` to use the existing API client:

### Before (Direct Fetch):
```typescript
const response = await fetch(`${this.baseUrl}/api/RepairOrder/status/update`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    repairOrderId,
    newStatusId
  })
});
```

### After (API Client):
```typescript
const response = await apiClient.post<unknown>("/api/RepairOrder/status/update", {
  repairOrderId: repairOrderId,
  newStatusId: newStatusId
});
```

## Benefits of the Fix

1. **Automatic Authentication**: The API client automatically includes authentication headers
2. **Consistent Error Handling**: Uses the same error handling patterns as the rest of the application
3. **Retry Logic**: Inherits retry logic for network errors
4. **Interceptors**: Benefits from request/response interceptors for logging and monitoring

## Files Modified

1. `src/services/manager/repair-order-hub.ts` - Updated to use API client
2. Created debug page at `/manager/repairOrderManagement/ro-board/debug-api` for testing

## Testing

To verify the fix:
1. Navigate to `/manager/repairOrderManagement/ro-board/debug-api`
2. Test the API call with the same repair order ID and status ID
3. Check that the call succeeds without authentication errors

## Verification

The fix can be verified by:
1. Successful drag and drop operations without 400 errors
2. Proper authentication headers being sent with requests
3. Consistent error handling across the application