
import type { RepairOrder } from "@/types/manager/repair-order"
import type { Job } from "@/types/job"
import type { QuotationDto } from "@/types/manager/quotation"

export interface StatusTransitionValidation {
  isValid: boolean
  message?: string
  requirements?: {
    hasQuotation: boolean
    hasGoodQuotation: boolean
    allJobsCompleted: boolean
    incompleteJobCount: number
    incompleteJobs: Job[]
  }
}

const STATUS = {
  PENDING: "1",
  IN_PROGRESS: "2",
  COMPLETED: "3"
} as const

export function hasGoodQuotation(quotations: QuotationDto[]): boolean {
  const approvedQuotations = quotations.filter(q => q.status === "Approved")
  
  if (approvedQuotations.length === 0) {
    return false
  }
  
  return approvedQuotations.some(quotation => {
    const services = quotation.quotationServices || []
    
    if (services.length === 0) {
      return false
    }
    
    return services.every(service => service.isGood === true)
  })
}

/**
 * Check if all jobs are completed
 */
export function areAllJobsCompleted(jobs: Job[]): boolean {
  if (jobs.length === 0) {
    return false
  }
  
  // Status 3 = Completed
  return jobs.every(job => job.status === 3)
}

/**
 * Get list of incomplete jobs
 */
export function getIncompleteJobs(jobs: Job[]): Job[] {
  return jobs.filter(job => job.status !== 3)
}

/**
 * Check if repair order is fully paid
 */
export function isFullyPaid(repairOrder: RepairOrder): boolean {
  return repairOrder.paidStatus === "Paid"
}

/**
 * Validate status transition based on business rules
 */
export function validateStatusTransition(
  repairOrder: RepairOrder,
  fromStatusId: string,
  toStatusId: string,
  jobs: Job[] = [],
  quotations: QuotationDto[] = []
): StatusTransitionValidation {
  // No change - always valid
  if (fromStatusId === toStatusId) {
    return { isValid: true }
  }

  // Pending → In Progress: ✅ Always allowed
  if (fromStatusId === STATUS.PENDING && toStatusId === STATUS.IN_PROGRESS) {
    return { isValid: true }
  }

  // Pending → Completed: ❌ BLOCKED - Must go to In Progress first
  if (fromStatusId === STATUS.PENDING && toStatusId === STATUS.COMPLETED) {
    return {
      isValid: false,
      message: "Cannot move directly from Pending to Completed. Please move to In Progress first."
    }
  }

  // In Progress → Completed: ✅ MUST have quotation AND (good quotation OR all jobs done)
  if (fromStatusId === STATUS.IN_PROGRESS && toStatusId === STATUS.COMPLETED) {
    const hasQuotation = quotations.length > 0
    const hasGoodQuote = hasGoodQuotation(quotations)
    const allJobsDone = areAllJobsCompleted(jobs)
    const incompleteJobs = getIncompleteJobs(jobs)
    const incompleteCount = incompleteJobs.length
    
    // STEP 1: Check if at least one quotation exists (any status)
    if (!hasQuotation) {
      return {
        isValid: false,
        message: "Cannot complete: No quotation exists for this repair order. Please create at least one quotation (any status).",
        requirements: {
          hasQuotation: false,
          hasGoodQuotation: false,
          allJobsCompleted: allJobsDone,
          incompleteJobCount: incompleteCount,
          incompleteJobs
        }
      }
    }
    
    // STEP 2: Check if has good quotation OR all jobs completed
    if (!hasGoodQuote && !allJobsDone) {
      const jobList = incompleteJobs.slice(0, 3).map(job => 
        job.jobName || `Job ${job.jobId.slice(0, 8)}`
      ).join(", ")
      
      const moreJobs = incompleteCount > 3 ? ` and ${incompleteCount - 3} more` : ""
      
      let message = `Cannot complete: No good quotation and ${incompleteCount} job(s) incomplete. `
      message += `To complete, either: (1) Get a good quotation (approve quotation where ALL services are marked as Good), or (2) Complete all jobs. `
      message += `Incomplete jobs: ${jobList}${moreJobs}.`
      
      return {
        isValid: false,
        message,
        requirements: {
          hasQuotation: true,
          hasGoodQuotation: false,
          allJobsCompleted: false,
          incompleteJobCount: incompleteCount,
          incompleteJobs
        }
      }
    }
    
    return { 
      isValid: true,
      requirements: {
        hasQuotation: true,
        hasGoodQuotation: hasGoodQuote,
        allJobsCompleted: allJobsDone,
        incompleteJobCount: 0,
        incompleteJobs: []
      }
    }
  }

  // In Progress → Pending: ✅ Always allowed
  if (fromStatusId === STATUS.IN_PROGRESS && toStatusId === STATUS.PENDING) {
    return { isValid: true }
  }

  // Completed → In Progress: ✅ Only if not fully paid
  if (fromStatusId === STATUS.COMPLETED && toStatusId === STATUS.IN_PROGRESS) {
    if (isFullyPaid(repairOrder)) {
      return {
        isValid: false,
        message: "Cannot move back to In Progress. This repair order is fully paid."
      }
    }
    
    return { isValid: true }
  }

  // Completed → Pending: ❌ BLOCKED
  if (fromStatusId === STATUS.COMPLETED && toStatusId === STATUS.PENDING) {
    return {
      isValid: false,
      message: "Cannot move from Completed to Pending. If you need to reopen this repair order, move it to In Progress first."
    }
  }

  // Default: allow the transition (for custom statuses)
  return { isValid: true }
}

/**
 * Get a user-friendly status name
 */
export function getStatusName(statusId: string): string {
  switch (statusId) {
    case STATUS.PENDING:
      return "Pending"
    case STATUS.IN_PROGRESS:
      return "In Progress"
    case STATUS.COMPLETED:
      return "Completed"
    default:
      return `Status ${statusId}`
  }
}

/**
 * Validate if a repair order can be archived
 * Archive requirements:
 * - Must be cancelled, OR
 * - Must be completed AND fully paid
 */
export function canArchiveRepairOrder(repairOrder: RepairOrder): {
  canArchive: boolean
  reason?: string
} {
  // Cancelled orders can always be archived
  if (repairOrder.isCancelled) {
    return { canArchive: true }
  }
  
  // Check if completed
  const isCompleted = repairOrder.statusId === STATUS.COMPLETED
  
  if (!isCompleted) {
    return {
      canArchive: false,
      reason: "Only completed or cancelled orders can be archived."
    }
  }
  
  // Check if fully paid
  const isFullyPaid = repairOrder.paidStatus === "Paid"
  
  if (!isFullyPaid) {
    return {
      canArchive: false,
      reason: "Completed orders must be fully paid before archiving."
    }
  }
  
  return { canArchive: true }
}
