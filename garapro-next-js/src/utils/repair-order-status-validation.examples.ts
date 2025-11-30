/**
 * Example scenarios for repair order status validation
 * This file demonstrates how the validation works with different scenarios
 */

import type { RepairOrder, PaidStatus } from '@/types/manager/repair-order'
import type { Job } from '@/types/job'
import type { QuotationDto, QuotationServiceDto } from '@/types/manager/quotation'

// Example 1: Pending → Completed (BLOCKED)
export const example1_PendingToCompleted = {
  description: 'Attempting to move from Pending to Completed should be blocked',
  repairOrder: {
    statusId: '1', // Pending
    paidStatus: 'Unpaid' as PaidStatus
  } as RepairOrder,
  fromStatus: '1',
  toStatus: '3',
  jobs: [],
  quotations: [],
  expectedResult: {
    isValid: false,
    message: 'Cannot move directly from Pending to Completed. Please move to In Progress first.'
  }
}

// Example 2: In Progress → Completed with all jobs done
export const example2_InProgressToCompletedWithJobs = {
  description: 'Moving from In Progress to Completed with all jobs completed should succeed',
  repairOrder: {
    statusId: '2', // In Progress
    paidStatus: 'Unpaid' as PaidStatus
  } as RepairOrder,
  fromStatus: '2',
  toStatus: '3',
  jobs: [
    { jobId: 'job-1', status: 3 }, // Completed
    { jobId: 'job-2', status: 3 }  // Completed
  ] as Job[],
  quotations: [],
  expectedResult: {
    isValid: true
  }
}

// Example 3: In Progress → Completed with good quotation
export const example3_InProgressToCompletedWithGoodQuotation = {
  description: 'Moving from In Progress to Completed with approved quotation (all services isGood=true) should succeed',
  repairOrder: {
    statusId: '2', // In Progress
    paidStatus: 'Unpaid' as PaidStatus
  } as RepairOrder,
  fromStatus: '2',
  toStatus: '3',
  jobs: [],
  quotations: [
    {
      quotationId: 'quote-1',
      status: 'Approved',
      quotationServices: [
        {
          quotationServiceId: 'qs-1',
          isGood: true, // All services marked as good
          serviceName: 'Oil Change'
        },
        {
          quotationServiceId: 'qs-2',
          isGood: true, // All services marked as good
          serviceName: 'Tire Rotation'
        }
      ] as QuotationServiceDto[]
    } as QuotationDto
  ],
  expectedResult: {
    isValid: true
  }
}

// Example 4: In Progress → Completed without jobs or good quotation
export const example4_InProgressToCompletedWithoutRequirements = {
  description: 'Moving from In Progress to Completed without completed jobs or good quotation should be blocked',
  repairOrder: {
    statusId: '2', // In Progress
    paidStatus: 'Unpaid' as PaidStatus
  } as RepairOrder,
  fromStatus: '2',
  toStatus: '3',
  jobs: [
    { jobId: 'job-1', status: 2 } // Still in progress
  ] as Job[],
  quotations: [],
  expectedResult: {
    isValid: false,
    message: 'Cannot complete repair order. Either all jobs must be completed OR there must be an approved quotation with all services marked as \'Good\' (no repair needed).'
  }
}

// Example 5: Completed → In Progress when fully paid
export const example5_CompletedToInProgressWhenPaid = {
  description: 'Moving from Completed to In Progress when fully paid should be blocked',
  repairOrder: {
    statusId: '3', // Completed
    paidStatus: 'Paid' as PaidStatus
  } as RepairOrder,
  fromStatus: '3',
  toStatus: '2',
  jobs: [],
  quotations: [],
  expectedResult: {
    isValid: false,
    message: 'Cannot move back to In Progress. This repair order is fully paid.'
  }
}

// Example 6: Completed → In Progress when not fully paid
export const example6_CompletedToInProgressWhenNotPaid = {
  description: 'Moving from Completed to In Progress when not fully paid should succeed',
  repairOrder: {
    statusId: '3', // Completed
    paidStatus: 'Partial' as PaidStatus
  } as RepairOrder,
  fromStatus: '3',
  toStatus: '2',
  jobs: [],
  quotations: [],
  expectedResult: {
    isValid: true
  }
}

