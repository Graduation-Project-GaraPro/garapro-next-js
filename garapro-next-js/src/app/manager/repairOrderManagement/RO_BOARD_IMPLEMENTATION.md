# Repair Order Kanban Board Implementation

## Overview
This document explains how the Repair Order Kanban Board is implemented with dynamic status columns fetched from the backend API.

## Implementation Steps

### Step 1: Fetch the List of Statuses
The first step is to retrieve all statuses from the system which will represent columns on the Kanban board.

#### API Endpoint
```
GET /api/RepairOrder/status
```

#### Response Format
```json
[
  {
    "orderStatusId": "a1f2-...",
    "statusName": "Pending",
    "orderIndex": 1,
    "repairOrderCount": 5
  },
  {
    "orderStatusId": "b2e3-...",
    "statusName": "In Progress",
    "orderIndex": 2,
    "repairOrderCount": 3
  },
  {
    "orderStatusId": "c3d4-...",
    "statusName": "Completed",
    "orderIndex": 3,
    "repairOrderCount": 12
  }
]
```

### Step 2: Fetch Repair Orders by Status
After retrieving the list of statuses, you can either:
1. Loop through each status and call `GET /api/RepairOrder/status/{statusId}`
2. Use the combined endpoint `GET /api/RepairOrder/kanban` (recommended)

#### Combined API Endpoint (Recommended)
```
GET /api/RepairOrder/kanban
```

#### Response Format
```json
{
  "columns": [
    {
      "orderStatusId": "a1f2-...",
      "statusName": "Pending",
      "orderIndex": 1,
      "cards": [
        { "repairOrderId": "RO-001", "vehicle": "Toyota Camry", "customer": "Nguyen Van A" },
        { "repairOrderId": "RO-002", "vehicle": "Mazda CX-5", "customer": "Tran Van B" }
      ]
    },
    {
      "orderStatusId": "b2e3-...",
      "statusName": "In Progress",
      "orderIndex": 2,
      "cards": [
        { "repairOrderId": "RO-003", "vehicle": "Kia Seltos", "customer": "Pham Thi C" }
      ]
    }
  ]
}
```

## Code Structure

### 1. Type Definitions
File: `src/types/manager/order-status.ts`
```typescript
export interface OrderStatus {
  orderStatusId: string
  statusName: string
  orderIndex: number
  repairOrderCount: number
}

export interface OrderStatusColumn {
  orderStatusId: string
  statusName: string
  orderIndex: number
  cards: unknown[]
}

export interface KanbanBoardResponse {
  columns: OrderStatusColumn[]
}
```

### 2. Service Layer
File: `src/services/manager/repair-order-service.ts`

The service provides methods to:
- `fetchOrderStatuses()`: Fetch all order statuses
- `fetchRepairOrdersByStatus(statusId)`: Fetch repair orders for a specific status
- `fetchKanbanBoard()`: Fetch the complete kanban board data

### 3. UI Components
- `RoDragDropBoard`: Main board component that renders columns
- `RoColumn`: Individual column component
- `RoCard`: Individual card component

The board component accepts a `statuses` prop to dynamically render columns based on the data from the API.

## How to Use

### Fetching Statuses in a Component
```typescript
import { repairOrderService } from "@/services/manager/repair-order-service"
import type { OrderStatus } from "@/types/manager/order-status"

const [statuses, setStatuses] = useState<OrderStatus[]>([])
const [loading, setLoading] = useState(true)

useEffect(() => {
  const loadStatuses = async () => {
    try {
      setLoading(true)
      const data = await repairOrderService.fetchOrderStatuses()
      setStatuses(data)
    } catch (error) {
      console.error("Failed to load statuses:", error)
    } finally {
      setLoading(false)
    }
  }

  loadStatuses()
}, [])
```

### Passing Statuses to the Board Component
```typescript
<RoDragDropBoard
  jobs={jobs}
  loading={loading}
  onMoveJob={handleMoveJob}
  onEditJob={setEditingJob}
  onDeleteJob={handleDeleteJob}
  statuses={statuses} // Pass the fetched statuses
/>
```

## Fallback Behavior
If the API call fails or no statuses are loaded, the board will fall back to hardcoded columns:
- Pending (requires-auth)
- In Progress (in-progress)
- Completed (ready-to-start)

This ensures the board remains functional even when the backend is unavailable.