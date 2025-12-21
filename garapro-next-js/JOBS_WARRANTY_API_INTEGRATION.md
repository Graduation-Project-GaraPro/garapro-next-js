# Jobs Warranty API Integration Update

## Overview
Updated the Jobs tab and archived repair order details to properly integrate with the enhanced backend API that now returns warranty information for each job part via the `jobParts` field.

## API Response Structure
The backend now returns warranty information in this format:
```json
{
  "jobs": [
    {
      "jobId": "27372770-5541-4b80-be13-815a71eb5aa5",
      "jobName": "Rear Brake Overhaul - Quotation 1c18798a",
      "technicianName": "Default Technician 1",
      "status": "Completed",
      "notes": "Auto-generated from approved quotation",
      "jobParts": [
        {
          "jobPartId": "27efa139-2f2a-4a44-a192-a5177745e235",
          "partName": "ATE 13.2109-0173.2 - Hyundai Elantra",
          "partCode": "eb4a23a4",
          "unitPrice": 4900,
          "quantity": 1,
          "totalPrice": 4900,
          "warrantyMonths": 24,
          "warrantyStartAt": "2025-12-21T11:36:01.0693895",
          "warrantyEndAt": "2027-12-21T11:36:01.0693895"
        }
      ]
    }
  ]
}
```

## Changes Made

### 1. **Type Definitions Updated**

#### **JobPart Interface** (`src/types/job.ts`)
```typescript
export interface JobPart {
  jobPartId: string
  jobId?: string
  partId?: string
  partCode?: string  // Added for part code display
  partName: string
  quantity: number
  unitPrice: number
  totalPrice: number
  createdAt?: string
  updatedAt?: string | null
  // Warranty information
  warrantyMonths?: number | null
  warrantyStartAt?: string | null
  warrantyEndAt?: string | null
}
```

#### **Job Interface** (`src/types/job.ts`)
```typescript
export interface Job {
  // ... existing fields
  parts: JobPart[]        // Legacy field name (backward compatibility)
  jobParts?: JobPart[]    // New field name from API
}
```

### 2. **Jobs Tab Enhanced** (`src/app/manager/repairOrderManagement/orders/[id]/components/jobs-tab.tsx`)

#### **Backward Compatibility**
```typescript
// Handles both old 'parts' and new 'jobParts' field names
const jobParts = job.jobParts || job.parts || []
```

#### **Enhanced Part Display**
- **Part Code Display**: Shows part code when available
- **Warranty Information**: Displays warranty period, start date, and end date
- **No Warranty Indicator**: Clear message when warranty is not available
- **Responsive Layout**: Warranty information adapts to screen size

### 3. **Archived RO Dialog Updated** (`src/app/manager/repairOrderManagement/archived/archived-ro-detail-dialog.tsx`)

#### **Interface Updated**
```typescript
jobs: Array<{
  jobId: string
  jobName: string
  technicianName: string
  startTime: string | null
  endTime: string | null
  status: string
  notes: string
  jobParts: Array<{  // Changed from 'parts' to 'jobParts'
    jobPartId: string
    partName: string
    partCode: string
    unitPrice: number    // Changed from 'partPrice' to 'unitPrice'
    quantity: number
    totalPrice: number
    warrantyMonths: number | null
    warrantyStartAt: string | null
    warrantyEndAt: string | null
  }>
}>
```

#### **Display Logic Updated**
- Changed from `job.parts` to `job.jobParts`
- Updated price field from `partPrice` to `unitPrice`
- Enhanced warranty display with proper formatting

## Visual Enhancements

### **Warranty Display Features**
- **Shield Icon**: Clear visual indicator for warranty sections
- **Blue Color Scheme**: Consistent with other warranty displays
- **Responsive Grid**: Warranty information adapts to screen size
- **Clear Labels**: "Period", "Start", "End" for easy understanding

### **Part Information Layout**
```
Part Name: ATE 13.2109-0173.2 - Hyundai Elantra
Code: eb4a23a4
Price: 4,900,000 VND × 1 = 4,900,000 VND

🛡️ Warranty:
Period: 24 months | Start: Dec 21, 2024 | End: Dec 21, 2026
```

## Backward Compatibility

### **Dual Field Support**
The implementation supports both old and new API responses:
- **Legacy**: Uses `job.parts` field
- **New**: Uses `job.jobParts` field
- **Fallback**: Gracefully handles missing data

### **Field Mapping**
- `partPrice` → `unitPrice` (updated to match API)
- `parts` → `jobParts` (new field name)
- Added `partCode` field for better part identification

## Benefits

1. **Complete Warranty Integration**: Full warranty information display for all job parts
2. **API Compatibility**: Works with both old and new API responses
3. **Enhanced User Experience**: Clear warranty information with professional display
4. **Consistent Design**: Matches warranty display in other parts of the application
5. **Future-Ready**: Prepared for additional warranty management features

## Testing Scenarios

### **With Warranty Data**
- ✅ Displays warranty period (24 months)
- ✅ Shows warranty start date (Dec 21, 2024)
- ✅ Shows warranty end date (Dec 21, 2026)
- ✅ Proper formatting and layout

### **Without Warranty Data**
- ✅ Shows "No warranty information available"
- ✅ Maintains clean layout without warranty section
- ✅ No errors or broken display

### **Mixed Scenarios**
- ✅ Some parts with warranty, some without
- ✅ Partial warranty data (only period, no dates)
- ✅ Different warranty periods for different parts

The Jobs tab now provides comprehensive warranty information that matches the enhanced backend API, giving managers and customer service representatives complete visibility into warranty coverage for all parts used in repair jobs.