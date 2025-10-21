# Vehicle Creation Fix

## Issue Description

The vehicle creation was failing with a 400 error because the request data didn't match the API requirements. The API requires specific validation for several fields:

1. BrandID, ModelID, and ColorID must be valid GUIDs
2. LicensePlate must match the format `[0-9]{2}[A-Z]{1,2}-[0-9]{4,5}`
3. VIN must be exactly 17 characters and exclude I, O, Q
4. Year must be between 1886 and 2030

## Changes Made

### 1. Updated Vehicle Interfaces

Added VIN property to the Vehicle interface in both components:
- `src/app/manager/repairOrderManagement/components/create-task.tsx`
- `src/app/manager/repairOrderManagement/components/add-vehicle-dialog.tsx`

### 2. Enhanced Form Validation

Updated the AddVehicleDialog to include proper validation:
- License plate format validation using regex `/^[0-9]{2}[A-Z]{1,2}-[0-9]{4,5}$/`
- VIN format validation using regex `/^[A-HJ-NPR-Z0-9]{17}$/`
- Required field validation for all fields including VIN

### 3. Improved Error Handling

Updated the handleAddVehicle function in create-task.tsx to:
- Validate all required fields before sending the request
- Provide specific error messages for validation failures
- Include VIN in the API request data

### 4. API Request Format

The CreateVehicleDto now properly includes all required fields:
- brandID: Placeholder GUID (would be replaced with actual selection in production)
- userID: Selected customer ID
- modelID: Placeholder GUID (would be replaced with actual selection in production)
- colorID: Placeholder GUID (would be replaced with actual selection in production)
- licensePlate: User input with format validation
- vin: User input with format validation
- year: User input with range validation (1886-2030)
- odometer: null (not collected in the form)

## Files Modified

1. `src/app/manager/repairOrderManagement/components/create-task.tsx`
2. `src/app/manager/repairOrderManagement/components/add-vehicle-dialog.tsx`

## Testing

To verify the fix:
1. Navigate to the repair order creation page
2. Select a customer
3. Click "ADD NEW VEHICLE"
4. Fill in all required fields with valid data:
   - License plate: Format like "51F-12345"
   - VIN: Exactly 17 characters excluding I, O, Q (e.g., "1HGBH41JXMN109186")
   - Year: Between 1886 and current year + 1
5. Click "Add Vehicle"
6. Verify that the vehicle is created successfully without 400 errors

## Future Improvements

For a production implementation, the following enhancements should be made:
1. Replace placeholder GUIDs with actual dropdown selections for Brand, Model, and Color
2. Implement a lookup service for Brand/Model/Color options
3. Add auto-formatting for license plates and VINs
4. Include odometer input in the form
5. Add vehicle image upload capability