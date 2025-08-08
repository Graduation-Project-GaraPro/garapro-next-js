'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
  UserPlus, 
  UserX, 
  Building2, 
  Shield, 
  Settings, 
  AlertTriangle,
  Ban,
  CheckCircle,
  Globe,
  Activity,
  Search,
  Calendar,
  Mail,
  Phone,
  MapPin,
  AlertCircle,
  Info,
  X,
  Save,
  Loader2
} from 'lucide-react'

const quickActions = [
  {
    title: 'Ban User',
    description: 'Temporarily suspend user account',
    icon: UserX,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    action: 'ban-user',
    modalTitle: 'Ban User Account',
    modalDescription: 'Suspend a user account temporarily or permanently'
  },
  {
    title: 'Unban User',
    description: 'Restore user account access',
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    action: 'unban-user',
    modalTitle: 'Unban User Account',
    modalDescription: 'Restore access to a previously banned user account'
  },
  {
    title: 'Ban Garage',
    description: 'Suspend garage account',
    icon: Building2,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    action: 'ban-garage',
    modalTitle: 'Ban Garage Account',
    modalDescription: 'Suspend a garage account for policy violations'
  },
  {
    title: 'Create Domain',
    description: 'Add new subdomain for garage',
    icon: Globe,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    action: 'create-domain',
    modalTitle: 'Create New Domain',
    modalDescription: 'Create a new subdomain for a garage'
  },
  {
    title: 'Security Alert',
    description: 'View security notifications',
    icon: AlertTriangle,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    action: 'security-alert',
    modalTitle: 'Security Alerts',
    modalDescription: 'View and manage security notifications'
  },
  {
    title: 'System Settings',
    description: 'Configure system parameters',
    icon: Settings,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    action: 'system-settings',
    modalTitle: 'System Settings',
    modalDescription: 'Configure system-wide parameters and preferences'
  }
]

