'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
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
  Plus, 
  Globe,
  Settings,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  Copy,
  Edit,
  Trash2,
  AlertTriangle
} from 'lucide-react'

const domains = [
  {
    id: 1,
    subdomain: 'autofix',
    fullDomain: 'autofix.garapro.com',
    garageName: 'AutoFix Garage',
    status: 'active',
    sslStatus: 'valid',
    dnsStatus: 'configured',
    createdAt: '2024-01-15',
    lastChecked: '2024-03-20 14:30',
    ipAddress: '192.168.1.100',
    sslExpiry: '2025-01-15'
  },
  {
    id: 2,
    subdomain: 'quickservice',
    fullDomain: 'quickservice.garapro.com',
    garageName: 'Quick Service Center',
    status: 'active',
    sslStatus: 'valid',
    dnsStatus: 'configured',
    createdAt: '2024-01-20',
    lastChecked: '2024-03-20 16:45',
    ipAddress: '192.168.1.101',
    sslExpiry: '2025-01-20'
  },
  {
    id: 3,
    subdomain: 'expresslube',
    fullDomain: 'expresslube.garapro.com',
    garageName: 'Express Lube',
    status: 'pending',
    sslStatus: 'pending',
    dnsStatus: 'pending',
    createdAt: '2024-03-20',
    lastChecked: '2024-03-20 12:15',
    ipAddress: '192.168.1.102',
    sslExpiry: '2025-03-20'
  },
  {
    id: 4,
    subdomain: 'premiumauto',
    fullDomain: 'premiumauto.garapro.com',
    garageName: 'Premium Auto Care',
    status: 'suspended',
    sslStatus: 'expired',
    dnsStatus: 'error',
    createdAt: '2024-02-01',
    lastChecked: '2024-03-15 09:20',
    ipAddress: '192.168.1.103',
    sslExpiry: '2024-02-01'
  }
]

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active':
      return <Badge className="bg-green-100 text-green-800">Active</Badge>
    case 'pending':
      return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
    case 'suspended':
      return <Badge variant="destructive">Suspended</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

