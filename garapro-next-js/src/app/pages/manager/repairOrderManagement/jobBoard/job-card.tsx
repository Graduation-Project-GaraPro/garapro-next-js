"use client"

import { MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Job } from "@/types/job"

interface JobCardProps {
  job: Job
  onDragStart: () => void
  onDragEnd: () => void
  onEdit: () => void
  onDelete: () => void
}

export default function JobCard({ job, onDragStart, onDragEnd, onEdit, onDelete }: JobCardProps) {
  return (
    <Card
      className="rounded-sm border border-gray-200 cursor-move hover:shadow-md transition-shadow"
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-medium text-sm line-clamp-2">{job.title}</h3>
            <p className="text-xs text-gray-600 mt-1">{job.company}</p>
            {job.contact && <p className="text-xs text-gray-500 mt-1">{job.contact}</p>}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="w-4 h-4" />
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
      </CardHeader>

      <CardContent className="pt-0">
        {job.location && <p className="text-xs text-gray-600 mb-2 line-clamp-1">{job.location}</p>}

        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500">{job.statusText}</span>
          <span className="text-xs font-medium">{job.progress}%</span>
        </div>

        {job.progress > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div
              className="bg-blue-600 h-1 rounded-full transition-all duration-300"
              style={{ width: `${job.progress}%` }}
            />
          </div>
        )}

        {job.dueDate && (
          <div className="mt-2 text-xs text-gray-500">Due: {new Date(job.dueDate).toLocaleDateString()}</div>
        )}
      </CardContent>
    </Card>
  )
}
