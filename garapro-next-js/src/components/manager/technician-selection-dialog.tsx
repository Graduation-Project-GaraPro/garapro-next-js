// src/components/manager/technician-selection-dialog.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, User, MapPin, Wrench, RefreshCw } from "lucide-react"
import { technicianService } from "@/services/manager/technician-service"
import type { Technician } from "@/types/manager/tech-schedule"
import { branchService } from "@/services/branch-service"

interface TechnicianSelectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAssign: (technicianId: string) => void
  jobIds: string[]
  branchId?: string 
}

export function TechnicianSelectionDialog({ 
  open, 
  onOpenChange, 
  onAssign,
  jobIds,
  branchId
}: TechnicianSelectionDialogProps) {
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [filteredTechnicians, setFilteredTechnicians] = useState<Technician[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTechnician, setSelectedTechnician] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [branchName, setBranchName] = useState<string | null>(null)
  const hasLoadedRef = useRef(false)

  useEffect(() => {
    if (open && (!hasLoadedRef.current || branchId)) {
      loadTechnicians()
      if (branchId) {
        loadBranchName()
      }
      hasLoadedRef.current = true
    }
  }, [open, branchId])

  // Reset selected technician and loaded state when dialog closes
  useEffect(() => {
    if (!open) {
      setSelectedTechnician(null)
      // Don't reset hasLoadedRef here so we can check if we need to reload when reopening
    }
  }, [open])

  useEffect(() => {
    setFilteredTechnicians(
      technicians.filter(tech => 
        tech.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tech.code.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
  }, [searchTerm, technicians])

  const loadTechnicians = async () => {
    try {
      setLoading(true)
      setError(null); // Clear any previous errors
      
      // Load technicians based on branch filtering if provided
      let data: Technician[]
      if (branchId) {
        // Use only the primary endpoint as requested
        console.log(`Loading technicians for branch: ${branchId}`)
        data = await technicianService.getTechniciansByBranch(branchId)
        console.log(`Loaded ${data.length} technicians for branch ${branchId} using primary endpoint`)
      } else {
        console.log("Loading all technicians (no branch filter)")
        data = await technicianService.getAllTechnicians()
        console.log(`Loaded ${data.length} technicians`)
      }
      
      setTechnicians(data)
      setFilteredTechnicians(data)
    } catch (error) {
      console.error("Failed to load technicians:", error)
      setError("Failed to load technicians. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const loadBranchName = async () => {
    if (!branchId) return
    
    try {
      const branch = await branchService.getBranchById(branchId)
      setBranchName(branch.branchName)
    } catch (error) {
      console.error("Failed to load branch name:", error)
      setBranchName(null)
    }
  }

  const handleAssign = () => {
    if (selectedTechnician) {
      onAssign(selectedTechnician)
    }
  }

  const handleSelectTechnician = (technicianId: string) => {
    setSelectedTechnician(technicianId)
  }



  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Select Technician</DialogTitle>
          {branchId && branchName && (
            <p className="text-sm text-gray-500">Branch: {branchName}</p>
          )}
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search technicians..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {error ? (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 text-center">
              <p className="text-red-700">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2" 
                onClick={loadTechnicians}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          ) : (
            <ScrollArea className="h-80">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                </div>
              ) : filteredTechnicians.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No technicians found
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredTechnicians.map((technician: Technician) => (
                    <div
                      key={technician.id}
                      className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedTechnician === technician.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                      onClick={() => handleSelectTechnician(technician.id)}
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                        {technician.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                      </div>
                      <div className="ml-3 flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium truncate">{technician.name}</p>
                        </div>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <MapPin className="w-3 h-3 mr-1" />
                          <span className="truncate">{technician.location}</span>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Wrench className="w-4 h-4 text-gray-400 mr-1" />
                        <span className="text-xs text-gray-500">
                          {technician.skills.length}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          )}
        </div>
        
        {!error && (
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAssign} 
              disabled={!selectedTechnician || jobIds.length === 0}
            >
              <User className="w-4 h-4 mr-2" />
              Assign ({jobIds.length} job{jobIds.length !== 1 ? 's' : ''})
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}