# Service Selection Feature

## Overview
This feature enhances the repair order creation process by allowing managers to select services from a catalog, with automatic calculation of estimated amounts and repair times.

## Features

### 1. Service Selection
- Browse available services from the service catalog
- Select multiple services for a repair order
- View service details (name, description, price, duration)

### 2. Auto-calculation
- Automatically calculates total estimated amount based on selected services
- Automatically calculates total estimated repair time based on selected services
- Real-time updates as services are selected/deselected

### 3. Improved User Experience
- Eliminates manual entry of estimated amounts and times
- Reduces calculation errors
- Provides consistent pricing and time estimates

## Implementation Details

### Frontend Changes

#### 1. CreateTask Component
Located at: `src/app/manager/repairOrderManagement/components/create-task.tsx`

Key modifications:
- Added service fetching from service catalog
- Implemented service selection UI with toggle functionality
- Added auto-calculation of totals
- Updated form submission to include selected service IDs

#### 2. Repair Order Types
Located at: `src/types/manager/repair-order.ts`

Updated interface:
```typescript
export interface CreateRepairOrderRequest {
  customerId: string
  vehicleId: string
  receiveDate: string
  roType: number
  estimatedCompletionDate: string
  note: string
  // Make these optional since they'll be calculated from services
  estimatedAmount?: number
  estimatedRepairTime?: number
  // Add selected service IDs
  selectedServiceIds?: string[]
}
```

#### 3. Repair Order Service
Located at: `src/services/manager/repair-order-service.ts`

No changes needed - the service automatically sends all fields in the request object to the backend.

### Backend Integration

The backend API endpoint `/api/RepairOrder` now accepts an optional `selectedServiceIds` array. When provided, the backend automatically calculates:
- `estimatedAmount` based on the sum of selected service prices
- `estimatedRepairTime` based on the sum of selected service durations

### UI Flow

1. Manager navigates to "Create Repair Order"
2. Manager selects customer and vehicle as before
3. Manager selects services from the service catalog list
4. System automatically calculates and displays:
   - Total estimated amount
   - Total estimated repair time
5. Manager completes other repair order details
6. Manager submits the repair order

## Testing

### Manual Testing
1. Navigate to the repair order board
2. Click "Create Repair Order"
3. Select a customer and vehicle
4. Select one or more services from the service list
5. Verify that totals are automatically calculated
6. Complete other details and submit
7. Verify that the repair order is created successfully

### Automated Testing
Run the test suite:
```bash
npm run test
```

## Demo

A demo page is available at `/manager/repairOrderManagement/service-demo` to showcase the feature.

## Future Improvements

1. **Service Categories**: Organize services into categories for easier browsing
2. **Service Search**: Add search functionality to quickly find services
3. **Service Dependencies**: Implement logic for services that require other services
4. **Pricing Tiers**: Support different pricing for different customer types
5. **Service Packages**: Create predefined service packages for common combinations