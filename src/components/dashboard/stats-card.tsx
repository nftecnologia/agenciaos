import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  growth?: number
  icon?: React.ReactNode
  loading?: boolean
}

export function StatsCard({ 
  title, 
  value, 
  subtitle, 
  growth, 
  icon, 
  loading = false 
}: StatsCardProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {icon && <div className="h-4 w-4 text-muted-foreground">{icon}</div>}
        </CardHeader>
        <CardContent>
          <div className="h-8 w-24 bg-muted animate-pulse rounded mb-2" />
          {subtitle && <div className="h-4 w-32 bg-muted animate-pulse rounded" />}
        </CardContent>
      </Card>
    )
  }

  const formatGrowth = (growth: number) => {
    if (growth === 0) return null
    
    const isPositive = growth > 0
    const Icon = isPositive ? TrendingUp : growth < 0 ? TrendingDown : Minus
    const color = isPositive ? 'text-green-600' : growth < 0 ? 'text-red-600' : 'text-gray-500'
    
    return (
      <Badge variant="outline" className={`${color} border-current`}>
        <Icon className="h-3 w-3 mr-1" />
        {Math.abs(growth).toFixed(1)}%
      </Badge>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="h-4 w-4 text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(subtitle || growth !== undefined) && (
          <div className="flex items-center justify-between mt-2">
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
            {growth !== undefined && formatGrowth(growth)}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 