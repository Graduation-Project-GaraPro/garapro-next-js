# Admin Services - Improved Architecture

## Overview

This document describes the improved admin services architecture that has been refactored to be more production-ready, maintainable, and easier to integrate with backend APIs.

## Key Improvements Made

### 1. Enhanced API Client (`src/services/api-client.ts`)

The API client has been completely rewritten with the following features:

- **Type-safe responses** with `ApiResponse<T>` interface
- **Automatic retry logic** for failed requests
- **Request/Response interceptors** for common operations
- **Better error handling** with structured error objects
- **Authentication token management**
- **File upload/download support**
- **Automatic cache busting** for GET requests

#### Usage Example:
```typescript
import { apiClient } from '@/services/api-client'

// Set authentication token
apiClient.setAuthToken('your-jwt-token')

// Make API calls
const response = await apiClient.get<User[]>('/users', { page: 1, limit: 10 })
const users = response.data

// Handle errors
try {
  const result = await apiClient.post<User>('/users', userData)
} catch (error) {
  console.error('Error:', error.message, 'Status:', error.status)
}
```

### 2. Refactored Services

All services have been updated to use the new API client and follow consistent patterns:

#### Statistics Service (`src/services/statistics-service.ts`)
- Dashboard metrics and analytics
- Real-time updates with WebSocket fallback
- Performance monitoring
- Export functionality

#### User Service (`src/services/user-service.ts`)
- Complete user management (CRUD operations)
- Role management and permissions
- Bulk operations
- User activity tracking
- Export and search functionality

#### Garage Service (`src/services/garage-service.ts`)
- Garage management and approval workflows
- Performance analytics
- Review management
- Bulk operations
- Service and domain management

#### Policy Service (`src/services/policy-service.ts`)
- Policy creation and management
- Compliance reporting
- Exception handling
- Audit logging
- Violation tracking

#### Log Service (`src/services/log-service.ts`)
- System log management
- Security and performance logging
- Real-time log streaming
- Log analytics and patterns
- Export and archival

### 3. Improved Error Handling

All services now provide:
- **Consistent error messages** for better user experience
- **Fallback data** when APIs are unavailable
- **Retry mechanisms** for transient failures
- **Structured error objects** with status codes and details

### 4. Real-time Updates

Services support real-time updates with:
- **WebSocket connections** for live data
- **Automatic fallback** to polling when WebSocket unavailable
- **Connection management** with proper cleanup

## Service Architecture

### Base Service Pattern

All services follow this consistent pattern:

```typescript
class ServiceName {
  private baseUrl = '/endpoint'

  // CRUD operations
  async getItems(filters?: Filters): Promise<Response>
  async getItemById(id: number): Promise<Item>
  async createItem(data: CreateData): Promise<Item>
  async updateItem(id: number, data: UpdateData): Promise<Item>
  async deleteItem(id: number): Promise<void>

  // Specialized operations
  async getStatistics(): Promise<Statistics>
  async exportData(filters?: Filters): Promise<Blob>
  async bulkOperations(ids: number[], operation: string): Promise<void>

  // Search and filtering
  async searchItems(query: string, filters?: Filters): Promise<Response>
}
```

### Response Format

All API responses follow this structure:

```typescript
interface ApiResponse<T> {
  data: T
  message?: string
  status: number
  success: boolean
}
```

### Error Format

Errors are structured as:

```typescript
interface ApiError {
  message: string
  status: number
  code?: string
  details?: any
}
```

## Integration with Backend

### Environment Configuration

Set your backend API URL in `.env.local`:

```bash
NEXT_PUBLIC_API_URL=https://your-api.com/api
```

### API Endpoints

The services expect these REST endpoints:

#### Users
- `GET /users` - List users with filters
- `GET /users/:id` - Get user details
- `POST /users` - Create user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user
- `PATCH /users/:id/ban` - Ban user
- `PATCH /users/:id/role` - Change role

#### Garages
- `GET /garages` - List garages with filters
- `GET /garages/:id` - Get garage details
- `POST /garages` - Create garage
- `PUT /garages/:id` - Update garage
- `DELETE /garages/:id` - Delete garage
- `PATCH /garages/:id/approve` - Approve garage
- `PATCH /garages/:id/ban` - Ban garage

#### Policies
- `GET /policies` - List policies with filters
- `GET /policies/:id` - Get policy details
- `POST /policies` - Create policy
- `PUT /policies/:id` - Update policy
- `DELETE /policies/:id` - Delete policy
- `PATCH /policies/:id/activate` - Activate policy

#### Logs
- `GET /logs` - List logs with filters
- `GET /logs/:id` - Get log details
- `GET /logs/analytics` - Get log analytics
- `GET /logs/export` - Export logs
- `DELETE /logs/clear` - Clear logs

### Authentication

The API client automatically handles authentication:

```typescript
// Set token (usually done after login)
apiClient.setAuthToken('jwt-token')

// Token is automatically included in all requests
const users = await userService.getUsers()

// Clear token on logout
apiClient.clearAuthToken()
```

## Usage Examples

### Dashboard Overview

```typescript
import { statisticsService } from '@/services/statistics-service'

// Get dashboard metrics
const metrics = await statisticsService.getMetrics()

// Subscribe to real-time updates
const unsubscribe = statisticsService.subscribeToRealTimeUpdates((data) => {
  if (data.type === 'metrics_update') {
    // Update UI with new data
    setMetrics(data.metrics)
  }
})

// Cleanup on component unmount
return () => unsubscribe()
```

### User Management

