# Manager Profile System

## Overview
The Manager Profile system provides user profile management functionality using the `/api/users/me` endpoint. It displays the current manager's profile information and integrates with the site header for easy access.

## Features

### Profile Display
- **Personal Information**: First name, last name, email, phone number
- **Role Information**: User role and permissions
- **Branch Assignment**: Current branch assignment (if applicable)
- **Account Status**: Active/inactive status and account creation date
- **Avatar Display**: Initials-based avatar throughout the interface

### Header Integration
- **Real-time Profile**: Header displays current user's name and initials
- **Profile Dropdown**: Quick access to profile information and logout
- **Loading States**: Graceful handling of profile loading

## API Integration

### User Profile Endpoint
- **Endpoint**: `GET /api/users/me`
- **Authorization**: Requires JWT token
- **Response**: UserDto object with complete profile information

## File Structure

```
src/
├── types/manager/
│   └── user.ts                    # User type definitions
├── services/manager/
│   └── user-service.ts           # User API service
├── hooks/
│   └── use-user-profile.ts       # Profile data hook
├── app/manager/
│   ├── profile/
│   │   └── page.tsx              # Profile page component
│   └── components/layout/
│       ├── site-header.tsx       # Updated header with profile
│       └── app-sidebar.tsx       # Updated sidebar with profile link
```

## Components

### UserService
- Handles API communication with `/api/users/me`
- Transforms raw API data to include computed fields (fullName, initials)

### useUserProfile Hook
- Manages profile data state and loading
- Provides error handling and refetch functionality
- Used throughout the application for consistent profile access

### Profile Page
- Comprehensive profile display with card-based layout
- Shows all user information in organized sections
- Responsive design for different screen sizes

### Header Integration
- Real-time profile display in site header
- Avatar with user initials
- Dropdown menu with profile link and logout option

## Usage

### Accessing Profile
1. Click on user avatar/name in the site header
2. Select "Profile" from the dropdown menu
3. Or navigate directly to `/manager/profile`
4. Or use the "Profile" link in the sidebar under "MANAGE"

### Profile Information Displayed
- **Personal**: Name, email, phone number
- **Professional**: Role, branch assignment
- **Account**: Status, creation date, last update

## Error Handling
- Loading states during API calls
- Error messages for failed requests
- Fallback displays when profile data unavailable
- Graceful degradation in header when profile fails to load

## Security
- Uses existing JWT authentication
- Profile data automatically filtered by user permissions
- No sensitive information exposed in client-side code

## Future Enhancements
- Profile editing functionality
- Profile picture upload
- Notification preferences
- Password change interface
- Activity history