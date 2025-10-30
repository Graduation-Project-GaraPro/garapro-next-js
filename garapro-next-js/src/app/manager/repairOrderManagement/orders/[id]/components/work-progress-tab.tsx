"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Clock, User, ChevronDown, MessageSquare } from "lucide-react"

interface Part {
  id: string
  name: string
  partNumber: string
  quantity: number
  status: "received" | "ordered" | "core" | "pending"
  estimatedCost: number
}

interface JobProgress {
  id: string
  title: string
  estimatedHours: number
  actualHours: number
  elapsedTime: string
  assignedTech: {
    id: string
    name: string
    avatar?: string
  }
  status: "pending" | "in-progress" | "completed" | "on-hold"
  startTime?: string
  completedTime?: string
  laborDetails: {
    description: string
    progress: number
  }
  parts: Part[]
  comments: {
    id: string
    message: string
    author: string
    timestamp: string
  }[]
}

interface WorkProgressTabProps {
  orderId: string
}

const mockJobProgress: JobProgress[] = [
  {
    id: "job-1",
    title: "Starter replacement",
    estimatedHours: 4.5,
    actualHours: 4.13,
    elapsedTime: "04:08:52",
    assignedTech: {
      id: "tech-c",
      name: "Tech C",
      avatar: "/avatars/tech-c.jpg"
    },
    status: "completed",
    startTime: "2024-01-15T08:00:00Z",
    completedTime: "2024-01-15T12:08:52Z",
    laborDetails: {
      description: "Starter Motor R&R",
      progress: 100
    },
    parts: [
      {
        id: "part-1",
        name: "DENSO Auto Parts Starter Motor",
        partNumber: "280-6010",
        quantity: 1,
        status: "received",
        estimatedCost: 189.99
      }
    ],
    comments: [
      {
        id: "comment-1",
        message: "Starter removed successfully. Installing new unit.",
        author: "Tech C",
        timestamp: "2024-01-15T10:30:00Z"
      },
      {
        id: "comment-2",
        message: "Installation complete. Testing functionality.",
        author: "Tech C",
        timestamp: "2024-01-15T12:00:00Z"
      }
    ]
  },
  {
    id: "job-2",
    title: "Cabin Air Filter",
    estimatedHours: 0.5,
    actualHours: 0.01,
    elapsedTime: "00:00:14",
    assignedTech: {
      id: "tech-c",
      name: "Tech C",
      avatar: "/avatars/tech-c.jpg"
    },
    status: "completed",
    startTime: "2024-01-15T12:15:00Z",
    completedTime: "2024-01-15T12:15:14Z",
    laborDetails: {
      description: "Cabin filter replacement",
      progress: 100
    },
    parts: [
      {
        id: "part-2",
        name: "Cabin Air Filter",
        partNumber: "CAF-2024",
        quantity: 1,
        status: "received",
        estimatedCost: 24.99
      }
    ],
    comments: []
  },
  {
    id: "job-3",
    title: "Brake Pad Replacement",
    estimatedHours: 2.0,
    actualHours: 1.25,
    elapsedTime: "01:15:33",
    assignedTech: {
      id: "tech-a",
      name: "Tech A",
      avatar: "/avatars/tech-a.jpg"
    },
    status: "in-progress",
    startTime: "2024-01-15T13:30:00Z",
    laborDetails: {
      description: "Front brake pad replacement",
      progress: 65
    },
    parts: [
      {
        id: "part-3",
        name: "Front Brake Pads Set",
        partNumber: "BP-F-2024",
        quantity: 1,
        status: "received",
        estimatedCost: 89.99
      },
      {
        id: "part-4",
        name: "Brake Fluid",
        partNumber: "BF-DOT4",
        quantity: 1,
        status: "received",
        estimatedCost: 15.99
      }
    ],
    comments: [
      {
        id: "comment-3",
        message: "Old pads removed. Cleaning brake components before installation.",
        author: "Tech A",
        timestamp: "2024-01-15T14:00:00Z"
      }
    ]
  }
]

