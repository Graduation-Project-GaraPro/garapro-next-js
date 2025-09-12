import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { X } from 'lucide-react'
import { CreateBranchRequest } from '@/services/branch-service'
import { User } from '@/services/user-service'

interface StaffSectionProps {
  formData: CreateBranchRequest
  errors: Record<string, string>
  drivers: User[]
  onStaffToggle: (driver: User, selected: boolean) => void
  onStaffRemove: (index: number) => void
}

export const StaffSection = ({ 
  formData, 
  errors, 
  drivers, 
  onStaffToggle, 
  onStaffRemove 
}: StaffSectionProps) => {
  const selectedStaffEmails = useMemo(() => 
    new Set(formData.staff.map(s => s.email)), 
    [formData.staff]
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Staff Members</CardTitle>
        <CardDescription>Select staff members from existing accounts</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Select Drivers</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {drivers.map((d) => {
              const isSelected = selectedStaffEmails.has(d.email)
              return (
                <label key={d.id} className="flex items-center gap-2 p-2 border rounded">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => onStaffToggle(d, e.target.checked)}
                  />
                  <span className="text-sm">{d.name} ({d.email})</span>
                </label>
              )
            })}
          </div>
        </div>

        {formData.staff.length > 0 && (
          <div className="space-y-2">
            <Label>Added Staff</Label>
            <div className="space-y-2">
              {formData.staff.map((staff, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{staff.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {staff.role} - {staff.email} - {staff.phone}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onStaffRemove(index)}
                    className="text-red-600"
                    aria-label={`Remove ${staff.name} from staff`}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
        {errors.staff && <p className="text-sm text-red-500">{errors.staff}</p>}
      </CardContent>
    </Card>
  )
}