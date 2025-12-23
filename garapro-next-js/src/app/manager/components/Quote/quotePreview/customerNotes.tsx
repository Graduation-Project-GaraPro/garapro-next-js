"use client"

import { MessageSquare } from "lucide-react"

interface CustomerNotesProps {
  customerNote?: string | null
  customerResponseAt?: string | null
}

export default function CustomerNotes({ customerNote, customerResponseAt }: CustomerNotesProps) {
  const hasCustomerNote = customerNote && customerNote.trim().length > 0

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-muted-foreground" />
        <h3 className="text-lg font-semibold text-card-foreground">Customer Note</h3>
      </div>
      
      {hasCustomerNote ? (
        <div className="space-y-3">
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
            <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
              {customerNote}
            </p>
          </div>
          
          {customerResponseAt && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Customer responded on:</span>
              <span className="font-medium">
                {new Date(customerResponseAt).toLocaleString()}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-gray-400" />
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Customer Note</h4>
          <p className="text-gray-600 max-w-sm mx-auto">
            The customer hasn't provided any comments their response.
          </p>
        </div>
      )}
    </div>
  )
}