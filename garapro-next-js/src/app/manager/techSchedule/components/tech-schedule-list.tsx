'use client'

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Clock, MapPin, Wrench, User } from "lucide-react"

interface Technician {
  id: string
  name: string
  code: string
  location: string
  skills: string[]
  status: "available" | "busy" | "break" | "offline"
  currentTask?: {
    jobId: string
    jobTitle: string
    startTime: string
    progress: number
    estimatedCompletion: string
  }
  shift: "morning" | "afternoon" | "night"
  totalJobs: number
  inProgressJobs: number
  assignedJobs: number
  timeTracking: {
    totalHours: number
    todayHours: number
    breakTime: number
  }
}

interface TechScheduleListProps {
  technicians: Technician[]
}

export function TechScheduleList({ technicians }: TechScheduleListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'busy':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'break':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'offline':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return '🟢'
      case 'busy':
        return '🟠'
      case 'break':
        return '🔵'
      case 'offline':
        return '⚪'
      default:
        return '⚪'
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
      {technicians.map((tech) => (
        <Card key={tech.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <div>
                  <h3 className="font-semibold text-sm">{tech.name}</h3>
                  <p className="text-xs text-gray-500">{tech.code}</p>
                </div>
              </div>
              <Badge className={`text-xs ${getStatusColor(tech.status)}`}>
                {getStatusIcon(tech.status)} {tech.status.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="pt-0 space-y-3">
            {/* Location & Shift */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1">
                <MapPin className="h-3 w-3 text-gray-400" />
                <span className="text-gray-600">{tech.location}</span>
              </div>
              <Badge variant="outline" className="text-xs">
                {tech.shift}
              </Badge>
            </div>

            {/* Skills */}
            <div className="space-y-1">
              <div className="flex items-center space-x-1">
                <Wrench className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-600">Skills:</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {tech.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="text-xs py-0">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Current Task */}
            {tech.currentTask && (
              <div className="space-y-2 p-2 bg-orange-50 rounded-md border border-orange-100">
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3 text-orange-500" />
                  <span className="text-xs font-medium text-orange-700">Current Task</span>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-700">{tech.currentTask.jobTitle}</p>
                  <p className="text-xs text-gray-500">Job ID: {tech.currentTask.jobId}</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Progress</span>
                      <span className="font-medium">{tech.currentTask.progress}%</span>
                    </div>
                    <Progress value={tech.currentTask.progress} className="h-1" />
                  </div>
                  <p className="text-xs text-gray-500">
                    Est. completion: {tech.currentTask.estimatedCompletion}
                  </p>
                </div>
              </div>
            )}

            {/* Work Statistics */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-blue-50 rounded border border-blue-100">
                <p className="text-xs text-blue-600 font-medium">{tech.totalJobs}</p>
                <p className="text-xs text-blue-500">Total</p>
              </div>
              <div className="p-2 bg-orange-50 rounded border border-orange-100">
                <p className="text-xs text-orange-600 font-medium">{tech.inProgressJobs}</p>
                <p className="text-xs text-orange-500">In Progress</p>
              </div>
              <div className="p-2 bg-purple-50 rounded border border-purple-100">
                <p className="text-xs text-purple-600 font-medium">{tech.assignedJobs}</p>
                <p className="text-xs text-purple-500">Assigned</p>
              </div>
            </div>

            {/* Time Tracking */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-1">
                <p className="text-xs font-medium text-gray-700">{tech.timeTracking.totalHours}h</p>
                <p className="text-xs text-gray-500">Total</p>
              </div>
              <div className="p-1">
                <p className="text-xs font-medium text-gray-700">{tech.timeTracking.todayHours}h</p>
                <p className="text-xs text-gray-500">Today</p>
              </div>
              <div className="p-1">
                <p className="text-xs font-medium text-gray-700">{tech.timeTracking.breakTime}m</p>
                <p className="text-xs text-gray-500">Break</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}