const getSSLStatusBadge = (status: string) => {
  switch (status) {
    case 'valid':
      return <Badge className="bg-green-100 text-green-800">Valid</Badge>
    case 'pending':
      return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
    case 'expired':
      return <Badge variant="destructive">Expired</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

const getDNSStatusBadge = (status: string) => {
  switch (status) {
    case 'configured':
      return <Badge className="bg-green-100 text-green-800">Configured</Badge>
    case 'pending':
      return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
    case 'error':
      return <Badge variant="destructive">Error</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

export function DomainManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedDomain, setSelectedDomain] = useState<any>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false)
  const [newDomain, setNewDomain] = useState({
    subdomain: '',
    garageName: '',
    ipAddress: ''
  })

  const filteredDomains = domains.filter(domain => {
    const matchesSearch = domain.subdomain.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         domain.garageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         domain.fullDomain.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || domain.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleCreateDomain = () => {
    setNewDomain({ subdomain: '', garageName: '', ipAddress: '' })
    setIsCreateDialogOpen(true)
  }

  const handleEditDomain = (domain: any) => {
    setSelectedDomain(domain)
    setIsEditDialogOpen(true)
  }

  const handleDomainSettings = (domain: any) => {
    setSelectedDomain(domain)
    setIsSettingsDialogOpen(true)
  }

  const confirmCreateDomain = () => {
    console.log('Creating domain:', newDomain)
    setIsCreateDialogOpen(false)
    setNewDomain({ subdomain: '', garageName: '', ipAddress: '' })
  }

  const confirmEditDomain = () => {
    console.log('Editing domain:', selectedDomain)
    setIsEditDialogOpen(false)
    setSelectedDomain(null)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Domains Overview</h2>
          <p className="text-sm text-gray-600">Manage garage subdomains and DNS settings</p>
        </div>
        <Button onClick={handleCreateDomain}>
          <Plus className="mr-2 h-4 w-4" />
          Create Domain
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search domains..."
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
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Domains Table */}
      <Card>
        <CardHeader>
          <CardTitle>Domains ({filteredDomains.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Domain</TableHead>
                <TableHead>Garage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>SSL</TableHead>
                <TableHead>DNS</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDomains.map((domain) => (
                <TableRow key={domain.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4 text-blue-600" />
                      <div>
                        <div className="font-medium">{domain.fullDomain}</div>
                        <div className="text-sm text-gray-500">{domain.subdomain}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{domain.garageName}</div>
                  </TableCell>
                  <TableCell>{getStatusBadge(domain.status)}</TableCell>
                  <TableCell>{getSSLStatusBadge(domain.sslStatus)}</TableCell>
                  <TableCell>{getDNSStatusBadge(domain.dnsStatus)}</TableCell>
                  <TableCell>
                    <div className="text-sm font-mono">{domain.ipAddress}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-500">{domain.createdAt}</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(domain.fullDomain)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`https://${domain.fullDomain}`, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDomainSettings(domain)}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditDomain(domain)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Domain Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Domain</DialogTitle>
            <DialogDescription>
              Create a new subdomain for a garage
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="subdomain">Subdomain</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="subdomain"
                  value={newDomain.subdomain}
                  onChange={(e) => setNewDomain({ ...newDomain, subdomain: e.target.value })}
                  placeholder="garage-name"
                />
                <span className="text-gray-500">.garapro.com</span>
              </div>
            </div>
            <div>
              <Label htmlFor="garage-name">Garage Name</Label>
              <Input
                id="garage-name"
                value={newDomain.garageName}
                onChange={(e) => setNewDomain({ ...newDomain, garageName: e.target.value })}
                placeholder="Enter garage name"
              />
            </div>
            <div>
              <Label htmlFor="ip-address">IP Address (Optional)</Label>
              <Input
                id="ip-address"
                value={newDomain.ipAddress}
                onChange={(e) => setNewDomain({ ...newDomain, ipAddress: e.target.value })}
                placeholder="192.168.1.100"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmCreateDomain}>
              Create Domain
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Domain Settings Dialog */}
      <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Domain Settings: {selectedDomain?.fullDomain}</DialogTitle>
          </DialogHeader>
          {selectedDomain && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">SSL Status</label>
                  <div className="mt-1">{getSSLStatusBadge(selectedDomain.sslStatus)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">SSL Expiry</label>
                  <p className="text-sm">{selectedDomain.sslExpiry}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">DNS Status</label>
                  <div className="mt-1">{getDNSStatusBadge(selectedDomain.dnsStatus)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Last Checked</label>
                  <p className="text-sm">{selectedDomain.lastChecked}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">DNS Records</label>
                <div className="space-y-2 mt-2">
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div>
                      <div className="text-sm font-medium">A Record</div>
                      <div className="text-xs text-gray-500">{selectedDomain.fullDomain} → {selectedDomain.ipAddress}</div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div>
                      <div className="text-sm font-medium">CNAME Record</div>
                      <div className="text-xs text-gray-500">www.{selectedDomain.subdomain} → {selectedDomain.fullDomain}</div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Actions</label>
                <div className="flex space-x-2 mt-2">
                  <Button variant="outline" size="sm">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Renew SSL
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="mr-2 h-4 w-4" />
                    Update DNS
                  </Button>
                  <Button variant="outline" size="sm">
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Check Status
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Domain Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Domain: {selectedDomain?.fullDomain}</DialogTitle>
          </DialogHeader>
          {selectedDomain && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-garage-name">Garage Name</Label>
                <Input
                  id="edit-garage-name"
                  value={selectedDomain.garageName}
                  onChange={(e) => setSelectedDomain({ ...selectedDomain, garageName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-ip-address">IP Address</Label>
                <Input
                  id="edit-ip-address"
                  value={selectedDomain.ipAddress}
                  onChange={(e) => setSelectedDomain({ ...selectedDomain, ipAddress: e.target.value })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="auto-renewal"
                  checked={true}
                />
                <Label htmlFor="auto-renewal">Auto-renewal SSL</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmEditDomain}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 