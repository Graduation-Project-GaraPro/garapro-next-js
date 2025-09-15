"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, AlertCircle, CheckCircle, Clock, Eye, Edit2, MoreHorizontal, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface CustomerConcern {
  id: string
  description: string
  finding: string
  status: "pending" | "in-progress" | "completed"
  addedBy: string
  addedAt: string
}

interface TechnicianConcern {
  id: string
  description: string
  finding: string
  rating: "critical" | "moderate" | "minor"
  technician: {
    id: string
    name: string
    avatar?: string
  }
  addedAt: string
  images?: string[]
}

interface InspectionTask {
  id: string
  title: string
  type: "specific-part" | "full-vehicle"
  assignedTo?: {
    id: string
    name: string
    avatar?: string
  }
  status: "pending" | "in-progress" | "completed"
  createdAt: string
  completedAt?: string
  rating?: "critical" | "good" | "fair" | "poor"
  findings?: string
  images?: string[]
  partsNeeded?: {
    id: string
    name: string
    quantity: number
    estimatedCost: number
  }[]
}

interface InspectionsTabProps {
  orderId: string
}

const mockCustomerConcerns: CustomerConcern[] = [
  {
    id: "1",
    description: "LOF - Lube Oil and Filter",
    finding: "Add finding",
    status: "pending",
    addedBy: "Customer",
    addedAt: "2024-01-15T09:00:00Z"
  },
  {
    id: "2",
    description: "State Inspection",
    finding: "Add finding",
    status: "pending",
    addedBy: "Customer",
    addedAt: "2024-01-15T09:00:00Z"
  },
  {
    id: "3",
    description: "Check Tires",
    finding: "Nail in RF tire",
    status: "completed",
    addedBy: "Customer",
    addedAt: "2024-01-15T09:00:00Z"
  }
]

const mockTechnicianConcerns: TechnicianConcern[] = [
  {
    id: "1",
    description: "Tech found a yoga mat stuck to the exhaust piping causing a burning smell.",
    finding: "Whatever it would to fix this issue",
    rating: "critical",
    technician: {
      id: "tech-1",
      name: "Mike Rodriguez",
      avatar: "/avatars/mike.jpg"
    },
    addedAt: "2024-01-15T10:30:00Z",
    images: ["/images/exhaust-issue.jpg"]
  }
]

const mockInspectionTasks: InspectionTask[] = [
  {
    id: "1",
    title: "Brake System Inspection",
    type: "specific-part",
    assignedTo: {
      id: "tech-1",
      name: "Sarah Bennett",
      avatar: "/avatars/sarah.jpg"
    },
    status: "completed",
    createdAt: "2024-01-15T08:00:00Z",
    completedAt: "2024-01-15T10:15:00Z",
    rating: "fair",
    findings: "Brake pads at 30% remaining, rotors in good condition. Recommend replacement within 2-3 weeks.",
    images: ["C:\\Users\\This PC\\OneDrive\\Pictures\\images.jpg", "/images/brake-rotors.jpg"],
    partsNeeded: [
      {
        id: "part-1",
        name: "Front Brake Pads Set",
        quantity: 1,
        estimatedCost: 89.99
      },
      {
        id: "part-2",
        name: "Brake Fluid",
        quantity: 1,
        estimatedCost: 15.99
      }
    ]
  },
  {
    id: "2",
    title: "Full Vehicle Safety Inspection",
    type: "full-vehicle",
    assignedTo: {
      id: "tech-2",
      name: "David Thompson",
      avatar: "/avatars/david.jpg"
    },
    status: "completed",
    createdAt: "2024-01-15T09:30:00Z",
    completedAt: "2024-01-15T14:45:00Z",
    rating: "good",
    findings: "Overall vehicle condition is good. Minor issues with air filter and cabin filter need replacement.",
    images: ["C:\\Users\\This PC\\OneDrive\\Pictures\\images.jpg"],
    partsNeeded: [
      {
        id: "part-3",
        name: "Engine Air Filter",
        quantity: 1,
        estimatedCost: 24.99
      },
      {
        id: "part-4",
        name: "Cabin Air Filter",
        quantity: 1,
        estimatedCost: 19.99
      }
    ]
  },
  {
    id: "3",
    title: "Engine Diagnostic",
    type: "specific-part",
    assignedTo: {
      id: "tech-3",
      name: "Mike Rodriguez",
      avatar: "/avatars/mike.jpg"
    },
    status: "in-progress",
    createdAt: "2024-01-15T11:00:00Z"
  }
]

