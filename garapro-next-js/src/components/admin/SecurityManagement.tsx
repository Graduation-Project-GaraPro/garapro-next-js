'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { 
  Shield, 
  Lock, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react'

const securityPolicies = [
  {
    id: 1,
    name: 'Password Policy',
    description: 'Configure password requirements and complexity rules',
    icon: Lock,
    settings: [
      { name: 'Minimum Length', value: '8 characters', type: 'input' },
      { name: 'Require Uppercase', value: true, type: 'switch' },
      { name: 'Require Lowercase', value: true, type: 'switch' },
      { name: 'Require Numbers', value: true, type: 'switch' },
      { name: 'Require Special Characters', value: false, type: 'switch' },
      { name: 'Password Expiry', value: '90 days', type: 'input' }
    ]
  },
  {
    id: 2,
    name: 'Session Management',
    description: 'Configure session timeouts and security settings',
    icon: Clock,
    settings: [
      { name: 'Session Timeout', value: '30 minutes', type: 'input' },
      { name: 'Remember Me', value: true, type: 'switch' },
      { name: 'Force Logout on Inactivity', value: true, type: 'switch' },
      { name: 'Multiple Sessions', value: false, type: 'switch' }
    ]
  },
  {
    id: 3,
    name: 'Access Control',
    description: 'Manage access restrictions and IP blocking',
    icon: Shield,
    settings: [
      { name: 'IP Whitelist', value: false, type: 'switch' },
      { name: 'Failed Login Attempts', value: '5 attempts', type: 'input' },
      { name: 'Account Lockout Duration', value: '15 minutes', type: 'input' },
      { name: 'Two-Factor Authentication', value: true, type: 'switch' }
    ]
  }
]

const securityAlerts = [
  {
    id: 1,
    type: 'warning',
    title: 'Multiple Failed Login Attempts',
    description: 'User john.doe@example.com has 3 failed login attempts',
    time: '2 minutes ago',
    icon: AlertTriangle
  },
  {
    id: 2,
    type: 'error',
    title: 'Suspicious IP Activity',
    description: 'Unusual login activity detected from IP 192.168.1.100',
    time: '15 minutes ago',
    icon: AlertTriangle
  },
  {
    id: 3,
    type: 'success',
    title: 'Security Scan Completed',
    description: 'Daily security scan completed successfully',
    time: '1 hour ago',
    icon: CheckCircle
  }
]

const getAlertIcon = (type: string) => {
  switch (type) {
    case 'warning':
      return AlertTriangle
    case 'error':
      return XCircle
    case 'success':
      return CheckCircle
    default:
      return AlertTriangle
  }
}

const getAlertColor = (type: string) => {
  switch (type) {
    case 'warning':
      return 'text-yellow-600 bg-yellow-50'
    case 'error':
      return 'text-red-600 bg-red-50'
    case 'success':
      return 'text-green-600 bg-green-50'
    default:
      return 'text-gray-600 bg-gray-50'
  }
}

export function SecurityManagement() {
  const [policies, setPolicies] = useState(securityPolicies)
  const [showPassword, setShowPassword] = useState(false)

  const updatePolicy = (policyId: number, settingName: string, value: any) => {
    setPolicies(prev => prev.map(policy => {
      if (policy.id === policyId) {
        return {
          ...policy,
          settings: policy.settings.map(setting => 
            setting.name === settingName 
              ? { ...setting, value }
              : setting
          )
        }
      }
      return policy
    }))
  }

  return (
    <div className="space-y-6">
      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Shield className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-gray-600">+12% from last hour</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-gray-600">2 warnings, 1 error</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked IPs</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15</div>
            <p className="text-xs text-gray-600">+3 this week</p>
          </CardContent>
        </Card>
      </div>

      {/* Security Policies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {policies.map((policy) => {
          const Icon = policy.icon
          return (
            <Card key={policy.id}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Icon className="h-5 w-5" />
                  <span>{policy.name}</span>
                </CardTitle>
                <p className="text-sm text-gray-600">{policy.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {policy.settings.map((setting) => (
                  <div key={setting.name} className="flex items-center justify-between">
                    <Label htmlFor={setting.name} className="text-sm font-medium">
                      {setting.name}
                    </Label>
                    <div className="flex items-center space-x-2">
                      {setting.type === 'switch' ? (
                        <Switch
                          id={setting.name}
                          checked={setting.value}
                          onCheckedChange={(checked) => updatePolicy(policy.id, setting.name, checked)}
                        />
                      ) : (
                        <Input
                          id={setting.name}
                          value={setting.value}
                          onChange={(e) => updatePolicy(policy.id, setting.name, e.target.value)}
                          className="w-32"
                        />
                      )}
                    </div>
                  </div>
                ))}
                <Separator />
                <Button variant="outline" size="sm" className="w-full">
                  <Settings className="mr-2 h-4 w-4" />
                  Configure Advanced Settings
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Security Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <span>Security Alerts</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {securityAlerts.map((alert) => {
              const Icon = getAlertIcon(alert.type)
              return (
                <div key={alert.id} className={`flex items-center justify-between p-4 rounded-lg ${getAlertColor(alert.type)}`}>
                  <div className="flex items-center space-x-3">
                    <Icon className="h-5 w-5" />
                    <div>
                      <div className="font-medium">{alert.title}</div>
                      <div className="text-sm opacity-80">{alert.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm opacity-80">{alert.time}</span>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Security Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Security Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="flex flex-col items-center space-y-2 h-auto p-4">
              <Shield className="h-5 w-5" />
              <span>Run Security Scan</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center space-y-2 h-auto p-4">
              <Lock className="h-5 w-5" />
              <span>Update Policies</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center space-y-2 h-auto p-4">
              <Clock className="h-5 w-5" />
              <span>Session Audit</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center space-y-2 h-auto p-4">
              <AlertTriangle className="h-5 w-5" />
              <span>View Logs</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 