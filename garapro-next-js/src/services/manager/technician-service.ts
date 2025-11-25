// src/services/manager/technician-service.ts
import { apiClient } from './api-client'
import type { Technician as TechType } from "@/types/manager/tech-schedule"
import type { 
  TechnicianWorkload, 
  TechnicianSchedule, 
  TechnicianJob 
} from "@/types/manager/technician"

class TechnicianService {
  private baseUrl = '/users/technicians'

  async getAllTechnicians(): Promise<TechType[]> {
    try {
      const response = await apiClient.get<unknown[]>(`${this.baseUrl}`)
      // Transform the user data to match the Technician interface
      return (response.data || []).map((tech: unknown) => {
        // Check if this is the new API structure or the old one
        const typedTech = tech as { 
          technicianId: string; 
          userId: string; 
          userFullName: string;
          quality: number;
          speed: number;
          efficiency: number;
          score: number;
        };
        
        // Check if this is the new structure by looking for technicianId
        if (typedTech.technicianId) {
          // New API structure
          return {
            id: typedTech.technicianId,
            name: typedTech.userFullName || 'Unknown Technician',
            code: typedTech.userFullName?.substring(0, 2).toUpperCase() || 'NA',
            location: "Bay 1", // Default location, would come from API in real implementation
            skills: [], // Default empty skills, would come from API in real implementation
            status: "available", // Default status, would come from API in real implementation
            shift: "morning", // Default shift, would come from API in real implementation
            totalJobs: 0,
            inProgressJobs: 0,
            assignedJobs: 0,
            timeTracking: {
              totalHours: 0,
              todayHours: 0,
              breakTime: 0
            },
            schedule: {
              shiftStart: "08:00",
              shiftEnd: "17:00"
            },
            todayStats: {
              hoursWorked: 0,
              targetHours: 8,
              jobsCompleted: 0,
              jobsAssigned: 0,
              jobsInProgress: 0,
              efficiency: typedTech.efficiency || 0
            },
            jobs: []
          };
        } else {
          // Old API structure
          const oldTypedUser = tech as { id: string; fullName?: string; email?: string; role?: string };
          return {
            id: oldTypedUser.id,
            name: oldTypedUser.fullName || 'Unknown Technician',
            code: oldTypedUser.email?.substring(0, 2).toUpperCase() || 'NA',
            location: "Bay 1", // Default location, would come from API in real implementation
            skills: [], // Default empty skills, would come from API in real implementation
            status: "available", // Default status, would come from API in real implementation
            shift: "morning", // Default shift, would come from API in real implementation
            totalJobs: 0,
            inProgressJobs: 0,
            assignedJobs: 0,
            timeTracking: {
              totalHours: 0,
              todayHours: 0,
              breakTime: 0
            },
            schedule: {
              shiftStart: "08:00",
              shiftEnd: "17:00"
            },
            todayStats: {
              hoursWorked: 0,
              targetHours: 8,
              jobsCompleted: 0,
              jobsAssigned: 0,
              jobsInProgress: 0,
              efficiency: 0
            },
            jobs: []
          };
        }
      });
    } catch (error) {
      console.error('Failed to fetch technicians:', error)
      // Fallback to mock data if API call fails
      return this.getMockTechnicians()
    }
  }

  async getTechniciansWithoutBranch(): Promise<TechType[]> {
    try {
      const response = await apiClient.get<unknown[]>(`${this.baseUrl}/without-branch`)
      return (response.data || []).map((tech: unknown) => {
        // Check if this is the new API structure or the old one
        const typedTech = tech as { 
          technicianId: string; 
          userId: string; 
          userFullName: string;
          quality: number;
          speed: number;
          efficiency: number;
          score: number;
        };
        
        // Check if this is the new structure by looking for technicianId
        if (typedTech.technicianId) {
          // New API structure
          return {
            id: typedTech.technicianId,
            name: typedTech.userFullName || 'Unknown Technician',
            code: typedTech.userFullName?.substring(0, 2).toUpperCase() || 'NA',
            location: "Unassigned", // Technicians without branch are unassigned
            skills: [],
            status: "available",
            shift: "morning",
            totalJobs: 0,
            inProgressJobs: 0,
            assignedJobs: 0,
            timeTracking: {
              totalHours: 0,
              todayHours: 0,
              breakTime: 0
            },
            schedule: {
              shiftStart: "08:00",
              shiftEnd: "17:00"
            },
            todayStats: {
              hoursWorked: 0,
              targetHours: 8,
              jobsCompleted: 0,
              jobsAssigned: 0,
              jobsInProgress: 0,
              efficiency: typedTech.efficiency || 0
            },
            jobs: []
          };
        } else {
          // Old API structure
          const oldTypedUser = tech as { id: string; fullName?: string; email?: string; role?: string };
          return {
            id: oldTypedUser.id,
            name: oldTypedUser.fullName || 'Unknown Technician',
            code: oldTypedUser.email?.substring(0, 2).toUpperCase() || 'NA',
            location: "Unassigned", // Technicians without branch are unassigned
            skills: [],
            status: "available",
            shift: "morning",
            totalJobs: 0,
            inProgressJobs: 0,
            assignedJobs: 0,
            timeTracking: {
              totalHours: 0,
              todayHours: 0,
              breakTime: 0
            },
            schedule: {
              shiftStart: "08:00",
              shiftEnd: "17:00"
            },
            todayStats: {
              hoursWorked: 0,
              targetHours: 8,
              jobsCompleted: 0,
              jobsAssigned: 0,
              jobsInProgress: 0,
              efficiency: 0
            },
            jobs: []
          };
        }
      });
    } catch (error) {
      console.error('Failed to fetch technicians without branch:', error)
      return this.getMockTechnicians()
    }
  }

