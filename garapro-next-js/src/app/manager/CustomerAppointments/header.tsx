import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus, Settings, Bell } from "lucide-react"

export function Header() {
  return (
    <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold text-foreground">AutoCare Garage</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input placeholder="Search appointments, customers..." className="pl-10 w-80" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm">
          <Bell className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}