```typescript
import { userService } from '@/services/user-service'

// Get users with pagination and filters
const response = await userService.getUsers({
  search: 'john',
  role: 'user',
  status: 'active',
  page: 1,
  limit: 20
})

// Create new user
const newUser = await userService.createUser({
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+1234567890',
  role: 'user',
  password: 'securepassword',
  location: 'New York'
})

// Bulk operations
await userService.bulkUpdateUsers([1, 2, 3], { role: 'admin' })
```

### Garage Management

```typescript
import { garageService } from '@/services/garage-service'

// Get garage statistics
const stats = await garageService.getGarageStatistics()

// Approve pending garage
await garageService.approveGarage(garageId)

// Get garage performance
const performance = await garageService.getGaragePerformance(garageId, '30d')
```

### Policy Management

```typescript
import { policyService } from '@/services/policy-service'

// Get compliance reports
const compliance = await policyService.getAllComplianceReports()

// Create policy exception
const exception = await policyService.createPolicyException(policyId, {
  reason: 'Emergency maintenance',
  requestedBy: 'admin@company.com',
  startDate: '2024-01-01',
  endDate: '2024-01-31',
  conditions: 'Only during off-hours'
})
```

### Log Management

```typescript
import { logService } from '@/services/log-service'

// Get security logs
const securityLogs = await logService.getSecurityLogs({
  level: 'error',
  dateRange: { start: '2024-01-01', end: '2024-01-31' }
})

// Subscribe to real-time logs
const unsubscribe = logService.getRealTimeLogs((log) => {
  // Handle new log entry
  console.log('New log:', log)
})

// Export logs
const blob = await logService.exportLogs(
  { level: 'error' },
  { format: 'csv', includeDetails: true, compression: false }
)
```

## Error Handling Best Practices

### Service Level

```typescript
try {
  const data = await userService.getUsers()
  setUsers(data.users)
} catch (error) {
  // Show user-friendly error message
  setError(error.message || 'Failed to fetch users')
  
  // Log detailed error for debugging
  console.error('User fetch error:', error)
}
```

### Component Level

```typescript
const [error, setError] = useState<string | null>(null)
const [isLoading, setIsLoading] = useState(false)

const loadData = async () => {
  try {
    setIsLoading(true)
    setError(null)
    
    const data = await service.getData()
    setData(data)
  } catch (error) {
    setError(error.message)
  } finally {
    setIsLoading(false)
  }
}
```

## Testing

### Mock Services

For testing, you can create mock implementations:

```typescript
// __mocks__/services/user-service.ts
export const userService = {
  getUsers: jest.fn().mockResolvedValue({
    users: mockUsers,
    total: mockUsers.length,
    page: 1,
    limit: 10,
    totalPages: 1
  }),
  // ... other methods
}
```

### Service Testing

```typescript
import { userService } from '@/services/user-service'

describe('UserService', () => {
  it('should fetch users with filters', async () => {
    const users = await userService.getUsers({ role: 'admin' })
    expect(users.users).toHaveLength(2)
    expect(users.total).toBe(2)
  })
})
```

## Performance Considerations

### Caching

Services automatically handle caching through the API client:

```typescript
// Cache busting for GET requests
apiClient.addRequestInterceptor((config) => {
  if (config.method === 'GET') {
    const url = new URL(config.url as string, window.location.origin)
    url.searchParams.set('_t', Date.now().toString())
    config.url = url.toString()
  }
  return config
})
```

### Real-time Updates

Use WebSocket connections for live data:

```typescript
// Automatic fallback to polling if WebSocket unavailable
const unsubscribe = service.subscribeToRealTimeUpdates((data) => {
  // Handle updates
})

// Cleanup on unmount
useEffect(() => {
  return unsubscribe
}, [])
```

## Security Features

### Authentication

- Automatic token inclusion in requests
- Token refresh handling
- Secure token storage

### Input Validation

- Type-safe interfaces
- Parameter sanitization
- SQL injection prevention

### Error Information

- No sensitive data in error messages
- Structured error responses
- Audit logging for security events

## Migration Guide

### From Old Services

1. **Update imports**:
   ```typescript
   // Old
   import { userService } from '@/services/user-service'
   
   // New
   import { userService } from '@/services/user-service'
   ```

2. **Update API calls**:
   ```typescript
   // Old
   const users = await userService.getUsers()
   
   // New
   const response = await userService.getUsers()
   const users = response.users
   ```

3. **Update error handling**:
   ```typescript
   // Old
   try {
     const data = await service.getData()
   } catch (error) {
     console.error('Error:', error)
   }
   
   // New
   try {
     const response = await service.getData()
     const data = response.data
   } catch (error) {
     console.error('Error:', error.message, 'Status:', error.status)
   }
   ```

## Troubleshooting

### Common Issues

1. **API not available**: Services automatically fall back to cached/mock data
2. **Authentication errors**: Check token validity and expiration
3. **Network errors**: Automatic retry with exponential backoff
4. **WebSocket connection**: Falls back to polling automatically

### Debug Mode

Enable debug logging:

```typescript
// In development
if (process.env.NODE_ENV === 'development') {
  apiClient.addRequestInterceptor((config) => {
    console.log('API Request:', config)
    return config
  })
}
```

## Contributing

When adding new services:

1. Follow the established service pattern
2. Include proper TypeScript interfaces
3. Add comprehensive error handling
4. Include fallback data for offline scenarios
5. Add JSDoc comments for all methods
6. Include unit tests

## Support

For questions or issues:

1. Check the service documentation
2. Review error messages and status codes
3. Check network tab for API responses
4. Verify authentication token validity
5. Check backend API availability

---

This architecture provides a robust, maintainable foundation for admin services that can easily integrate with any backend API while providing excellent user experience and developer productivity.
