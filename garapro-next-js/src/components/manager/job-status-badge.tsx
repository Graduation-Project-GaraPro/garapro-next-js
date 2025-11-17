// src/components/manager/job-status-badge.tsx
import { Badge } from "@/components/ui/badge"

interface JobStatusBadgeProps {
  status: number
}

export function JobStatusBadge({ status }: JobStatusBadgeProps) {
  const getStatusInfo = (status: number) => {
    switch (status) {
      case 0: // Pending
        return { text: "Pending", variant: "gray" }
      case 1: // New (Assigned)
        return { text: "Assigned", variant: "blue" }
      case 2: // In Progress
        return { text: "In Progress", variant: "orange" }
      case 3: // Completed
        return { text: "Completed", variant: "green" }
      case 4: // On Hold
        return { text: "On Hold", variant: "red" }
      default:
        return { text: "Unknown", variant: "gray" }
    }
  }

  const { text, variant } = getStatusInfo(status)

  const variantClasses = {
    gray: "bg-gray-100 text-gray-800 hover:bg-gray-200",
    blue: "bg-blue-100 text-blue-800 hover:bg-blue-200",
    orange: "bg-orange-100 text-orange-800 hover:bg-orange-200",
    green: "bg-green-100 text-green-800 hover:bg-green-200",
    red: "bg-red-100 text-red-800 hover:bg-red-200"
  }

  return (
    <Badge className={`${variantClasses[variant as keyof typeof variantClasses]}`}>
      {text}
    </Badge>
  )
}