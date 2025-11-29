# Quotation Tree Selection Implementation

## Overview
Implemented a hierarchical service selection flow for creating quotations. The Manager can now browse through a service category tree, drill down through multiple levels, select services, and choose part categories to include in quotations.

## Architecture

### API Endpoints Used
- `GET /api/QuotationTreeSelection/root` - Load root categories
- `GET /api/QuotationTreeSelection/category/{id}` - Drill down into categories
- `GET /api/QuotationTreeSelection/service/{id}` - Get service details with part categories
- `POST /api/Quotation` - Create quotation with selected services and parts

### Flow
1. **Browse Categories**: Manager starts at root and navigates through category hierarchy
2. **Select Service**: When reaching a service, Manager clicks to select it
3. **Choose Part Categories**: Modal shows all part categories for the service
4. **Include All Parts**: Manager selects part categories, and ALL parts from those categories are included with `isSelected: false`
5. **Create Quotation**: Manager submits, creating a quotation where Customer will later choose specific parts

## Files Created

### Services
- `src/services/manager/quotation-tree-service.ts` - API client for tree navigation endpoints

### Components
- `src/app/manager/components/Quote/ServiceTreeNavigator.tsx` - Tree navigation UI with breadcrumbs
- `src/app/manager/components/Quote/PartCategorySelector.tsx` - Part category selection modal
- `src/app/manager/components/Quote/CreateQuotationDialogV2.tsx` - New quotation dialog using tree selection

### Types
All types defined in `quotation-tree-service.ts`:
- `TreeRootResponse` - Root categories response
- `CategoryResponse` - Category drill-down response
- `ServiceDetailsResponse` - Service with part categories
- `PartCategory` - Part category with parts
- `PartItem` - Individual part

## Usage

### In Quotation Tab
```typescript
import { CreateQuotationDialogV2 } from "@/app/manager/components/Quote"

<CreateQuotationDialogV2
  open={isCreateFormOpen}
  onOpenChange={setIsCreateFormOpen}
  onSuccess={() => {
    handleQuotationCreated();
  }}
  roData={{
    roNumber: orderId,
    customerName: "John Doe",
    customerPhone: "+1234567890",
    vehicleInfo: "2023 Toyota Camry",
    dateCreated: new Date().toISOString().split('T')[0]
  }}
/>
```

## Key Features

### 1. Hierarchical Navigation
- Breadcrumb navigation showing current path
- Click categories to drill down
- Click breadcrumb items to go back up
- Visual distinction between categories (folder icon) and services (wrench icon)

### 2. Part Category Selection
- Shows all part categories for selected service
- Displays all parts within each category
- Checkbox selection for categories
- Shows part count and prices
- Calculates total including service + all selected parts

### 3. Quotation Creation
- Manager includes ALL parts from selected categories
- All parts set to `isSelected: false`
- Customer will later choose which parts they want
- Clean summary view of selected services and parts
- Real-time total calculation

## Data Flow

```
Manager Flow:
1. Browse tree → Select service → Choose part categories → Create quotation
   (All parts included with isSelected: false)

Customer Flow (later):
2. View quotation → Select specific parts they want → Approve/Reject
   (Customer sets isSelected: true for chosen parts)
```

## API Request Format

```json
{
  "repairOrderId": "guid",
  "userId": "guid",
  "vehicleId": "guid",
  "inspectionId": null,
  "note": "Quotation created via tree selection",
  "quotationServices": [
    {
      "serviceId": "guid",
      "isSelected": false,
      "isRequired": false,
      "quotationServiceParts": [
        {
          "partId": "guid",
          "isSelected": false,
          "isRecommended": false,
          "recommendationNote": "",
          "quantity": 1
        }
      ]
    }
  ]
}
```

## Benefits

1. **Better UX**: Intuitive tree navigation instead of flat lists
2. **Scalability**: Handles deep category hierarchies
3. **Flexibility**: Manager can include multiple part options for customer choice
4. **Clear Workflow**: Separation between Manager (include options) and Customer (make choices)
5. **Visual Feedback**: Breadcrumbs, icons, and clear selection states

## Migration Notes

- Old dialog: `CreateQuotationDialog` (still available)
- New dialog: `CreateQuotationDialogV2` (tree-based)
- Both exported from `@/app/manager/components/Quote`
- Can switch between them by changing import

## Future Enhancements

- Add search functionality in tree
- Support for marking services as "required"
- Bulk part category selection
- Save/load quotation templates
- Price comparison views
