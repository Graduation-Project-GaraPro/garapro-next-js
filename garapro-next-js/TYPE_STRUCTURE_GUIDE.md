# Type Structure Guide

## Overview
All TypeScript interfaces and types are centralized in the `src/types/` folder for better maintainability and consistency.

## Folder Structure

```
src/types/
├── manager/              # Manager-specific types
│   ├── api.ts           # API response/error interfaces
│   ├── appointment.ts   # Appointment and repair request types
│   ├── customer.ts      # Customer interfaces
│   ├── inspection.ts    # Inspection types and status enum
│   ├── label.ts         # Label types
│   ├── order-status.ts  # Order status types
│   ├── quotation.ts     # Quotation types
│   ├── repair-order.ts  # Repair order types
│   ├── repair-order-hub.ts  # Real-time hub card interface
│   ├── repair-request.ts    # Repair request types
│   ├── tech-schedule.ts     # Technician schedule types
│   ├── technician.ts        # Technician workload/notifications
│   └── vehicle.ts           # Vehicle types
├── api.ts               # General API types
├── job.ts               # Job types
├── logs.ts              # Log types
├── policy.ts            # Policy types
├── service.ts           # Service types
└── statistics.ts        # Statistics types
```

## Usage Examples

### Importing Types

```typescript
// Import types from manager folder
import type { Customer, CreateCustomerDto } from '@/types/manager/customer';
import type { InspectionDto } from '@/types/manager/inspection';
import type { ApiResponse, ApiError } from '@/types/manager/api';

// Import enums (use regular import, not type import)
import { InspectionStatus } from '@/types/manager/inspection';

// Import general types
import type { Job } from '@/types/job';
```

### In Service Files

```typescript
// src/services/manager/customer-service.ts
import { apiClient } from './api-client';
import type { Customer, CreateCustomerDto } from '@/types/manager/customer';

class CustomerService {
  async getCustomer(id: string): Promise<Customer> {
    const response = await apiClient.get<Customer>(`/api/Customer/${id}`);
    return response.data;
  }
  
  async createCustomer(data: CreateCustomerDto): Promise<Customer> {
    const response = await apiClient.post<Customer>('/api/Customer', data);
    return response.data;
  }
}
```

### In Component Files

```typescript
// src/app/manager/customers/page.tsx
import type { Customer } from '@/types/manager/customer';
import { customerService } from '@/services/manager/customer-service';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  
  // ... component logic
}
```

## Best Practices

1. **Always use `type` imports** for interfaces and types:
   ```typescript
   import type { Customer } from '@/types/manager/customer';
   ```

2. **Use regular imports for enums** (they're values, not just types):
   ```typescript
   import { InspectionStatus } from '@/types/manager/inspection';
   ```

3. **Keep types close to their domain**:
   - Manager-specific types → `src/types/manager/`
   - General types → `src/types/`

4. **One file per domain**:
   - Customer-related types → `customer.ts`
   - Inspection-related types → `inspection.ts`

5. **Export all types explicitly**:
   ```typescript
   export interface Customer { ... }
   export interface CreateCustomerDto { ... }
   ```

6. **Use descriptive names**:
   - DTOs: `CreateCustomerDto`, `UpdateCustomerDto`
   - Responses: `CustomerResponse`, `ApiResponse<T>`
   - Filters: `CustomerFilter`, `RepairRequestFilter`

## Backward Compatibility

Services re-export types for backward compatibility:

```typescript
// In service file
import type { Customer } from '@/types/manager/customer';
export type { Customer }; // Re-export for backward compatibility

// Old code still works
import type { Customer } from '@/services/manager/customer-service';
```

## Migration Checklist

When adding new types:
- [ ] Create/update type file in `src/types/manager/`
- [ ] Import types in service file
- [ ] Re-export types from service for backward compatibility
- [ ] Update components to import from `@/types/manager/`
- [ ] Remove duplicate interface definitions from service files
- [ ] Run diagnostics to check for errors

## Common Patterns

### API Response Pattern
```typescript
import type { ApiResponse } from '@/types/manager/api';

async function fetchData<T>(endpoint: string): Promise<T> {
  const response = await apiClient.get<T>(endpoint);
  return response.data;
}
```

### Filter Pattern
```typescript
import type { RepairRequestFilter } from '@/types/manager/appointment';

async function getFilteredRequests(filter: RepairRequestFilter) {
  // ... implementation
}
```

### DTO Pattern
```typescript
import type { CreateCustomerDto, Customer } from '@/types/manager/customer';

async function createCustomer(dto: CreateCustomerDto): Promise<Customer> {
  // ... implementation
}
```