  // Get technicians by branch (Primary Option)
  async getTechniciansByBranch(branchId: string): Promise<TechType[]> {
    try {
      // Use the correct endpoint format (apiClient already has /api in base URL)
      const endpoint = `/Technician/by-branch/${branchId}`
      console.log(`Fetching technicians for branch ${branchId} at endpoint: ${endpoint}`)
      
      const response = await apiClient.get<unknown[]>(endpoint)
      console.log(`Technicians by branch response:`, response)
      
      return (response.data || []).map((tech: unknown) => {
        const typedTech = tech as { 
          technicianId: string; 
          userId: string; 
          userFullName: string;
          quality: number;
          speed: number;
          efficiency: number;
          score: number;
        };
        return {
          id: typedTech.technicianId,
          name: typedTech.userFullName || 'Unknown Technician',
          code: typedTech.userFullName?.substring(0, 2).toUpperCase() || 'NA',
          location: "Branch Location", // Would come from API
          skills: [],
          status: "available",
          shift: "morning",
          totalJobs: 0,
          inProgressJobs: 0,
          assignedJobs: 0,
          timeTracking: {
            totalHours: 0,
            todayHours: 0,
            breakTime: 0
          },
          schedule: {
            shiftStart: "08:00",
            shiftEnd: "17:00"
          },
          todayStats: {
            hoursWorked: 0,
            targetHours: 8,
            jobsCompleted: 0,
            jobsAssigned: 0,
            jobsInProgress: 0,
            efficiency: typedTech.efficiency || 0
          },
          jobs: []
        };
      });
    } catch (error) {
      console.error(`Failed to fetch technicians for branch ${branchId}:`, error)
      throw error; // Re-throw the error instead of returning mock data
    }
  }

  async getAllManagersAndTechnicians(): Promise<TechType[]> {
    try {
      const response = await apiClient.get<unknown[]>(`${this.baseUrl}/managers-technicians`)
      return (response.data || []).map((tech: unknown) => {
        // Check if this is the new API structure or the old one
        const typedTech = tech as { 
          technicianId: string; 
          userId: string; 
          userFullName: string;
          quality: number;
          speed: number;
          efficiency: number;
          score: number;
        };
        
        // Check if this is the new structure by looking for technicianId
        if (typedTech.technicianId) {
          // New API structure
          return {
            id: typedTech.technicianId,
            name: typedTech.userFullName || 'Unknown Technician',
            code: typedTech.userFullName?.substring(0, 2).toUpperCase() || 'NA',
            location: "Location", // Would come from API
            skills: [],
            status: "available",
            shift: "morning",
            totalJobs: 0,
            inProgressJobs: 0,
            assignedJobs: 0,
            timeTracking: {
              totalHours: 0,
              todayHours: 0,
              breakTime: 0
            },
            schedule: {
              shiftStart: "08:00",
              shiftEnd: "17:00"
            },
            todayStats: {
              hoursWorked: 0,
              targetHours: 8,
              jobsCompleted: 0,
              jobsAssigned: 0,
              jobsInProgress: 0,
              efficiency: typedTech.efficiency || 0
            },
            jobs: []
          };
        } else {
          // Old API structure
          const oldTypedUser = tech as { id: string; fullName?: string; email?: string; role?: string };
          return {
            id: oldTypedUser.id,
            name: oldTypedUser.fullName || 'Unknown Technician',
            code: oldTypedUser.email?.substring(0, 2).toUpperCase() || 'NA',
            location: oldTypedUser.role || "Unknown",
            skills: [],
            status: "available",
            shift: "morning",
            totalJobs: 0,
            inProgressJobs: 0,
            assignedJobs: 0,
            timeTracking: {
              totalHours: 0,
              todayHours: 0,
              breakTime: 0
            },
            schedule: {
              shiftStart: "08:00",
              shiftEnd: "17:00"
            },
            todayStats: {
              hoursWorked: 0,
              targetHours: 8,
              jobsCompleted: 0,
              jobsAssigned: 0,
              jobsInProgress: 0,
              efficiency: 0
            },
            jobs: []
          };
        }
      });
    } catch (error) {
      console.error('Failed to fetch managers and technicians:', error)
      return this.getMockTechnicians()
    }
  }

