"use client"

import { useState } from "react"
import { MoreHorizontal, Edit, Trash2, Clock, DollarSign, User, Car, ExternalLink, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useRouter } from "next/navigation"
import type { Job, JobStatus } from "@/types/job"

interface ListViewProps {
  jobs: Job[]
  loading: boolean
  onEditJob: (job: Job) => void
  onDeleteJob: (jobId: string) => void
}

type SortField = "title" | "company" | "status" | "progress" | "dueDate" | "createdAt"
type SortOrder = "asc" | "desc"

export default function ListView({ jobs, loading, onEditJob, onDeleteJob }: ListViewProps) {
  const router = useRouter()
  const [sortField, setSortField] = useState<SortField>("createdAt")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  const sortedJobs = [...jobs].sort((a, b) => {
    let aValue: string | number | Date
    let bValue: string | number | Date

    // Handle different data types
    switch (sortField) {
      case "progress":
        aValue = a.progress || 0
        bValue = b.progress || 0
        break
      case "dueDate":
      case "createdAt":
        aValue = new Date(a[sortField] || 0)
        bValue = new Date(b[sortField] || 0)
        break
      default:
        aValue = String(a[sortField] || "").toLowerCase()
        bValue = String(b[sortField] || "").toLowerCase()
    }

    if (aValue < bValue) return sortOrder === "asc" ? -1 : 1
    if (aValue > bValue) return sortOrder === "asc" ? 1 : -1
    return 0
  })

  const handleRowClick = (job: Job, e: React.MouseEvent) => {
    // Prevent navigation when clicking on dropdown or other interactive elements
    if ((e.target as HTMLElement).closest('[role="menuitem"], button')) {
      return
    }
    router.push(`/manager/repairOrderManagement/orders/${job.id}`)
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "work not started":
        return "bg-gray-100 text-gray-700 border-gray-200"
      case "in progress":
        return "bg-blue-100 text-blue-700 border-blue-200"
      case "completed":
        return "bg-green-100 text-green-700 border-green-200"
      case "on hold":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const getJobStatusColor = (status: JobStatus) => {
    switch (status) {
      case "requires-auth":
        return "bg-red-100 text-red-700 border-red-200"
      case "in-progress":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      case "ready-to-start":
        return "bg-green-100 text-green-700 border-green-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const getJobStatusText = (status: JobStatus) => {
    switch (status) {
      case "requires-auth":
        return "Requires Authorization"
      case "in-progress":
        return "In Progress"
      case "ready-to-start":
        return "Ready to Start"
      default:
        return status
    }
  }

  if (loading) {
    return (
      <div className="flex-1 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Repair Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5].map((i) => (
              <TableRow key={i}>
                <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-white overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleSort("title")}
                className="h-auto p-0 font-semibold hover:bg-transparent"
              >
                Repair Order
                <ArrowUpDown className="ml-2 h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead className="w-[200px]">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleSort("company")}
                className="h-auto p-0 font-semibold hover:bg-transparent"
              >
                Customer
                <ArrowUpDown className="ml-2 h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead className="w-[150px]">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleSort("status")}
                className="h-auto p-0 font-semibold hover:bg-transparent"
              >
                Status
                <ArrowUpDown className="ml-2 h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead className="w-[120px]">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleSort("progress")}
                className="h-auto p-0 font-semibold hover:bg-transparent"
              >
                Progress
                <ArrowUpDown className="ml-2 h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead className="w-[120px]">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleSort("dueDate")}
                className="h-auto p-0 font-semibold hover:bg-transparent"
              >
                Due Date
                <ArrowUpDown className="ml-2 h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedJobs.map((job) => (
            <TableRow 
              key={job.id} 
              className="cursor-pointer hover:bg-gray-50"
              onClick={(e) => handleRowClick(job, e)}
            >
              <TableCell className="font-medium">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-blue-600">RO #{job.id}</span>
                    <ExternalLink className="w-3 h-3 text-gray-400" />
                  </div>
                  <div className="text-sm text-gray-900">{job.title}</div>
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <Car className="w-3 h-3" />
                    <span>2003 Volkswagen Jetta • GJK2247-TX</span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="text-sm font-medium">{job.company}</div>
                  {job.contact && <div className="text-xs text-gray-600">{job.contact}</div>}
                  {job.location && <div className="text-xs text-gray-500">{job.location}</div>}
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <Badge
                    variant="outline"
                    className={`text-xs font-medium ${getJobStatusColor(job.status)}`}
                  >
                    {getJobStatusText(job.status)}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`text-xs font-medium ${getStatusColor(job.statusText || "Work Not Started")}`}
                  >
                    {job.statusText || "Work Not Started"}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <div className="flex-1 bg-gray-200 rounded-full h-1.5 max-w-[60px]">
                      <div
                        className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${job.progress || 0}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-900">{job.progress || 0}%</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>Tech: SB</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>0/2 hrs</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3 text-green-600" />
                      <span className="font-semibold text-green-600">$452.95</span>
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  {job.dueDate ? (
                    <div>
                      <div className="font-medium">{new Date(job.dueDate).toLocaleDateString()}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(job.dueDate).toLocaleDateString() === new Date().toLocaleDateString() 
                          ? "Today" 
                          : new Date(job.dueDate) < new Date() 
                            ? "Overdue" 
                            : "Upcoming"}
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-500">No due date</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEditJob(job)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDeleteJob(job.id)} className="text-red-600">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
          {sortedJobs.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
                <div className="text-gray-500">
                  <p className="text-sm">No repair orders found</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}