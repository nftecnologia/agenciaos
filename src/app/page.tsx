'use client'

import { PageHeader } from '@/components/layout/page-header'
import { StatsCard } from '@/components/dashboard/stats-card'
import { RecentProjects } from '@/components/dashboard/recent-projects'
import { PendingTasks } from '@/components/dashboard/pending-tasks'
import { useDashboard } from '@/hooks/use-dashboard'
import { 
  Users, 
  FolderOpen, 
  DollarSign, 
  Bot,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function DashboardPage() {
  const { stats, loading, error, refresh } = useDashboard()

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Dashboard"
          description="Visão geral da sua agência"
        />
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">Erro ao carregar dados: {error}</p>
          <Button onClick={refresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar Novamente
          </Button>
        </div>
      </div>
    )
  }
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Visão geral da sua agência"
        action={
          <Button onClick={refresh} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        }
      />

      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total de Clientes"
          value={stats?.clients.total || 0}
          growth={stats?.clients.growth}
          icon={<Users className="h-4 w-4" />}
          loading={loading}
        />

        <StatsCard
          title="Projetos Ativos"
          value={stats?.projects.active || 0}
          subtitle={`${stats?.projects.total || 0} total`}
          growth={stats?.projects.growth}
          icon={<FolderOpen className="h-4 w-4" />}
          loading={loading}
        />

        <StatsCard
          title="Receita Mensal"
          value={stats ? formatCurrency(Number(stats.revenue.monthly)) : 'R$ 0,00'}
          subtitle={`Total: ${stats ? formatCurrency(Number(stats.revenue.total)) : 'R$ 0,00'}`}
          growth={stats?.revenue.growth}
          icon={<DollarSign className="h-4 w-4" />}
          loading={loading}
        />

        <StatsCard
          title="IA Utilizada"
          value={stats ? `${stats.ai.used}/${stats.ai.limit}` : '0/20'}
          subtitle={stats ? `${stats.ai.percentage}% do limite` : '0% do limite'}
          icon={<Bot className="h-4 w-4" />}
          loading={loading}
        />
      </div>

      {/* Seção de Projetos e Tarefas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Projetos Recentes */}
        <div className="col-span-4">
          <RecentProjects 
            projects={stats?.recentProjects || []} 
            loading={loading} 
          />
        </div>

        {/* Tarefas Pendentes */}
        <div className="col-span-3">
          <PendingTasks 
            tasks={stats?.pendingTasks || []} 
            loading={loading} 
          />
        </div>
      </div>
    </div>
  )
}
