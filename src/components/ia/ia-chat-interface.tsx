'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react'

interface Message {
  id: string
  content: string
  type: 'user' | 'assistant'
  timestamp: Date
  assistantType?: string
}

interface Assistant {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  available: boolean
}

interface IAChatInterfaceProps {
  activeAssistant: string | null
  assistants: Assistant[]
}

export function IAChatInterface({ activeAssistant, assistants }: IAChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const currentAssistant = assistants.find(a => a.id === activeAssistant)

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  // Simular resposta da IA
  const simulateAIResponse = async (userMessage: string, assistantType: string) => {
    setIsLoading(true)
    
    // Simular delay de resposta
    await new Promise(resolve => setTimeout(resolve, 1500))

    const responses = {
      business: [
        `Analisando sua pergunta sobre "${userMessage}", vejo algumas oportunidades de crescimento. Baseado nos dados da sua agência, sugiro focar em:

• Diversificação de serviços: Considere adicionar consultoria em marketing digital
• Otimização de receita: Seus projetos de design têm 23% mais margem que desenvolvimento
• Retenção de clientes: 3 clientes têm potencial para projetos recorrentes

Posso detalhar qualquer uma dessas áreas. O que gostaria de explorar primeiro?`,
        `Interessante questão sobre "${userMessage}". Vou analisar alguns KPIs importantes:

📊 **Performance Atual:**
- Receita mensal: +15% vs mês anterior
- Novos clientes: 4 este mês
- Taxa de conclusão de projetos: 92%

🎯 **Oportunidades:**
- Upsell para clientes existentes
- Automação de processos repetitivos
- Expansão para novos nichos de mercado

Que tipo de análise específica seria mais útil para você agora?`
      ],
      projects: [
        `Sobre "${userMessage}", vou ajudar você a otimizar seus projetos:

🎯 **Análise de Projetos Atuais:**
- 5 projetos em andamento
- 2 com prazo apertado (precisam atenção)
- 1 projeto em risco de atraso

⚡ **Sugestões de Otimização:**
- Implementar sprints de 1 semana
- Automatizar relatórios de progresso
- Redistribuir tarefas da equipe

Quer que eu crie um plano de ação detalhado para algum projeto específico?`,
        `Para "${userMessage}", identifiquei alguns pontos importantes:

📋 **Gestão de Tarefas:**
- 23 tarefas pendentes total
- 8 tarefas de alta prioridade
- Tempo médio de conclusão: 3.2 dias

🔧 **Melhorias Sugeridas:**
- Usar templates para tarefas recorrentes
- Implementar sistema de priorização automática
- Criar checkpoints semanais

Posso ajudar você a configurar algum desses processos?`
      ],
      financial: [
        `Analisando "${userMessage}" do ponto de vista financeiro:

💰 **Situação Atual:**
- Receita mensal: R$ 45.000
- Despesas: R$ 28.000
- Margem líquida: 37,8%

📈 **Projeções:**
- Tendência de crescimento: +12% nos próximos 3 meses
- Melhor categoria: Consultoria (45% margem)
- Área para melhoria: Reduzir custos operacionais

Quer que eu elabore um plano financeiro detalhado ou analise alguma métrica específica?`,
        `Sobre "${userMessage}", vou fazer uma análise financeira completa:

💹 **Fluxo de Caixa:**
- Entradas previstas: R$ 67.000 (próximos 30 dias)
- Saídas programadas: R$ 31.000
- Saldo projetado: R$ 36.000

🎯 **Recomendações:**
- Reserve 20% para impostos
- Invista em marketing (ROI de 3:1)
- Considere contratação (capacidade 85%)

Precisa de alguma projeção específica ou análise de viabilidade?`
      ]
    }

    const assistantResponses = responses[assistantType as keyof typeof responses] || responses.business
    const randomResponse = assistantResponses[Math.floor(Math.random() * assistantResponses.length)]

    const assistantMessage: Message = {
      id: Date.now().toString() + '_assistant',
      content: randomResponse,
      type: 'assistant',
      timestamp: new Date(),
      assistantType
    }

    setMessages(prev => [...prev, assistantMessage])
    setIsLoading(false)
  }

  const handleSendMessage = async () => {
    if (!input.trim() || !activeAssistant) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      type: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')

    await simulateAIResponse(input, activeAssistant)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!activeAssistant) {
    return (
      <Card className="h-[600px]">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
              <Bot className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-medium">Selecione um Assistente IA</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Escolha um assistente especializado para começar a conversar
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          {currentAssistant && (
            <>
              <div className={`p-2 rounded-md ${currentAssistant.color}`}>
                <currentAssistant.icon className="h-4 w-4 text-white" />
              </div>
              <div>
                <CardTitle className="text-base">
                  {currentAssistant.name}
                </CardTitle>
                <CardDescription className="text-sm">
                  {currentAssistant.description}
                </CardDescription>
              </div>
              <Badge variant="secondary" className="ml-auto">
                <Sparkles className="h-3 w-3 mr-1" />
                Online
              </Badge>
            </>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <div className="flex-1 px-4 overflow-y-auto" ref={scrollAreaRef}>
          <div className="space-y-4 pb-4">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <div className="text-sm text-muted-foreground">
                  Inicie uma conversa com o {currentAssistant?.name}
                </div>
                <div className="mt-4 space-y-2">
                  <p className="text-xs text-muted-foreground">Exemplos:</p>
                  <div className="space-y-1">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs h-auto py-1 px-2"
                      onClick={() => setInput('Como está o desempenho da agência este mês?')}
                    >
                      Como está o desempenho da agência este mês?
                    </Button>
                    <br />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs h-auto py-1 px-2"
                      onClick={() => setInput('Que projetos devo priorizar?')}
                    >
                      Que projetos devo priorizar?
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.type === 'assistant' && currentAssistant && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className={currentAssistant.color}>
                      <currentAssistant.icon className="h-4 w-4 text-white" />
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className={`max-w-[80%] ${message.type === 'user' ? 'order-first' : ''}`}>
                  <div
                    className={`rounded-lg px-3 py-2 text-sm ${
                      message.type === 'user'
                        ? 'bg-primary text-primary-foreground ml-auto'
                        : 'bg-muted'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>

                {message.type === 'user' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {isLoading && currentAssistant && (
              <div className="flex gap-3 justify-start">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className={currentAssistant.color}>
                    <currentAssistant.icon className="h-4 w-4 text-white" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-lg px-3 py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Pergunte ao ${currentAssistant?.name}...`}
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
