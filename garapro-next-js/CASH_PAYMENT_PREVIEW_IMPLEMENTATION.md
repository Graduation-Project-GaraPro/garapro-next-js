# Cash Payment Preview Implementation

## Overview
Implemented cash payment preview functionality that fetches detailed payment information from the API before processing the payment. When a manager clicks "Cash Payment", a dialog shows the preview with services, parts, and cost breakdown, then allows confirmation to process the payment.

## Implementation Details

### 1. API Integration

#### New Type Definitions (`src/types/manager/payment.ts`)
Added payment preview types:
```typescript
export interface PaymentPreviewService {
  serviceId: string;
  serviceName: string;
  price: number;
  estimatedDuration: number;
}

export interface PaymentPreviewPart {
  partId: string;
  partName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface PaymentPreviewResponse {
  repairOrderId: string;
  repairOrderCost: number;
  estimatedAmount: number;
  paidAmount: number;
  discountAmount: number;
  totalAmount: number;
  customerName: string;
  vehicleInfo: string;
  services: PaymentPreviewService[];
  parts: PaymentPreviewPart[];
}
```

#### New Service Method (`src/services/manager/payment-service.ts`)
Added `getPaymentPreview` method:
```typescript
async getPaymentPreview(repairOrderId: string): Promise<PaymentPreviewResponse>
```
- Endpoint: `GET /api/Payments/preview/{repairOrderId}`
- Returns detailed breakdown of services, parts, and costs

### 2. Payment Tab Component Updates

#### New State Variables
- `paymentPreview`: Stores the preview data from API
- `loadingPreview`: Loading state for preview fetch

#### Updated Flow
1. **Click Cash Payment** → Calls `loadPaymentPreview()`
2. **Load Preview** → Fetches data from `/api/Payments/preview/{repairOrderId}`
3. **Show Dialog** → Displays preview with:
   - Customer & vehicle information
   - List of services with prices and duration
   - List of parts with quantities and prices
   - Payment summary (estimated, discount, total, paid, balance)
   - Payment method indicator (Cash)
   - Optional description field
4. **Confirm Payment** → Calls `createPayment()` API
5. **Success** → Shows success toast and updates transaction history
6. **Update History** → Reloads payment summary to show new transaction

### 3. UI Components

#### Cash Payment Preview Dialog
- **Header**: Title and close button
- **Loading State**: Spinner while fetching preview
- **Customer Info Section**: Name and vehicle details
- **Services Section**: List of services with prices and duration
- **Parts Section**: List of parts with quantities and unit prices
- **Payment Summary Section**: 
  - Estimated Amount
  - Repair Order Cost
  - Discount (in red)
  - Total Amount
  - Already Paid (in green)
  - Balance Due (in red, bold)
- **Payment Method Section**: Cash indicator with description
- **Description Field**: Optional text input for payment notes
- **Footer Actions**: Cancel and Confirm Payment buttons

#### Transaction History
- Automatically updates after successful payment
- Shows new transaction in the payment history table
- Displays: Date, Amount, Method, Status, Description

## API Endpoints Used

### 1. Get Payment Preview
```
GET /api/Payments/preview/{repairOrderId}
Authorization: Bearer {token}
```

**Response Example:**
```json
{
  "repairOrderId": "3d54e742-a14f-4bd0-83d5-70a7715d112b",
  "repairOrderCost": 0,
  "estimatedAmount": 400000,
  "paidAmount": 0,
  "discountAmount": 0,
  "totalAmount": 0,
  "customerName": "Default Customer",
  "vehicleInfo": "Unknown Brand Unknown Model (51F98765)",
  "services": [
    {
      "serviceId": "c18a796c-4d29-4701-afad-22a7d2e68ae2",
      "serviceName": "Emissions Test",
      "price": 400000,
      "estimatedDuration": 1
    }
  ],
  "parts": []
}
```

### 2. Create Cash Payment
```
POST /api/payments/manager-create/{repairOrderId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "method": "Cash",
  "description": "Cash payment for repair services"
}
```

### 3. Get Payment Summary (for history update)
```
GET /api/payments/summary/{repairOrderId}
Authorization: Bearer {token}
```

## User Flow

1. Manager navigates to completed repair order's Payment tab
2. Manager clicks "Cash Payment" card
3. System fetches payment preview from API (`GET /api/Payments/preview/{repairOrderId}`)
4. Dialog displays:
   - Customer and vehicle information
   - Detailed list of **decided services** from approved quotation
   - Detailed list of **parts** from approved quotation
   - Complete cost breakdown (estimated amount, repair order cost, discount, total, paid, balance)
   - Balance due amount
5. Manager reviews the preview and optionally adds description
6. Manager clicks "Confirm Payment ($X.XX)"
7. System processes payment via API (`POST /api/payments/manager-create/{repairOrderId}`)
8. **Backend automatically changes Repair Order status to "Paid"**
9. Success toast notification appears
10. Transaction history automatically updates with new payment
11. **Repair order status refreshes to show "Paid" status**
12. Dialog closes

## Features

- ✅ API-driven payment preview
- ✅ Detailed service and parts breakdown
- ✅ Real-time cost calculations
- ✅ Loading states for better UX
- ✅ Success/error toast notifications
- ✅ Automatic transaction history refresh
- ✅ Optional payment description
- ✅ Disabled state when fully paid
- ✅ Responsive dialog design
- ✅ Error handling with user-friendly messages

## Files Modified

1. `src/types/manager/payment.ts` - Added preview types
2. `src/services/manager/payment-service.ts` - Added getPaymentPreview method
3. `src/app/manager/repairOrderManagement/orders/[id]/components/payment-tab.tsx` - Updated UI and flow

## Testing Checklist

- [ ] Preview dialog opens when clicking Cash Payment
- [ ] Preview shows correct customer and vehicle info
- [ ] Services list displays with prices and duration
- [ ] Parts list displays with quantities and prices
- [ ] Payment summary calculations are correct
- [ ] Balance due is calculated correctly
- [ ] Description field is optional and works
- [ ] Confirm button is disabled when fully paid
- [ ] Payment processes successfully
- [ ] Success toast appears after payment
- [ ] Transaction history updates automatically
- [ ] Dialog closes after successful payment
- [ ] Error handling works for API failures
- [ ] Loading states display correctly