export default function InspectionsTab({ orderId }: InspectionsTabProps) {
  const [customerConcerns, setCustomerConcerns] = useState<CustomerConcern[]>(mockCustomerConcerns)
  const [technicianConcerns] = useState<TechnicianConcern[]>(mockTechnicianConcerns)
  const [inspectionTasks, setInspectionTasks] = useState<InspectionTask[]>(mockInspectionTasks)
  const [isAddInspectionOpen, setIsAddInspectionOpen] = useState(false)
  const [isEditConcernOpen, setIsEditConcernOpen] = useState(false)
  const [isAddConcernOpen, setIsAddConcernOpen] = useState(false)
  const [isAssignTechOpen, setIsAssignTechOpen] = useState(false)
  const [selectedConcern, setSelectedConcern] = useState<CustomerConcern | null>(null)
  const [selectedTaskForAssignment, setSelectedTaskForAssignment] = useState<string | null>(null)
  const [newInspectionType, setNewInspectionType] = useState<"specific-part" | "full-vehicle" | "">("")
  const [newInspectionTitle, setNewInspectionTitle] = useState("")
  const [assignedTech, setAssignedTech] = useState("")
  const [newConcernDescription, setNewConcernDescription] = useState("")
  const [newConcernFinding, setNewConcernFinding] = useState("")

  // Mock technicians data
  const availableTechnicians = [
    { id: "tech-1", name: "Sarah Bennett", avatar: "/avatars/sarah.jpg" },
    { id: "tech-2", name: "Mike Rodriguez", avatar: "/avatars/mike.jpg" },
    { id: "tech-3", name: "David Thompson", avatar: "/avatars/david.jpg" },
    { id: "tech-4", name: "Lisa Chen", avatar: "/avatars/lisa.jpg" }
  ]

  const handleAddInspection = () => {
    if (!newInspectionType || !newInspectionTitle) return

    const newTask: InspectionTask = {
      id: `task-${Date.now()}`,
      title: newInspectionTitle,
      type: newInspectionType,
      status: "pending",
      createdAt: new Date().toISOString()
    }

    setInspectionTasks([...inspectionTasks, newTask])
    setIsAddInspectionOpen(false)
    setNewInspectionType("")
    setNewInspectionTitle("")
  }

  const handleAssignTechnician = () => {
    if (!selectedTaskForAssignment || !assignedTech) return

    setInspectionTasks(tasks => 
      tasks.map(task => 
        task.id === selectedTaskForAssignment 
          ? { 
              ...task, 
              assignedTo: availableTechnicians.find(tech => tech.id === assignedTech),
              status: "in-progress" as const
            }
          : task
      )
    )
    
    setIsAssignTechOpen(false)
    setSelectedTaskForAssignment(null)
    setAssignedTech("")
  }

  const openAssignDialog = (taskId: string) => {
    setSelectedTaskForAssignment(taskId)
    setIsAssignTechOpen(true)
  }

  const handleEditConcern = (concern: CustomerConcern) => {
    setSelectedConcern(concern)
    setIsEditConcernOpen(true)
  }

  const handleSaveConcern = () => {
    if (!selectedConcern) return
    
    setCustomerConcerns(concerns => 
      concerns.map(concern => 
        concern.id === selectedConcern.id ? selectedConcern : concern
      )
    )
    setIsEditConcernOpen(false)
    setSelectedConcern(null)
  }

  const handleAddConcern = () => {
    if (!newConcernDescription.trim()) return

    const newConcern: CustomerConcern = {
      id: `concern-${Date.now()}`,
      description: newConcernDescription,
      finding: newConcernFinding || "Add finding",
      status: "pending",
      addedBy: "Manager",
      addedAt: new Date().toISOString()
    }

    setCustomerConcerns([...customerConcerns, newConcern])
    setIsAddConcernOpen(false)
    setNewConcernDescription("")
    setNewConcernFinding("")
  }

  const handleDeleteConcern = (concernId: string) => {
    setCustomerConcerns(concerns => concerns.filter(concern => concern.id !== concernId))
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "in-progress":
        return <Clock className="h-4 w-4 text-orange-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />
    }
  }

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200"
      case "moderate":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "minor":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "good":
        return "bg-green-100 text-green-800 border-green-200"
      case "fair":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "poor":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="space-y-6">
      {/* Vehicle Issues Section */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">Vehicle Issues - RO #{orderId}</CardTitle>
              <Badge variant="destructive" className="bg-red-500">
                {customerConcerns.length + technicianConcerns.length}
              </Badge>
            </div>
            <Button 
              onClick={() => setIsAddInspectionOpen(true)}
              className="bg-[#154c79] hover:bg-[#123a5c] text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Inspection
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Customer Concerns */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <span>Customer Concerns</span>
              <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-600">
                ?
              </div>
            </div>
            
            {customerConcerns.map((concern) => (
              <div key={concern.id} className="grid grid-cols-12 items-center gap-4 py-2 hover:bg-gray-50 rounded">
                <div className="col-span-4">
                  <p className="text-sm text-gray-900">{concern.description}</p>
                </div>
                <div className="col-span-4">
                  <p className="text-sm text-gray-600">{concern.finding}</p>
                </div>
                <div className="col-span-4 flex items-center justify-end gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleEditConcern(concern)}>
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit Finding
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Eye className="h-4 w-4 mr-2" />
                        Copy to Estimate ({customerConcerns.length})
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteConcern(concern.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Concern
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
            
            <Button 
              variant="ghost" 
              className="w-fit text-sm text-gray-600 hover:text-gray-900 p-0 h-auto font-normal"
              onClick={() => setIsAddConcernOpen(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Concern
            </Button>
          </div>

          {/* Technician Concerns */}
          <div className="space-y-3 pt-4 border-t">
            <div className="text-sm font-medium text-gray-700">Technician Concerns</div>
            
            {technicianConcerns.map((concern) => (
              <div key={concern.id} className="grid grid-cols-12 items-center gap-4 py-2 hover:bg-gray-50 rounded">
                <div className="col-span-1 flex justify-center">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                </div>
                <div className="col-span-7">
                  <p className="text-sm text-gray-900">{concern.description}</p>
                </div>
                <div className="col-span-4 flex items-center justify-end gap-2">
                  <span className="text-sm text-gray-600">{concern.finding}</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>
                        <Eye className="h-4 w-4 mr-2" />
                        Copy to Estimate (1)
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
            
            <Button 
              variant="ghost" 
              className="w-fit text-sm text-gray-600 hover:text-gray-900 p-0 h-auto font-normal"
              disabled
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Concern
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Created Inspection Forms Section */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">Created Inspection Forms</CardTitle>
            <Badge variant="secondary" className="ml-auto">{inspectionTasks.length}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {inspectionTasks.map((task) => (
              <div key={task.id} className="p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(task.status)}
                    <div>
                      <h4 className="font-medium text-gray-900">{task.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {task.type === "specific-part" ? "Specific Part" : "Full Vehicle"}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          Created {new Date(task.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getRatingColor(task.status)}>
                      {task.status}
                    </Badge>
                    {task.status === "pending" && (
                      <Button 
                        size="sm" 
                        onClick={() => openAssignDialog(task.id)}
                        className="bg-[#154c79] hover:bg-[#123a5c] text-white"
                      >
                        Assign Tech
                      </Button>
                    )}
                  </div>
                </div>
                
                {task.assignedTo && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-gray-600">Assigned to:</span>
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={task.assignedTo.avatar} />
                      <AvatarFallback>{task.assignedTo.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{task.assignedTo.name}</span>
                  </div>
                )}
                
                {task.status === "completed" && (
                  <div className="mt-4 space-y-4">
                    {/* Rating */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">Rating:</span>
                      <Badge className={getRatingColor(task.rating || "good")}>
                        {task.rating || "Not rated"}
                      </Badge>
                    </div>

                    {/* Findings */}
                    {task.findings && (
                      <div className="p-3 bg-gray-50 rounded border">
                        <p className="text-sm font-medium text-gray-700 mb-2">Findings:</p>
                        <p className="text-sm text-gray-600">{task.findings}</p>
                      </div>
                    )}

                    {/* Images */}
                    {task.images && task.images.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Images:</p>
                        <div className="flex gap-2 flex-wrap">
                          {task.images.map((image, index) => (
                            <div key={index} className="relative group">
                              <div className="w-24 h-24 bg-gray-200 rounded border overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
                                <img 
                                  src={image.startsWith('C:') ? '/placeholder-image.jpg' : image}
                                  alt={`Inspection image ${index + 1}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                  }}
                                />
                                <div className="hidden w-full h-full flex items-center justify-center bg-gray-200">
                                  <span className="text-xs text-gray-500">IMG {index + 1}</span>
                                </div>
                              </div>
                              <div className="absolute bottom-1 left-1 bg-black bg-opacity-75 text-white text-xs px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                {image.split('/').pop()?.split('\\').pop()}
                              </div>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Click images to view full size</p>
                      </div>
                    )}

                    {/* Parts Needed */}
                    {task.partsNeeded && task.partsNeeded.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Parts Needed to Fix:</p>
                        <div className="space-y-2">
                          {task.partsNeeded.map((part) => (
                            <div key={part.id} className="flex items-center justify-between p-2 bg-blue-50 rounded border">
                              <div>
                                <p className="text-sm font-medium text-gray-900">{part.name}</p>
                                <p className="text-xs text-gray-600">Qty: {part.quantity}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium text-green-600">${part.estimatedCost}</p>
                              </div>
                            </div>
                          ))}
                          <div className="pt-2 border-t">
                            <p className="text-sm font-medium text-gray-900">
                              Total Estimated Cost: $
                              {task.partsNeeded.reduce((total, part) => total + (part.estimatedCost * part.quantity), 0).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            {inspectionTasks.length === 0 && (
              <p className="text-gray-500 text-center py-8">No inspection forms created yet.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add New Inspection Dialog */}
      <Dialog open={isAddInspectionOpen} onOpenChange={setIsAddInspectionOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Inspection</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Inspection Type</label>
              <Select value={newInspectionType} onValueChange={(value: "specific-part" | "full-vehicle") => setNewInspectionType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose inspection type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="specific-part">Specific Part Inspection</SelectItem>
                  <SelectItem value="full-vehicle">Full Vehicle Check-up</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Inspection Title</label>
              <Input 
                value={newInspectionTitle}
                onChange={(e) => setNewInspectionTitle(e.target.value)}
                placeholder="Enter inspection description"
              />
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsAddInspectionOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddInspection}
                className="flex-1 bg-[#154c79] hover:bg-[#123a5c]"
                disabled={!newInspectionType || !newInspectionTitle}
              >
                Create Inspection
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Technician Dialog */}
      <Dialog open={isAssignTechOpen} onOpenChange={setIsAssignTechOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Technician</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Technician</label>
              <Select value={assignedTech} onValueChange={setAssignedTech}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose technician" />
                </SelectTrigger>
                <SelectContent>
                  {availableTechnicians.map((tech) => (
                    <SelectItem key={tech.id} value={tech.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={tech.avatar} />
                          <AvatarFallback>{tech.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        {tech.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsAssignTechOpen(false)
                  setSelectedTaskForAssignment(null)
                  setAssignedTech("")
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAssignTechnician}
                className="flex-1 bg-[#154c79] hover:bg-[#123a5c]"
                disabled={!assignedTech}
              >
                Assign Technician
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Customer Concern Dialog */}
      <Dialog open={isAddConcernOpen} onOpenChange={setIsAddConcernOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Customer Concern</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Customer states</label>
              <Textarea 
                value={newConcernDescription}
                onChange={(e) => setNewConcernDescription(e.target.value)}
                placeholder="Enter what the customer is reporting..."
                className="min-h-[80px]"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Finding (Optional)</label>
              <Textarea 
                value={newConcernFinding}
                onChange={(e) => setNewConcernFinding(e.target.value)}
                placeholder="Enter initial findings or leave blank..."
                className="min-h-[80px]"
              />
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsAddConcernOpen(false)
                  setNewConcernDescription("")
                  setNewConcernFinding("")
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddConcern}
                className="flex-1 bg-[#154c79] hover:bg-[#123a5c]"
                disabled={!newConcernDescription.trim()}
              >
                Add Concern
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Customer Concern Dialog */}
      <Dialog open={isEditConcernOpen} onOpenChange={setIsEditConcernOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Customer Concern</DialogTitle>
          </DialogHeader>
          {selectedConcern && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Customer states</label>
                <Textarea 
                  value={selectedConcern.description}
                  onChange={(e) => setSelectedConcern({...selectedConcern, description: e.target.value})}
                  className="min-h-[80px]"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Finding</label>
                <Textarea 
                  value={selectedConcern.finding}
                  onChange={(e) => setSelectedConcern({...selectedConcern, finding: e.target.value})}
                  className="min-h-[80px]"
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditConcernOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveConcern}
                  className="flex-1 bg-[#154c79] hover:bg-[#123a5c]"
                >
                  Save
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
