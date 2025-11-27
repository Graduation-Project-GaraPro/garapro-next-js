// Technician workload interface based on the API specification
export interface TechnicianWorkload {
  technicianId: string;
  technicianName: string;
  totalJobs: number;
  completedJobs: number;
  inProgressJobs: number;
  pendingJobs: number;
  completionRate: number;
  upcomingJobs: unknown[];
}

// Technician schedule interface based on the API specification
export interface TechnicianSchedule {
  technicianId: string;
  technicianName: string;
  jobs: TechnicianJob[];
}

export interface TechnicianJob {
  jobId: string;
  jobTitle: string;
  status: string;
  deadline: string;
  priority: string;
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
