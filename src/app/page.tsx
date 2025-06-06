import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  FolderOpen, 
  DollarSign, 
  TrendingUp,
  Clock,
  CheckCircle
} from 'lucide-react'

export default function Dashboard() {
  return (
    <div>
      <PageHeader 
        title="Dashboard" 
        description="Visão geral da sua agência"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              +2 novos este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projetos Ativos</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              3 em desenvolvimento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 45.230</div>
            <p className="text-xs text-muted-foreground">
              +12% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">IA Utilizadas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">247</div>
            <p className="text-xs text-muted-foreground">
              de 500 disponíveis
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Projetos Recentes</CardTitle>
            <CardDescription>
              Últimos projetos criados ou atualizados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  Campanha Black Friday - Loja XYZ
                </p>
                <p className="text-sm text-muted-foreground">
                  Cliente: Loja XYZ
                </p>
              </div>
              <Badge variant="secondary">Em Progresso</Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  Redesign Website - Tech Corp
                </p>
                <p className="text-sm text-muted-foreground">
                  Cliente: Tech Corp
                </p>
              </div>
              <Badge variant="outline">Planejamento</Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  Social Media - Restaurante ABC
                </p>
                <p className="text-sm text-muted-foreground">
                  Cliente: Restaurante ABC
                </p>
              </div>
              <Badge>Concluído</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tarefas Pendentes</CardTitle>
            <CardDescription>
              Tarefas que precisam da sua atenção
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Clock className="h-4 w-4 text-orange-500" />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  Revisar proposta comercial
                </p>
                <p className="text-sm text-muted-foreground">
                  Vence em 2 dias
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Clock className="h-4 w-4 text-red-500" />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  Entrega de criativos
                </p>
                <p className="text-sm text-muted-foreground">
                  Vence hoje
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  Reunião de alinhamento
                </p>
                <p className="text-sm text-muted-foreground">
                  Agendada para amanhã
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
