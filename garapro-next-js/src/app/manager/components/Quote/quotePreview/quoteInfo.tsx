interface QuoteInfoProps {
  quote: {
    customerName: string
    customerEmail: string
    customerPhone: string
  }
}

export default function QuoteInfo({ quote }: QuoteInfoProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h2 className="text-xl font-semibold text-card-foreground">Customer Information</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div>
          <p className="text-sm text-muted-foreground">Customer Name</p>
          <p className="mt-1 font-medium text-card-foreground">{quote.customerName}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Email</p>
          <p className="mt-1 font-medium text-card-foreground">{quote.customerEmail}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Phone</p>
          <p className="mt-1 font-medium text-card-foreground">{quote.customerPhone}</p>
        </div>
      </div>
    </div>
  )
}
