# Archived Orders Feature

## Overview
Added a new page to display archived repair orders in a table format with search functionality.

## Changes Made

### 1. Service Layer
**File**: `src/services/manager/repair-order-service.ts`
- Added `getArchivedRepairOrders()` method
- Calls `GET /api/RepairOrder/archived` endpoint
- Returns array of `RepairOrder` objects

### 2. Archived Orders Page
**File**: `src/app/manager/repairOrderManagement/archived/page.tsx`
- Created new page component for displaying archived orders
- Features:
  - Table view with columns: Order ID, Customer, Phone, Status, Created Date, Archived Date, Cost, Actions
  - Search functionality (filters by order ID, customer name, or status)
  - View details button that navigates to order detail page
  - Loading state
  - Empty state when no archived orders found
  - Responsive design with proper formatting

### 3. Sidebar Navigation
**File**: `src/app/manager/components/layout/app-sidebar.tsx`
- Added "Archived Orders" menu item to the MAIN section
- Icon: Archive icon from lucide-react
- Route: `/manager/repairOrderManagement/archived`

## Usage

### Accessing Archived Orders
1. Navigate to the sidebar
2. Click on "Archived Orders" in the MAIN section
3. View all archived repair orders in a table format

### Search Functionality
- Use the search bar to filter orders by:
  - Order ID
  - Customer name
  - Status name

### View Order Details
- Click the "View" button on any row to navigate to the order detail page

## API Endpoint
- **GET** `/api/RepairOrder/archived`
- Returns: Array of archived repair orders
- Response format: Same as regular repair orders (RepairOrderApiResponse[])

## UI Components Used
- Table (shadcn/ui)
- Card (shadcn/ui)
- Badge (shadcn/ui)
- Button (shadcn/ui)
- Input (shadcn/ui)
- Icons from lucide-react

## Data Display
- **Order ID**: Unique identifier for the repair order
- **Customer**: Customer name with user icon
- **Phone**: Customer phone number
- **Status**: Badge showing the order status (roTypeName)
- **Created Date**: When the order was created (formatted)
- **Archived Date**: When the order was archived (formatted)
- **Cost**: Total cost of the repair order (formatted as currency)
- **Actions**: View button to see order details
