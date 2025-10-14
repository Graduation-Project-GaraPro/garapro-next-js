# Repair Order Integration

## Overview
This document explains how the repair order data is integrated into the Kanban board components.

## Changes Made

### 1. Type Definitions
Created new type definitions for RepairOrder in `src/types/manager/repair-order.ts`:
- `RepairOrder` interface with all properties from the API response
- `CreateRepairOrderRequest` for creating new repair orders
- `UpdateRepairOrderRequest` for updating existing repair orders

### 2. Service Layer
Created `src/services/manager/repair-order-service.ts` with methods:
- `getAllRepairOrders()` - Fetch all repair orders
- `getRepairOrderById(id)` - Fetch a specific repair order
- `createRepairOrder(repairOrder)` - Create a new repair order
- `updateRepairOrder(repairOrder)` - Update an existing repair order
- `deleteRepairOrder(id)` - Delete a repair order
- `getRepairOrdersByStatus(statusId)` - Fetch repair orders by status
- `fetchOrderStatuses()` - Fetch order statuses for the kanban board

### 3. UI Components
Updated the following components to work with RepairOrder data:

#### RoCard Component
- Renamed from `JobCard` to `RepairOrderCard`
- Updated to display repair order specific information:
  - Repair order ID
  - Customer name and phone
  - Payment status with color coding
  - Repair type
  - Estimated amount and currency formatting
  - Progress percentage
  - Creation and estimated completion dates

#### RoColumn Component
- Updated to work with RepairOrder data instead of Job data
- Accepts repair orders array instead of jobs array
- Updated event handlers to work with repair orders

#### RoDragDropBoard Component
- Updated to work with RepairOrder data
- Uses repair order specific event handlers
- Maintains drag and drop functionality

### 4. Main Board Page
Updated `page.tsx` to:
- Fetch repair orders instead of jobs
- Use the new repair order components
- Implement repair order specific event handlers

## API Endpoints Used

### Repair Order Endpoints
- `GET /api/RepairOrder` - Fetch all repair orders
- `GET /api/RepairOrder/{id}` - Fetch a specific repair order
- `POST /api/RepairOrder` - Create a new repair order
- `PUT /api/RepairOrder/{id}` - Update an existing repair order
- `DELETE /api/RepairOrder/{id}` - Delete a repair order
- `GET /api/RepairOrder/status/{statusId}` - Fetch repair orders by status

### Order Status Endpoints
- `GET /api/orderstatus/columns` - Fetch order statuses for the kanban board

## Data Transformation

### Currency Formatting
All currency values are formatted using Vietnamese Dong (VND) formatting:
```typescript
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount)
}
```

### Date Formatting
All dates are formatted for the Vietnamese locale:
```typescript
const formatDate = (dateString: string | null) => {
  if (!dateString) return "N/A"
  return new Date(dateString).toLocaleDateString('vi-VN')
}
```

## Testing
A test page has been created at `/manager/repairOrderManagement/ro-board/test-repair-orders` to verify that the repair order data is being fetched and displayed correctly.

## Usage
The repair order kanban board now displays real data from the backend API instead of mock job data. Users can:
- View repair orders in a kanban board format
- See detailed information about each repair order
- Drag and drop repair orders between columns (client-side only in this implementation)
- Edit and delete repair orders (functionality needs to be fully implemented)