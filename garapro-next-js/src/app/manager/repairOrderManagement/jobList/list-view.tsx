"use client"

import { useState } from "react"
import { MoreHorizontal, Edit, Trash2, ArrowUpDown, Wrench, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useRouter } from "next/navigation"
import type { Job } from "@/types/job"

interface ListViewProps {
  jobs: Job[]
  loading: boolean
  onEditJob: (job: Job) => void
  onDeleteJob: (jobId: string) => void
}

type SortField = "jobName" | "status" | "createdAt" | "updatedAt"
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
      case "createdAt":
      case "updatedAt":
        aValue = new Date(a[sortField])
        bValue = new Date(b[sortField])
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
    router.push(`/manager/repairOrderManagement/orders/${job.repairOrderId}`)
  }

  const getJobStatusText = (status: number) => {
    switch (status) {
      case 0: return "Pending"
      case 1: return "In Progress"
      case 2: return "Completed"
      default: return "Unknown"
    }
  }

  const getJobStatusColor = (status: number) => {
    switch (status) {
      case 0: return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case 1: return "bg-blue-100 text-blue-800 border-blue-200"
      case 2: return "bg-green-100 text-green-800 border-green-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  if (loading) {
    return (
      <div className="flex-1 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job</TableHead>
              <TableHead>Repair Order</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
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
                onClick={() => handleSort("jobName")}
                className="h-auto p-0 font-semibold hover:bg-transparent"
              >
                Job
                <ArrowUpDown className="ml-2 h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead className="w-[200px]">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleSort("createdAt")}
                className="h-auto p-0 font-semibold hover:bg-transparent"
              >
                Repair Order
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
                onClick={() => handleSort("createdAt")}
                className="h-auto p-0 font-semibold hover:bg-transparent"
              >
                Created
                <ArrowUpDown className="ml-2 h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedJobs.map((job) => (
            <TableRow 
              key={job.jobId} 
              className="cursor-pointer hover:bg-gray-50"
              onClick={(e) => handleRowClick(job, e)}
            >
              <TableCell className="font-medium">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-semibold text-blue-600">{job.jobName}</span>
                  </div>
                  <div className="text-xs text-gray-500">ID: {job.jobId}</div>
                  {job.parts.length > 0 && (
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Package className="w-3 h-3" />
                      <span>{job.parts.length} parts</span>
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="text-sm font-medium">RO #{job.repairOrderId}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={`text-xs font-medium ${getJobStatusColor(job.status)}`}
                >
                  {getJobStatusText(job.status)}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  {new Date(job.createdAt).toLocaleDateString()}
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
                    <DropdownMenuItem onClick={() => onDeleteJob(job.jobId)} className="text-red-600">
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
              <TableCell colSpan={5} className="text-center py-8">
                <div className="text-gray-500">
                  <Wrench className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                  <p className="text-sm">No jobs found</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}