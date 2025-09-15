'use client'

import { Card, CardContent } from "@/components/ui/card"

interface TechScheduleStats {
  totalTechnicians: number
  availableTechnicians: number
  busyTechnicians: number
  offlineTechnicians: number
  totalActiveJobs: number
  avgJobCompletion: number
}

interface TechStatsCardsProps {
  stats: TechScheduleStats
}

export function TechStatsCards({ stats }: TechStatsCardsProps) {
  const cards = [
    {
      title: "Total Techs",
      value: stats.totalTechnicians,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Available",
      value: stats.availableTechnicians,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Busy",
      value: stats.busyTechnicians,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      title: "Offline",
      value: stats.offlineTechnicians,
      color: "text-gray-600",
      bgColor: "bg-gray-50"
    },
    {
      title: "Active Jobs",
      value: stats.totalActiveJobs,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Avg Complete",
      value: `${stats.avgJobCompletion}%`,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50"
    }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
      {cards.map((card, index) => (
        <Card key={index} className={`${card.bgColor} border-0 shadow-sm`}>
          <CardContent className="">
            <div className="text-center">
              <p className="text-xs font-medium text-gray-600">{card.title}</p>
              <p className={`text-lg font-bold ${card.color}`}>{card.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}