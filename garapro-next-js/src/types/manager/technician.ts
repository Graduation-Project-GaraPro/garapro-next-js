// Technician workload interface based on the API specification
// Endpoint: GET /api/Technician/workload?technicianId={guid}
export interface TechnicianWorkload {
  technicianId: string;
  userId: string;
  fullName: string;
  totalJobs: number;
  completedJobs: number;
  inProgressJobs: number;
  pendingJobs: number;
  overdueJobs: number;
  averageCompletionTime: number;
  efficiency: number;
  quality: number;
  speed: number;
  score: number;
}

// Technician with performance scores
// Endpoint: GET /api/Technician/by-branch/{branchId}
export interface TechnicianPerformance {
  technicianId: string;
  userId: string;
  userFullName: string;
  quality: number;
  speed: number;
  efficiency: number;
  score: number;
}

// Technician job/schedule interface
// Endpoint: GET /api/Technician/schedule
export interface TechnicianJob {
  jobId: string;
  jobName: string;
  technicianId: string;
  technicianName: string;
  status: string;
  startDate: string;
  deadline: string;
  estimatedDuration: number;
  actualDuration: number;
  isOverdue: boolean;
  repairOrderId: string;
  vehicleLicensePlate: string;
}

// Legacy interface for backward compatibility
export interface TechnicianSchedule {
  technicianId: string;
  technicianName: string;
  jobs: TechnicianJob[];
}

// Technician assignment notifications
export interface TechnicianAssignmentNotification {
  technicianId: string;
  technicianName: string;
  jobCount: number;
  jobNames: string[];
}

export interface TechnicianReassignmentNotification {
  jobId: string;
  oldTechnicianId: string;
  newTechnicianId: string;
  jobName: string;
}

export interface InspectionAssignmentNotification {
  technicianId: string;
  technicianName: string;
  inspectionCount: number;
  inspectionNames: string[];
}

export interface InspectionReassignmentNotification {
  inspectionId: string;
  oldTechnicianId: string;
  newTechnicianId: string;
  inspectionName: string;
}
