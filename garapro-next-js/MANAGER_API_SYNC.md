# Manager API Client Synchronization

## Summary
Successfully synchronized the manager services to use the correct API client configuration and moved all interfaces to the types folder for a clean, maintainable structure.

## Changes Made

### 1. Updated API Client Base URL
**File:** `src/services/manager/api-client.ts`
- Changed from `NEXT_PUBLIC_API_URL` to `NEXT_PUBLIC_BASE_URL`
- Now matches your `.env.local` configuration: `https://localhost:7113`
- Moved `ApiResponse` and `ApiError` interfaces to `src/types/manager/api.ts`

### 2. Fixed Import Paths
Updated the following services to import from the correct api-client:
- `src/services/manager/customer-service.ts` - Changed from `'../api-client'` to `'./api-client'`
- `src/services/manager/job-service.ts` - Changed from `'../api-client'` to `'./api-client'`

### 3. Centralized Type Definitions
Created new type files in `src/types/manager/`:
- ✅ `api.ts` - API response and error interfaces
- ✅ `customer.ts` - Customer and CreateCustomerDto interfaces
- ✅ `inspection.ts` - Inspection-related interfaces and InspectionStatus enum
- ✅ `technician.ts` - Technician workload, schedule, and assignment notification interfaces
- ✅ `repair-order-hub.ts` - Real-time repair order card interface
- ✅ Updated `appointment.ts` - Added RepairRequestFilter interface

### 4. Updated Service Files
All manager services now import types from `@/types/manager/` instead of defining them locally:
- ✅ `api-client.ts` - Imports and re-exports ApiResponse, ApiError
- ✅ `customer-service.ts` - Imports Customer, CreateCustomerDto
- ✅ `inspection-service.ts` - Imports inspection types and InspectionStatus enum
- ✅ `technician-service.ts` - Imports technician types
- ✅ `technician-assignment-hub.ts` - Imports assignment notification types
- ✅ `repair-order-hub.ts` - Imports RoBoardCardDto
- ✅ `appointmentService.ts` - Imports RepairRequestFilter

## Type Structure Overview

### Manager Types (`src/types/manager/`)
All interfaces and types are now centralized:

**Existing type files:**
- `appointment.ts` - Appointment and repair request types
- `label.ts` - Label types
- `order-status.ts` - Order status types
- `quotation.ts` - Quotation types
- `repair-order.ts` - Repair order types
- `repair-request.ts` - Repair request types
- `tech-schedule.ts` - Technician schedule types
- `vehicle.ts` - Vehicle types

**New type files created:**
- `api.ts` - API response and error interfaces
- `customer.ts` - Customer interfaces
- `inspection.ts` - Inspection interfaces and status enum
- `technician.ts` - Technician workload, schedule, and notifications
- `repair-order-hub.ts` - Real-time hub card interface

## API Structure Overview

### Manager Services (Your Code)
All manager services now correctly use:
```typescript
import { apiClient } from './api-client';
import type { SomeType } from '@/types/manager/some-type';
```

**Base URL:** `https://localhost:7113` (from `NEXT_PUBLIC_BASE_URL`)

**Services with synchronized types:**
- ✅ `appointmentService.ts` - Uses types from `@/types/manager/appointment`
- ✅ `customer-service.ts` - Uses types from `@/types/manager/customer`
- ✅ `inspection-service.ts` - Uses types from `@/types/manager/inspection`
- ✅ `job-service.ts` - Uses types from `@/types/job`
- ✅ `label-service.ts` - Uses types from `@/types/manager/label`
- ✅ `quotation-hub-service.ts` - Uses types from `@/types/manager/quotation`
- ✅ `quotation-service.ts` - Uses types from `@/types/manager/quotation`
- ✅ `repair-order-hub.ts` - Uses types from `@/types/manager/repair-order-hub`
- ✅ `repair-order-service.ts` - Uses types from `@/types/manager/repair-order`
- ✅ `tech-schedule-service.ts` - Uses types from `@/types/manager/tech-schedule`
- ✅ `technician-assignment-hub.ts` - Uses types from `@/types/manager/technician`
- ✅ `technician-service.ts` - Uses types from `@/types/manager/technician`
- ✅ `vehicle-service.ts` - Uses types from `@/types/manager/vehicle`

### Other Team Members' Services
They use the main api-client:
```typescript
import { apiClient } from './api-client';
```
Located at: `src/services/api-client.ts`

**Services:**
- `branch-service.ts` - Uses hardcoded `https://localhost:7113/api`
- `policy-service.ts` - Uses `/policies` endpoint
- `role-service.ts` - Uses `https://localhost:7113` from `NEXT_PUBLIC_API_URL`
- `service-Service.ts` - Mock service (no API calls)

## API Endpoint Patterns

### Manager API Endpoints
All endpoints follow the pattern: `/api/[Controller]`

Examples:
- `/api/Customer` - Customer management
- `/api/VehicleIntegration` - Vehicle integration
- `/api/Vehicles` - Vehicle CRUD
- `/api/RepairOrder` - Repair orders
- `/api/Quotation` - Quotations
- `/api/Technician` - Technician management
- `/api/users/technicians` - User technicians

### Team API Endpoints
- `/api/Branch` - Branch management
- `/api/Roles` - Role management
- `/api/Permissions` - Permission management
- `/policies` - Policy management (mock)

## Environment Configuration

Your `.env.local`:
```env
NEXT_PUBLIC_BASE_URL=https://localhost:7113
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id-here
```

## API Client Features

Both api-clients support:
- ✅ Request/Response interceptors
- ✅ Automatic token management from localStorage
- ✅ Retry logic for failed requests
- ✅ Error handling
- ✅ File upload/download
- ✅ GET, POST, PUT, PATCH, DELETE methods

## Benefits of This Structure

1. **Type Safety** - All interfaces are defined once in the types folder
2. **Maintainability** - Easy to find and update type definitions
3. **Consistency** - Matches the team's code structure pattern
4. **Reusability** - Types can be imported by multiple services
5. **Backward Compatibility** - Services re-export types for existing imports

## Next Steps

1. Ensure all API endpoints are correctly configured on the backend
2. Verify authentication tokens are properly set in localStorage
3. Test all manager services with the synchronized api-client
4. Consider consolidating to a single api-client if the team agrees
5. Update any components that import types from service files to use `@/types/manager/` instead

## Notes

- Manager services are isolated in `src/services/manager/` folder
- All type definitions are centralized in `src/types/manager/` folder
- Services re-export types for backward compatibility with existing imports
- The main api-client at `src/services/api-client.ts` is used by other team members
- All services now correctly reference `NEXT_PUBLIC_BASE_URL` from environment variables
- Enums (like `InspectionStatus`) use regular imports, not type imports
