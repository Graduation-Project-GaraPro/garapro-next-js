'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Shield, 
  Lock, 
  Users, 
  Building2, 
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  Filter,
  Download
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Policy {
  id: string
  name: string
  description: string
  category: 'security' | 'privacy' | 'data' | 'access' | 'compliance'
  status: 'active' | 'inactive' | 'draft'
  priority: 'low' | 'medium' | 'high' | 'critical'
  scope: 'global' | 'user' | 'garage' | 'admin'
  version: string
  createdAt: string
  updatedAt: string
  createdBy: string
}

const mockPolicies: Policy[] = [
  {
    id: '1',
    name: 'Password Security Policy',
    description: 'Enforces strong password requirements and regular password changes',
    category: 'security',
    status: 'active',
    priority: 'high',
    scope: 'global',
    version: '2.1.0',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-03-20T14:30:00Z',
    createdBy: 'admin@garapro.com'
  },
  {
    id: '2',
    name: 'Data Privacy Policy',
    description: 'Ensures compliance with GDPR and data protection regulations',
    category: 'privacy',
    status: 'active',
    priority: 'critical',
    scope: 'global',
    version: '1.5.2',
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-03-18T16:45:00Z',
    createdBy: 'admin@garapro.com'
  },
  {
    id: '3',
    name: 'User Access Control',
    description: 'Defines user access levels and permissions based on roles',
    category: 'access',
    status: 'active',
    priority: 'high',
    scope: 'user',
    version: '1.2.0',
    createdAt: '2024-01-20T11:30:00Z',
    updatedAt: '2024-03-15T13:20:00Z',
    createdBy: 'admin@garapro.com'
  }
]

const categoryColors = {
  security: 'bg-red-100 text-red-800',
  privacy: 'bg-blue-100 text-blue-800',
  data: 'bg-green-100 text-green-800',
  access: 'bg-purple-100 text-purple-800',
  compliance: 'bg-orange-100 text-orange-800'
}

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800'
}

const statusColors = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  draft: 'bg-yellow-100 text-yellow-800'
}

