import { Search } from "lucide-react"
import { useState } from "react"

import { Label } from '@/components/ui/label'
import { SidebarInput } from '@/components/ui/sidebar'

interface SearchFormProps extends React.ComponentProps<"form"> {
  onSearch?: (searchTerm: string) => void
  placeholder?: string
}

export function SearchForm({ onSearch, placeholder = "Search by name, phone, or RO ID...", ...props }: SearchFormProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    if (onSearch) {
      onSearch(value)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (onSearch) {
      onSearch(searchTerm)
    }
  }

  return (
    <form onSubmit={handleSubmit} {...props}>
      <div className="relative">
        <Label htmlFor="search" className="sr-only">
          Search
        </Label>
        <SidebarInput
          id="search"
          placeholder={placeholder}
          className="h-8 pl-7"
          value={searchTerm}
          onChange={handleInputChange}
        />
        <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 select-none opacity-50" />
      </div>
    </form>
  )
}