export function QuickActions() {
  const [selectedAction, setSelectedAction] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    reason: '',
    duration: '',
    domain: '',
    garageName: '',
    description: '',
    alertType: '',
    settingName: '',
    settingValue: ''
  })

  const handleAction = (action: string) => {
    setSelectedAction(action)
  }

  const handleSubmit = async (action: string) => {
    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Handle different actions
    switch (action) {
      case 'ban-user':
        console.log('Banning user:', formData.email, 'Reason:', formData.reason)
        break
      case 'unban-user':
        console.log('Unbanning user:', formData.email)
        break
      case 'ban-garage':
        console.log('Banning garage:', formData.garageName, 'Reason:', formData.reason)
        break
      case 'create-domain':
        console.log('Creating domain:', formData.domain, 'for garage:', formData.garageName)
        break
      case 'security-alert':
        console.log('Creating security alert:', formData.alertType, 'Description:', formData.description)
        break
      case 'system-settings':
        console.log('Updating system setting:', formData.settingName, 'Value:', formData.settingValue)
        break
    }
    
    setIsLoading(false)
    setSelectedAction(null)
    setFormData({
      email: '',
      reason: '',
      duration: '',
      domain: '',
      garageName: '',
      description: '',
      alertType: '',
      settingName: '',
      settingValue: ''
    })
  }

  const renderModalContent = (action: string) => {
    const actionConfig = quickActions.find(a => a.action === action)
    
    switch (action) {
      case 'ban-user':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">User Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter user email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="duration">Ban Duration</Label>
              <Select value={formData.duration} onValueChange={(value) => setFormData({...formData, duration: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-day">1 Day</SelectItem>
                  <SelectItem value="1-week">1 Week</SelectItem>
                  <SelectItem value="1-month">1 Month</SelectItem>
                  <SelectItem value="permanent">Permanent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Ban</Label>
              <Textarea
                id="reason"
                placeholder="Enter reason for banning this user..."
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                className="min-h-[100px] resize-none"
              />
            </div>
          </div>
        )

      case 'unban-user':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">User Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter user email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-blue-900">Restore Access</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    This will immediately restore all access privileges to the user account.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      case 'ban-garage':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="garageName">Garage Name</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="garageName"
                  placeholder="Enter garage name"
                  value={formData.garageName}
                  onChange={(e) => setFormData({...formData, garageName: e.target.value})}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="duration">Ban Duration</Label>
              <Select value={formData.duration} onValueChange={(value) => setFormData({...formData, duration: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-day">1 Day</SelectItem>
                  <SelectItem value="1-week">1 Week</SelectItem>
                  <SelectItem value="1-month">1 Month</SelectItem>
                  <SelectItem value="permanent">Permanent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Ban</Label>
              <Textarea
                id="reason"
                placeholder="Enter reason for banning this garage..."
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                className="min-h-[100px] resize-none"
              />
            </div>
          </div>
        )

      case 'create-domain':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="garageName">Garage Name</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="garageName"
                  placeholder="Enter garage name"
                  value={formData.garageName}
                  onChange={(e) => setFormData({...formData, garageName: e.target.value})}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="domain">Subdomain</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="domain"
                  placeholder="Enter subdomain (e.g., autofix)"
                  value={formData.domain}
                  onChange={(e) => setFormData({...formData, domain: e.target.value})}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-gray-500">The full domain will be: {formData.domain}.garapro.com</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Optional description for this domain..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="min-h-[80px] resize-none"
              />
            </div>
          </div>
        )

      case 'security-alert':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="alertType">Alert Type</Label>
              <Select value={formData.alertType} onValueChange={(value) => setFormData({...formData, alertType: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select alert type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="login-attempts">Failed Login Attempts</SelectItem>
                  <SelectItem value="suspicious-activity">Suspicious Activity</SelectItem>
                  <SelectItem value="data-breach">Potential Data Breach</SelectItem>
                  <SelectItem value="system-error">System Error</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Alert Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the security alert..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="min-h-[100px] resize-none"
              />
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-900">Security Alert</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    This alert will be logged and may trigger additional security measures.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      case 'system-settings':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="settingName">Setting Name</Label>
              <Select value={formData.settingName} onValueChange={(value) => setFormData({...formData, settingName: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select setting to modify" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="maintenance-mode">Maintenance Mode</SelectItem>
                  <SelectItem value="registration-enabled">User Registration</SelectItem>
                  <SelectItem value="email-verification">Email Verification</SelectItem>
                  <SelectItem value="session-timeout">Session Timeout</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="settingValue">Setting Value</Label>
              <Input
                id="settingValue"
                placeholder="Enter new value"
                value={formData.settingValue}
                onChange={(e) => setFormData({...formData, settingValue: e.target.value})}
              />
            </div>
            
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Settings className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-purple-900">System Setting</h4>
                  <p className="text-sm text-purple-700 mt-1">
                    Changes to system settings may affect all users immediately.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="h-5 w-5" />
          <span>Quick Actions</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Dialog key={action.title} open={selectedAction === action.action} onOpenChange={() => setSelectedAction(null)}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-start space-y-2 hover:shadow-md transition-shadow"
                    onClick={() => handleAction(action.action)}
                  >
                    <div className="flex items-center space-x-3 w-full">
                      <div className={`p-2 rounded-lg ${action.bgColor}`}>
                        <Icon className={`h-4 w-4 ${action.color}`} />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-gray-900">{action.title}</div>
                        <div className="text-sm text-gray-500">{action.description}</div>
                      </div>
                    </div>
                  </Button>
                </DialogTrigger>
                
                <DialogContent className="max-w-md w-full max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2">
                      <Icon className={`h-5 w-5 ${action.color}`} />
                      <span>{action.modalTitle}</span>
                    </DialogTitle>
                    <DialogDescription className="text-sm text-gray-600">
                      {action.modalDescription}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="py-4">
                    {renderModalContent(action.action)}
                  </div>
                  
                  <DialogFooter className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedAction(null)}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => handleSubmit(action.action)}
                      disabled={isLoading}
                      className="min-w-[80px]"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Submit
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
} 