# Job Update Implementation

## Overview
Implemented the PUT endpoint for updating jobs with a simplified interface that allows updating only the status, note, and deadline fields.

## API Endpoint

### PUT /api/Job/{id}

**Description**: Updates only the status, note, and deadline of a job. All other fields remain immutable.

**Request Parameters**:
- `id` (path parameter): The GUID of the job to update

**Request Body**:
```json
{
  "status": 0,
  "note": "test update job",
  "deadline": "2025-11-22T08:40:29.287Z"
}
```

**Fields**:
- `status` (integer): The new status for the job
  - `0` = Pending
  - `1` = New
  - `2` = In Progress
  - `3` = Completed
  - `4` = On Hold
- `note` (string): Updated note for the job
- `deadline` (datetime, nullable): Deadline for job completion

**Response**: Returns the updated Job object with all job details.

**Response Codes**:
- `200 OK`: Successfully updated the job
- `400 Bad Request`: Invalid request data
- `404 Not Found`: Job with the specified ID does not exist

## Implementation Details

### 1. Service Layer

**File**: `src/services/manager/job-service.ts`

The existing `updateJob` method already supports this functionality:
```typescript
async updateJob(jobId: string, jobData: Partial<Job>): Promise<Job>
```

This method:
- Calls the PUT endpoint with the job ID
- Sends only the fields that need to be updated
- Returns the updated job object

### 2. UI Component

**File**: `src/app/manager/repairOrderManagement/orders/[id]/components/edit-job-dialog.tsx`

Created a new dialog component with the following features:

**Features**:
- Status selection dropdown with 2 status options (Pending and New only)
- Deadline picker (datetime-local input)
- Note textarea for job notes
- Real-time validation
- Loading states
- Error handling
- Helper text explaining manager status restrictions

**Props**:
- `open`: Controls dialog visibility
- `onOpenChange`: Callback for dialog state changes
- `job`: The complete Job object to edit
- `onSuccess`: Callback executed after successful update

**Status Options** (Manager Role):
- Pending (0)
- New (1)

**Note**: Managers can only update jobs between Pending and New status. Other status transitions (In Progress, Completed, On Hold) are managed by technicians or the system.

### 3. Integration

**File**: `src/app/manager/repairOrderManagement/orders/[id]/components/jobs-tab.tsx`

Integrated the edit dialog into the jobs tab:

**Changes**:
- Added Edit button for each job card
- Opens edit dialog when Edit button is clicked
- Refreshes job list after successful update
- Maintains existing functionality (technician assignment, etc.)

**Location**: The Edit button is positioned in the top-right of each job card, before the "Assign Tech" button.

## Usage

### For Users

1. Navigate to the Jobs tab in a repair order details page
2. Click the "Edit" button on any job card
3. Update the following fields:
   - **Status**: Select from dropdown (Pending or New only - managers have limited status update permissions)
   - **Deadline**: Set or clear the deadline using the date/time picker
   - **Note**: Add or modify notes about the job
4. Click "Update Job" to save changes
5. The job list will refresh with the updated data

### For Developers

**To use the service method directly**:
```typescript
import { jobService } from "@/services/manager/job-service"

const updateData = {
  status: 2, // In Progress
  note: "Updated note",
  deadline: "2025-11-22T08:40:29.287Z"
}

const updatedJob = await jobService.updateJob("job-id", updateData)
```

**To use the dialog component**:
```typescript
import EditJobDialog from "./edit-job-dialog"

<EditJobDialog
  open={isOpen}
  onOpenChange={setIsOpen}
  job={jobObject}
  onSuccess={() => console.log("Updated!")}
/>
```

## Files Modified

1. `src/app/manager/repairOrderManagement/orders/[id]/components/jobs-tab.tsx` - Added Edit button and dialog integration

## Files Created

1. `src/app/manager/repairOrderManagement/orders/[id]/components/edit-job-dialog.tsx` - Edit job dialog component

## Job Status Reference

| Status Code | Status Name | Description | Manager Can Update |
|-------------|-------------|-------------|-------------------|
| 0 | Pending | Job is waiting to be started | ✅ Yes |
| 1 | New | Job has been created but not yet assigned | ✅ Yes |
| 2 | In Progress | Job is currently being worked on | ❌ No (Technician only) |
| 3 | Completed | Job has been finished | ❌ No (System/Technician) |
| 4 | On Hold | Job is temporarily paused | ❌ No (Technician only) |

**Manager Permissions**: Managers can only update jobs between Pending (0) and New (1) status. Other status transitions are controlled by technicians or the system to maintain workflow integrity.

## Testing Recommendations

1. **Status Update**: Verify status changes are reflected immediately and badge colors update
2. **Deadline Update**: Test setting, updating, and clearing deadlines
3. **Note Update**: Test with empty, short, and long notes
4. **Validation**: Ensure all fields are properly validated
5. **Error Handling**: Test with invalid job IDs and network failures
6. **Loading States**: Verify loading indicators appear during API calls
7. **Refresh**: Confirm job list refreshes after successful update
8. **Status Transitions**: Test all status transitions (Pending → In Progress → Completed, etc.)
9. **Deadline Format**: Verify datetime is properly formatted for the API
10. **Concurrent Updates**: Test editing multiple jobs in sequence

## Notes

- The API endpoint only allows updating status, note, and deadline
- **Managers can only update status between Pending (0) and New (1)** - backend validation enforces this
- All other job fields (jobName, serviceId, repairOrderId, etc.) remain immutable
- The deadline field is optional and can be set to null
- The dialog shows the job name in the header for context
- Status changes are immediately reflected in the job card badge
- The Edit button is available for all jobs regardless of current status
- Technician assignment functionality remains separate and unchanged
- Other status transitions (In Progress, Completed, On Hold) are managed by technicians through their interface
