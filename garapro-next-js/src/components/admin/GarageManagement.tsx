'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  Search, 
  MoreHorizontal, 
  Building2, 
  Globe,
  Ban,
  CheckCircle,
  Calendar,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  Users,
  Plus
} from 'lucide-react'

const garages = [
  {
    id: 1,
    name: 'AutoFix Garage',
    owner: 'John Smith',
    email: 'john@autofix.com',
    phone: '+1 (555) 123-4567',
    address: '123 Main St, City, State',
    domain: 'autofix.garapro.com',
    status: 'active',
    joinedDate: '2024-01-15',
    lastActive: '2024-03-20 14:30',
    avatar: 'AG',
    technicians: 8,
    totalOrders: 156,
    totalRevenue: 12500.50,
    verified: true,
    rating: 4.8,
    services: ['Oil Change', 'Brake Repair', 'Engine Diagnostic'],
    businessHours: 'Mon-Fri: 8AM-6PM, Sat: 9AM-4PM'
  },
  {
    id: 2,
    name: 'Quick Service Center',
    owner: 'Sarah Johnson',
    email: 'sarah@quickservice.com',
    phone: '+1 (555) 987-6543',
    address: '456 Oak Ave, City, State',
    domain: 'quickservice.garapro.com',
    status: 'active',
    joinedDate: '2024-01-20',
    lastActive: '2024-03-20 16:45',
    avatar: 'QC',
    technicians: 5,
    totalOrders: 89,
    totalRevenue: 8900.25,
    verified: true,
    rating: 4.6,
    services: ['Tire Rotation', 'AC Repair', 'Battery Service'],
    businessHours: 'Mon-Sat: 7AM-7PM'
  },
  {
    id: 3,
    name: 'Premium Auto Care',
    owner: 'Mike Wilson',
    email: 'mike@premiumauto.com',
    phone: '+1 (555) 456-7890',
    address: '789 Pine Rd, City, State',
    domain: 'premiumauto.garapro.com',
    status: 'banned',
    joinedDate: '2024-02-01',
    lastActive: '2024-03-15 09:20',
    avatar: 'PA',
    technicians: 12,
    totalOrders: 234,
    totalRevenue: 18900.75,
    verified: false,
    rating: 3.2,
    services: ['Full Service', 'Performance Tuning', 'Body Work'],
    businessHours: 'Mon-Fri: 9AM-5PM'
  },
  {
    id: 4,
    name: 'Express Lube',
    owner: 'Lisa Brown',
    email: 'lisa@expresslube.com',
    phone: '+1 (555) 321-6547',
    address: '321 Elm St, City, State',
    domain: 'expresslube.garapro.com',
    status: 'active',
    joinedDate: '2024-01-25',
    lastActive: '2024-03-20 12:15',
    avatar: 'EL',
    technicians: 6,
    totalOrders: 112,
    totalRevenue: 9800.00,
    verified: true,
    rating: 4.7,
    services: ['Quick Lube', 'Filter Change', 'Fluid Check'],
    businessHours: 'Mon-Sat: 8AM-6PM, Sun: 10AM-4PM'
  },
  {
    id: 5,
    name: 'City Auto Repair',
    owner: 'David Chen',
    email: 'david@cityauto.com',
    phone: '+1 (555) 234-5678',
    address: '654 Maple Dr, City, State',
    domain: 'cityauto.garapro.com',
    status: 'active',
    joinedDate: '2024-02-15',
    lastActive: '2024-03-19 18:30',
    avatar: 'CA',
    technicians: 10,
    totalOrders: 178,
    totalRevenue: 15200.00,
    verified: true,
    rating: 4.9,
    services: ['Electrical Repair', 'Transmission Service', 'Suspension Work'],
    businessHours: 'Mon-Fri: 7AM-8PM, Sat: 8AM-5PM'
  }
]

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active':
      return <Badge className="bg-green-100 text-green-800">Active</Badge>
    case 'banned':
      return <Badge variant="destructive">Banned</Badge>
    case 'inactive':
      return <Badge variant="secondary">Inactive</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

