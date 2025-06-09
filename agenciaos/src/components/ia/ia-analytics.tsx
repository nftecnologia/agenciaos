'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Users, 
  DollarSign, 
  Clock, 
  Target,
  Brain,
  Zap
} from 'lucide-react'

export function IAAnalytics() {
  const analytics = [
    {
      title: 'Performance da IA',
      description: 'Métricas de precisão e efetividade dos assistentes',
      metrics: [
        { label: 'Precisão Geral', value: '94%', trend: '+2%', type: 'positive' },
        { label: 'Consultas Processadas', value: '1,247', trend: '+15%', type: 'positive' },
        { label: 'Tempo Médio de Resposta', value: '1.2s', trend: '-0.3s', type: 'positive' },
        { label: 'Taxa de Satisfação', value: '96%', trend: '+3%', type: 'positive' }
      ]
    },
    {
      title: 'Impacto nos Negócios',
      description: 'Como a IA está influenciando os resultados da agência',
      metrics: [
        { label: 'Tempo Economizado', value: '47h', trend: '+12h', type: 'positive' },
        { label: 'Receita Gerada', value: 'R$ 23k', trend: '+R$ 8k', type: 'positive' },
        { label: 'Clientes Retidos', value: '12', trend: '+4', type: 'positive' },
        { label: 'Eficiência Operacional', value: '+23%', trend: '+5%', type: 'positive' }
      ]
    },
    {
      title: 'Uso por Assistente',
      description: 'Distribuição de uso entre os assistentes especializados',
      metrics: [
        { label: 'Assistente de Negócios', value: '38%', trend: '+5%', type: 'positive' },
        { label: 'Gerente de Projetos', value: '28%', trend: '+2%', type: 'positive' },
        { label: 'Consultor Financeiro', value: '24%', trend: '-1%', type: 'neutral' },
        { label: 'Criador de Conteúdo', value: '10%', trend: '+8%', type: 'positive' }
      ]
    }
  ]

  const automationMetrics = [
    {
      title: 'Relatórios Automatizados',
      value: '156',
      description: 'Gerados este mês',
      icon: BarChart3,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Processos Otimizados',
      value: '8',
      description: 'Fluxos melhorados pela IA',
      icon: Zap,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'Insights Gerados',
      value: '42',
      description: 'Recomendações acionáveis',
      icon: Brain,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Automações Ativas',
      value: '12',
      description: 'Rodando em background',
      icon: Target,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    }
  ]

  const getTrendIcon = (type: string) => {
    switch (type) {
      case 'positive':
        return <TrendingUp className="h-3 w-3 text-green-600" />
      case 'negative':
        return <TrendingDown className="h-3 w-3 text-red-600" />
      default:
        return <Activity className="h-3 w-3 text-gray-600" />
    }
  }

  const getTrendColor = (type: string) => {
    switch (type) {
      case 'positive':
        return 'text-green-600'
      case 'negative':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-medium">Analytics da IA</h3>
        <p className="text-sm text-muted-foreground">
          Métricas e insights sobre o desempenho dos assistentes inteligentes
        </p>
      </div>

      {/* Automation Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {automationMetrics.map((metric) => {
          const Icon = metric.icon
          return (
            <Card key={metric.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                <div className={`p-2 rounded-md ${metric.bgColor}`}>
                  <Icon className={`h-4 w-4 ${metric.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className="text-xs text-muted-foreground">
                  {metric.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Detailed Analytics */}
      <div className="grid gap-6 lg:grid-cols-1">
        {analytics.map((section, sectionIndex) => (
          <Card key={sectionIndex}>
            <CardHeader>
              <CardTitle className="text-base">{section.title}</CardTitle>
              <CardDescription>{section.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {section.metrics.map((metric, metricIndex) => (
                  <div key={metricIndex} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-muted-foreground">
                        {metric.label}
                      </div>
                      <div className={`flex items-center gap-1 ${getTrendColor(metric.type)}`}>
                        {getTrendIcon(metric.type)}
                        <span className="text-xs font-medium">{metric.trend}</span>
                      </div>
                    </div>
                    <div className="text-2xl font-bold mt-2">{metric.value}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Summary */}
      <Card className="border-l-4 border-l-green-500">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-600" />
            <CardTitle className="text-base">Resumo de Performance</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">+47%</div>
              <div className="text-sm text-green-700">Produtividade Geral</div>
              <div className="text-xs text-muted-foreground mt-1">vs mês anterior</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">R$ 23k</div>
              <div className="text-sm text-blue-700">Valor Gerado pela IA</div>
              <div className="text-xs text-muted-foreground mt-1">este mês</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">96%</div>
              <div className="text-sm text-purple-700">Satisfação do Usuário</div>
              <div className="text-xs text-muted-foreground mt-1">feedback positivo</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Atividade Recente da IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                time: '2 min atrás',
                action: 'Assistente de Negócios gerou insight sobre oportunidade de upsell',
                value: 'R$ 12.000',
                type: 'opportunity'
              },
              {
                time: '15 min atrás',
                action: 'Gerente de Projetos otimizou cronograma do Projeto Alpha',
                value: '3 dias',
                type: 'optimization'
              },
              {
                time: '1h atrás',
                action: 'Consultor Financeiro detectou tendência de aumento de receita',
                value: '+15%',
                type: 'insight'
              },
              {
                time: '2h atrás',
                action: 'Criador de Conteúdo gerou carrossel para redes sociais',
                value: '5 slides',
                type: 'content'
              }
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="text-sm font-medium">{activity.action}</div>
                  <div className="text-xs text-muted-foreground">{activity.time}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {activity.value}
                  </Badge>
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
