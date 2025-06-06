import { cn } from '@/lib/utils'

interface SimpleSelectProps {
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  className?: string
  children: React.ReactNode
}

interface SimpleSelectItemProps {
  value: string
  children: React.ReactNode
}

export function SimpleSelect({ 
  value, 
  onValueChange, 
  placeholder, 
  className,
  children 
}: SimpleSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {children}
    </select>
  )
}

export function SimpleSelectItem({ value, children }: SimpleSelectItemProps) {
  return <option value={value}>{children}</option>
} 