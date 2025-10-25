# Authentication Fix for Vehicle API Integration

## Issue Description

The vehicle API integration was failing with a 401 Unauthorized error, even though the API endpoint was working correctly when tested with curl. The error occurred because the authentication token was not being properly included in API requests from the frontend.

## Root Cause

The authentication token was being stored in localStorage after login, but the manager's api-client was not initializing the Authorization header with the token from localStorage. This meant that API requests to protected endpoints were being made without authentication, resulting in 401 errors.

## Solution Implemented

Added a request interceptor to the manager's api-client (`src/services/manager/api-client.ts`) that automatically sets the Authorization header from the token stored in localStorage:

```typescript
apiClient.addRequestInterceptor((config) => {
  // Set authentication token from localStorage if available
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`
      };
    }
  }
  return config;
});
```

This interceptor:
1. Checks if we're running in a browser environment (typeof window !== 'undefined')
2. Retrieves the authentication token from localStorage
3. If a token exists, adds it to the Authorization header of all requests
4. Returns the modified config object

## Files Modified

1. `src/services/manager/api-client.ts` - Added authentication token interceptor

## Testing

To verify the fix:
1. Log in to the application
2. Navigate to the repair order creation page
3. Select a customer
4. Verify that vehicles are loaded correctly without 401 errors

## How It Works

1. User logs in through the authentication flow
2. Authentication service stores the JWT token in localStorage
3. When the manager's api-client is initialized, the request interceptor checks for the token in localStorage
4. If a token is found, it's automatically added to the Authorization header of all subsequent API requests
5. Protected endpoints like the vehicle API now receive the proper authentication and respond successfully

## Security Considerations

- The token is only accessed in browser environments (typeof window !== 'undefined' check)
- Tokens are automatically cleared from localStorage on logout
- The interceptor doesn't modify requests if no token is available