'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp, TrendingDown, DollarSign, CreditCard, PiggyBank, Target } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface FinancialStats {
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  monthlyRevenue: number
  monthlyExpenses: number
  monthlyProfit: number
  revenueGrowth: number
  expenseGrowth: number
  profitMargin: number
  recurringRevenue: number
  topCategories: {
    revenue: Array<{ category: string; amount: number; count: number }>
    expense: Array<{ category: string; amount: number; count: number }>
  }
}

export function FinancialDashboard() {
  const [stats, setStats] = useState<FinancialStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/financial/stats')
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Erro ao buscar estatísticas financeiras')
        }

        const data = await response.json()
        setStats(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return <FinancialDashboardSkeleton />
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-600">
            <p>Erro ao carregar dados financeiros</p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!stats) {
    return null
  }

  const formatGrowth = (growth: number) => {
    const isPositive = growth >= 0
    return (
      <div className={`flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        <span className="text-xs font-medium">
          {isPositive ? '+' : ''}{growth.toFixed(1)}%
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Métricas Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Mensal: {formatCurrency(stats.monthlyRevenue)}
              </p>
              {formatGrowth(stats.revenueGrowth)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas Totais</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalExpenses)}</div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Mensal: {formatCurrency(stats.monthlyExpenses)}
              </p>
              {formatGrowth(stats.expenseGrowth)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.netProfit)}</div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Mensal: {formatCurrency(stats.monthlyProfit)}
              </p>
              <Badge variant={stats.netProfit >= 0 ? 'default' : 'destructive'}>
                {stats.netProfit >= 0 ? 'Positivo' : 'Negativo'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Margem de Lucro</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.profitMargin.toFixed(1)}%</div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Recorrente: {formatCurrency(stats.recurringRevenue)}
              </p>
              <Badge variant={stats.profitMargin >= 20 ? 'default' : stats.profitMargin >= 10 ? 'secondary' : 'destructive'}>
                {stats.profitMargin >= 20 ? 'Excelente' : stats.profitMargin >= 10 ? 'Boa' : 'Baixa'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categorias Top */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Categorias - Receitas</CardTitle>
            <CardDescription>Principais fontes de receita</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topCategories.revenue.length > 0 ? (
                stats.topCategories.revenue.map((category) => (
                  <div key={category.category} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-sm font-medium">{category.category}</span>
                      <Badge variant="outline" className="text-xs">
                        {category.count} {category.count === 1 ? 'item' : 'itens'}
                      </Badge>
                    </div>
                    <span className="text-sm font-semibold text-green-600">
                      {formatCurrency(category.amount)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma receita cadastrada ainda
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Categorias - Despesas</CardTitle>
            <CardDescription>Principais gastos da agência</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topCategories.expense.length > 0 ? (
                stats.topCategories.expense.map((category) => (
                  <div key={category.category} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      <span className="text-sm font-medium">{category.category}</span>
                      <Badge variant="outline" className="text-xs">
                        {category.count} {category.count === 1 ? 'item' : 'itens'}
                      </Badge>
                    </div>
                    <span className="text-sm font-semibold text-red-600">
                      {formatCurrency(category.amount)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma despesa cadastrada ainda
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function FinancialDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[120px] mb-2" />
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-[80px]" />
                <Skeleton className="h-5 w-[60px]" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-[200px]" />
              <Skeleton className="h-4 w-[150px]" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Skeleton className="w-2 h-2 rounded-full" />
                      <Skeleton className="h-4 w-[100px]" />
                      <Skeleton className="h-5 w-[50px]" />
                    </div>
                    <Skeleton className="h-4 w-[80px]" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 