# Quotation Flow Implementation Guide

## Overview
Quotations are **automatically generated** from completed inspections. There is NO manual "Create Quotation" functionality.

## Workflow

### 1. Inspection Completion (Technician)
- Technician completes inspection
- Inspection status → `Completed`
- Inspection contains selected services and recommended parts

### 2. Convert Inspection to Quotation (Manager)
**Location**: Inspections Tab

**Button**: "Convert to Quotation" (only visible for completed inspections)

**API Endpoint**: `POST /api/Inspection/convert-to-quotation`

**Request**:
```json
{
  "inspectionId": "guid",
  "note": "string (optional)"
}
```

**Response**: `QuotationDto`

### 3. View/Edit Quotation (Manager)
**Location**: Quotation Tab

**Features**:
- View quotation details
- Edit services/parts selection
- Add notes
- Send to customer

### 4. Send to Customer (Manager)
**Button**: "Send to Customer"

**API**: `PUT /api/Quotations/{id}/status`

**Request**:
```json
{
  "status": "Sent"
}
```

### 5. Customer Response
**Customer can**:
- View quotation details
- Select/deselect optional services/parts
- Approve or reject

**API**: `PUT /api/CustomerQuotations/customer-response`

### 6. Create Jobs from Approved Quotation (Manager)
**Button**: "Copy to Jobs" (only for approved quotations)

**API**: `POST /api/Quotations/{id}/copy-to-jobs`

**Result**: Creates Job entries for technician assignment

## UI Changes Required

### Inspections Tab
- [x] Add "Convert to Quotation" button for completed inspections
- [x] Show button only when inspection status is "Completed"
- [x] Hide button if quotation already exists for inspection
- [x] Call `/api/Inspection/convert-to-quotation` endpoint

### Quotation Tab
- [x] Remove "Create Quote" button
- [x] Show quotations created from inspections
- [x] Add "Send to Customer" button for pending quotations
- [x] Add "Copy to Jobs" button for approved quotations
- [x] Show quotation status badges

### Quotation Service
- [x] Add `convertInspectionToQuotation()` method
- [x] Add `copyQuotationToJobs()` method (already exists)
- [x] Update `updateQuotationStatus()` to use correct endpoint

## Status Flow

```
Pending → Sent → Approved/Rejected
           ↓
        Expired
```

## Business Rules

### Convert Inspection to Quotation
- ✅ Inspection must be `Completed`
- ✅ Inspection must have valid RepairOrder
- ✅ Inspection must have at least one service
- ❌ Cannot convert if quotation already exists

### Send to Customer
- ✅ Quotation must be `Pending`
- ✅ Manager can edit before sending

### Customer Response
- ✅ Quotation must be `Sent`
- ✅ Must not be expired
- ✅ If rejecting, reason is required

### Copy to Jobs
- ✅ Quotation must be `Approved`
- ✅ Jobs must not already exist
- ✅ At least one service must be selected

## Implementation Checklist

- [ ] Update `quotation-service.ts` with new methods
- [ ] Update `inspections-tab.tsx` to show "Convert to Quotation" button
- [ ] Update `quotation-tab.tsx` to remove manual creation
- [ ] Add "Send to Customer" functionality
- [ ] Add "Copy to Jobs" functionality
- [ ] Update quotation types if needed
- [ ] Test complete workflow