  // Get all technician workloads
  async getAllTechnicianWorkloads(): Promise<TechnicianWorkload[]> {
    try {
      // Use the correct endpoint format - should be relative to base URL
      const endpoint = `/Technician/workload`
      console.log(`Fetching all technician workloads at endpoint: ${endpoint}`)
      
      const response = await apiClient.get<TechnicianWorkload[]>(endpoint)
      console.log(`All technician workloads response:`, response)
      
      return response.data || []
    } catch (error) {
      console.error('Failed to fetch technician workloads:', error)
      return []
    }
  }

  // Get specific technician workload
  async getTechnicianWorkload(technicianId: string): Promise<TechnicianWorkload | null> {
    try {
      // Use the correct endpoint format - should be relative to base URL
      const endpoint = `/Technician/workload/${technicianId}`
      console.log(`Fetching workload for technician ${technicianId} at endpoint: ${endpoint}`)
      
      const response = await apiClient.get<TechnicianWorkload>(endpoint)
      console.log(`Technician workload response:`, response)
      
      return response.data || null
    } catch (error) {
      console.error(`Failed to fetch workload for technician ${technicianId}:`, error)
      return null
    }
  }

  // Get all technician schedules
  async getAllTechnicianSchedules(): Promise<TechnicianSchedule[]> {
    try {
      // Use the correct endpoint format - should be relative to base URL
      const endpoint = `/Technician/schedule`
      console.log(`Fetching all technician schedules at endpoint: ${endpoint}`)
      
      const response = await apiClient.get<TechnicianSchedule[]>(endpoint)
      console.log(`All technician schedules response:`, response)
      
      return response.data || []
    } catch (error) {
      console.error('Failed to fetch technician schedules:', error)
      return []
    }
  }

  // Get specific technician schedule
  async getTechnicianSchedule(technicianId: string): Promise<TechnicianSchedule | null> {
    try {
      // Use the correct endpoint format - should be relative to base URL
      const endpoint = `/Technician/${technicianId}/schedule`
      console.log(`Fetching schedule for technician ${technicianId} at endpoint: ${endpoint}`)
      
      const response = await apiClient.get<TechnicianSchedule>(endpoint)
      console.log(`Technician schedule response:`, response)
      
      return response.data || null
    } catch (error) {
      console.error(`Failed to fetch schedule for technician ${technicianId}:`, error)
      return null
    }
  }

  // Filter technicians by status
  async getTechniciansByStatus(status: string): Promise<TechType[]> {
    try {
      // Use the correct endpoint format - should be relative to base URL
      const endpoint = `/Technician?status=${status}`
      console.log(`Fetching technicians with status ${status} at endpoint: ${endpoint}`)
      
      const response = await apiClient.get<unknown[]>(endpoint)
      console.log(`Technicians by status response:`, response)
      
      return (response.data || []).map((tech: unknown) => {
        // Check if this is the new API structure or the old one
        const typedTech = tech as { 
          technicianId: string; 
          userId: string; 
          userFullName: string;
          quality: number;
          speed: number;
          efficiency: number;
          score: number;
        };
        
        // Check if this is the new structure by looking for technicianId
        if (typedTech.technicianId) {
          // New API structure
          return {
            id: typedTech.technicianId,
            name: typedTech.userFullName || 'Unknown Technician',
            code: typedTech.userFullName?.substring(0, 2).toUpperCase() || 'NA',
            location: "Location", // Would come from API
            skills: [],
            status: status as "available" | "busy" | "break" | "offline",
            shift: "morning",
            totalJobs: 0,
            inProgressJobs: 0,
            assignedJobs: 0,
            timeTracking: {
              totalHours: 0,
              todayHours: 0,
              breakTime: 0
            },
            schedule: {
              shiftStart: "08:00",
              shiftEnd: "17:00"
            },
            todayStats: {
              hoursWorked: 0,
              targetHours: 8,
              jobsCompleted: 0,
              jobsAssigned: 0,
              jobsInProgress: 0,
              efficiency: typedTech.efficiency || 0
            },
            jobs: []
          };
        } else {
          // Old API structure
          const oldTypedUser = tech as { id: string; fullName?: string; email?: string; role?: string };
          return {
            id: oldTypedUser.id,
            name: oldTypedUser.fullName || 'Unknown Technician',
            code: oldTypedUser.email?.substring(0, 2).toUpperCase() || 'NA',
            location: "Location", // Would come from API
            skills: [],
            status: status as "available" | "busy" | "break" | "offline",
            shift: "morning",
            totalJobs: 0,
            inProgressJobs: 0,
            assignedJobs: 0,
            timeTracking: {
              totalHours: 0,
              todayHours: 0,
              breakTime: 0
            },
            schedule: {
              shiftStart: "08:00",
              shiftEnd: "17:00"
            },
            todayStats: {
              hoursWorked: 0,
              targetHours: 8,
              jobsCompleted: 0,
              jobsAssigned: 0,
              jobsInProgress: 0,
              efficiency: 0
            },
            jobs: []
          };
        }
      });
    } catch (error) {
      console.error(`Failed to fetch technicians with status ${status}:`, error)
      return this.getMockTechnicians()
    }
  }

