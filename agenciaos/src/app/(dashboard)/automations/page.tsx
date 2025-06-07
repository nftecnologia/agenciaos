'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Bot, Clock, CheckCircle, AlertCircle, TrendingUp, Users, FolderOpen, ListChecks } from 'lucide-react'

// Dados simulados de jobs executados (depois vamos pegar do banco)
const mockJobs = [
  {
    id: '1',
    type: 'ai-content',
    title: 'Análise de Projeto: Sistema E-commerce',
    description: 'Gerar sugestões e estratégias para projeto de e-commerce',
    status: 'completed',
    createdAt: new Date().toISOString(),
    completedAt: new Date(Date.now() - 30000).toISOString(), // 30 segundos atrás
    results: {
      suggestions: [
        'Implementar sistema de recomendações baseado em IA',
        'Criar funil de vendas otimizado para conversão',
        'Configurar analytics avançados de comportamento do usuário',
        'Desenvolver programa de fidelidade com gamificação'
      ],
      estimatedHours: 120,
      priority: 'high'
    }
  },
  {
    id: '2',
    type: 'ai-content',
    title: 'Estratégia de Relacionamento: TechCorp Ltd.',
    description: 'Gerar estratégias para cliente empresarial TechCorp',
    status: 'completed',
    createdAt: new Date(Date.now() - 120000).toISOString(), // 2 minutos atrás
    completedAt: new Date(Date.now() - 90000).toISOString(),
    results: {
      strategies: [
        'Agendar reunião mensal de planejamento estratégico',
        'Propor auditoria completa de marketing digital',
        'Apresentar cases de sucesso do setor tecnológico',
        'Criar proposta de expansão para novos mercados'
      ],
      nextActions: [
        'Enviar relatório de performance atual',
        'Agendar apresentação de novas soluções',
        'Preparar análise competitiva personalizada'
      ]
    }
  },
  {
    id: '3',
    type: 'ai-content',
    title: 'Quebra de Task: Desenvolvimento de Landing Page',
    description: 'Gerar subtasks para tarefa complexa de alta prioridade',
    status: 'processing',
    createdAt: new Date(Date.now() - 60000).toISOString(), // 1 minuto atrás
    results: null
  }
]

function AutomationsDashboard() {
  const [selectedJob, setSelectedJob] = useState<typeof mockJobs[0] | null>(null)

  const completedJobs = mockJobs.filter(job => job.status === 'completed')
  const processingJobs = mockJobs.filter(job => job.status === 'processing')

  const getJobIcon = (type: string) => {
    switch (type) {
      case 'ai-content':
        return <Bot className="h-4 w-4" />
      default:
        return <Bot className="h-4 w-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Concluído</Badge>
      case 'processing':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Processando</Badge>
      case 'failed':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Falhou</Badge>
      default:
        return <Badge variant="outline">Desconhecido</Badge>
    }
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <PageHeader 
          title="Automações Inteligentes"
          description="Acompanhe os jobs de IA executados automaticamente pelo sistema"
        />

        {/* Métricas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Jobs Hoje</CardTitle>
              <Bot className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockJobs.length}</div>
              <p className="text-xs text-muted-foreground">
                +2 desde ontem
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">100%</div>
              <p className="text-xs text-muted-foreground">
                Todos os jobs executados com sucesso
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projetos Analisados</CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
              <p className="text-xs text-muted-foreground">
                Sugestões geradas automaticamente
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes Analisados</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
              <p className="text-xs text-muted-foreground">
                Estratégias de relacionamento criadas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs de Jobs */}
        <Tabs defaultValue="recent" className="space-y-4">
          <TabsList>
            <TabsTrigger value="recent">Jobs Recentes</TabsTrigger>
            <TabsTrigger value="processing">Em Processamento</TabsTrigger>
            <TabsTrigger value="results">Resultados</TabsTrigger>
          </TabsList>

          <TabsContent value="recent" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {mockJobs.map((job) => (
                <Card key={job.id} className="cursor-pointer hover:bg-gray-50" onClick={() => setSelectedJob(job)}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getJobIcon(job.type)}
                        <CardTitle className="text-lg">{job.title}</CardTitle>
                      </div>
                      {getStatusBadge(job.status)}
                    </div>
                    <CardDescription>{job.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Criado: {new Date(job.createdAt).toLocaleString('pt-BR')}</span>
                      {job.completedAt && (
                        <span>Concluído: {new Date(job.completedAt).toLocaleString('pt-BR')}</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="processing" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {processingJobs.length > 0 ? (
                processingJobs.map((job) => (
                  <Card key={job.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getJobIcon(job.type)}
                          <CardTitle className="text-lg">{job.title}</CardTitle>
                        </div>
                        {getStatusBadge(job.status)}
                      </div>
                      <CardDescription>{job.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                        <span className="text-sm text-muted-foreground">Processando...</span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="text-muted-foreground">Nenhum job em processamento</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {completedJobs.map((job) => (
                <Card key={job.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      {getJobIcon(job.type)}
                      <span>{job.title}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {job.results?.suggestions && (
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center">
                          <ListChecks className="h-4 w-4 mr-2" />
                          Sugestões Geradas:
                        </h4>
                        <ul className="space-y-1">
                          {job.results.suggestions.map((suggestion, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                        {job.results.estimatedHours && (
                          <p className="text-sm text-muted-foreground mt-2">
                            Estimativa: {job.results.estimatedHours} horas
                          </p>
                        )}
                      </div>
                    )}

                    {job.results?.strategies && (
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center">
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Estratégias de Relacionamento:
                        </h4>
                        <ul className="space-y-1">
                          {job.results.strategies.map((strategy, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{strategy}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {job.results?.nextActions && (
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          Próximas Ações:
                        </h4>
                        <ul className="space-y-1">
                          {job.results.nextActions.map((action, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Modal de Detalhes (Placeholder) */}
        {selectedJob && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-2xl w-full max-h-[80vh] overflow-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{selectedJob.title}</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => setSelectedJob(null)}>
                    Fechar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{selectedJob.description}</p>
                {selectedJob.results && (
                  <div className="space-y-4">
                    <pre className="bg-gray-50 p-4 rounded text-sm overflow-auto">
                      {JSON.stringify(selectedJob.results, null, 2)}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  )
}

export default function AutomationsPage() {
  return <AutomationsDashboard />
}
