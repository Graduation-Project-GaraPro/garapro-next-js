# Startup Page Setup

## Overview
This document explains how the startup page was configured to redirect users to the login page when they first visit the application.

## Changes Made

### 1. Root Page Redirection
Updated `src/app/page.tsx` to redirect to the login page:

```typescript
import { redirect } from "next/navigation";

export default function Page() {
  // Redirect to login page as the startup page
  redirect("/login");
}
```

### 2. Login Page
The login page is located at `src/app/login/page.tsx` and provides:
- Phone number authentication
- Google Sign-In integration
- Registration link for new users
- Password recovery option

### 3. Post-Login Navigation
After successful authentication, users are redirected to:
- Manager dashboard: `/manager` for manager users
- Technician dashboard: `/technician` for technician users
- Customer dashboard: `/customer` for customer users

## Authentication Flow

1. User visits the application root URL (`/`)
2. User is automatically redirected to `/login`
3. User authenticates using either:
   - Phone number and password
   - Google Sign-In
4. Upon successful authentication:
   - Token is stored in localStorage
   - User is redirected to their role-specific dashboard
5. User can navigate to different sections from the dashboard

## File Structure
```
src/
  app/
    page.tsx              # Root page (redirects to login)
    login/
      page.tsx            # Login page
    manager/
      page.tsx            # Manager dashboard
    technician/
      page.tsx            # Technician dashboard
    customer/
      page.tsx            # Customer dashboard
```

## Testing

To verify the setup:
1. Visit the root URL (`http://localhost:3000/`)
2. Confirm automatic redirection to `/login`
3. Test login functionality with valid credentials
4. Verify successful navigation to the dashboard after login

## Security Considerations

- Authentication tokens are stored in localStorage
- Each role has its own protected routes
- Unauthenticated users are redirected to login page
- Google Sign-In uses secure OAuth 2.0 flow