  private getMockTechnicians(): TechType[] {
    return [
      {
        id: "1",
        name: "John Smith",
        code: "JS",
        location: "Bay 1",
        skills: ["Engine Repair", "Brake Service"],
        status: "available",
        shift: "morning",
        totalJobs: 12,
        inProgressJobs: 3,
        assignedJobs: 2,
        timeTracking: {
          totalHours: 40,
          todayHours: 6,
          breakTime: 1
        },
        schedule: {
          shiftStart: "08:00",
          shiftEnd: "17:00"
        },
        todayStats: {
          hoursWorked: 6,
          targetHours: 8,
          jobsCompleted: 2,
          jobsAssigned: 2,
          jobsInProgress: 3,
          efficiency: 85
        },
        jobs: []
      },
      {
        id: "2",
        name: "Sarah Johnson",
        code: "SJ",
        location: "Bay 2",
        skills: ["Electrical Systems", "Diagnostics"],
        status: "busy",
        shift: "afternoon",
        totalJobs: 15,
        inProgressJobs: 5,
        assignedJobs: 1,
        timeTracking: {
          totalHours: 35,
          todayHours: 7,
          breakTime: 0.5
        },
        schedule: {
          shiftStart: "12:00",
          shiftEnd: "21:00"
        },
        todayStats: {
          hoursWorked: 7,
          targetHours: 8,
          jobsCompleted: 3,
          jobsAssigned: 1,
          jobsInProgress: 5,
          efficiency: 92
        },
        jobs: []
      },
      {
        id: "3",
        name: "Mike Williams",
        code: "MW",
        location: "Bay 3",
        skills: ["Transmission", "Suspension"],
        status: "available",
        shift: "morning",
        totalJobs: 8,
        inProgressJobs: 2,
        assignedJobs: 3,
        timeTracking: {
          totalHours: 42,
          todayHours: 5,
          breakTime: 1
        },
        schedule: {
          shiftStart: "08:00",
          shiftEnd: "17:00"
        },
        todayStats: {
          hoursWorked: 5,
          targetHours: 8,
          jobsCompleted: 1,
          jobsAssigned: 3,
          jobsInProgress: 2,
          efficiency: 78
        },
        jobs: []
      },
      {
        id: "4",
        name: "Emily Davis",
        code: "ED",
        location: "Bay 1",
        skills: ["AC Systems", "Tire Service"],
        status: "offline",
        shift: "night",
        totalJobs: 10,
        inProgressJobs: 0,
        assignedJobs: 4,
        timeTracking: {
          totalHours: 38,
          todayHours: 0,
          breakTime: 0
        },
        schedule: {
          shiftStart: "16:00",
          shiftEnd: "01:00"
        },
        todayStats: {
          hoursWorked: 0,
          targetHours: 8,
          jobsCompleted: 4,
          jobsAssigned: 4,
          jobsInProgress: 0,
          efficiency: 95
        },
        jobs: []
      },
      {
        id: "5",
        name: "Robert Brown",
        code: "RB",
        location: "Bay 2",
        skills: ["Engine Repair", "Diagnostics"],
        status: "available",
        shift: "afternoon",
        totalJobs: 14,
        inProgressJobs: 4,
        assignedJobs: 2,
        timeTracking: {
          totalHours: 45,
          todayHours: 6,
          breakTime: 0.5
        },
        schedule: {
          shiftStart: "12:00",
          shiftEnd: "21:00"
        },
        todayStats: {
          hoursWorked: 6,
          targetHours: 8,
          jobsCompleted: 3,
          jobsAssigned: 2,
          jobsInProgress: 4,
          efficiency: 88
        },
        jobs: []
      }
    ]
  }
}

export const technicianService = new TechnicianService()