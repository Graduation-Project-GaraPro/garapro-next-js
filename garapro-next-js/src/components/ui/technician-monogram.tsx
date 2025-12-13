// src/components/ui/technician-monogram.tsx
"use client"

import { cn } from "@/lib/utils"

interface TechnicianMonogramProps {
  name: string
  size?: "sm" | "md" | "lg"
  className?: string
}

export function TechnicianMonogram({ name, size = "sm", className }: TechnicianMonogramProps) {
  // Generate initials from name
  const getInitials = (fullName: string) => {
    const names = fullName.trim().split(' ')
    if (names.length === 1) {
      return names[0].substring(0, 2).toUpperCase()
    }
    return names.map(n => n.charAt(0)).join('').substring(0, 2).toUpperCase()
  }

  // Generate a consistent color based on name
  const getColorFromName = (name: string) => {
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    
    // Generate HSL color with good contrast
    const hue = Math.abs(hash) % 360
    return `hsl(${hue}, 65%, 45%)`
  }

  const sizeClasses = {
    sm: "w-6 h-6 text-xs",
    md: "w-8 h-8 text-sm", 
    lg: "w-10 h-10 text-base"
  }

  const initials = getInitials(name)
  const backgroundColor = getColorFromName(name)

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-semibold text-white shadow-sm border border-white/20",
        sizeClasses[size],
        className
      )}
      style={{ backgroundColor }}
      title={name}
    >
      {initials}
    </div>
  )
}

interface TechnicianMonogramGroupProps {
  technicianNames: string[]
  maxVisible?: number
  size?: "sm" | "md" | "lg"
  className?: string
}

export function TechnicianMonogramGroup({ 
  technicianNames, 
  maxVisible = 3, 
  size = "sm", 
  className 
}: TechnicianMonogramGroupProps) {
  if (!technicianNames || technicianNames.length === 0) {
    return null
  }

  const visibleTechnicians = technicianNames.slice(0, maxVisible)
  const remainingCount = technicianNames.length - maxVisible

  return (
    <div className={cn("flex items-center -space-x-1", className)}>
      {visibleTechnicians.map((name, index) => (
        <TechnicianMonogram
          key={`${name}-${index}`}
          name={name}
          size={size}
          className="border-2 border-white"
        />
      ))}
      {remainingCount > 0 && (
        <div
          className={cn(
            "rounded-full flex items-center justify-center font-semibold text-gray-600 bg-gray-200 border-2 border-white",
            size === "sm" ? "w-6 h-6 text-xs" : 
            size === "md" ? "w-8 h-8 text-sm" : 
            "w-10 h-10 text-base"
          )}
          title={`+${remainingCount} more technician${remainingCount > 1 ? 's' : ''}: ${technicianNames.slice(maxVisible).join(', ')}`}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  )
}