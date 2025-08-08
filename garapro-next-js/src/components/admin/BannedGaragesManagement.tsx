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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  Search, 
  Building2, 
  CheckCircle, 
  AlertTriangle,
  Calendar,
  Clock,
  Ban,
  Eye,
  Mail,
  Phone,
  MapPin
} from 'lucide-react'

const bannedGarages = [
  {
    id: 1,
    name: 'Premium Auto Care',
    owner: 'Mike Wilson',
    email: 'mike@premiumauto.com',
    phone: '+1 (555) 456-7890',
    address: '789 Pine Rd, City, State',
    domain: 'premiumauto.garapro.com',
    banReason: 'Fraudulent activity and fake reviews',
    banDate: '2024-03-15',
    bannedBy: 'admin@garapro.com',
    banType: 'permanent',
    appealStatus: 'pending',
    lastActive: '2024-03-15 09:20',
    technicians: 8,
    totalOrders: 156,
    avatar: 'PA'
  },
  {
    id: 2,
    name: 'Quick Fix Garage',
    owner: 'Tom Anderson',
    email: 'tom@quickfix.com',
    phone: '+1 (555) 123-7890',
    address: '456 Oak St, City, State',
    domain: 'quickfix.garapro.com',
    banReason: 'Multiple customer complaints',
    banDate: '2024-03-10',
    bannedBy: 'moderator@garapro.com',
    banType: 'temporary',
    appealStatus: 'approved',
    lastActive: '2024-03-10 14:30',
    technicians: 5,
    totalOrders: 89,
    avatar: 'QF'
  },
  {
    id: 3,
    name: 'City Auto Repair',
    owner: 'Lisa Chen',
    email: 'lisa@cityauto.com',
    phone: '+1 (555) 987-6543',
    address: '321 Elm Ave, City, State',
    domain: 'cityauto.garapro.com',
    banReason: 'Unsafe practices reported',
    banDate: '2024-03-08',
    bannedBy: 'admin@garapro.com',
    banType: 'permanent',
    appealStatus: 'rejected',
    lastActive: '2024-03-08 11:15',
    technicians: 12,
    totalOrders: 234,
    avatar: 'CA'
  }
]

const getBanTypeBadge = (type: string) => {
  switch (type) {
    case 'permanent':
      return <Badge variant="destructive">Permanent</Badge>
    case 'temporary':
      return <Badge className="bg-yellow-100 text-yellow-800">Temporary</Badge>
    default:
      return <Badge variant="secondary">{type}</Badge>
  }
}

const getAppealStatusBadge = (status: string) => {
  switch (status) {
    case 'pending':
      return <Badge className="bg-blue-100 text-blue-800">Pending</Badge>
    case 'approved':
      return <Badge className="bg-green-100 text-green-800">Approved</Badge>
    case 'rejected':
      return <Badge variant="destructive">Rejected</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

export function BannedGaragesManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [banTypeFilter, setBanTypeFilter] = useState('all')
  const [selectedGarage, setSelectedGarage] = useState<any>(null)
  const [isUnbanDialogOpen, setIsUnbanDialogOpen] = useState(false)
  const [isViewDetailsDialogOpen, setIsViewDetailsDialogOpen] = useState(false)

  const filteredGarages = bannedGarages.filter(garage => {
    const matchesSearch = garage.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         garage.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         garage.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = banTypeFilter === 'all' || garage.banType === banTypeFilter
    return matchesSearch && matchesType
  })

  const handleUnbanGarage = (garage: any) => {
    setSelectedGarage(garage)
    setIsUnbanDialogOpen(true)
  }

  const handleViewDetails = (garage: any) => {
    setSelectedGarage(garage)
    setIsViewDetailsDialogOpen(true)
  }

  const confirmUnban = () => {
    console.log(`Unbanning garage: ${selectedGarage?.name}`)
    setIsUnbanDialogOpen(false)
    setSelectedGarage(null)
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search banned garages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={banTypeFilter}
              onChange={(e) => setBanTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Ban Types</option>
              <option value="permanent">Permanent</option>
              <option value="temporary">Temporary</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Banned Garages Table */}
      <Card>
        <CardHeader>
          <CardTitle>Banned Garages ({filteredGarages.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Garage</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Ban Reason</TableHead>
                <TableHead>Ban Type</TableHead>
                <TableHead>Ban Date</TableHead>
                <TableHead>Appeal Status</TableHead>
                <TableHead>Technicians</TableHead>
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
                        <div className="text-sm text-gray-500">{garage.domain}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{garage.owner}</div>
                      <div className="text-sm text-gray-500">{garage.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate" title={garage.banReason}>
                      {garage.banReason}
                    </div>
                  </TableCell>
                  <TableCell>{getBanTypeBadge(garage.banType)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3 text-gray-400" />
                      <span className="text-sm">{garage.banDate}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getAppealStatusBadge(garage.appealStatus)}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{garage.technicians} techs</div>
                      <div className="text-gray-500">{garage.totalOrders} orders</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(garage)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUnbanGarage(garage)}
                        className="text-green-600 hover:text-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Unban
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
            <Button onClick={confirmUnban} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="mr-2 h-4 w-4" />
              Unban Garage
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Garage Details Dialog */}
      <Dialog open={isViewDetailsDialogOpen} onOpenChange={setIsViewDetailsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Garage Details</DialogTitle>
          </DialogHeader>
          {selectedGarage && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg">{selectedGarage.avatar}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{selectedGarage.name}</h3>
                  <p className="text-gray-600">{selectedGarage.domain}</p>
                  <p className="text-gray-600">Owner: {selectedGarage.owner}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Ban Reason</label>
                  <p className="text-sm bg-red-50 p-3 rounded mt-1">{selectedGarage.banReason}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Ban Type</label>
                  <div className="mt-1">{getBanTypeBadge(selectedGarage.banType)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Ban Date</label>
                  <p className="text-sm">{selectedGarage.banDate}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Banned By</label>
                  <p className="text-sm">{selectedGarage.bannedBy}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Appeal Status</label>
                  <div className="mt-1">{getAppealStatusBadge(selectedGarage.appealStatus)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Last Activity</label>
                  <p className="text-sm">{selectedGarage.lastActive}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Technicians</label>
                  <p className="text-sm">{selectedGarage.technicians}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Total Orders</label>
                  <p className="text-sm">{selectedGarage.totalOrders}</p>
                </div>
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
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Review Appeal
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 