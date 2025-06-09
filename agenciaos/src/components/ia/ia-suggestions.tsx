'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Lightbulb, 
  Users, 
  DollarSign, 
  Clock, 
  Target,
  Zap,
  TrendingUp,
  CheckCircle,
  ArrowRight
} from 'lucide-react'

export function IASuggestions() {
  const suggestions = [
    {
      id: 1,
      title: 'Automatizar Relatórios Semanais',
      description: 'Configure relatórios automáticos para economizar 3h por semana na geração manual de reports',
      category: 'Automação',
      priority: 'high',
      impact: 'medium',
      timeToImplement: '2 horas',
      estimatedSavings: '3h/semana',
      icon: Zap,
      color: 'text-blue-600',
      actions: ['Configurar template', 'Agendar envio', 'Testar automação']
    },
    {
      id: 2,
      title: 'Implementar Sistema de Follow-up',
      description: 'Crie lembretes automáticos para acompanhar leads e propostas, aumentando conversão em 15%',
      category: 'Vendas',
      priority: 'high',
      impact: 'high',
      timeToImplement: '4 horas',
      estimatedSavings: '+R$ 8.500/mês',
      icon: Target,
      color: 'text-green-600',
      actions: ['Definir critérios', 'Configurar triggers', 'Criar templates']
    },
    {
      id: 3,
      title: 'Otimizar Precificação de Projetos',
      description: 'Ajuste seus preços baseado na análise de mercado e margem de lucro dos concorrentes',
      category: 'Financeiro',
      priority: 'medium',
      impact: 'high',
      timeToImplement: '1 hora',
      estimatedSavings: '+12% margem',
      icon: DollarSign,
      color: 'text-yellow-600',
      actions: ['Analisar mercado', 'Revisar tabela', 'Atualizar propostas']
    },
    {
      id: 4,
      title: 'Criar Programa de Fidelidade',
      description: 'Desenvolva um sistema de pontos para reter clientes e incentivar projetos recorrentes',
      category: 'Retenção',
      priority: 'medium',
      impact: 'medium',
      timeToImplement: '6 horas',
      estimatedSavings: '+25% retenção',
      icon: Users,
      color: 'text-purple-600',
      actions: ['Definir regras', 'Criar benefícios', 'Implementar sistema']
    },
    {
      id: 5,
      title: 'Otimizar Onboarding de Clientes',
      description: 'Melhore o processo de início de projetos para reduzir tempo de setup em 40%',
      category: 'Processos',
      priority: 'low',
      impact: 'medium',
      timeToImplement: '3 horas',
      estimatedSavings: '2h/projeto',
      icon: Clock,
      color: 'text-orange-600',
      actions: ['Mapear processo atual', 'Criar checklist', 'Treinar equipe']
    }
  ]

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">Alta</Badge>
      case 'medium':
        return <Badge variant="secondary">Média</Badge>
      case 'low':
        return <Badge variant="outline">Baixa</Badge>
      default:
        return <Badge variant="outline">-</Badge>
    }
  }

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'high':
        return <Badge className="bg-green-100 text-green-800">Alto Impacto</Badge>
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Médio Impacto</Badge>
      case 'low':
        return <Badge className="bg-gray-100 text-gray-800">Baixo Impacto</Badge>
      default:
        return <Badge variant="outline">-</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-medium">Sugestões Inteligentes</h3>
        <p className="text-sm text-muted-foreground">
          Recomendações personalizadas para otimizar sua agência
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sugestões Ativas</CardTitle>
            <Lightbulb className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">
              3 alta prioridade
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Economia Potencial</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 8.5k</div>
            <p className="text-xs text-muted-foreground">
              Por mês, se implementadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo de Setup</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">16h</div>
            <p className="text-xs text-muted-foreground">
              Total estimado
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Suggestions List */}
      <div className="space-y-4">
        {suggestions.map((suggestion) => {
          const Icon = suggestion.icon
          return (
            <Card key={suggestion.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <Icon className={`h-5 w-5 ${suggestion.color}`} />
                    </div>
                    <div>
                      <CardTitle className="text-base">{suggestion.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {suggestion.description}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getPriorityBadge(suggestion.priority)}
                    <Badge variant="outline" className="text-xs">
                      {suggestion.category}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Metrics */}
                <div className="grid grid-cols-3 gap-4 p-3 bg-muted/30 rounded-lg">
                  <div className="text-center">
                    <div className="text-sm font-medium">{suggestion.timeToImplement}</div>
                    <div className="text-xs text-muted-foreground">Tempo setup</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium">{suggestion.estimatedSavings}</div>
                    <div className="text-xs text-muted-foreground">Economia</div>
                  </div>
                  <div className="text-center">
                    {getImpactBadge(suggestion.impact)}
                  </div>
                </div>

                {/* Action Steps */}
                <div>
                  <h5 className="text-sm font-medium mb-2">Próximos passos:</h5>
                  <div className="space-y-1">
                    {suggestion.actions.map((action, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-medium text-primary">{index + 1}</span>
                        </div>
                        <span>{action}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2">
                  <Button variant="outline" size="sm">
                    Ver Detalhes
                  </Button>
                  <Button size="sm" className="gap-2">
                    Implementar
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* CTA Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-dashed">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            Precisa de mais sugestões?
          </CardTitle>
          <CardDescription>
            Nossa IA pode analisar áreas específicas do seu negócio para gerar recomendações personalizadas
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button className="gap-2">
            <Target className="h-4 w-4" />
            Solicitar Análise Personalizada
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
