"use client"

import { Button } from "@/components/ui/button"
import { /*Download,*/ Send, /*Trash2,*/ Wrench } from "lucide-react"

interface QuoteActionsProps {
  onSend: () => void
  onDelete: () => void
  onDownloadPDF: () => void
  onCopyToJobs?: () => void // Add copy to jobs handler
  isApproved?: boolean // Add approved status flag
  jobsCreated?: boolean // Add jobs created flag
  jobsCreatedAt?: string | null // Add jobs created timestamp
  quoteSent?: boolean // Add quote sent flag
  sentAt?: string | null // Add sent timestamp
  status?: "Pending" | "Sent" | "Approved" | "Rejected" | "Expired" | "Good" // Add status prop
}

export default function QuoteActions({ 
  onSend, 
  // onDelete, 
  // onDownloadPDF,
  onCopyToJobs, // Destructure new props
  isApproved = false, 
  jobsCreated = false,
  jobsCreatedAt = null,
  // quoteSent = false,
  sentAt = null,
  status = "Pending"
}: QuoteActionsProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
      {/* <Button onClick={onDownloadPDF} variant="outline" className="flex items-center gap-2 bg-transparent">
        <Download className="h-4 w-4" />
        Download PDF
      </Button> */}
      {jobsCreated ? (
        <div className="flex items-center gap-2 rounded-md bg-blue-100 px-4 py-2 text-sm font-medium text-blue-800">
          <Wrench className="h-4 w-4" />
          Jobs Created
          {jobsCreatedAt && (
            <span className="text-blue-600">
              • {new Date(jobsCreatedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      ) : isApproved && onCopyToJobs ? (
        <Button
          onClick={onCopyToJobs}
          className="flex items-center gap-2 bg-green-600 text-white hover:bg-green-700"
        >
          <Wrench className="h-4 w-4" />
          Copy to Jobs
        </Button>
      ) : null}
      {!isApproved && (
        status === "Sent" ? (
          <div className="flex items-center gap-2 rounded-md bg-green-100 px-4 py-2 text-sm font-medium text-green-800">
            <Send className="h-4 w-4" />
            Quote Sent
            {sentAt && (
              <span className="text-green-600">
                • {new Date(sentAt).toLocaleDateString()}
              </span>
            )}
          </div>
        ) : status === "Approved" ? (
          <div className="flex items-center gap-2 rounded-md bg-blue-100 px-4 py-2 text-sm font-medium text-blue-800">
            <Send className="h-4 w-4" />
            Quote Approved
          </div>
        ) : status === "Rejected" ? (
          <div className="flex items-center gap-2 rounded-md bg-red-100 px-4 py-2 text-sm font-medium text-red-800">
            <Send className="h-4 w-4" />
            Quote Rejected
          </div>
        ) : status === "Expired" ? (
          <div className="flex items-center gap-2 rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-800">
            <Send className="h-4 w-4" />
            Quote Expired
          </div>
        ) : status === "Pending" ? (
          <Button
            onClick={onSend}
            className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Send className="h-4 w-4" />
            Send Quote
          </Button>
        ) : null
      )}
    </div>
  )
}