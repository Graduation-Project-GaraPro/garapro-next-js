'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
  Filter, 
  MoreHorizontal, 
  UserX, 
  UserCheck, 
  Mail,
  Calendar,
  Shield,
  Ban,
  CheckCircle,
  Eye,
  Edit,
  Phone,
  MapPin,
  Clock,
  AlertTriangle,
  Info,
  Copy,
  Check,
  X,
  Save,
  Loader2,
  Download,
  RefreshCw,
  UserPlus,
  Settings,
  Activity,
  CreditCard,
  Star
} from 'lucide-react'

const users = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    role: 'user',
    status: 'active',
    joinedDate: '2024-01-15',
    lastLogin: '2024-03-20 14:30',
    avatar: 'JD',
    location: 'New York, NY',
    verified: true,
    totalOrders: 15,
    totalSpent: 1250.50,
    details: {
      address: '123 Main St, New York, NY 10001',
      dateOfBirth: '1990-05-15',
      emergencyContact: '+1 (555) 987-6543',
      preferences: {
        notifications: true,
        marketing: false,
        twoFactor: true
      },
      devices: ['iPhone 13', 'MacBook Pro'],
      lastIpAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
      accountHistory: [
        { action: 'Login', date: '2024-03-20 14:30', ip: '192.168.1.100' },
        { action: 'Password Changed', date: '2024-03-15 10:20', ip: '192.168.1.100' },
        { action: 'Profile Updated', date: '2024-03-10 16:45', ip: '192.168.1.100' }
      ],
      orders: [
        { id: 'ORD-001', amount: 150.00, status: 'Completed', date: '2024-03-18' },
        { id: 'ORD-002', amount: 89.99, status: 'Completed', date: '2024-03-15' },
        { id: 'ORD-003', amount: 299.99, status: 'In Progress', date: '2024-03-20' }
      ]
    }
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '+1 (555) 987-6543',
    role: 'admin',
    status: 'active',
    joinedDate: '2024-01-10',
    lastLogin: '2024-03-20 16:45',
    avatar: 'JS',
    location: 'Los Angeles, CA',
    verified: true,
    totalOrders: 0,
    totalSpent: 0,
    details: {
      address: '456 Oak Ave, Los Angeles, CA 90210',
      dateOfBirth: '1985-08-22',
      emergencyContact: '+1 (555) 123-4567',
      preferences: {
        notifications: true,
        marketing: true,
        twoFactor: true
      },
      devices: ['iPhone 14', 'iPad Pro'],
      lastIpAddress: '10.0.0.50',
      userAgent: 'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X)',
      accountHistory: [
        { action: 'Login', date: '2024-03-20 16:45', ip: '10.0.0.50' },
        { action: 'Admin Action', date: '2024-03-19 09:15', ip: '10.0.0.50' },
        { action: 'Settings Changed', date: '2024-03-18 14:30', ip: '10.0.0.50' }
      ],
      orders: [],
      permissions: ['user_management', 'system_settings', 'reports']
    }
  },
  {
    id: 3,
    name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    phone: '+1 (555) 456-7890',
    role: 'user',
    status: 'banned',
    joinedDate: '2024-02-01',
    lastLogin: '2024-03-15 09:20',
    avatar: 'BJ',
    location: 'Chicago, IL',
    verified: false,
    totalOrders: 3,
    totalSpent: 450.00,
    details: {
      address: '789 Pine St, Chicago, IL 60601',
      dateOfBirth: '1988-12-03',
      emergencyContact: '+1 (555) 321-6547',
      preferences: {
        notifications: false,
        marketing: true,
        twoFactor: false
      },
      devices: ['Android Galaxy S21'],
      lastIpAddress: '172.16.0.25',
      userAgent: 'Mozilla/5.0 (Linux; Android 11; SM-G991B)',
      banReason: 'Multiple policy violations',
      banDate: '2024-03-15',
      banDuration: 'Permanent',
      accountHistory: [
        { action: 'Account Banned', date: '2024-03-15 09:20', ip: '172.16.0.25' },
        { action: 'Warning Issued', date: '2024-03-14 16:30', ip: '172.16.0.25' },
        { action: 'Login', date: '2024-03-13 11:45', ip: '172.16.0.25' }
      ],
      orders: [
        { id: 'ORD-004', amount: 200.00, status: 'Cancelled', date: '2024-03-14' },
        { id: 'ORD-005', amount: 150.00, status: 'Refunded', date: '2024-03-10' },
        { id: 'ORD-006', amount: 100.00, status: 'Completed', date: '2024-03-05' }
      ]
    }
  },
  {
    id: 4,
    name: 'Alice Brown',
    email: 'alice.brown@example.com',
    phone: '+1 (555) 321-6547',
    role: 'user',
    status: 'active',
    joinedDate: '2024-02-15',
    lastLogin: '2024-03-20 12:15',
    avatar: 'AB',
    location: 'Houston, TX',
    verified: true,
    totalOrders: 8,
    totalSpent: 675.25,
    details: {
      address: '321 Elm St, Houston, TX 77001',
      dateOfBirth: '1992-03-18',
      emergencyContact: '+1 (555) 789-0123',
      preferences: {
        notifications: true,
        marketing: false,
        twoFactor: false
      },
      devices: ['iPhone 12', 'Windows PC'],
      lastIpAddress: '203.0.113.45',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      accountHistory: [
        { action: 'Login', date: '2024-03-20 12:15', ip: '203.0.113.45' },
        { action: 'Order Placed', date: '2024-03-19 15:30', ip: '203.0.113.45' },
        { action: 'Profile Updated', date: '2024-03-18 09:45', ip: '203.0.113.45' }
      ],
      orders: [
        { id: 'ORD-007', amount: 89.99, status: 'Completed', date: '2024-03-19' },
        { id: 'ORD-008', amount: 125.50, status: 'Completed', date: '2024-03-16' },
        { id: 'ORD-009', amount: 299.99, status: 'In Progress', date: '2024-03-20' }
      ]
    }
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

const getRoleBadge = (role: string) => {
  switch (role) {
    case 'admin':
      return <Badge className="bg-purple-100 text-purple-800">Admin</Badge>
    case 'moderator':
      return <Badge className="bg-blue-100 text-blue-800">Moderator</Badge>
    case 'user':
      return <Badge className="bg-gray-100 text-gray-800">User</Badge>
    default:
      return <Badge variant="secondary">{role}</Badge>
  }
}

export function UserManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')
  const [verifiedFilter, setVerifiedFilter] = useState('all')
  const [selectedUsers, setSelectedUsers] = useState<number[]>([])
  const [isBulkActionDialogOpen, setIsBulkActionDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    const matchesVerified = verifiedFilter === 'all' || 
                           (verifiedFilter === 'verified' && user.verified) ||
                           (verifiedFilter === 'unverified' && !user.verified)
    
    return matchesSearch && matchesStatus && matchesRole && matchesVerified
  })

  const handleBanUser = (user: any) => {
    setSelectedUser(user)
    // Open ban dialog
  }

  const handleUnbanUser = (user: any) => {
    setSelectedUser(user)
    // Open unban dialog
  }

  const confirmBan = () => {
    console.log('Banning user:', selectedUser?.name)
    setSelectedUser(null)
  }

  const confirmUnban = () => {
    console.log('Unbanning user:', selectedUser?.name)
    setSelectedUser(null)
  }

  const handleUserDetails = (user: any) => {
    setSelectedUser(user)
  }

  const handleEditUser = (user: any) => {
    setSelectedUser(user)
    // Open edit dialog
  }

  const handleSelectUser = (userId: number) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId))
    } else {
      setSelectedUsers([...selectedUsers, userId])
    }
  }

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id))
    }
  }

  const handleBulkAction = (action: string) => {
    console.log(`Bulk action ${action} for users:`, selectedUsers)
    setIsBulkActionDialogOpen(false)
    setSelectedUsers([])
  }

  const handleCopyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(fieldName)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const renderUserDetails = (user: any) => {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg">{user.avatar}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{user.name}</h3>
              <p className="text-sm text-gray-500">{user.email}</p>
              <div className="flex items-center space-x-2 mt-1">
                {getRoleBadge(user.role)}
                {getStatusBadge(user.status)}
                {user.verified && <Badge className="bg-blue-100 text-blue-800">Verified</Badge>}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            {user.status === 'banned' ? (
              <Button variant="outline" size="sm">
                <CheckCircle className="h-4 w-4 mr-2" />
                Unban
              </Button>
            ) : (
              <Button variant="outline" size="sm">
                <Ban className="h-4 w-4 mr-2" />
                Ban
              </Button>
            )}
          </div>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Contact Information</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Email</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-900">{user.email}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyToClipboard(user.email, 'email')}
                    className="h-6 w-6 p-0"
                  >
                    {copiedField === 'email' ? (
                      <Check className="h-3 w-3 text-green-600" />
                    ) : (
                      <Copy className="h-3 w-3 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Phone</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-900">{user.phone}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyToClipboard(user.phone, 'phone')}
                    className="h-6 w-6 p-0"
                  >
                    {copiedField === 'phone' ? (
                      <Check className="h-3 w-3 text-green-600" />
                    ) : (
                      <Copy className="h-3 w-3 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Location</span>
                </div>
                <span className="text-sm text-gray-900">{user.location}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Account Information</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Joined Date</span>
                <span className="text-sm text-gray-900">{user.joinedDate}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Last Login</span>
                <span className="text-sm text-gray-900">{user.lastLogin}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Total Orders</span>
                <span className="text-sm text-gray-900">{user.totalOrders}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Total Spent</span>
                <span className="text-sm text-gray-900">${user.totalSpent.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Account History */}
        {user.details?.accountHistory && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Recent Activity</h4>
            <div className="space-y-2">
              {user.details.accountHistory.slice(0, 5).map((activity: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-900">{activity.action}</span>
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>{activity.date}</span>
                    <span>{activity.ip}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Orders */}
        {user.details?.orders && user.details.orders.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Recent Orders</h4>
            <div className="space-y-2">
              {user.details.orders.slice(0, 3).map((order: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-900">{order.id}</span>
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>${order.amount.toFixed(2)}</span>
                    <Badge variant={order.status === 'Completed' ? 'default' : 'secondary'}>
                      {order.status}
                    </Badge>
                    <span>{order.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-4 border-t border-gray-200">
          <Button variant="outline" size="sm">
            <Mail className="h-4 w-4 mr-2" />
            Send Email
          </Button>
          <Button variant="outline" size="sm">
            <Activity className="h-4 w-4 mr-2" />
            View Activity
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users..."
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
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="moderator">Moderator</option>
              <option value="user">User</option>
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

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Users ({filteredUsers.length})</CardTitle>
            {selectedUsers.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {selectedUsers.length} selected
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsBulkActionDialogOpen(true)}
                >
                  Bulk Actions
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300"
                  />
                </TableHead>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Verified</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                      className="rounded border-gray-300"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{user.avatar}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  <TableCell>
                    {user.verified ? (
                      <Badge className="bg-green-100 text-green-800">Verified</Badge>
                    ) : (
                      <Badge variant="secondary">Unverified</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">{user.joinedDate}</TableCell>
                  <TableCell className="text-sm text-gray-500">{user.lastLogin}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleUserDetails(user)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditUser(user)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit User
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {user.status === 'banned' ? (
                          <DropdownMenuItem onClick={() => handleUnbanUser(user)}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Unban User
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleBanUser(user)}>
                            <Ban className="mr-2 h-4 w-4" />
                            Ban User
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

      {/* User Details Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Comprehensive information about the selected user
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {selectedUser && renderUserDetails(selectedUser)}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedUser(null)}>
              Close
            </Button>
            <Button onClick={() => handleEditUser(selectedUser)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Actions Dialog */}
      <Dialog open={isBulkActionDialogOpen} onOpenChange={setIsBulkActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Actions</DialogTitle>
            <DialogDescription>
              Select an action to perform on {selectedUsers.length} selected users
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleBulkAction('ban')}
            >
              <Ban className="mr-2 h-4 w-4" />
              Ban Selected Users
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleBulkAction('unban')}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Unban Selected Users
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleBulkAction('export')}
            >
              <Download className="mr-2 h-4 w-4" />
              Export User Data
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleBulkAction('email')}
            >
              <Mail className="mr-2 h-4 w-4" />
              Send Email to Users
            </Button>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBulkActionDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 