export function GarageManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [verifiedFilter, setVerifiedFilter] = useState('all')
  const [selectedGarage, setSelectedGarage] = useState<any>(null)
  const [isBanDialogOpen, setIsBanDialogOpen] = useState(false)
  const [isUnbanDialogOpen, setIsUnbanDialogOpen] = useState(false)
  const [isDomainDialogOpen, setIsDomainDialogOpen] = useState(false)
  const [isGarageDetailsDialogOpen, setIsGarageDetailsDialogOpen] = useState(false)
  const [isTechniciansDialogOpen, setIsTechniciansDialogOpen] = useState(false)
  const [newDomain, setNewDomain] = useState('')

  const filteredGarages = garages.filter(garage => {
    const matchesSearch = garage.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         garage.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         garage.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || garage.status === statusFilter
    const matchesVerified = verifiedFilter === 'all' || 
                           (verifiedFilter === 'verified' && garage.verified) ||
                           (verifiedFilter === 'unverified' && !garage.verified)
    return matchesSearch && matchesStatus && matchesVerified
  })

  const handleBanGarage = (garage: any) => {
    setSelectedGarage(garage)
    setIsBanDialogOpen(true)
  }

  const handleUnbanGarage = (garage: any) => {
    setSelectedGarage(garage)
    setIsUnbanDialogOpen(true)
  }

  const handleCreateDomain = (garage: any) => {
    setSelectedGarage(garage)
    setIsDomainDialogOpen(true)
  }

  const confirmBan = () => {
    console.log(`Banning garage: ${selectedGarage?.name}`)
    setIsBanDialogOpen(false)
    setSelectedGarage(null)
  }

  const confirmUnban = () => {
    console.log(`Unbanning garage: ${selectedGarage?.name}`)
    setIsUnbanDialogOpen(false)
    setSelectedGarage(null)
  }

  const confirmCreateDomain = () => {
    console.log(`Creating domain: ${newDomain} for ${selectedGarage?.name}`)
    setNewDomain('')
    setIsDomainDialogOpen(false)
    setSelectedGarage(null)
  }

  const handleGarageDetails = (garage: any) => {
    setSelectedGarage(garage)
    setIsGarageDetailsDialogOpen(true)
  }

  const handleViewTechnicians = (garage: any) => {
    setSelectedGarage(garage)
    setIsTechniciansDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search garages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="banned">Banned</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              value={verifiedFilter}
              onChange={(e) => setVerifiedFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Verification</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Garages Table */}
      <Card>
        <CardHeader>
          <CardTitle>Garages ({filteredGarages.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Garage</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Verified</TableHead>
                <TableHead>Technicians</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGarages.map((garage) => (
                <TableRow key={garage.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>{garage.avatar}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{garage.name}</div>
                        <div className="text-sm text-gray-500">{garage.owner}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-1 text-sm">
                        <Mail className="h-3 w-3 text-gray-400" />
                        <span>{garage.email}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-sm">
                        <Phone className="h-3 w-3 text-gray-400" />
                        <span>{garage.phone}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4 text-blue-600" />
                      <a 
                        href={`https://${garage.domain}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm flex items-center space-x-1"
                      >
                        <span>{garage.domain}</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(garage.status)}</TableCell>
                  <TableCell>
                    {garage.verified ? (
                      <Badge className="bg-green-100 text-green-800">Verified</Badge>
                    ) : (
                      <Badge variant="secondary">Unverified</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">{garage.technicians} techs</div>
                      <div className="text-gray-500">{garage.totalOrders} orders</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="flex items-center space-x-1">
                        <span className="font-medium">{garage.rating}</span>
                        <span className="text-yellow-500">★</span>
                      </div>
                      <div className="text-gray-500">${garage.totalRevenue.toLocaleString()}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3 text-gray-400" />
                      <span className="text-sm">{garage.joinedDate}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-500">{garage.lastActive}</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleGarageDetails(garage)}>
                          <Building2 className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleViewTechnicians(garage)}>
                          <Users className="mr-2 h-4 w-4" />
                          View Technicians
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <MapPin className="mr-2 h-4 w-4" />
                          View Location
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleCreateDomain(garage)}>
                          <Globe className="mr-2 h-4 w-4" />
                          Create Domain
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {garage.status === 'active' ? (
                          <DropdownMenuItem 
                            onClick={() => handleBanGarage(garage)}
                            className="text-red-600"
                          >
                            <Ban className="mr-2 h-4 w-4" />
                            Ban Garage
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem 
                            onClick={() => handleUnbanGarage(garage)}
                            className="text-green-600"
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Unban Garage
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Ban Dialog */}
      <Dialog open={isBanDialogOpen} onOpenChange={setIsBanDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ban Garage</DialogTitle>
            <DialogDescription>
              Are you sure you want to ban {selectedGarage?.name}? This action will prevent them from accessing the platform.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBanDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmBan}>
              Ban Garage
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unban Dialog */}
      <Dialog open={isUnbanDialogOpen} onOpenChange={setIsUnbanDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Unban Garage</DialogTitle>
            <DialogDescription>
              Are you sure you want to unban {selectedGarage?.name}? This will restore their access to the platform.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUnbanDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmUnban}>
              Unban Garage
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Garage Details Dialog */}
      <Dialog open={isGarageDetailsDialogOpen} onOpenChange={setIsGarageDetailsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Garage Details: {selectedGarage?.name}</DialogTitle>
          </DialogHeader>
          {selectedGarage && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg">{selectedGarage.avatar}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{selectedGarage.name}</h3>
                  <p className="text-gray-600">Owner: {selectedGarage.owner}</p>
                  <p className="text-gray-600">{selectedGarage.domain}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedGarage.status)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Verification</label>
                  <div className="mt-1">
                    {selectedGarage.verified ? (
                      <Badge className="bg-green-100 text-green-800">Verified</Badge>
                    ) : (
                      <Badge variant="secondary">Unverified</Badge>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Rating</label>
                  <div className="flex items-center space-x-1 mt-1">
                    <span className="font-medium">{selectedGarage.rating}</span>
                    <span className="text-yellow-500">★</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Technicians</label>
                  <p className="text-sm">{selectedGarage.technicians}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Total Orders</label>
                  <p className="text-sm">{selectedGarage.totalOrders}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Total Revenue</label>
                  <p className="text-sm">${selectedGarage.totalRevenue.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Joined Date</label>
                  <p className="text-sm">{selectedGarage.joinedDate}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Last Active</label>
                  <p className="text-sm">{selectedGarage.lastActive}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Services Offered</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedGarage.services.map((service: string) => (
                    <Badge key={service} variant="secondary">
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Business Hours</label>
                <p className="text-sm">{selectedGarage.businessHours}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Contact Information</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{selectedGarage.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{selectedGarage.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2 md:col-span-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{selectedGarage.address}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Actions</label>
                <div className="flex space-x-2 mt-2">
                  <Button variant="outline" size="sm">
                    <Mail className="mr-2 h-4 w-4" />
                    Send Email
                  </Button>
                  <Button variant="outline" size="sm">
                    <Phone className="mr-2 h-4 w-4" />
                    Call Owner
                  </Button>
                  <Button variant="outline" size="sm">
                    <MapPin className="mr-2 h-4 w-4" />
                    View Location
                  </Button>
                  <Button variant="outline" size="sm">
                    <Users className="mr-2 h-4 w-4" />
                    Manage Technicians
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Technicians Dialog */}
      <Dialog open={isTechniciansDialogOpen} onOpenChange={setIsTechniciansDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Technicians - {selectedGarage?.name}</DialogTitle>
            <DialogDescription>
              Manage technicians for this garage
            </DialogDescription>
          </DialogHeader>
          {selectedGarage && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    {selectedGarage.technicians} technicians registered
                  </p>
                </div>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Technician
                </Button>
              </div>

              <div className="border rounded-lg">
                <div className="p-4 bg-gray-50 border-b">
                  <h4 className="font-medium">Technician Management</h4>
                  <p className="text-sm text-gray-600">
                    Each garage can manage their own technicians with individual accounts
                  </p>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="border rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">Active Technicians</div>
                          <div className="text-sm text-gray-500">
                            {Math.floor(selectedGarage.technicians * 0.8)} online
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="border rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium">Verified Techs</div>
                          <div className="text-sm text-gray-500">
                            {Math.floor(selectedGarage.technicians * 0.9)} certified
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="border rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                          <Calendar className="h-4 w-4 text-orange-600" />
                        </div>
                        <div>
                          <div className="font-medium">This Month</div>
                          <div className="text-sm text-gray-500">
                            {Math.floor(selectedGarage.totalOrders * 0.3)} orders
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Technician Management System
                </h3>
                <p className="text-gray-600 mb-4">
                  Each garage manages their own technicians with individual accounts, 
                  schedules, and performance tracking.
                </p>
                <div className="flex justify-center space-x-2">
                  <Button variant="outline">
                    <Users className="mr-2 h-4 w-4" />
                    View All Technicians
                  </Button>
                  <Button variant="outline">
                    <Calendar className="mr-2 h-4 w-4" />
                    Manage Schedules
                  </Button>
                  <Button variant="outline">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Performance Reports
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Domain Dialog */}
      <Dialog open={isDomainDialogOpen} onOpenChange={setIsDomainDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Domain</DialogTitle>
            <DialogDescription>
              Create a new subdomain for {selectedGarage?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Domain Name</label>
              <div className="flex items-center space-x-2 mt-1">
                <Input
                  placeholder="garage-name"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                />
                <span className="text-gray-500">.garapro.com</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDomainDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmCreateDomain}>
              Create Domain
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 