# Part Management System

## Overview
The Part Management system provides comprehensive functionality for managing part categories and parts inventory in your garage management application.

## Features

### 1. Part Categories Management
- **CRUD Operations**: Create, read, update, and delete part categories
- **Search Functionality**: Search categories by name or description
- **Card-based Layout**: Visual representation of categories with action buttons

### 2. Parts Inventory Management
- **Full CRUD**: Complete part management with SKU, pricing, and quantity tracking
- **Category Assignment**: Link parts to specific categories
- **Table View**: Organized table display with search capabilities
- **Inventory Tracking**: Monitor stock levels and pricing



## API Integration

The system integrates with the following API endpoints:

### Part Categories
- `GET /api/partcategories` - Get all categories
- `GET /api/partcategories/{id}` - Get category by ID
- `POST /api/partcategories` - Create new category
- `PUT /api/partcategories/{id}` - Update category
- `DELETE /api/partcategories/{id}` - Delete category

### Parts
- `GET /api/parts` - Get all parts
- `GET /api/parts/{id}` - Get part by ID
- `POST /api/parts` - Create new part
- `PUT /api/parts/{id}` - Update part
- `DELETE /api/parts/{id}` - Delete part




## File Structure

```
src/app/manager/partManagement/
├── page.tsx                           # Main part management page
└── components/
    ├── part-categories-tab.tsx        # Categories management tab
    ├── parts-tab.tsx                  # Parts inventory tab
    ├── part-category-form.tsx         # Category create/edit form
    └── part-form.tsx                  # Part create/edit form

src/services/manager/
└── part-category-service.ts          # API service layer

src/types/manager/
└── part-category.ts                  # TypeScript type definitions
```

## Usage

### Accessing the System
Navigate to `/manager/partManagement` or use the "Part Management" link in the sidebar under the "MANAGE" section.

### Managing Categories
1. Click the "Categories" tab
2. Use the search bar to find specific categories
3. Click "Add Category" to create new categories
4. Use "Edit" or "Delete" buttons on category cards

### Managing Parts
1. Click the "Parts" tab
2. Search parts by name or SKU
3. Click "Add Part" to create new inventory items
4. Assign parts to categories and set pricing/quantity



## Key Components

### PartCategoryService
Handles all API communications for part categories and parts.

### Form Components
- **PartCategoryForm**: Modal form for category creation/editing
- **PartForm**: Modal form for part creation/editing with category selection

### Tab Components
- **PartCategoriesTab**: Grid layout for category management
- **PartsTab**: Table layout for parts inventory

## Error Handling
- Toast notifications for success/error feedback
- Loading states during API operations
- Graceful handling of missing data
- Confirmation dialogs for destructive operations

## Future Enhancements
- Bulk import/export functionality
- Advanced filtering and sorting
- Inventory alerts for low stock
- Part usage analytics
- Barcode scanning integration