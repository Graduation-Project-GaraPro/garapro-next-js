'use client'

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Filter, RefreshCw } from "lucide-react"
import { TechStatsCards } from "./components/tech-stats-cards"
import { TechScheduleList } from "./components/tech-schedule-list"
import { techScheduleService } from "@/services/manager/tech-schedule-service"
import type { Technician, TechScheduleFilters, TechScheduleStats } from "@/types/manager/tech-schedule"

export default function TechSchedulePage() {
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [filteredTechnicians, setFilteredTechnicians] = useState<Technician[]>([])
  const [stats, setStats] = useState<TechScheduleStats>({
    totalTechnicians: 0,
    availableTechnicians: 0,
    busyTechnicians: 0,
    offlineTechnicians: 0,
    totalActiveJobs: 0,
    avgJobCompletion: 0
  })
  const [filters, setFilters] = useState<TechScheduleFilters>({
    search: "",
    status: "all",
    location: "all",
    skills: "all",
    shift: "all"
  })
  const [isLoading, setIsLoading] = useState(false)

  // Load initial data
  useEffect(() => {
    loadData()
  }, [])

  // Apply filters when filters change
  useEffect(() => {
    applyFilters()
  }, [filters, technicians])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const allTechnicians = await techScheduleService.getAllTechnicians()
      const scheduleStats = await techScheduleService.getScheduleStats()
      
      setTechnicians(allTechnicians)
      setStats(scheduleStats)
    } catch (error) {
      console.error('Failed to load technician data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = async () => {
    try {
      const filtered = await techScheduleService.filterTechnicians(filters)
      setFilteredTechnicians(filtered)
    } catch (error) {
      console.error('Failed to filter technicians:', error)
    }
  }

  const handleFilterChange = (key: keyof TechScheduleFilters, value: string) => {
    setFilters((prev: TechScheduleFilters) => ({
      ...prev,
      [key]: value
    }))
  }

  const handleRefresh = () => {
    loadData()
  }

  const handleResetFilters = () => {
    setFilters({
      search: "",
      status: "all",
      location: "all",
      skills: "all",
      shift: "all"
    })
  }

  // Get unique values for filter options
  const uniqueLocations = [...new Set(technicians.map(tech => tech.location))]
  const uniqueSkills = [...new Set(technicians.flatMap(tech => tech.skills))]

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tech Schedule</h1>
          <p className="text-gray-600 mt-1">Monitor technician availability and workload</p>
        </div>
        <Button onClick={handleRefresh} disabled={isLoading} className="flex items-center gap-2">
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <TechStatsCards stats={stats} />

      {/* Filters */}
      <Card>
        <CardHeader className="">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-4 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-1">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name or code..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Status Filter */}
            <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="busy">Busy</SelectItem>
                <SelectItem value="break">On Break</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
              </SelectContent>
            </Select>

            {/* Location Filter */}
            <Select value={filters.location} onValueChange={(value) => handleFilterChange('location', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {uniqueLocations.map(location => (
                  <SelectItem key={location} value={location}>{location}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Skills Filter */}
            <Select value={filters.skills} onValueChange={(value) => handleFilterChange('skills', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Skills" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Skills</SelectItem>
                {uniqueSkills.map(skill => (
                  <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Shift Filter */}
            <Select value={filters.shift} onValueChange={(value) => handleFilterChange('shift', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Shift" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Shifts</SelectItem>
                <SelectItem value="morning">Morning</SelectItem>
                <SelectItem value="afternoon">Afternoon</SelectItem>
                <SelectItem value="night">Night</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filter Actions */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-600">
              Showing {filteredTechnicians.length} of {technicians.length} technicians
            </p>
            <Button variant="outline" onClick={handleResetFilters} className="text-sm">
              Reset Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Technician List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Technicians Overview</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-600">Loading technicians...</span>
            </div>
          ) : filteredTechnicians.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No technicians found matching your filters.</p>
              <Button variant="outline" onClick={handleResetFilters} className="mt-2">
                Clear Filters
              </Button>
            </div>
          ) : (
            <TechScheduleList technicians={filteredTechnicians} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}