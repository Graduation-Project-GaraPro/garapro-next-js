import React from "react"
import { Lock, Check, X, Eye } from "lucide-react"
import { formatVND } from "@/lib/currency"

interface Part {
  id: number
  name: string
  quantity: number
  unitPrice: number
  isSelected?: boolean // Track if customer selected this part
  isRecommended?: boolean // Track if this part was recommended
}

interface Service {
  id: number
  name: string
  price: number
  isRequired?: boolean // Add isRequired property
  isGood?: boolean // ✅ NEW - true = view only, no repair needed
  inspectionFee?: number // ✅ NEW - inspection fee for this service
  isSelected?: boolean // Track if customer selected this service
  parts: Part[]
}

interface ServicesTableProps {
  services: Service[]
  showCustomerChoices?: boolean // New prop to show customer response details
  quotationStatus?: "Pending" | "Sent" | "Approved" | "Rejected" | "Expired" | "Good"
}

export default function ServicesTable({ services, showCustomerChoices = false, quotationStatus }: ServicesTableProps) {
  const hasCustomerResponded = quotationStatus === "Approved" || quotationStatus === "Rejected"
  const shouldShowChoices = showCustomerChoices && hasCustomerResponded

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      {/* Customer Response Summary */}
      {shouldShowChoices && (
        <div className="bg-blue-50 border-b border-blue-200 p-4">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">
            Customer Response Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              <span className="text-gray-700">
                Selected Services: {services.filter(s => s.isSelected && !s.isGood).length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <X className="w-4 h-4 text-red-600" />
              <span className="text-gray-700">
                Declined Services: {services.filter(s => !s.isSelected && !s.isGood && !s.isRequired).length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-green-600" />
              <span className="text-gray-700">
                Good Condition: {services.filter(s => s.isGood).length}
              </span>
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Total Selected Parts: {services.reduce((total, service) => 
              total + (service.parts?.filter(p => p.isSelected).length || 0), 0
            )}
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted">
              <th className="px-6 py-3 text-left text-sm font-semibold text-card-foreground">Service</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-card-foreground">Parts</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-card-foreground">Qty</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-card-foreground">Unit Price</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-card-foreground">Total</th>
              {shouldShowChoices && (
                <th className="px-6 py-3 text-center text-sm font-semibold text-card-foreground">Customer Choice</th>
              )}
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
                        service.isGood 
                          ? 'text-green-700 bg-green-50' 
                          : shouldShowChoices && service.isSelected
                            ? 'text-blue-700 bg-blue-50'
                            : shouldShowChoices && !service.isSelected && !service.isRequired
                              ? 'text-gray-500 bg-gray-50'
                              : 'text-card-foreground'
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
                        {shouldShowChoices && service.isSelected && !service.isGood && (
                          <Check className="w-4 h-4 text-blue-600" />
                        )}
                        {shouldShowChoices && !service.isSelected && !service.isGood && !service.isRequired && (
                          <X className="w-4 h-4 text-red-500" />
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
                      {!service.isGood && !service.isRequired && !shouldShowChoices && (
                        <span className="inline-block mt-1 text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                          Optional
                        </span>
                      )}
                      {shouldShowChoices && service.isSelected && !service.isGood && (
                        <span className="inline-block mt-1 text-xs bg-blue-600 text-white px-2 py-1 rounded">
                          ✓ Customer Selected
                        </span>
                      )}
                      {shouldShowChoices && !service.isSelected && !service.isGood && !service.isRequired && (
                        <span className="inline-block mt-1 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                          ✗ Customer Declined
                        </span>
                      )}
                      {shouldShowChoices && !service.isSelected && !service.isGood && service.isRequired && (
                        <span className="inline-block mt-1 text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                          Required - Not Selected
                        </span>
                      )}
                    </td>
                    {partsCount > 0 ? (
                      <>
                        <td className={`border-b border-border px-6 py-3 text-sm ${
                          shouldShowChoices && service.parts[0].isSelected ? 'text-blue-700 font-medium' : 'text-card-foreground'
                        }`}>
                          <div className="flex items-center gap-2">
                            {service.parts[0].name}
                            {shouldShowChoices && service.parts[0].isSelected && (
                              <Check className="w-3 h-3 text-blue-600" />
                            )}
                            {shouldShowChoices && !service.parts[0].isSelected && (
                              <X className="w-3 h-3 text-red-500" />
                            )}
                          </div>
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
                        {shouldShowChoices && (
                          <td className="border-b border-border px-6 py-3 text-center">
                            {service.parts[0].isSelected ? (
                              <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                <Check className="w-3 h-3" />
                                Selected
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                                <X className="w-3 h-3" />
                                Declined
                              </span>
                            )}
                          </td>
                        )}
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
                        {shouldShowChoices && (
                          <td className="border-b border-border px-6 py-3 text-center">
                            <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                              <Eye className="w-3 h-3" />
                              Good Condition
                            </span>
                          </td>
                        )}
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
                        {shouldShowChoices && (
                          <td className="border-b border-border px-6 py-3 text-center">
                            {service.isSelected ? (
                              <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                <Check className="w-3 h-3" />
                                Selected
                              </span>
                            ) : service.isGood ? (
                              <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                <Eye className="w-3 h-3" />
                                Good
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                                <X className="w-3 h-3" />
                                Declined
                              </span>
                            )}
                          </td>
                        )}
                      </>
                    )}
                  </tr>
                  {/* Additional rows for remaining parts */}
                  {service.parts.slice(1).map((part, index) => (
                    <tr key={`${service.id}-part-${index + 1}`}>
                      <td className={`border-b border-border px-6 py-3 text-sm ${
                        shouldShowChoices && part.isSelected ? 'text-blue-700 font-medium' : 'text-card-foreground'
                      }`}>
                        <div className="flex items-center gap-2">
                          {part.name}
                          {shouldShowChoices && part.isSelected && (
                            <Check className="w-3 h-3 text-blue-600" />
                          )}
                          {shouldShowChoices && !part.isSelected && (
                            <X className="w-3 h-3 text-red-500" />
                          )}
                        </div>
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
                      {shouldShowChoices && (
                        <td className="border-b border-border px-6 py-3 text-center">
                          {part.isSelected ? (
                            <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                              <Check className="w-3 h-3" />
                              Selected
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                              <X className="w-3 h-3" />
                              Declined
                            </span>
                          )}
                        </td>
                      )}
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
                      {shouldShowChoices && (
                        <td className="border-b border-border px-6 py-3 text-center">
                          <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                            <Eye className="w-3 h-3" />
                            Good Condition
                          </span>
                        </td>
                      )}
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
              className={`rounded-lg p-4 border ${
                service.isGood 
                  ? 'bg-green-50 border-green-200' 
                  : shouldShowChoices && service.isSelected
                    ? 'bg-blue-50 border-blue-200'
                    : shouldShowChoices && !service.isSelected && !service.isRequired
                      ? 'bg-red-50 border-red-200'
                      : 'bg-muted border-border'
              }`}
            >
              <h4 className={`font-semibold flex items-center gap-2 ${
                service.isGood 
                  ? 'text-green-700' 
                  : shouldShowChoices && service.isSelected
                    ? 'text-blue-700'
                    : shouldShowChoices && !service.isSelected && !service.isRequired
                      ? 'text-red-700'
                      : 'text-card-foreground'
              }`}>
                {service.name}
                {service.isGood && (
                  <span className="text-green-600">✓</span>
                )}
                {!service.isGood && service.isRequired && (
                  <Lock className="w-4 h-4 text-red-500" />
                )}
                {shouldShowChoices && service.isSelected && !service.isGood && (
                  <Check className="w-4 h-4 text-blue-600" />
                )}
                {shouldShowChoices && !service.isSelected && !service.isGood && !service.isRequired && (
                  <X className="w-4 h-4 text-red-600" />
                )}
              </h4>
              {service.isGood && (
                <span className="inline-block mt-1 text-xs bg-green-600 text-white px-2 py-1 rounded">
                  Good Condition - No Repair Needed
                </span>
              )}
              {!service.isGood && service.isRequired && !shouldShowChoices && (
                <span className="inline-block mt-1 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                  Required Service
                </span>
              )}
              {!service.isGood && !service.isRequired && !shouldShowChoices && (
                <span className="inline-block mt-1 text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                  Optional Service
                </span>
              )}
              {shouldShowChoices && service.isSelected && !service.isGood && (
                <span className="inline-block mt-1 text-xs bg-blue-600 text-white px-2 py-1 rounded">
                  ✓ Customer Selected
                </span>
              )}
              {shouldShowChoices && !service.isSelected && !service.isGood && !service.isRequired && (
                <span className="inline-block mt-1 text-xs bg-red-600 text-white px-2 py-1 rounded">
                  ✗ Customer Declined
                </span>
              )}
              {shouldShowChoices && !service.isSelected && !service.isGood && service.isRequired && (
                <span className="inline-block mt-1 text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                  Required - Not Selected
                </span>
              )}
              <div className="mt-3 space-y-2">
                {service.parts && service.parts.length > 0 ? (
                  service.parts.map((part) => (
                    <div 
                      key={part.id} 
                      className={`flex items-center justify-between text-sm p-2 rounded ${
                        shouldShowChoices && part.isSelected 
                          ? 'bg-blue-100 border border-blue-300' 
                          : shouldShowChoices && !part.isSelected
                            ? 'bg-red-100 border border-red-300'
                            : ''
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`${
                          shouldShowChoices && part.isSelected 
                            ? 'text-blue-700 font-medium' 
                            : shouldShowChoices && !part.isSelected
                              ? 'text-red-700'
                              : 'text-card-foreground'
                        }`}>
                          {part.name}
                        </span>
                        {shouldShowChoices && part.isSelected && (
                          <Check className="w-3 h-3 text-blue-600" />
                        )}
                        {shouldShowChoices && !part.isSelected && (
                          <X className="w-3 h-3 text-red-600" />
                        )}
                        {part.isRecommended && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-1 py-0.5 rounded">
                            Recommended
                          </span>
                        )}
                      </div>
                      <div className="flex gap-4">
                        <span className="text-muted-foreground">Qty: {part.quantity}</span>
                        <span className="text-muted-foreground">{formatVND(part.unitPrice)}</span>
                        <span className={`font-medium ${
                          shouldShowChoices && part.isSelected 
                            ? 'text-blue-700' 
                            : shouldShowChoices && !part.isSelected
                              ? 'text-red-700'
                              : 'text-card-foreground'
                        }`}>
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