"use client"

import { MoreHorizontal, Edit, Trash2, Clock, DollarSign, User, Car, ExternalLink } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import type { Job } from "@/types/job"

interface JobCardProps {
  job: Job
  onDragStart: () => void
  onDragEnd: () => void
  onEdit: () => void
  onDelete: () => void
}

export default function JobCard({ job, onDragStart, onDragEnd, onEdit, onDelete }: JobCardProps) {
  const router = useRouter()

  const handleCardClick = (e: React.MouseEvent) => {
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

  return (
    <Card
      className="group rounded-sm border border-gray-200 cursor-move hover:shadow-md transition-shadow hover:border-blue-300"
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={handleCardClick}
    >
      <CardHeader className="px-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Badge
              variant="outline"
              className={`text-xs font-medium px-1 py-0 h-4 ${getStatusColor(job.statusText || "Work Not Started")}`}
            >
              {job.statusText || "Work Not Started"}
            </Badge>
            <span className="text-xs font-semibold text-blue-600">RO #{job.id || "227"}</span>
            <ExternalLink className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                <MoreHorizontal className="w-2.5 h-2.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-red-600">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="mt-0.5">
          <div className="text-xs text-gray-900 font-medium leading-tight">
            {job.title} • {job.company} {job.contact && `• ${job.contact}`}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-1 pb-1.5 px-2 space-y-1">
        <div className="flex items-center gap-1 text-xs">
          <Car className="w-2.5 h-2.5 text-gray-500 flex-shrink-0" />
          <span className="font-medium">2003 Volkswagen Jetta • GJK2247-TX • Unit: 133</span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              <User className="w-2.5 h-2.5 text-gray-500" />
              <span className="text-gray-600">
                Tech: <span className="font-medium text-gray-900">SB</span>
              </span>
            </div>
            <div className="flex items-center gap-0.5">
              <Clock className="w-2.5 h-2.5 text-gray-500" />
              <span className="text-gray-600">0/2 hrs</span>
            </div>
          </div>
          <div className="flex items-center gap-0.5">
            <DollarSign className="w-2.5 h-2.5 text-green-600" />
            <span className="font-semibold text-green-600">$452.95</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <div className="flex-1 bg-gray-200 rounded-full h-0.5">
            <div
              className="bg-blue-500 h-0.5 rounded-full transition-all duration-300"
              style={{ width: `${job.progress || 0}%` }}
            />
          </div>
          <span className="text-xs font-medium text-gray-900">{job.progress || 0}%</span>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 pt-0.5">
          <span>{job.dueDate ? `Due: ${new Date(job.dueDate).toLocaleDateString()}` : "No due date"}</span>
          <span>7/23 at 2:17PM</span>
        </div>
      </CardContent>
    </Card>
  )
}
