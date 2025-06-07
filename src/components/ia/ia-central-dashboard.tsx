'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Bot, 
  MessageSquare, 
  TrendingUp, 
  Users, 
  Lightbulb, 
  BarChart3, 
  Zap,
  Brain,
  Sparkles,
  Target,
  Clock,
  DollarSign
} from 'lucide-react'
import { IAChatInterface } from './ia-chat-interface'
import { IAInsights } from './ia-insights'
import { IASuggestions } from './ia-suggestions'
import { IAAnalytics } from './ia-analytics'

export function IACentralDashboard() {
  const [activeAssistant, setActiveAssistant] = useState<string | null>(null)

  const assistants = [
    {
      id: 'business',
      name: 'Assistente de Negócios',
      description: 'Análises estratégicas e insights de crescimento',
      icon: TrendingUp,
      color: 'bg-blue-500',
      available: true,
    },
    {
      id: 'projects',
      name: 'Gerente de Projetos',
      description: 'Otimização de fluxos e gestão de tarefas',
      icon: Target,
      color: 'bg-green-500',
      available: true,
    },
    {
      id: 'financial',
      name: 'Consultor Financeiro',
      description: 'Análise financeira e previsões de receita',
      icon: DollarSign,
      color: 'bg-yellow-500',
      available: true,
    },
    {
      id: 'content',
      name: 'Criador de Conteúdo',
      description: 'Geração de copy, posts e material criativo',
      icon: Sparkles,
      color: 'bg-purple-500',
      available: false,
    },
  ]

  const quickActions = [
    {
      id: 'analyze-performance',
      title: 'Analisar Performance',
      description: 'Análise completa dos KPIs da agência',
      icon: BarChart3,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      id: 'project-suggestions',
      title: 'Sugestões de Projetos',
      description: 'Recomendações baseadas no histórico',
      icon: Lightbulb,
      color: 'bg-yellow-100 text-yellow-600',
    },
    {
      id: 'client-insights',
      title: 'Insights de Clientes',
      description: 'Análise comportamental dos clientes',
      icon: Users,
      color: 'bg-green-100 text-green-600',
    },
    {
      id: 'automation-tips',
      title: 'Dicas de Automação',
      description: 'Processos que podem ser automatizados',
      icon: Zap,
      color: 'bg-purple-100 text-purple-600',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">IA Ativa</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              +1 desde ontem
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultas Hoje</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <p className="text-xs text-muted-foreground">
              +12% em relação a ontem
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Economizado</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6.2h</div>
            <p className="text-xs text-muted-foreground">
              Esta semana
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Precisão IA</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-xs text-muted-foreground">
              +2% este mês
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="chat" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="chat">Chat IA</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="suggestions">Sugestões</TabsTrigger>
          <TabsTrigger value="analytics">Analytics IA</TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Assistants Panel */}
            <div className="lg:col-span-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5" />
                    Assistentes IA
                  </CardTitle>
                  <CardDescription>
                    Escolha um assistente especializado
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {assistants.map((assistant) => {
                    const Icon = assistant.icon
                    return (
                      <div
                        key={assistant.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          activeAssistant === assistant.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        } ${!assistant.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => assistant.available && setActiveAssistant(assistant.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-md ${assistant.color}`}>
                            <Icon className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-medium truncate">
                                {assistant.name}
                              </h4>
                              {assistant.available ? (
                                <Badge variant="secondary" className="text-xs">
                                  Ativo
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs">
                                  Em Breve
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {assistant.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-base">Ações Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {quickActions.map((action) => {
                    const Icon = action.icon
                    return (
                      <Button
                        key={action.id}
                        variant="ghost"
                        className="w-full justify-start h-auto p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-md ${action.color}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="text-left">
                            <div className="text-sm font-medium">
                              {action.title}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {action.description}
                            </div>
                          </div>
                        </div>
                      </Button>
                    )
                  })}
                </CardContent>
              </Card>
            </div>

            {/* Chat Interface */}
            <div className="lg:col-span-8">
              <IAChatInterface 
                activeAssistant={activeAssistant}
                assistants={assistants}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="insights">
          <IAInsights />
        </TabsContent>

        <TabsContent value="suggestions">
          <IASuggestions />
        </TabsContent>

        <TabsContent value="analytics">
          <IAAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  )
}
