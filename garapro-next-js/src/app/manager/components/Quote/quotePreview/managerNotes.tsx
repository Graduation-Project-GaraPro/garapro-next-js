"use client"

interface ManagerNotesProps {
  note: string
  onNoteChange: (note: string) => void
}

export default function ManagerNotes({ note, onNoteChange }: ManagerNotesProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h3 className="text-lg font-semibold text-card-foreground">Manager Notes</h3>
      <textarea
        value={note}
        onChange={(e) => onNoteChange(e.target.value)}
        className="mt-4 w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        rows={6}
        placeholder="Add any notes for the customer or internal reference..."
      />
      <p className="mt-2 text-xs text-muted-foreground">
        These notes will be visible to the customer when the quote is sent.
      </p>
    </div>
  )
}
