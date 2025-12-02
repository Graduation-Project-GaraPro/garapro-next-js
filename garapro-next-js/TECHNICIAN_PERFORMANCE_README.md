# Technician Performance Dashboard

A comprehensive dashboard for managers to monitor technician workload, schedules, and performance metrics.

## Features

### 1. Overview Tab
- **Summary Cards**: Display total technicians, active technicians, active jobs, and average workload
- **Technician List**: Shows all technicians with:
  - Real-time status (Available, Busy, Offline)
  - Active and completed job counts
  - Active inspections
  - Average completion time
  - Workload percentage with progress bar
- **Interactive**: Click on any technician to view detailed performance

### 2. Schedule Tab
- **Job Filtering**: Filter by All, In Progress, Pending, or Completed
- **Job Cards**: Display job information including:
  - Job name and status
  - Assigned technician
  - Vehicle license plate
  - Overdue indicators
- **Expandable Details**: Click to view:
  - Start date and deadline
  - Estimated vs actual duration
  - Repair order ID

### 3. Individual Performance Tab
- **Job Statistics**: 
  - Total, completed, in progress, pending, and overdue jobs
  - Completion percentage
- **Performance Metrics**:
  - Quality score with visual progress bars
  - Speed score
  - Efficiency score
- **Job Distribution**: Visual breakdown of job statuses
- **Inspection Summary**: Total, completed, and in-progress inspections
- **Work Summary**: Average completion time, overall score, pending jobs

## File Structure

```
src/app/manager/technician-performance/
├── page.tsx                                    # Main page with tabs
├── components/
│   ├── index.ts                               # Component exports
│   ├── technician-overview.tsx                # Overview tab component
│   ├── technician-schedule.tsx                # Schedule tab component
│   └── technician-detail.tsx                  # Individual performance component
```

## API Integration

The dashboard is fully integrated with the following API endpoints:

### 1. Get Technicians by Branch
**Endpoint**: `GET /api/Technician/by-branch/{branchId}`
- Returns list of technicians in a branch with performance scores
- Response includes: technicianId, userId, userFullName, quality, speed, efficiency, score

### 2. Get Technician Workload
**Endpoint**: `GET /api/Technician/workload?technicianId={guid}`
- Returns detailed workload and performance metrics for a specific technician
- Response includes:
  - Job counts (total, completed, in progress, pending, overdue)
  - Performance metrics (quality, speed, efficiency, score)
  - Average completion time

**Performance Metrics Calculation**:
- **Quality** (0-100): Job revision rate - (1 - revisedJobs/totalJobs) × 100
- **Speed** (0-100): Completion time vs estimate - faster = higher score
- **Efficiency** (0-100): (completionRate × 50) + (onTimeRate × 50)
- **Score** (0-100): (Quality × 40%) + (Speed × 30%) + (Efficiency × 30%)

### 3. Get Technician Schedule
**Endpoint**: `GET /api/Technician/schedule`
- Returns all technicians' job schedules with optional filtering
- Query parameters:
  - `technicianId` (optional): Filter by specific technician
  - `status` (optional): Filter by job status
  - `fromDate` / `toDate` (optional): Date range filter
  - `isOverdueOnly` (optional): Show only overdue jobs
- Response includes: jobId, jobName, technicianName, status, dates, duration, repairOrderId, vehicleLicensePlate

### 4. Get Specific Technician Schedule
**Endpoint**: `GET /api/Technician/{technicianId}/schedule`
- Returns job schedule for a single technician

### 5. Assign Jobs to Technician
**Endpoint**: `POST /api/Technician/assign/jobs`
- Allows manager to assign multiple jobs to a technician
- Request body: `{ technicianId: string, jobIds: string[] }`

## Usage

Navigate to `/manager/technician-performance` to access the dashboard.

## Components Used

- Card, CardContent, CardHeader, CardTitle from `@/components/ui/card`
- Tabs, TabsContent, TabsList, TabsTrigger from `@/components/ui/tabs`
- Badge from `@/components/ui/badge`
- Button from `@/components/ui/button`
- Progress from `@/components/ui/progress`
- Icons from `lucide-react`

## Future Enhancements

- Real-time updates via SignalR
- Export performance reports
- Historical performance trends
- Technician comparison view
- Custom date range filtering
- Performance alerts and notifications
