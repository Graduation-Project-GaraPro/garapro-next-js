export type JobStatus = "requires-auth" | "in-progress" | "ready-to-start"

export interface JobPart {
  jobPartId: string
  jobId?: string
  partId?: string
  partCode?: string
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

export interface Job {
  jobId: string
  serviceId: string
  repairOrderId: string
  jobName: string
  status: number // 0 = Pending, 1 = New, 2 = InProgress, 3 = Completed, 4 = OnHold
  deadline: string | null
  note: string
  createdAt: string
  updatedAt: string
  level?: number
  assignedByManagerId: string | null
  assignedAt: string | null
  assignedTechnicianId?: string | null
  assignedTechnicianName?: string | null
  assignedTechnicianMonogram?: string | null
  technicianName?: string | null // API returns this field name
  parts: JobPart[] // Legacy field name
  jobParts?: JobPart[] // New field name from API
}

export interface CreateJobRequest {
  title: string
  company: string
  contact?: string
  location?: string
  description?: string
  status: JobStatus
  progress?: number
  statusText?: string
  dueDate?: string
}

export interface UpdateJobRequest extends Partial<CreateJobRequest> {
  id: string
}