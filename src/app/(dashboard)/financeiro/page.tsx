import { Suspense } from 'react'
import { PageHeader } from '@/components/layout/page-header'
import { FinancialDashboard } from '@/components/financial/financial-dashboard'
import { RevenuesList } from '@/components/financial/revenues-list'
import { ExpensesList } from '@/components/financial/expenses-list'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

function FinancialSkeleton() {
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
              <Skeleton className="h-3 w-[80px]" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-[200px]" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    </div>
  )
}

export default function FinanceiroPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Financeiro"
        description="Gerencie receitas, despesas e acompanhe a saúde financeira da sua agência"
      />

      <Suspense fallback={<FinancialSkeleton />}>
        <FinancialDashboard />
      </Suspense>

      <Tabs defaultValue="receitas" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="receitas">Receitas</TabsTrigger>
          <TabsTrigger value="despesas">Despesas</TabsTrigger>
        </TabsList>

        <TabsContent value="receitas" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Receitas</CardTitle>
              <CardDescription>
                Gerencie todas as receitas da sua agência
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
                <RevenuesList />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="despesas" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Despesas</CardTitle>
              <CardDescription>
                Controle todas as despesas da sua agência
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
                <ExpensesList />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 