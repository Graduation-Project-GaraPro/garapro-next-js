import { Lock } from "lucide-react"

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
            {services.map((service) => (
              <tr key={service.id}>
                <td
                  rowSpan={Math.max(1, service.parts.length)} // Ensure at least 1 row
                  className="border-b border-border px-6 py-4 font-semibold text-card-foreground align-top"
                >
                  <div className="flex items-center gap-2">
                    {service.name}
                    {service.isRequired && (
                      <Lock className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  {service.isRequired && (
                    <span className="inline-block mt-1 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                      Required
                    </span>
                  )}
                </td>
                {service.parts.length > 0 ? (
                  <>
                    <td className="border-b border-border px-6 py-3 text-sm text-card-foreground">
                      {service.parts[0].name}
                    </td>
                    <td className="border-b border-border px-6 py-3 text-center text-sm text-card-foreground">
                      {service.parts[0].quantity}
                    </td>
                    <td className="border-b border-border px-6 py-3 text-right text-sm text-card-foreground">
                      ${service.parts[0].unitPrice.toLocaleString()}
                    </td>
                    <td className="border-b border-border px-6 py-3 text-right text-sm font-medium text-card-foreground">
                      ${(service.parts[0].quantity * service.parts[0].unitPrice).toLocaleString()}
                    </td>
                  </>
                ) : (
                  <>
                    <td className="border-b border-border px-6 py-3 text-sm text-card-foreground">
                      No parts
                    </td>
                    <td className="border-b border-border px-6 py-3 text-center text-sm text-card-foreground">
                      0
                    </td>
                    <td className="border-b border-border px-6 py-3 text-right text-sm text-card-foreground">
                      $0
                    </td>
                    <td className="border-b border-border px-6 py-3 text-right text-sm font-medium text-card-foreground">
                      $0
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detailed parts breakdown */}
      <div className="border-t border-border p-6">
        <h3 className="mb-4 text-lg font-semibold text-card-foreground">Parts Breakdown by Service</h3>
        <div className="space-y-6">
          {services.map((service) => (
            <div key={service.id} className="rounded-lg bg-muted p-4">
              <h4 className="font-semibold text-card-foreground flex items-center gap-2">
                {service.name}
                {service.isRequired && (
                  <Lock className="w-4 h-4 text-red-500" />
                )}
              </h4>
              {service.isRequired && (
                <span className="inline-block mt-1 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                  Required Service
                </span>
              )}
              <div className="mt-3 space-y-2">
                {service.parts && service.parts.length > 0 ? (
                  service.parts.map((part) => (
                    <div key={part.id} className="flex items-center justify-between text-sm">
                      <span className="text-card-foreground">{part.name}</span>
                      <div className="flex gap-4">
                        <span className="text-muted-foreground">Qty: {part.quantity}</span>
                        <span className="text-muted-foreground">${part.unitPrice.toLocaleString()}</span>
                        <span className="font-medium text-card-foreground">
                          ${(part.quantity * part.unitPrice).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">No parts associated with this service</div>
                )}
              </div>
              <div className="mt-3 border-t border-border pt-3">
                <div className="flex justify-between font-semibold text-card-foreground">
                  <span>Service Total:</span>
                  <span className="text-primary">${service.price.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}