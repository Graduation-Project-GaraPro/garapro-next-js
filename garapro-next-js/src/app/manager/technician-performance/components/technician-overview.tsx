"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Users, 
  Wrench, 
  CheckCircle, 
  TrendingUp
} from "lucide-react"
import { technicianService } from "@/services/manager/technician-service"
import { authService } from "@/services/authService"
import { branchService } from "@/services/branch-service"
import { useJobHub } from "@/hooks/use-job-hub"
import { useToast } from "@/hooks/use-toast"

interface TechnicianStats {
  technicianId: string
  name: string
  email: string
  phoneNumber: string
  activeJobs: number
  completedJobs: number
  totalJobs: number
  activeInspections: number
  completedInspections: number
  totalInspections: number
  averageCompletionTime: number
  workloadPercentage: number
  status: "available" | "busy" | "offline"
}

interface TechnicianOverviewProps {
  onSelectTechnician: (id: string) => void
}

export function TechnicianOverview({ onSelectTechnician }: TechnicianOverviewProps) {
  const { toast } = useToast()
  const { isConnected, onJobStatusUpdated, onRepairCreated } = useJobHub()
  const [technicians, setTechnicians] = useState<TechnicianStats[]>([])
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState({
    totalTechnicians: 0,
    activeTechnicians: 0,
    totalActiveJobs: 0,
    averageWorkload: 0
  })

  useEffect(() => {
    fetchTechnicians()
  }, [])

  // Real-time updates from job hub
  useEffect(() => {
    if (!isConnected) return;

    // Handle job status updates (technician starts/finishes work)
    const unsubscribeStatus = onJobStatusUpdated((notification) => {
      // Refresh technician data when job status changes
      fetchTechnicians();
      
      // Show toast notification
      toast({
        title: "Job Status Updated",
        description: `${notification.technicianName} updated job "${notification.jobName}" to ${notification.newStatus}`,
        duration: 3000,
      });
    });

    const unsubscribeRepair = onRepairCreated((notification) => {
      // Refresh technician data when work starts
      fetchTechnicians();
      
      // Show toast notification
      toast({
        title: "Work Started",
        description: `Technician started work on "${notification.jobName}"`,
        duration: 3000,
      });
    });

    return () => {
      unsubscribeStatus();
      unsubscribeRepair();
    };
  }, [isConnected, onJobStatusUpdated, onRepairCreated, toast])

  const fetchTechnicians = async () => {
    try {
      setLoading(true)
      
      // Get current user's branch
      const currentUser = authService.getCurrentUser()
      if (!currentUser.userId) {
        console.error("User not authenticated")
        return
      }
      
      const userBranch = await branchService.getCurrentUserBranch(currentUser.userId)
      if (!userBranch) {
        console.error("Unable to determine user's branch")
        return
      }
      
      // Fetch technicians by branch with performance scores
      const data = await technicianService.getTechniciansByBranch(userBranch.branchId)
      
      // Fetch workload for each technician
      const techStatsPromises = data.map(async (tech) => {
        const workload = await technicianService.getTechnicianWorkload(tech.id)
        
        if (workload) {
          return {
            technicianId: workload.technicianId,
            name: workload.fullName,
            email: "",
            phoneNumber: "",
            activeJobs: workload.inProgressJobs,
            completedJobs: workload.completedJobs,
            totalJobs: workload.totalJobs,
            activeInspections: 0, // Not provided by API yet
            completedInspections: 0, // Not provided by API yet
            totalInspections: 0, // Not provided by API yet
            averageCompletionTime: workload.averageCompletionTime,
            workloadPercentage: Math.min(100, (workload.inProgressJobs / 10) * 100), // Calculate based on active jobs
            status: workload.inProgressJobs > 5 ? "busy" : workload.inProgressJobs > 0 ? "available" : "offline"
          } as TechnicianStats
        }
        
        // Fallback if workload not available
        return {
          technicianId: tech.id,
          name: tech.name,
          email: "",
          phoneNumber: "",
          activeJobs: 0,
          completedJobs: 0,
          totalJobs: 0,
          activeInspections: 0,
          completedInspections: 0,
          totalInspections: 0,
          averageCompletionTime: 0,
          workloadPercentage: 0,
          status: "offline"
        } as TechnicianStats
      })
      
      const techStats = await Promise.all(techStatsPromises)
      setTechnicians(techStats)

      // Calculate summary
      setSummary({
        totalTechnicians: techStats.length,
        activeTechnicians: techStats.filter(t => t.status !== "offline").length,
        totalActiveJobs: techStats.reduce((sum, t) => sum + t.activeJobs, 0),
        averageWorkload: Math.round(techStats.reduce((sum, t) => sum + t.workloadPercentage, 0) / techStats.length)
      })
    } catch (error) {
      console.error("Failed to fetch technicians:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available": return "bg-green-500"
      case "busy": return "bg-yellow-500"
      case "offline": return "bg-gray-400"
      default: return "bg-gray-400"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "available": return "Available"
      case "busy": return "Busy"
      case "offline": return "Offline"
      default: return "Unknown"
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Real-time Status Indicator */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div 
            className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}
            title={isConnected ? "Real-time updates active" : "Real-time updates disconnected"}
          />
          <span className="text-sm text-gray-600">
            {isConnected ? "Live updates active" : "Real-time updates unavailable"}
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Technicians</p>
                <p className="text-2xl font-bold">{summary.totalTechnicians}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Now</p>
                <p className="text-2xl font-bold text-green-600">{summary.activeTechnicians}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Jobs</p>
                <p className="text-2xl font-bold text-orange-600">{summary.totalActiveJobs}</p>
              </div>
              <Wrench className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Workload</p>
                <p className="text-2xl font-bold">{summary.averageWorkload}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Technician List */}
      <Card>
        <CardHeader>
          <CardTitle>Technician Workload</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {technicians.map((tech) => (
              <div
                key={tech.technicianId}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => onSelectTechnician(tech.technicianId)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-semibold">
                      {tech.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{tech.name}</h3>
                      <p className="text-sm text-gray-500">{tech.email}</p>
                    </div>
                  </div>
                  <Badge className={`${getStatusColor(tech.status)} text-white`}>
                    {getStatusText(tech.status)}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-gray-500">Active Jobs</p>
                    <p className="text-lg font-semibold text-orange-600">{tech.activeJobs}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Completed</p>
                    <p className="text-lg font-semibold text-green-600">{tech.completedJobs}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Inspections</p>
                    <p className="text-lg font-semibold text-blue-600">{tech.activeInspections}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Avg Time</p>
                    <p className="text-lg font-semibold">{tech.averageCompletionTime}m</p>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Workload</span>
                    <span className="font-semibold">{tech.workloadPercentage}%</span>
                  </div>
                  <Progress value={tech.workloadPercentage} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
