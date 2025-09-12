import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { CreateBranchRequest, OperatingHours, DaySchedule } from '@/services/branch-service'
import { WEEKDAYS } from '@/constants/branch'

interface OperatingHoursSectionProps {
  formData: CreateBranchRequest
  onOperatingHoursChange: (day: keyof OperatingHours, field: keyof DaySchedule, value: string | boolean) => void
}

export const OperatingHoursSection = ({ 
  formData, 
  onOperatingHoursChange 
}: OperatingHoursSectionProps) => (
  <Card>
    <CardHeader>
      <CardTitle>Operating Hours</CardTitle>
      <CardDescription>Set the operating hours for each day of the week</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {WEEKDAYS.map((day) => (
          <div key={day} className="flex items-center gap-4 p-3 border rounded-lg">
            <div className="w-24 font-medium capitalize">{day}</div>
            <Switch
              checked={formData.operatingHours[day].isOpen}
              onCheckedChange={(checked) => onOperatingHoursChange(day, 'isOpen', checked)}
              aria-label={`${day} operating hours toggle`}
            />
            {formData.operatingHours[day].isOpen && (
              <>
                <div className="flex items-center gap-2">
                  <Label>Open:</Label>
                  <Input
                    type="time"
                    value={formData.operatingHours[day].openTime}
                    onChange={(e) => onOperatingHoursChange(day, 'openTime', e.target.value)}
                    className="w-32"
                    aria-label={`${day} opening time`}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label>Close:</Label>
                  <Input
                    type="time"
                    value={formData.operatingHours[day].closeTime}
                    onChange={(e) => onOperatingHoursChange(day, 'closeTime', e.target.value)}
                    className="w-32"
                    aria-label={`${day} closing time`}
                  />
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
)