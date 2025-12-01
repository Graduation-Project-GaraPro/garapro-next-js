import React from "react"
import { Lock } from "lucide-react"
import { formatVND } from "@/lib/currency"

interface Part {
  id: number
  name: string
  quantity: number
  unitPrice: number
}

interface Service {
  id: number
  name: string
  price: number
  isRequired?: boolean // Add isRequired property
  isGood?: boolean // ✅ NEW - true = view only, no repair needed
  inspectionFee?: number // ✅ NEW - inspection fee for this service
  parts: Part[]
}

interface ServicesTableProps {
  services: Service[]
}

export default function ServicesTable({ services }: ServicesTableProps) {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted">
              <th className="px-6 py-3 text-left text-sm font-semibold text-card-foreground">Service</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-card-foreground">Parts</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-card-foreground">Qty</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-card-foreground">Unit Price</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-card-foreground">Total</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => {
              // Calculate total rows for this service
              const partsCount = service.parts.length
              const hasInspectionFee = service.isGood && service.inspectionFee && service.inspectionFee > 0
              const inspectionFeeRows = hasInspectionFee ? 1 : 0
              const totalRows = Math.max(1, partsCount + inspectionFeeRows)
              
              return (
                <React.Fragment key={service.id}>
                  <tr>
                    <td
                      rowSpan={totalRows}
                      className={`border-b border-border px-6 py-4 font-semibold align-top ${
                        service.isGood ? 'text-green-700 bg-green-50' : 'text-card-foreground'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {service.name}
                        {service.isGood && (
                          <span className="text-green-600">✓</span>
                        )}
                        {!service.isGood && service.isRequired && (
                          <Lock className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                      {service.isGood && (
                        <span className="inline-block mt-1 text-xs bg-green-600 text-white px-2 py-1 rounded">
                          Good Condition
                        </span>
                      )}
                      {!service.isGood && service.isRequired && (
                        <span className="inline-block mt-1 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                          Required
                        </span>
                      )}
                      {!service.isGood && !service.isRequired && (
                        <span className="inline-block mt-1 text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                          Optional
                        </span>
                      )}
                    </td>
                    {partsCount > 0 ? (
                      <>
                        <td className="border-b border-border px-6 py-3 text-sm text-card-foreground">
                          {service.parts[0].name}
                        </td>
                        <td className="border-b border-border px-6 py-3 text-center text-sm text-card-foreground">
                          {service.parts[0].quantity}
                        </td>
                        <td className="border-b border-border px-6 py-3 text-right text-sm text-card-foreground">
                          {formatVND(service.parts[0].unitPrice)}
                        </td>
                        <td className="border-b border-border px-6 py-3 text-right text-sm font-medium text-card-foreground">
                          {formatVND(service.parts[0].quantity * service.parts[0].unitPrice)}
                        </td>
                      </>
                    ) : hasInspectionFee ? (
                      <>
                        <td className="border-b border-border px-6 py-3 text-sm text-green-700 italic">
                          Inspection Fee
                        </td>
                        <td className="border-b border-border px-6 py-3 text-center text-sm text-card-foreground">
                          1
                        </td>
                        <td className="border-b border-border px-6 py-3 text-right text-sm text-card-foreground">
                          {formatVND(service.inspectionFee || 0)}
                        </td>
                        <td className="border-b border-border px-6 py-3 text-right text-sm font-medium text-green-600">
                          {formatVND(service.inspectionFee || 0)}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="border-b border-border px-6 py-3 text-sm text-muted-foreground">
                          No parts
                        </td>
                        <td className="border-b border-border px-6 py-3 text-center text-sm text-card-foreground">
                          -
                        </td>
                        <td className="border-b border-border px-6 py-3 text-right text-sm text-card-foreground">
                          -
                        </td>
                        <td className="border-b border-border px-6 py-3 text-right text-sm font-medium text-card-foreground">
                          {formatVND(0)}
                        </td>
                      </>
                    )}
                  </tr>
                  {/* Additional rows for remaining parts */}
                  {service.parts.slice(1).map((part, index) => (
                    <tr key={`${service.id}-part-${index + 1}`}>
                      <td className="border-b border-border px-6 py-3 text-sm text-card-foreground">
                        {part.name}
                      </td>
                      <td className="border-b border-border px-6 py-3 text-center text-sm text-card-foreground">
                        {part.quantity}
                      </td>
                      <td className="border-b border-border px-6 py-3 text-right text-sm text-card-foreground">
                        {formatVND(part.unitPrice)}
                      </td>
                      <td className="border-b border-border px-6 py-3 text-right text-sm font-medium text-card-foreground">
                        {formatVND(part.quantity * part.unitPrice)}
                      </td>
                    </tr>
                  ))}
                  {/* Inspection fee row for good services with parts */}
                  {hasInspectionFee && partsCount > 0 && (
                    <tr key={`${service.id}-inspection-fee`}>
                      <td className="border-b border-border px-6 py-3 text-sm text-green-700 italic">
                        Inspection Fee
                      </td>
                      <td className="border-b border-border px-6 py-3 text-center text-sm text-card-foreground">
                        1
                      </td>
                      <td className="border-b border-border px-6 py-3 text-right text-sm text-card-foreground">
                        {formatVND(service.inspectionFee || 0)}
                      </td>
                      <td className="border-b border-border px-6 py-3 text-right text-sm font-medium text-green-600">
                        {formatVND(service.inspectionFee || 0)}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Detailed parts breakdown */}
      <div className="border-t border-border p-6">
        <h3 className="mb-4 text-lg font-semibold text-card-foreground">Parts Breakdown by Service</h3>
        <div className="space-y-6">
          {services.map((service) => (
            <div 
              key={service.id} 
              className={`rounded-lg p-4 ${
                service.isGood ? 'bg-green-50 border border-green-200' : 'bg-muted'
              }`}
            >
              <h4 className={`font-semibold flex items-center gap-2 ${
                service.isGood ? 'text-green-700' : 'text-card-foreground'
              }`}>
                {service.name}
                {service.isGood && (
                  <span className="text-green-600">✓</span>
                )}
                {!service.isGood && service.isRequired && (
                  <Lock className="w-4 h-4 text-red-500" />
                )}
              </h4>
              {service.isGood && (
                <span className="inline-block mt-1 text-xs bg-green-600 text-white px-2 py-1 rounded">
                  Good Condition - No Repair Needed
                </span>
              )}
              {!service.isGood && service.isRequired && (
                <span className="inline-block mt-1 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                  Required Service
                </span>
              )}
              {!service.isGood && !service.isRequired && (
                <span className="inline-block mt-1 text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                  Optional Service
                </span>
              )}
              <div className="mt-3 space-y-2">
                {service.parts && service.parts.length > 0 ? (
                  service.parts.map((part) => (
                    <div key={part.id} className="flex items-center justify-between text-sm">
                      <span className="text-card-foreground">{part.name}</span>
                      <div className="flex gap-4">
                        <span className="text-muted-foreground">Qty: {part.quantity}</span>
                        <span className="text-muted-foreground">{formatVND(part.unitPrice)}</span>
                        <span className="font-medium text-card-foreground">
                          {formatVND(part.quantity * part.unitPrice)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">No parts associated with this service</div>
                )}
              </div>
              <div className="mt-3 border-t border-border pt-3 space-y-2">
                {/* Show inspection fee if service is good */}
                {service.isGood && service.inspectionFee && service.inspectionFee > 0 && (
                  <div className="flex justify-between text-sm text-card-foreground">
                    <span>Inspection Fee:</span>
                    <span className="font-medium text-green-600">{formatVND(service.inspectionFee)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-card-foreground">
                  <span>Service Total:</span>
                  <span className={service.isGood ? 'text-green-600' : 'text-primary'}>
                    {service.isGood 
                      ? (service.inspectionFee && service.inspectionFee > 0 
                          ? formatVND(service.inspectionFee) 
                          : `${formatVND(0)} (No repair needed)`)
                      : formatVND(service.price)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}