export function PolicyManagement() {
  const [policies, setPolicies] = useState<Policy[]>(mockPolicies)
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')

  const filteredPolicies = policies.filter(policy => {
    const matchesSearch = policy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         policy.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || policy.category === filterCategory
    const matchesStatus = filterStatus === 'all' || policy.status === filterStatus
    const matchesPriority = filterPriority === 'all' || policy.priority === filterPriority

    return matchesSearch && matchesCategory && matchesStatus && matchesPriority
  })

  const handleCreatePolicy = (newPolicy: Omit<Policy, 'id' | 'createdAt' | 'updatedAt'>) => {
    const policy: Policy = {
      ...newPolicy,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setPolicies(prev => [...prev, policy])
    setIsCreateDialogOpen(false)
  }

  const handleUpdatePolicy = (updatedPolicy: Policy) => {
    setPolicies(prev => prev.map(policy => 
      policy.id === updatedPolicy.id 
        ? { ...updatedPolicy, updatedAt: new Date().toISOString() }
        : policy
    ))
    setIsEditDialogOpen(false)
  }

  const handleDeletePolicy = (policyId: string) => {
    setPolicies(prev => prev.filter(policy => policy.id !== policyId))
  }

  const exportPolicies = () => {
    const dataStr = JSON.stringify(policies, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'policies-export.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Policy Management</h1>
          <p className="text-gray-600 mt-1">Manage system policies, security rules, and compliance requirements</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={exportPolicies}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Policy
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search policies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="privacy">Privacy</SelectItem>
                  <SelectItem value="data">Data</SelectItem>
                  <SelectItem value="access">Access</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Policies</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{policies.length}</div>
            <p className="text-xs text-muted-foreground">
              +2 from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Policies</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {policies.filter(p => p.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {((policies.filter(p => p.status === 'active').length / policies.length) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Policies</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {policies.filter(p => p.priority === 'critical').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98.5%</div>
            <p className="text-xs text-muted-foreground">
              +1.2% from last audit
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Policies Table */}
      <Card>
        <CardHeader>
          <CardTitle>Policies</CardTitle>
          <CardDescription>
            Manage system policies and their configurations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPolicies.map((policy) => (
                <TableRow key={policy.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{policy.name}</div>
                      <div className="text-sm text-gray-500">{policy.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn(categoryColors[policy.category])}>
                      {policy.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn(statusColors[policy.status])}>
                      {policy.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn(priorityColors[policy.priority])}>
                      {policy.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-mono">{policy.version}</span>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-500">
                      {new Date(policy.updatedAt).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedPolicy(policy)
                          setIsViewDialogOpen(true)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedPolicy(policy)
                          setIsEditDialogOpen(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Policy</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{policy.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeletePolicy(policy.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Policy Dialog */}
      <CreatePolicyDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreatePolicy}
      />

      {/* Edit Policy Dialog */}
      {selectedPolicy && (
        <EditPolicyDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          policy={selectedPolicy}
          onSubmit={handleUpdatePolicy}
        />
      )}

      {/* View Policy Dialog */}
      {selectedPolicy && (
        <ViewPolicyDialog
          open={isViewDialogOpen}
          onOpenChange={setIsViewDialogOpen}
          policy={selectedPolicy}
        />
      )}
    </div>
  )
}

// Create Policy Dialog Component
function CreatePolicyDialog({ 
  open, 
  onOpenChange, 
  onSubmit 
}: { 
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (policy: Omit<Policy, 'id' | 'createdAt' | 'updatedAt'>) => void
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'security' as Policy['category'],
    status: 'draft' as Policy['status'],
    priority: 'medium' as Policy['priority'],
    scope: 'global' as Policy['scope'],
    version: '1.0.0'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      createdBy: 'admin@garapro.com'
    })
    setFormData({
      name: '',
      description: '',
      category: 'security',
      status: 'draft',
      priority: 'medium',
      scope: 'global',
      version: '1.0.0'
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Policy</DialogTitle>
          <DialogDescription>
            Create a new system policy with rules and compliance requirements.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Policy Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="version">Version</Label>
              <Input
                id="version"
                value={formData.version}
                onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                required
              />
            </div>
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value: Policy['category']) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="privacy">Privacy</SelectItem>
                  <SelectItem value="data">Data</SelectItem>
                  <SelectItem value="access">Access</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(value: Policy['priority']) => setFormData(prev => ({ ...prev, priority: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: Policy['status']) => setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="scope">Scope</Label>
              <Select value={formData.scope} onValueChange={(value: Policy['scope']) => setFormData(prev => ({ ...prev, scope: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="global">Global</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="garage">Garage</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Policy</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Edit Policy Dialog Component
function EditPolicyDialog({ 
  open, 
  onOpenChange, 
  policy, 
  onSubmit 
}: { 
  open: boolean
  onOpenChange: (open: boolean) => void
  policy: Policy
  onSubmit: (policy: Policy) => void
}) {
  const [formData, setFormData] = useState(policy)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Policy</DialogTitle>
          <DialogDescription>
            Update the policy configuration and settings.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-name">Policy Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-version">Version</Label>
              <Input
                id="edit-version"
                value={formData.version}
                onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                required
              />
            </div>
          </div>
          <div>
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-category">Category</Label>
              <Select value={formData.category} onValueChange={(value: Policy['category']) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="privacy">Privacy</SelectItem>
                  <SelectItem value="data">Data</SelectItem>
                  <SelectItem value="access">Access</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(value: Policy['priority']) => setFormData(prev => ({ ...prev, priority: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-status">Status</Label>
              <Select value={formData.status} onValueChange={(value: Policy['status']) => setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-scope">Scope</Label>
              <Select value={formData.scope} onValueChange={(value: Policy['scope']) => setFormData(prev => ({ ...prev, scope: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="global">Global</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="garage">Garage</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Update Policy</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// View Policy Dialog Component
function ViewPolicyDialog({ 
  open, 
  onOpenChange, 
  policy 
}: { 
  open: boolean
  onOpenChange: (open: boolean) => void
  policy: Policy
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>{policy.name}</span>
          </DialogTitle>
          <DialogDescription>
            Policy details and configuration
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-600">Name</Label>
              <p className="text-sm">{policy.name}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Version</Label>
              <p className="text-sm font-mono">{policy.version}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Category</Label>
              <Badge className={cn(categoryColors[policy.category])}>
                {policy.category}
              </Badge>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Priority</Label>
              <Badge className={cn(priorityColors[policy.priority])}>
                {policy.priority}
              </Badge>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Status</Label>
              <Badge className={cn(statusColors[policy.status])}>
                {policy.status}
              </Badge>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Scope</Label>
              <p className="text-sm capitalize">{policy.scope}</p>
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-600">Description</Label>
            <p className="text-sm text-gray-700 mt-1">{policy.description}</p>
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="text-xs font-medium text-gray-600">Created By</Label>
              <p>{policy.createdBy}</p>
            </div>
            <div>
              <Label className="text-xs font-medium text-gray-600">Created At</Label>
              <p>{new Date(policy.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <Label className="text-xs font-medium text-gray-600">Last Updated</Label>
              <p>{new Date(policy.updatedAt).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 