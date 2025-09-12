import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { X } from 'lucide-react'
import { CreateBranchRequest } from '@/services/branch-service'
import { GarageServiceCatalogItem } from '@/services/service-catalog'

interface ServicesSectionProps {
  formData: CreateBranchRequest
  errors: Record<string, string>
  catalog: GarageServiceCatalogItem[]
  onServiceToggle: (item: GarageServiceCatalogItem, selected: boolean) => void
  onServiceRemove: (index: number) => void
}

export const ServicesSection = ({ 
  formData, 
  errors, 
  catalog, 
  onServiceToggle, 
  onServiceRemove 
}: ServicesSectionProps) => {
  const selectedServiceIds = useMemo(() => 
    new Set(formData.services.map(s => s.id)), 
    [formData.services]
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Services</CardTitle>
        <CardDescription>Select services from the catalog to enable at this branch</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2" role="group" aria-labelledby="services-heading">
          <Label id="services-heading">Available Services</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {catalog.map((item) => {
              const isSelected = selectedServiceIds.has(item.id)
              return (
                <label key={item.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => onServiceToggle(item, e.target.checked)}
                    aria-describedby={`service-${item.id}-desc`}
                  />
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div id={`service-${item.id}-desc`} className="text-sm text-muted-foreground">
                      {item.description}
                    </div>
                  </div>
                </label>
              )
            })}
          </div>
        </div>

        {formData.services.length > 0 && (
          <div className="space-y-2">
            <Label>Selected Services</Label>
            <div className="space-y-2">
              {formData.services.map((service, index) => (
                <div key={service.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{service.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {service.description} - ${service.price} ({service.duration} min)
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onServiceRemove(index)} 
                    className="text-red-600"
                    aria-label={`Remove ${service.name} service`}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
        {errors.services && <p className="text-sm text-red-500">{errors.services}</p>}
      </CardContent>
    </Card>
  )
}