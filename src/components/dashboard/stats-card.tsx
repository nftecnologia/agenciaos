"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  change?: number
  icon: LucideIcon
  description?: string
  trend?: "up" | "down" | "neutral"
  format?: "number" | "currency" | "percentage"
  className?: string
}

export function StatsCard({
  title,
  value,
  change,
  icon: Icon,
  description,
  trend,
  format = "number",
  className,
}: StatsCardProps) {
  const formatValue = (val: string | number) => {
    if (typeof val === "string") return val
    
    switch (format) {
      case "currency":
        return new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(val)
      case "percentage":
        return `${val}%`
      default:
        return new Intl.NumberFormat("pt-BR").format(val)
    }
  }

  const getChangeColor = (changeValue?: number) => {
    if (!changeValue) return "text-muted-foreground"
    if (changeValue > 0) return "text-green-600"
    if (changeValue < 0) return "text-red-600"
    return "text-muted-foreground"
  }

  const getChangeIcon = (changeValue?: number) => {
    if (!changeValue) return ""
    if (changeValue > 0) return "↗"
    if (changeValue < 0) return "↘"
    return "→"
  }

  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return "text-green-600"
      case "down":
        return "text-red-600"
      default:
        return "text-muted-foreground"
    }
  }

  return (
    <Card className={cn("transition-all hover:shadow-md", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatValue(value)}</div>
        
        {change !== undefined && (
          <div className="flex items-center space-x-1 mt-1">
            <span className={cn("text-xs font-medium", getChangeColor(change))}>
              {getChangeIcon(change)} {Math.abs(change)}%
            </span>
            <span className="text-xs text-muted-foreground">
              vs período anterior
            </span>
          </div>
        )}
        
        {description && (
          <p className={cn("text-xs mt-1", getTrendColor())}>
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

interface StatsGridProps {
  children: React.ReactNode
  className?: string
}

export function StatsGrid({ children, className }: StatsGridProps) {
  return (
    <div className={cn(
      "grid gap-4 md:grid-cols-2 lg:grid-cols-4",
      className
    )}>
      {children}
    </div>
  )
}

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: {
    value: number
    label: string
    positive?: boolean
  }
  className?: string
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className,
}: MetricCardProps) {
  return (
    <Card className={cn("p-6", className)}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className="flex flex-col items-end space-y-2">
          <Icon className="h-8 w-8 text-muted-foreground" />
          {trend && (
            <Badge
              variant={trend.positive ? "default" : "destructive"}
              className="text-xs"
            >
              {trend.positive ? "+" : ""}{trend.value}% {trend.label}
            </Badge>
          )}
        </div>
      </div>
    </Card>
  )
}
