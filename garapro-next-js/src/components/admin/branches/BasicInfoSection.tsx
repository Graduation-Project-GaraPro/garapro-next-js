import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CreateBranchRequest } from '@/services/branch-service'
import { User } from '@/services/user-service'
import { US_STATES } from '@/constants/branch'

interface BasicInfoSectionProps {
  formData: CreateBranchRequest
  errors: Record<string, string>
  managers: User[]
  onChange: (field: keyof CreateBranchRequest, value: string) => void
}

export const BasicInfoSection = ({ 
  formData, 
  errors, 
  managers, 
  onChange 
}: BasicInfoSectionProps) => (
  <Card>
    <CardHeader>
      <CardTitle>Basic Information</CardTitle>
      <CardDescription>Provide the essential details for your new branch</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Branch Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => onChange('name', e.target.value)}
            placeholder="e.g., Downtown Auto Service"
            className={errors.name ? 'border-red-500' : ''}
            data-testid="branch-name"
          />
          {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="managerId">Manager *</Label>
          <Select value={formData.managerId} onValueChange={(value) => onChange('managerId', value)}>
            <SelectTrigger className={errors.managerId ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select Manager" />
            </SelectTrigger>
            <SelectContent>
              {managers.map((m) => (
                <SelectItem key={m.id} value={String(m.id)}>
                  {m.name} ({m.email})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.managerId && <p className="text-sm text-red-500">{errors.managerId}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address *</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => onChange('address', e.target.value)}
          placeholder="123 Main Street"
          className={errors.address ? 'border-red-500' : ''}
        />
        {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City *</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => onChange('city', e.target.value)}
            placeholder="City"
            className={errors.city ? 'border-red-500' : ''}
          />
          {errors.city && <p className="text-sm text-red-500">{errors.city}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">State *</Label>
          <Select value={formData.state} onValueChange={(value) => onChange('state', value)}>
            <SelectTrigger className={errors.state ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select State" />
            </SelectTrigger>
            <SelectContent>
              {US_STATES.map((state) => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.state && <p className="text-sm text-red-500">{errors.state}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="zipCode">ZIP Code *</Label>
          <Input
            id="zipCode"
            value={formData.zipCode}
            onChange={(e) => onChange('zipCode', e.target.value)}
            placeholder="12345"
            className={errors.zipCode ? 'border-red-500' : ''}
          />
          {errors.zipCode && <p className="text-sm text-red-500">{errors.zipCode}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone *</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => onChange('phone', e.target.value)}
            placeholder="(555) 123-4567"
            className={errors.phone ? 'border-red-500' : ''}
          />
          {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => onChange('email', e.target.value)}
            placeholder="branch@garage.com"
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
        </div>
      </div>
    </CardContent>
  </Card>
)