interface QuoteHeaderProps {
  quote: {
    id: string
    date: string
    status: string
  }
}

export default function QuoteHeader({ quote }: QuoteHeaderProps) {
  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    sent: "bg-blue-100 text-blue-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    expired: "bg-gray-100 text-gray-800",
  }

  // Capitalize the first letter of the status for display
  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  }

  return (
    <div className="border-b border-border pb-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Quote</h1>
          <p className="mt-1 text-muted-foreground">
            Quote ID: <span className="font-semibold">{quote.id}</span>
          </p>
        </div>
        <div className="flex flex-col items-start gap-3 sm:items-end">
          <span
            className={`inline-block rounded-full px-4 py-1 text-sm font-medium ${
              statusColors[quote.status.toLowerCase() as keyof typeof statusColors] || "bg-gray-100 text-gray-800"
            }`}
          >
            {formatStatus(quote.status)}
          </span>
          <p className="text-sm text-muted-foreground">Date: {new Date(quote.date).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  )
}