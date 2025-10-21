# How to Test the Repair Order Creation Fix

## Overview
This document explains how to test that the repair order creation fix is working correctly.

## Prerequisites
1. The application should be running (`npm run dev`)
2. You should be logged in as a manager
3. You should have at least one customer and vehicle in the system

## Test Steps

### 1. Navigate to Repair Order Board
1. Open your browser and go to `http://localhost:3001` (or the appropriate port)
2. Navigate to the Repair Order Board page
3. Click the "Create Repair Order" button

### 2. Select Customer and Vehicle
1. In the "Select customer" section, search for and select a customer
2. In the "Select vehicle" section, select a vehicle for that customer
   - If no vehicles exist, click "ADD NEW VEHICLE" and create one

### 3. Fill in Repair Order Information
1. Enter an "Estimated Repair Time" (e.g., 2)
2. Select an "Estimated Completion Date" (e.g., 3 days from today)
3. Enter an "Estimated Amount" (e.g., 1000000)
4. Select an "RO Label" (optional)
5. Select a "Repair Order Type" (e.g., Walk-in)
6. Enter a "Purpose of visit" (e.g., Regular maintenance)

### 4. Create the Repair Order
1. Click the "Create Repair Order" button
2. Check for success message

### 5. Verify Success
1. Check the browser console for successful creation logs:
   - "Sending repair order data:" with the correct JSON structure
   - "Repair order API response:" with the full response from the backend
2. The new repair order should appear in the board/list view
3. No error toasts should appear

## Expected Console Output
When the repair order is created successfully, you should see in the browser console:

```
Sending repair order data: {
  "customerId": "ad9e0c46-8edc-48d7-9e01-b312f9a27872",
  "vehicleId": "7d6a3d38-20a5-441c-a52c-88bf41984311",
  "receiveDate": "2025-10-21T10:00:00.000Z",
  "roType": 0,
  "estimatedCompletionDate": "2025-10-24T10:00:00.000Z",
  "estimatedAmount": 1000000,
  "note": "Regular maintenance",
  "estimatedRepairTime": 2
}
Repair order API response: { /* full response object with auto-generated fields */ }
Successfully created repair order: { /* repair order object */ }
```

## Troubleshooting

### If You Still Get NETWORK_ERROR
1. Check that you're sending the correct authentication token
2. Verify that the API is running and accessible
3. Check the browser's Network tab to see the actual request being sent

### If You Get 400 Bad Request
1. Check that all required fields are being sent
2. Verify that the field values are in the correct format
3. Check the browser console for detailed error information

### If the Repair Order Doesn't Appear
1. Refresh the page to see if it appears after a reload
2. Check that the SignalR connection is working properly
3. Verify that the repair order was actually created in the database

## Test Data
You can use the following test data for verification:

**Customer ID:** `ad9e0c46-8edc-48d7-9e01-b312f9a27872` (Default Customer)
**Vehicle ID:** `7d6a3d38-20a5-441c-a52c-88bf41984311` (Toyota Camry)

These are from the working curl example and should work if they exist in your database.