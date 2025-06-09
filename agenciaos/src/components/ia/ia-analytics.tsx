'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  BarChart3, 
  TrendingUp, 
  Brain, 
  Clock, 
  Target,
  Zap,
  CheckCircle,
  Calendar,
  Activity
} from 'lucide-react'

export function IAAnalytics() {
  const aiUsageStats = [
    {
      metric: 'Consultas Totais',
      value: '1.247',
      change: '+23%',
      trend: 'up',
      period: 'este mês'
    },
    {
      metric: 'Tempo Economizado',
      value: '42.5h',
      change: '+15%',
      trend: 'up',
      period: 'esta semana'
    },
    {
      metric: 'Precisão Média',
      value: '94.2%',
      change: '+2.1%',
      trend: 'up',
      period: 'últimos 30 dias'
    },
    {
      metric: 'Satisfação do Usuário',
      value: '4.8/5.0',
      change: '+0.3',
      trend: 'up',
      period: 'avaliações recentes'
    }
  ]

  const assistantPerformance = [
    {
      name: 'Assistente de Negócios',
      usage: 85,
      accuracy: 96,
      satisfaction: 4.9,
      totalQueries: 456,
      avgResponseTime: '1.2s'
    },
    {
      name: 'Gerente de Projetos',
      usage: 72,
      accuracy: 93,
      satisfaction: 4.7,
      totalQueries: 342,
      avgResponseTime: '1.8s'
    },
    {
      name: 'Consultor Financeiro',
      usage: 68,
      accuracy: 95,
      satisfaction: 4.8,
      totalQueries: 298,
      avgResponseTime: '1.5s'
    }
  ]

  const weeklyUsage = [
    { day: 'Seg', queries: 28, timeSpent: 6.2 },
    { day: 'Ter', queries: 45, timeSpent: 8.7 },
    { day: 'Qua', queries: 52, timeSpent: 9.8 },
    { day: 'Qui', queries: 38, timeSpent: 7.1 },
    { day: 'Sex', queries: 41, timeSpent: 8.3 },
    { day: 'Sáb', queries: 15, timeSpent: 2.4 },
    { day: 'Dom', queries: 8, timeSpent: 1.1 }
  ]

  const insights = [
    {
      title: 'Pico de Uso às Terças',
      description: 'Maior volume de consultas acontece às terças-feiras (52 consultas)',
      type: 'trend',
      impact: 'Médio'
    },
    {
      title: 'IA Financeira em Alta',
      description: 'Consultor Financeiro teve 34% mais uso que a semana passada',
      type: 'growth',
      impact: 'Alto'
    },
    {
      title: 'Tempo de Resposta Otimizado',
      description: 'Tempo médio de resposta melhorou 23% nos últimos 7 dias',
      type: 'performance',
      impact: 'Alto'
    }
  ]

  const getUsageBarWidth = (usage: number) => {
    return `${Math.min(usage, 100)}%`
  }

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 95) return 'text-green-600'
    if (accuracy >= 90) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'trend':
        return TrendingUp
      case 'growth':
        return BarChart3
      case 'performance':
        return Zap
      default:
        return Activity
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'trend':
        return 'bg-blue-100 text-blue-600'
      case 'growth':
        return 'bg-green-100 text-green-600'
      case 'performance':
        return 'bg-purple-100 text-purple-600'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Analytics de IA</h3>
          <p className="text-sm text-muted-foreground">
            Monitoramento e métricas de performance dos assistentes IA
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Calendar className="h-4 w-4 mr-2" />
          Últimos 30 dias
        </Button>
      </div>

      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {aiUsageStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.metric}</CardTitle>
              <div className={`h-4 w-4 ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                <TrendingUp className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className={stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                  {stat.change}
                </span>
                {' '}{stat.period}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Usage Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Uso Semanal de IA
          </CardTitle>
          <CardDescription>
            Consultas e tempo gasto por dia da semana
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {weeklyUsage.map((day, index) => {
              const maxQueries = Math.max(...weeklyUsage.map(d => d.queries))
              const barWidth = (day.queries / maxQueries) * 100
              
              return (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-8 text-sm font-medium">{day.day}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">{day.queries} consultas</span>
                      <span className="text-xs text-muted-foreground">{day.timeSpent}h</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full">
                      <div 
                        className="h-2 bg-blue-500 rounded-full" 
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Assistant Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Performance dos Assistentes
          </CardTitle>
          <CardDescription>
            Métricas detalhadas de cada assistente IA
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {assistantPerformance.map((assistant, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">{assistant.name}</h4>
                  <Badge variant="outline">{assistant.totalQueries} consultas</Badge>
                </div>
                
                <div className="grid gap-4 md:grid-cols-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Uso</div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full">
                        <div 
                          className="h-2 bg-blue-500 rounded-full" 
                          style={{ width: getUsageBarWidth(assistant.usage) }}
                        />
                      </div>
                      <span className="text-sm font-medium">{assistant.usage}%</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Precisão</div>
                    <div className={`text-lg font-semibold ${getAccuracyColor(assistant.accuracy)}`}>
                      {assistant.accuracy}%
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Satisfação</div>
                    <div className="text-lg font-semibold text-yellow-600">
                      {assistant.satisfaction}/5.0
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Tempo Resposta</div>
                    <div className="text-lg font-semibold">
                      {assistant.avgResponseTime}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Insights sobre Uso da IA
          </CardTitle>
          <CardDescription>
            Padrões e tendências identificados automaticamente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {insights.map((insight, index) => {
              const IconComponent = getInsightIcon(insight.type)
              return (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className={`p-2 rounded-md ${getInsightColor(insight.type)}`}>
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{insight.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {insight.description}
                    </p>
                    <Badge variant="outline" className="mt-2 text-xs">
                      Impacto {insight.impact}
                    </Badge>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* System Health */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Saúde do Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Status do Servidor</span>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Online</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Latência Média</span>
                <span className="text-sm font-medium">1.4s</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Uptime</span>
                <span className="text-sm font-medium">99.8%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Cache Hit Rate</span>
                <span className="text-sm font-medium">89.2%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Próximas Atualizações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 mt-0.5 text-blue-600" />
                <div>
                  <div className="text-sm font-medium">Assistente de Conteúdo</div>
                  <div className="text-xs text-muted-foreground">Lançamento em 7 dias</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 mt-0.5 text-purple-600" />
                <div>
                  <div className="text-sm font-medium">Análise Preditiva</div>
                  <div className="text-xs text-muted-foreground">Lançamento em 14 dias</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 mt-0.5 text-green-600" />
                <div>
                  <div className="text-sm font-medium">API Integrations</div>
                  <div className="text-xs text-muted-foreground">Lançamento em 21 dias</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
