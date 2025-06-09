'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  Target,
  Zap,
  TrendingUp,
  FileText,
  Calendar,
  ArrowRight,
  CheckCircle,
  Star
} from 'lucide-react'

export function IASuggestions() {
  const suggestions = [
    {
      id: '1',
      title: 'Automatizar Relatórios Semanais',
      description: 'Configure relatórios automáticos para economizar 4h/semana da equipe.',
      category: 'Automação',
      impact: 'Alto',
      effort: 'Baixo',
      savings: 'R$ 2.400/mês',
      timeToImplement: '2 dias',
      icon: Zap,
      color: 'bg-purple-500',
      steps: [
        'Definir template padrão de relatório',
        'Configurar automação no sistema',
        'Testar com um cliente piloto',
        'Implementar para todos os clientes'
      ]
    },
    {
      id: '2',
      title: 'Programa de Referência de Clientes',
      description: 'Lance um programa de referência que pode gerar 3-5 novos clientes/mês.',
      category: 'Marketing',
      impact: 'Alto',
      effort: 'Médio',
      savings: 'R$ 15.000/mês',
      timeToImplement: '1 semana',
      icon: Users,
      color: 'bg-green-500',
      steps: [
        'Criar estrutura de incentivos',
        'Desenvolver materiais promocionais',
        'Contatar clientes satisfeitos',
        'Lançar programa oficialmente'
      ]
    },
    {
      id: '3',
      title: 'Pacotes de Serviços Recorrentes',
      description: 'Crie pacotes mensais para aumentar a previsibilidade da receita.',
      category: 'Vendas',
      impact: 'Alto',
      effort: 'Médio',
      savings: 'R$ 8.000/mês',
      timeToImplement: '3 dias',
      icon: Target,
      color: 'bg-blue-500',
      steps: [
        'Analisar serviços mais solicitados',
        'Criar estrutura de preços recorrentes',
        'Apresentar para clientes atuais',
        'Ajustar proposta comercial'
      ]
    },
    {
      id: '4',
      title: 'Sistema de Templates de Projetos',
      description: 'Padronize processos para reduzir tempo de setup em 60%.',
      category: 'Processo',
      impact: 'Médio',
      effort: 'Baixo',
      savings: 'R$ 3.200/mês',
      timeToImplement: '1 dia',
      icon: FileText,
      color: 'bg-orange-500',
      steps: [
        'Documentar processos atuais',
        'Criar templates reutilizáveis',
        'Treinar equipe nos novos templates',
        'Implementar gradualmente'
      ]
    },
    {
      id: '5',
      title: 'Análise Preditiva de Churn',
      description: 'Implemente alertas para identificar clientes em risco 30 dias antes.',
      category: 'Retenção',
      impact: 'Alto',
      effort: 'Alto',
      savings: 'R$ 12.000/mês',
      timeToImplement: '2 semanas',
      icon: TrendingUp,
      color: 'bg-red-500',
      steps: [
        'Configurar métricas de engajamento',
        'Definir scores de saúde do cliente',
        'Criar alertas automáticos',
        'Treinar equipe em ações preventivas'
      ]
    }
  ]

  const quickWins = [
    {
      title: 'Atualizar Página de Preços',
      description: 'Pode aumentar conversão em 15%',
      timeToImplement: '2 horas',
      impact: 'Médio'
    },
    {
      title: 'Configurar Backup Automático',
      description: 'Protege dados críticos da agência',
      timeToImplement: '1 hora',
      impact: 'Alto'
    },
    {
      title: 'Otimizar Imagens do Site',
      description: 'Melhora velocidade em 40%',
      timeToImplement: '3 horas',
      impact: 'Médio'
    }
  ]

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'Baixo':
        return 'bg-green-100 text-green-800'
      case 'Médio':
        return 'bg-yellow-100 text-yellow-800'
      case 'Alto':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'Alto':
        return 'bg-blue-100 text-blue-800'
      case 'Médio':
        return 'bg-purple-100 text-purple-800'
      case 'Baixo':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Sugestões Inteligentes</h3>
          <p className="text-sm text-muted-foreground">
            Recomendações personalizadas para crescer sua agência
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Star className="h-4 w-4 mr-2" />
          Por Prioridade
        </Button>
      </div>

      {/* Quick Wins */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Vitórias Rápidas
          </CardTitle>
          <CardDescription>
            Implementações simples com retorno imediato
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            {quickWins.map((win, index) => (
              <div key={index} className="p-3 border rounded-lg">
                <h4 className="font-medium text-sm">{win.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {win.description}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {win.timeToImplement}
                    </Badge>
                    <Badge variant="outline" className={getImpactColor(win.impact)}>
                      {win.impact}
                    </Badge>
                  </div>
                  <Button size="sm" variant="ghost">
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Suggestions */}
      <div className="space-y-4">
        {suggestions.map((suggestion) => {
          const IconComponent = suggestion.icon
          return (
            <Card key={suggestion.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-md ${suggestion.color}`}>
                      <IconComponent className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-base">{suggestion.title}</CardTitle>
                        <Badge variant="outline">{suggestion.category}</Badge>
                      </div>
                      <CardDescription className="text-sm">
                        {suggestion.description}
                      </CardDescription>
                      <div className="flex items-center gap-4 mt-2">
                        <Badge className={getImpactColor(suggestion.impact)}>
                          Impacto {suggestion.impact}
                        </Badge>
                        <Badge className={getEffortColor(suggestion.effort)}>
                          Esforço {suggestion.effort}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-lg font-semibold text-green-600">
                      {suggestion.savings}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      economia potencial
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 lg:grid-cols-2">
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      Plano de Implementação ({suggestion.timeToImplement})
                    </h4>
                    <ul className="space-y-1">
                      {suggestion.steps.map((step, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <span className="text-xs bg-muted rounded-full w-5 h-5 flex items-center justify-center mt-0.5 flex-shrink-0">
                            {index + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="text-sm font-medium mb-1">Benefícios Esperados</div>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div className="flex justify-between">
                          <span>ROI mensal:</span>
                          <span className="font-medium">340%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Payback:</span>
                          <span className="font-medium">15 dias</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Risco:</span>
                          <span className="font-medium text-green-600">Baixo</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button size="sm">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Implementar
                  </Button>
                  <Button size="sm" variant="outline">
                    Mais Detalhes
                  </Button>
                  <Button size="sm" variant="ghost">
                    Adiar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Implementation Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Histórico de Implementações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">8</div>
              <div className="text-xs text-muted-foreground">Implementadas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">R$ 45.200</div>
              <div className="text-xs text-muted-foreground">Economia Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">92%</div>
              <div className="text-xs text-muted-foreground">Taxa de Sucesso</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
