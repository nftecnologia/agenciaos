"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

export type CalendarProps = React.ComponentProps<"div"> & {
  mode?: "single" | "multiple" | "range"
  selected?: Date | Date[] | { from: Date; to?: Date }
  onSelect?: (date: Date | Date[] | { from: Date; to?: Date } | undefined) => void
  disabled?: (date: Date) => boolean
  className?: string
}

function Calendar({
  className,
  mode = "single",
  selected,
  onSelect,
  disabled,
  ...props
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date())

  const today = new Date()
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()

  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay()

  // Generate calendar days
  const days = []
  
  // Add empty cells for days before month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null)
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(year, month, day))
  }

  const isSelected = (date: Date) => {
    if (!selected) return false
    
    if (mode === "single") {
      return selected instanceof Date && 
             date.toDateString() === selected.toDateString()
    }
    
    if (mode === "multiple") {
      return Array.isArray(selected) && 
             selected.some(d => d.toDateString() === date.toDateString())
    }
    
    if (mode === "range") {
      const range = selected as { from: Date; to?: Date }
      if (!range.from) return false
      if (!range.to) return date.toDateString() === range.from.toDateString()
      return date >= range.from && date <= range.to
    }
    
    return false
  }

  const handleDateClick = (date: Date) => {
    if (disabled?.(date)) return
    
    if (mode === "single") {
      onSelect?.(date)
    } else if (mode === "multiple") {
      const currentSelected = (selected as Date[]) || []
      const isAlreadySelected = currentSelected.some(d => 
        d.toDateString() === date.toDateString()
      )
      
      if (isAlreadySelected) {
        onSelect?.(currentSelected.filter(d => 
          d.toDateString() !== date.toDateString()
        ))
      } else {
        onSelect?.([...currentSelected, date])
      }
    } else if (mode === "range") {
      const range = (selected as { from: Date; to?: Date }) || { from: new Date() }
      
      if (!range.from || (range.from && range.to)) {
        onSelect?.({ from: date })
      } else if (date < range.from) {
        onSelect?.({ from: date, to: range.from })
      } else {
        onSelect?.({ from: range.from, to: date })
      }
    }
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ]

  const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

  return (
    <div className={cn("p-3", className)} {...props}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateMonth("prev")}
          className="h-7 w-7 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="text-sm font-medium">
          {monthNames[month]} {year}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateMonth("next")}
          className="h-7 w-7 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div
            key={day}
            className="text-xs text-muted-foreground text-center p-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => {
          if (!date) {
            return <div key={index} className="p-2" />
          }

          const isToday = date.toDateString() === today.toDateString()
          const isDateSelected = isSelected(date)
          const isDisabled = disabled?.(date)

          return (
            <Button
              key={date.toISOString()}
              variant={isDateSelected ? "default" : "ghost"}
              size="sm"
              className={cn(
                "h-8 w-8 p-0 text-xs",
                isToday && !isDateSelected && "bg-accent text-accent-foreground",
                isDisabled && "opacity-50 cursor-not-allowed"
              )}
              onClick={() => handleDateClick(date)}
              disabled={isDisabled}
            >
              {date.getDate()}
            </Button>
          )
        })}
      </div>
    </div>
  )
}

Calendar.displayName = "Calendar"

export { Calendar }
