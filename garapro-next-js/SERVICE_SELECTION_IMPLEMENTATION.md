# Service Selection Implementation

## Overview
This document describes the implementation of the service selection feature for repair order creation in the garage management system.

## Key Features Implemented

### 1. Service Selection UI
- Display available services in a selectable list
- Allow multiple service selection
- Show service details (name, description, price, duration)
- Visual feedback for selected services

### 2. Auto-calculation
- Automatically calculate total estimated amount based on selected services
- Automatically calculate total estimated repair time based on selected services
- Display calculated totals in real-time

### 3. API Integration
- Fetch services from the backend API
- Send selected service IDs to the repair order creation endpoint
- Handle service-related data in repair order creation

## Implementation Details

### Frontend Components

#### 1. CreateTask Component (`src/app/manager/repairOrderManagement/components/create-task.tsx`)
- Added service selection functionality
- Implemented service fetching from service catalog
- Added service selection toggle functionality
- Implemented auto-calculation of totals
- Updated form submission to include selected service IDs

#### 2. Repair Order Types (`src/types/manager/repair-order.ts`)
- Updated `CreateRepairOrderRequest` interface to include `selectedServiceIds` field
- Made `estimatedAmount` and `estimatedRepairTime` optional since they're calculated

#### 3. Repair Order Service (`src/services/manager/repair-order-service.ts`)
- Updated to handle the new `selectedServiceIds` field in the request

### Backend Integration

#### Request Structure
The repair order creation endpoint now accepts the following structure:

```json
{
  "customerId": "string",
  "vehicleId": "string",
  "receiveDate": "datetime",
  "roType": "number",
  "estimatedCompletionDate": "datetime",
  "note": "string",
  "estimatedAmount": "number (optional)",
  "estimatedRepairTime": "number (optional)",
  "selectedServiceIds": ["string"]
}
```

#### Auto-calculation Logic
When services are selected:
1. Total amount = sum of all selected service prices
2. Total time = sum of all selected service durations (in minutes)

### UI Flow

1. User fills in basic repair order information (customer, vehicle, date, etc.)
2. User selects services from a list of available services
3. System automatically calculates and displays:
   - Total estimated amount (sum of selected service prices)
   - Total estimated time (sum of selected service durations)
4. User submits the repair order

## Key Benefits

1. **Improved User Experience**: No need to manually calculate or enter estimated values
2. **Reduced Errors**: Automatic calculations prevent typos or miscalculations
3. **Consistency**: All repair orders follow the same calculation logic
4. **Service Tracking**: Selected services are automatically linked to the repair order

## Testing

To test the implementation:
1. Navigate to the repair order creation form
2. Select a customer and vehicle
3. Select one or more services from the service list
4. Verify that totals are automatically calculated
5. Submit the form and verify that selected services are included in the request

## Future Improvements

1. Add service categories for better organization
2. Implement service search/filter functionality
3. Add service descriptions and images
4. Implement service dependencies (some services require others)