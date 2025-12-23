// src/components/ui/date-time-picker.tsx
"use client"

import { useState, useEffect } from "react"
import { format, isAfter, startOfDay, addMinutes } from "date-fns"
import { Calendar as CalendarIcon, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DayPicker } from "react-day-picker"
import { cn } from "@/lib/utils"

interface DateTimePickerProps {
  value?: string | null
  onChange: (value: string | null) => void
  placeholder?: string
  disabled?: boolean
  minDate?: Date
  className?: string
  label?: string
  error?: string
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = "Select date and time",
  disabled = false,
  minDate,
  className,
  label,
  error
}: DateTimePickerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [isOpen, setIsOpen] = useState(false)
  const [dateSelectionEffect, setDateSelectionEffect] = useState<'success' | 'error' | null>(null)

  // Parse the initial value
  useEffect(() => {
    if (value) {
      const date = new Date(value)
      setSelectedDate(date)
      setSelectedTime(format(date, "HH:mm"))
    } else {
      setSelectedDate(undefined)
      setSelectedTime("")
    }
  }, [value])

  // Generate time options (every 30 minutes)
  const timeOptions = []
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      timeOptions.push(timeString)
    }
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      setSelectedDate(undefined)
      onChange(null)
      setDateSelectionEffect(null)
      return
    }

    // Check if date is in the past
    const isPastDate = minDate && !isAfter(date, startOfDay(minDate))
    
    if (isPastDate) {
      // Show error effect for past dates
      setDateSelectionEffect('error')
      setTimeout(() => setDateSelectionEffect(null), 2000)
      return // Don't select dates in the past
    }

    // Show success effect for valid future dates
    setDateSelectionEffect('success')
    setTimeout(() => setDateSelectionEffect(null), 1500)

    setSelectedDate(date)
    
    // If we have both date and time, combine them
    if (selectedTime) {
      const [hours, minutes] = selectedTime.split(':').map(Number)
      const combinedDateTime = new Date(date)
      combinedDateTime.setHours(hours, minutes, 0, 0)
      
      // Validate combined datetime against minimum
      if (minDate && !isAfter(combinedDateTime, minDate)) {
        // If the combined datetime is in the past, set to current time + 1 hour
        const futureTime = addMinutes(new Date(), 60)
        const futureTimeString = format(futureTime, "HH:mm")
        setSelectedTime(futureTimeString)
        combinedDateTime.setHours(futureTime.getHours(), futureTime.getMinutes(), 0, 0)
      }
      
      onChange(combinedDateTime.toISOString())
    }
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
    
    if (selectedDate) {
      const [hours, minutes] = time.split(':').map(Number)
      const combinedDateTime = new Date(selectedDate)
      combinedDateTime.setHours(hours, minutes, 0, 0)
      
      // Validate combined datetime against minimum
      if (minDate && !isAfter(combinedDateTime, minDate)) {
        // Show error effect for past times
        setDateSelectionEffect('error')
        setTimeout(() => setDateSelectionEffect(null), 2000)
        return // Don't allow past times
      }
      
      // Show success effect for valid times
      setDateSelectionEffect('success')
      setTimeout(() => setDateSelectionEffect(null), 1500)
      
      onChange(combinedDateTime.toISOString())
    }
  }

  const handleClear = () => {
    setSelectedDate(undefined)
    setSelectedTime("")
    setDateSelectionEffect(null)
    onChange(null)
    setIsOpen(false)
  }

  const formatDisplayValue = () => {
    if (!selectedDate) return ""
    
    if (selectedTime) {
      const [hours, minutes] = selectedTime.split(':').map(Number)
      const displayDate = new Date(selectedDate)
      displayDate.setHours(hours, minutes, 0, 0)
      return format(displayDate, "MMM dd, yyyy 'at' HH:mm")
    }
    
    return format(selectedDate, "MMM dd, yyyy")
  }

  // Check if current selection is in the past
  const isInPast = () => {
    if (!selectedDate || !selectedTime || !minDate) return false
    
    const [hours, minutes] = selectedTime.split(':').map(Number)
    const combinedDateTime = new Date(selectedDate)
    combinedDateTime.setHours(hours, minutes, 0, 0)
    
    return !isAfter(combinedDateTime, minDate)
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label>{label}</Label>}
      
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal transition-all duration-300 hover:border-blue-300 hover:bg-blue-50",
              !selectedDate && "text-muted-foreground",
              error && "border-red-500 hover:border-red-400",
              isInPast() && "border-red-500 bg-red-50 hover:bg-red-100",
              dateSelectionEffect === 'success' && "border-green-500 bg-green-50 shadow-md hover:bg-green-100",
              dateSelectionEffect === 'error' && "border-red-500 bg-red-50 shadow-md animate-pulse hover:bg-red-100"
            )}
            disabled={disabled}
          >
            <CalendarIcon className={cn(
              "mr-2 h-4 w-4 transition-colors duration-300",
              dateSelectionEffect === 'success' && "text-green-600",
              dateSelectionEffect === 'error' && "text-red-600"
            )} />
            {formatDisplayValue() || placeholder}
            {dateSelectionEffect === 'success' && (
              <CheckCircle className="ml-auto h-4 w-4 text-green-600 animate-bounce" />
            )}
            {dateSelectionEffect === 'error' && (
              <AlertCircle className="ml-auto h-4 w-4 text-red-600 animate-bounce" />
            )}
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex">
            {/* Calendar */}
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={(date) => minDate ? !isAfter(date, startOfDay(minDate)) : false}
              className="p-3"
              classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4",
                caption: "flex justify-center pt-1 relative items-center",
                caption_label: "text-sm font-medium",
                nav: "space-x-1 flex items-center",
                nav_button: cn(
                  "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 hover:bg-blue-100 transition-all duration-200"
                ),
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse space-y-1",
                head_row: "flex",
                head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                row: "flex w-full mt-2",
                cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 hover:bg-blue-50 transition-colors duration-150",
                day: cn(
                  "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-blue-100 hover:text-blue-900 transition-colors duration-200 cursor-pointer"
                ),
                day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                day_today: "bg-accent text-accent-foreground hover:bg-blue-200",
                day_outside: "text-muted-foreground opacity-50 hover:opacity-75",
                day_disabled: "text-muted-foreground opacity-50 cursor-not-allowed hover:bg-red-50 hover:text-red-400",
                day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                day_hidden: "invisible",
              }}
            />
            
            {/* Time Selection */}
            <div className="border-l p-3 space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Clock className="h-4 w-4" />
                Time
              </div>
              
              <Select value={selectedTime} onValueChange={handleTimeSelect}>
                <SelectTrigger className="w-24 hover:border-blue-300 hover:bg-blue-50 transition-colors duration-200">
                  <SelectValue placeholder="--:--" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {timeOptions.map((time) => (
                    <SelectItem 
                      key={time} 
                      value={time}
                      className="hover:bg-blue-100 hover:text-blue-900 cursor-pointer transition-colors duration-150"
                    >
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full hover:bg-green-100 hover:text-green-800 hover:border-green-300 transition-colors duration-200"
                  onClick={() => {
                    const now = new Date()
                    const futureTime = addMinutes(now, 60) // Default to 1 hour from now
                    handleDateSelect(futureTime)
                    handleTimeSelect(format(futureTime, "HH:mm"))
                  }}
                >
                  Now + 1h
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full hover:bg-gray-100 hover:text-gray-800 hover:border-gray-300 transition-colors duration-200"
                  onClick={handleClear}
                >
                  Clear
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
      
      
      {dateSelectionEffect === 'error' && (
        <div className="flex items-center gap-2 text-sm text-red-600 animate-fade-in">
          <AlertCircle className="h-4 w-4" />
          <span>Cannot select past dates.</span>
        </div>
      )}
      
      {isInPast() && !dateSelectionEffect && (
        <p className="text-sm text-red-500">
          Selected time is in the past. Please choose a future date and time.
        </p>
      )}
    </div>
  )
}