export type JobStatus = "requires-auth" | "in-progress" | "ready-to-start"

export interface JobPart {
  jobPartId: string
  jobId: string
  partId: string
  quantity: number
  unitPrice: number
  totalPrice: number
  createdAt: string
  updatedAt: string | null
  partName: string
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
  level: number
  assignedByManagerId: string | null
  assignedAt: string | null
  assignedTechnicianId?: string | null
  assignedTechnicianName?: string | null
  assignedTechnicianMonogram?: string | null
  parts: JobPart[]
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