// Example 7: Completed → Pending (BLOCKED)
export const example7_CompletedToPending = {
  description: 'Moving from Completed to Pending should always be blocked',
  repairOrder: {
    statusId: '3', // Completed
    paidStatus: 'Unpaid' as PaidStatus
  } as RepairOrder,
  fromStatus: '3',
  toStatus: '1',
  jobs: [],
  quotations: [],
  expectedResult: {
    isValid: false,
    message: 'Cannot move from Completed to Pending. If you need to reopen this repair order, move it to In Progress first.'
  }
}

// Example 8: In Progress → Completed with mixed quotation (some services not good)
export const example8_InProgressToCompletedWithMixedQuotation = {
  description: 'Moving from In Progress to Completed with quotation having some non-good services should be blocked',
  repairOrder: {
    statusId: '2', // In Progress
    paidStatus: 'Unpaid' as PaidStatus
  } as RepairOrder,
  fromStatus: '2',
  toStatus: '3',
  jobs: [],
  quotations: [
    {
      quotationId: 'quote-1',
      status: 'Approved',
      quotationServices: [
        {
          quotationServiceId: 'qs-1',
          isGood: true, // This one is good
          serviceName: 'Oil Change'
        },
        {
          quotationServiceId: 'qs-2',
          isGood: false, // This one needs repair
          serviceName: 'Brake Replacement'
        }
      ] as QuotationServiceDto[]
    } as QuotationDto
  ],
  expectedResult: {
    isValid: false,
    message: 'Cannot complete repair order. Either all jobs must be completed OR there must be an approved quotation with all services marked as \'Good\' (no repair needed).'
  }
}

// Example 9: Archive validation - Completed but not paid
export const example9_ArchiveCompletedNotPaid = {
  description: 'Attempting to archive a completed repair order that is not fully paid should be blocked',
  repairOrder: {
    statusId: '3', // Completed
    paidStatus: 'Partial' as PaidStatus,
    isCancelled: false
  } as RepairOrder,
  expectedArchiveResult: {
    canArchive: false,
    reason: 'Completed orders must be fully paid before archiving.'
  }
}

// Example 10: Archive validation - Completed and paid
export const example10_ArchiveCompletedAndPaid = {
  description: 'Archiving a completed and fully paid repair order should succeed',
  repairOrder: {
    statusId: '3', // Completed
    paidStatus: 'Paid' as PaidStatus,
    isCancelled: false
  } as RepairOrder,
  expectedArchiveResult: {
    canArchive: true
  }
}

// Example 11: Archive validation - Cancelled order
export const example11_ArchiveCancelled = {
  description: 'Archiving a cancelled repair order should always succeed regardless of payment status',
  repairOrder: {
    statusId: '1', // Pending (doesn't matter)
    paidStatus: 'Unpaid' as PaidStatus,
    isCancelled: true
  } as RepairOrder,
  expectedArchiveResult: {
    canArchive: true
  }
}

// Summary of all examples
export const allExamples = [
  example1_PendingToCompleted,
  example2_InProgressToCompletedWithJobs,
  example3_InProgressToCompletedWithGoodQuotation,
  example4_InProgressToCompletedWithoutRequirements,
  example5_CompletedToInProgressWhenPaid,
  example6_CompletedToInProgressWhenNotPaid,
  example7_CompletedToPending,
  example8_InProgressToCompletedWithMixedQuotation,
  example9_ArchiveCompletedNotPaid,
  example10_ArchiveCompletedAndPaid,
  example11_ArchiveCancelled
]

/**
 * Usage examples:
 * 
 * // Status transition validation
 * import { validateStatusTransition } from './repair-order-status-validation'
 * import { example2_InProgressToCompletedWithJobs } from './repair-order-status-validation.examples'
 * 
 * const result = validateStatusTransition(
 *   example2_InProgressToCompletedWithJobs.repairOrder,
 *   example2_InProgressToCompletedWithJobs.fromStatus,
 *   example2_InProgressToCompletedWithJobs.toStatus,
 *   example2_InProgressToCompletedWithJobs.jobs,
 *   example2_InProgressToCompletedWithJobs.quotations
 * )
 * 
 * console.log(result) // { isValid: true }
 * 
 * // Archive validation
 * import { canArchiveRepairOrder } from './repair-order-status-validation'
 * import { example10_ArchiveCompletedAndPaid } from './repair-order-status-validation.examples'
 * 
 * const archiveResult = canArchiveRepairOrder(
 *   example10_ArchiveCompletedAndPaid.repairOrder
 * )
 * 
 * console.log(archiveResult) // { canArchive: true }
 */
