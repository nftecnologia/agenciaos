'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Clock, 
  Target,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react'

export function IAInsights() {
  const insights = [
    {
      id: 1,
      title: 'Oportunidade de Upsell Identificada',
      description: 'Cliente TechCorp tem 85% de probabilidade de aceitar serviços adicionais baseado no comportamento recente',
      type: 'opportunity',
      impact: 'high',
      confidence: 85,
      estimatedValue: 'R$ 12.000',
      category: 'Vendas',
      actionable: true
    },
    {
      id: 2,
      title: 'Risco de Churn Detectado',
      description: 'Cliente StartupXYZ mostra sinais de insatisfação: 3 tickets em aberto há mais de 5 dias',
      type: 'risk',
      impact: 'high',
      confidence: 78,
      estimatedValue: '-R$ 8.500',
      category: 'Retenção',
      actionable: true
    },
    {
      id: 3,
      title: 'Eficiência da Equipe em Alta',
      description: 'Produtividade aumentou 23% este mês com a implementação de novos processos automatizados',
      type: 'positive',
      impact: 'medium',
      confidence: 92,
      estimatedValue: '+15h/semana',
      category: 'Operações',
      actionable: false
    },
    {
      id: 4,
      title: 'Tendência de Mercado Favorável',
      description: 'Demanda por serviços de design UI/UX cresceu 34% no seu nicho nos últimos 3 meses',
      type: 'trend',
      impact: 'medium',
      confidence: 89,
      estimatedValue: '+R$ 25.000',
      category: 'Mercado',
      actionable: true
    },
    {
      id: 5,
      title: 'Otimização de Fluxo de Trabalho',
      description: 'Identificadas 4 tarefas recorrentes que podem ser automatizadas, economizando 8h/semana',
      type: 'optimization',
      impact: 'medium',
      confidence: 95,
      estimatedValue: '8h/semana',
      category: 'Eficiência',
      actionable: true
    }
  ]

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'risk':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case 'positive':
        return <CheckCircle className="h-4 w-4 text-blue-600" />
      case 'trend':
        return <TrendingUp className="h-4 w-4 text-purple-600" />
      case 'optimization':
        return <Target className="h-4 w-4 text-orange-600" />
      default:
        return <Info className="h-4 w-4 text-gray-600" />
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'opportunity':
        return 'border-green-200 bg-green-50'
      case 'risk':
        return 'border-red-200 bg-red-50'
      case 'positive':
        return 'border-blue-200 bg-blue-50'
      case 'trend':
        return 'border-purple-200 bg-purple-50'
      case 'optimization':
        return 'border-orange-200 bg-orange-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'high':
        return <Badge variant="destructive">Alto Impacto</Badge>
      case 'medium':
        return <Badge variant="secondary">Médio Impacto</Badge>
      case 'low':
        return <Badge variant="outline">Baixo Impacto</Badge>
      default:
        return <Badge variant="outline">Indefinido</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-medium">Insights Inteligentes</h3>
        <p className="text-sm text-muted-foreground">
          Análises automáticas baseadas nos dados da sua agência
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Oportunidades</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">2</div>
            <p className="text-xs text-muted-foreground">
              Valor potencial: R$ 37.000
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Riscos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">1</div>
            <p className="text-xs text-muted-foreground">
              Requer ação imediata
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eficiência</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">+23%</div>
            <p className="text-xs text-muted-foreground">
              Este mês vs anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confiança IA</CardTitle>
            <CheckCircle className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">87%</div>
            <p className="text-xs text-muted-foreground">
              Precisão média
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Insights List */}
      <div className="space-y-4">
        {insights.map((insight) => (
          <Card key={insight.id} className={`border-l-4 ${getInsightColor(insight.type)}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {getInsightIcon(insight.type)}
                  <div>
                    <CardTitle className="text-base">{insight.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {insight.description}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {getImpactBadge(insight.impact)}
                  <Badge variant="outline" className="text-xs">
                    {insight.category}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Confiança:</span>
                    <span className="font-medium">{insight.confidence}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Valor:</span>
                    <span className="font-medium">{insight.estimatedValue}</span>
                  </div>
                </div>
                
                {insight.actionable && (
                  <Badge variant="secondary" className="text-xs">
                    Ação Recomendada
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
