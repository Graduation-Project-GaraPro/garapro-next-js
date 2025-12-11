# Quotation Response Listener

## Overview
The Quotation Response Listener enables managers to receive real-time notifications when customers respond to quotations. It uses SignalR to listen to the QuotationHub for customer responses.

## Implementation

### Hub Configuration

#### For Manager Notifications (Toast/Alerts)
- **Hub**: QuotationHub
- **Group**: "Managers" 
- **Event**: "CustomerRespondedToQuotation"
- **Method**: NotifyManagersOfCustomerResponseAsync()
- **Purpose**: Show toast notifications to all managers

#### For Quotation UI Updates
- **Hub**: QuotationHub
- **Group**: "Quotation_{quotationId}"
- **Event**: "QuotationUpdated" 
- **Method**: SendQuotationUpdateNotificationAsync()
- **Purpose**: Update specific quotation displays in real-time

### Components

#### QuotationResponseListener
- **Location**: `src/components/manager/quotation-response-listener.tsx`
- **Purpose**: Background component that listens for customer responses
- **Integration**: Added to manager layout for always-on listening

#### QuotationHubService
- **Location**: `src/services/manager/quotation-hub-service.ts`
- **Features**:
  - Connects to QuotationHub
  - Joins "Managers" group automatically
  - Listens for "CustomerRespondedToQuotation" events
  - Provides event listeners for customer responses

#### useQuotationHub Hook
- **Location**: `src/hooks/use-quotation-hub.ts`
- **Features**:
  - Manages hub connection state
  - Handles group joining/leaving
  - Provides callback system for events
  - Auto-connects when `isManager: true`

## Event Structures

### CustomerRespondedToQuotation Event (Manager Notifications)
```typescript
interface QuotationCustomerResponseEvent {
  quotationId: string;
  repairOrderId: string;
  inspectionId: string;
  customerId: string;
  customerName: string;
  status: "Approved" | "Rejected";
  totalAmount: number;
  selectedServicesCount: number;
  totalServicesCount: number;
  customerNote: string;
  respondedAt: string;
  message: string;
}
```

### QuotationUpdated Event (UI Updates)
```typescript
interface QuotationUpdatedEvent {
  quotationId: string;
  userId: string;
  repairOrderId: string;
  totalAmount: number;
  status: "Approved" | "Rejected";
  note: string;
  updatedAt: string;
  customerRespondedAt: string;
}
```

## Usage

### Automatic Listening (Current Implementation)
The system automatically listens for customer responses when a manager is logged in:

```typescript
// In manager layout
{isManager && <QuotationResponseListener />}
```

### Manual Usage in Components

#### For Manager Notifications
```typescript
const { isConnected } = useQuotationHub({
  isManager: true,
  onCustomerResponse: (event) => {
    console.log("Customer response:", event);
    // Handle manager notification
  }
});
```

#### For Quotation UI Updates
```typescript
import { useQuotationUpdates } from "@/hooks/use-quotation-updates";

const { isConnected } = useQuotationUpdates({
  quotationId: "your-quotation-id",
  onQuotationUpdated: (event) => {
    console.log("Quotation updated:", event);
    // Update your UI state
    setQuotationStatus(event.status);
    setTotalAmount(event.totalAmount);
  }
});
```

## Notifications

When a customer responds to a quotation, managers receive:

### Approved Quotations
- ✅ Success toast notification
- Message: "Quotation Approved! 🎉"
- Description: Includes quotation ID and next steps
- Duration: 8 seconds

### Rejected Quotations  
- ❌ Error toast notification
- Message: "Quotation Rejected"
- Description: Includes quotation ID and customer message
- Duration: 8 seconds

## Connection Management

### Automatic Connection
- Connects when manager layout loads
- Joins "Managers" group automatically
- Handles reconnection automatically
- Cleans up on component unmount

### Group Management
- `joinManagersGroup()` - Join managers group for notifications
- `leaveManagersGroup()` - Leave managers group
- Groups are managed automatically by the hook

## Error Handling

- Connection failures are logged and handled gracefully
- Reconnection is automatic via SignalR
- Missing group methods are handled with informational logs
- Component continues to work even if some hub methods are unavailable

## Integration Points

### Manager Layout
- `QuotationResponseListener` is added to manager layout
- Only active when user has "Manager" role
- Runs in background without UI impact

### Toast System
- Uses the application's toast system (`useToast`)
- Consistent with other notifications in the app
- Non-intrusive but attention-getting

## Testing

To test the customer response listener:

1. Ensure manager is logged in
2. Check browser console for connection messages:
   - "✅ QuotationHub SignalR Connected"
   - "✅ Manager is now listening for customer quotation responses"

3. When customer responds, you should see:
   - Console log: "Customer responded to quotation: [event]"
   - Toast notification with appropriate message

## Future Enhancements

- Sound notifications for important responses
- Badge counter in header for pending responses
- Response history tracking
- Email notifications for offline managers
- Mobile push notifications