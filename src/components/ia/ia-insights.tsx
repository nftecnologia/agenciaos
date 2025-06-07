'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Calendar,
  Target,
  Lightbulb,
  ArrowUpRight
} from 'lucide-react'

export function IAInsights() {
  const insights = [
    {
      id: '1',
      title: 'Crescimento de Receita Acelerado',
      description: 'Sua receita cresceu 23% nos últimos 30 dias, superando a meta de 15%.',
      type: 'positive',
      icon: TrendingUp,
      category: 'Financeiro',
      priority: 'high',
      impact: 'Alto',
      confidence: 94,
      recommendations: [
        'Considere aumentar os preços dos serviços mais procurados',
        'Replique estratégias bem-sucedidas em outros projetos',
        'Invista em marketing para manter o momentum'
      ]
    },
    {
      id: '2',
      title: 'Cliente em Risco de Churn',
      description: 'Cliente "TechCorp" não interage há 15 dias e tem padrão de cancelamento.',
      type: 'warning',
      icon: AlertTriangle,
      category: 'Relacionamento',
      priority: 'high',
      impact: 'Médio',
      confidence: 87,
      recommendations: [
        'Agendar call de check-in imediatamente',
        'Oferecer desconto ou serviço adicional',
        'Investigar possíveis problemas de satisfação'
      ]
    },
    {
      id: '3',
      title: 'Eficiência de Projeto Melhorada',
      description: 'Projetos de design são concluídos 18% mais rápido que a média do setor.',
      type: 'positive',
      icon: CheckCircle,
      category: 'Produtividade',
      priority: 'medium',
      impact: 'Alto',
      confidence: 91,
      recommendations: [
        'Documente o processo otimizado',
        'Treine a equipe para replicar a eficiência',
        'Use como diferencial competitivo nas propostas'
      ]
    },
    {
      id: '4',
      title: 'Oportunidade de Upsell Identificada',
      description: '3 clientes ativos têm perfil ideal para serviços de consultoria premium.',
      type: 'opportunity',
      icon: Target,
      category: 'Vendas',
      priority: 'medium',
      impact: 'Alto',
      confidence: 89,
      recommendations: [
        'Criar proposta personalizada para cada cliente',
        'Destacar ROI baseado em casos similares',
        'Agendar apresentação dos novos serviços'
      ]
    },
    {
      id: '5',
      title: 'Gargalo na Aprovação de Projetos',
      description: 'Projetos ficam em média 3.2 dias aguardando aprovação do cliente.',
      type: 'warning',
      icon: AlertTriangle,
      category: 'Processo',
      priority: 'medium',
      impact: 'Médio',
      confidence: 85,
      recommendations: [
        'Implementar sistema de aprovação online',
        'Definir prazos mais claros para feedback',
        'Criar templates de apresentação mais eficazes'
      ]
    }
  ]

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'positive':
        return 'text-green-600 bg-green-100'
      case 'warning':
        return 'text-yellow-600 bg-yellow-100'
      case 'opportunity':
        return 'text-blue-600 bg-blue-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }


  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Insights Inteligentes</h3>
          <p className="text-sm text-muted-foreground">
            Análises automáticas baseadas nos dados da sua agência
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Calendar className="h-4 w-4 mr-2" />
          Últimos 30 dias
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Insights Gerados</CardTitle>
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              +3 desde ontem
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alta Prioridade</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">
              Requer ação imediata
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confiança Média</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89%</div>
            <p className="text-xs text-muted-foreground">
              Precisão dos insights
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Insights List */}
      <div className="space-y-4">
        {insights.map((insight) => {
          const IconComponent = insight.icon
          return (
            <Card key={insight.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-md ${getTypeColor(insight.type)}`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-base">{insight.title}</CardTitle>
                        <Badge variant="outline" className={getPriorityColor(insight.priority)}>
                          {insight.priority === 'high' ? 'Alta' : 
                           insight.priority === 'medium' ? 'Média' : 'Baixa'}
                        </Badge>
                      </div>
                      <CardDescription className="text-sm">
                        {insight.description}
                      </CardDescription>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>Categoria: {insight.category}</span>
                        <span>Impacto: {insight.impact}</span>
                        <span>Confiança: {insight.confidence}%</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Recomendações:
                  </h4>
                  <ul className="space-y-1">
                    {insight.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm flex items-start gap-2">
                        <CheckCircle className="h-3 w-3 mt-0.5 text-green-600 flex-shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="outline">
                    Implementar
                  </Button>
                  <Button size="sm" variant="ghost">
                    Mais Detalhes
                  </Button>
                  <Button size="sm" variant="ghost">
                    Descartar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