export default function WorkProgressTab({ orderId: _orderId }: WorkProgressTabProps) {
  const [jobProgress] = useState<JobProgress[]>(mockJobProgress)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [expandedJobs, setExpandedJobs] = useState<Set<string>>(new Set())

  const filteredJobs = jobProgress.filter(job => {
    if (statusFilter === "all") return true
    return job.status === statusFilter
  })

  const toggleJobExpansion = (jobId: string) => {
    const newExpanded = new Set(expandedJobs)
    if (newExpanded.has(jobId)) {
      newExpanded.delete(jobId)
    } else {
      newExpanded.add(jobId)
    }
    setExpandedJobs(newExpanded)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 border-green-200">COMPLETED</Badge>
      case "in-progress":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">IN PROGRESS</Badge>
      case "on-hold":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">ON HOLD</Badge>
      case "pending":
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">PENDING</Badge>
      default:
        return <Badge variant="secondary">{status.toUpperCase()}</Badge>
    }
  }

  const getPartStatusBadge = (status: string) => {
    switch (status) {
      case "received":
        return <Badge className="bg-green-100 text-green-700 text-xs">Received</Badge>
      case "core":
        return <Badge className="bg-purple-100 text-purple-700 text-xs">Core</Badge>
      case "ordered":
        return <Badge className="bg-blue-100 text-blue-700 text-xs">Ordered</Badge>
      case "pending":
        return <Badge className="bg-gray-100 text-gray-700 text-xs">Pending</Badge>
      default:
        return <Badge variant="secondary" className="text-xs">{status}</Badge>
    }
  }

  const formatDuration = (hours: number) => {
    const wholeHours = Math.floor(hours)
    const minutes = Math.round((hours - wholeHours) * 60)
    if (wholeHours === 0) {
      return `${minutes}m`
    }
    return minutes > 0 ? `${wholeHours}h ${minutes}m` : `${wholeHours}h`
  }

  return (
    <div className="space-y-4">
      {/* Header with Filter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="h-8 px-3 text-sm font-medium"
            onClick={() => setStatusFilter(statusFilter === "in-progress" ? "all" : "in-progress")}
          >
            <Clock className="h-4 w-4 mr-1" />
            {statusFilter === "in-progress" ? "IN-PROGRESS" : "ALL JOBS"}
            <ChevronDown className="h-4 w-4 ml-1" />
          </Button>
        </div>
        <div className="text-sm text-gray-600">
          {filteredJobs.length} jobs
        </div>
      </div>

      {/* Jobs List */}
      <div className="space-y-3">
        {filteredJobs.map((job) => (
          <Card key={job.id} className="overflow-hidden">
            <CardHeader 
              className="pb-3 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleJobExpansion(job.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-medium text-gray-900">
                      {job.title} ({formatDuration(job.estimatedHours)})
                    </CardTitle>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">{job.assignedTech.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-mono">{job.elapsedTime}</span>
                  </div>
                  {getStatusBadge(job.status)}
                </div>
              </div>
            </CardHeader>
            
            {expandedJobs.has(job.id) && (
              <CardContent className="pt-0">
                {/* Labor Section */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Labor</h4>
                  <div className="bg-gray-50 rounded p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-900">{job.laborDetails.description}</span>
                      <span className="text-sm text-gray-600">{job.laborDetails.progress}%</span>
                    </div>
                    <Progress value={job.laborDetails.progress} className="h-2" />
                  </div>
                </div>

                {/* Parts Section */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Part</h4>
                  <div className="space-y-2">
                    {job.parts.map((part) => (
                      <div key={part.id} className="bg-gray-50 rounded p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-gray-900">{part.name}</span>
                              <span className="text-xs text-gray-500">{part.partNumber}</span>
                            </div>
                            <div className="text-xs text-gray-600">Starter Motor</div>
                          </div>
                          <div className="flex items-center gap-3">
                            {getPartStatusBadge(part.status)}
                            <div className="text-right">
                              <div className="text-sm font-medium">Qty</div>
                              <div className="text-lg font-bold">{part.quantity}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Comments Section */}
                {job.comments.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">
                        {job.comments.length} Comments
                      </span>
                    </div>
                    <div className="space-y-2">
                      {job.comments.map((comment) => (
                        <div key={comment.id} className="bg-blue-50 rounded p-3 border-l-4 border-blue-200">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-gray-900">{comment.author}</span>
                            <span className="text-xs text-gray-500">
                              {new Date(comment.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{comment.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        ))
        }
        
        {filteredJobs.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">
                {statusFilter === "all" ? "No work started yet." : `No ${statusFilter} jobs found.`}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
