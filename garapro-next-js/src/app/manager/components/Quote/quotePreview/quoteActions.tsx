"use client"

import { Button } from "@/components/ui/button"
import { Download, Send, Trash2, Wrench } from "lucide-react"

interface QuoteActionsProps {
  onSend: () => void
  onDelete: () => void
  onDownloadPDF: () => void
  onCopyToJobs?: () => void // Add copy to jobs handler
  isApproved?: boolean // Add approved status flag
}

export default function QuoteActions({ 
  onSend, 
  onDelete, 
  onDownloadPDF,
  onCopyToJobs, // Destructure new props
  isApproved = false // Default to false
}: QuoteActionsProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
      <Button onClick={onDownloadPDF} variant="outline" className="flex items-center gap-2 bg-transparent">
        <Download className="h-4 w-4" />
        Download PDF
      </Button>
      <Button
        onClick={onDelete}
        variant="outline"
        className="flex items-center gap-2 text-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
      >
        <Trash2 className="h-4 w-4" />
        Delete
      </Button>
      {isApproved && onCopyToJobs && (
        <Button
          onClick={onCopyToJobs}
          className="flex items-center gap-2 bg-green-600 text-white hover:bg-green-700"
        >
          <Wrench className="h-4 w-4" />
          Copy to Jobs
        </Button>
      )}
      <Button
        onClick={onSend}
        className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
      >
        <Send className="h-4 w-4" />
        Send Quote
      </Button>
    </div>
  )
}