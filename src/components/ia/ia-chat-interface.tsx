'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react'
import { InstagramCarouselGenerator } from './instagram-carousel-generator'

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

  // Função para retornar perguntas específicas de cada assistente
  const getAssistantQuestions = (assistantId: string | null): string[] => {
    switch (assistantId) {
      case 'business':
        return [
          'Como está o desempenho da agência este mês?',
          'Quais são as melhores oportunidades de crescimento?',
          'Que estratégias posso usar para aumentar a receita?'
        ]
      case 'projects':
        return [
          'Que projetos devo priorizar agora?',
          'Há tarefas em atraso que precisam de atenção?',
          'Como otimizar o fluxo de trabalho da equipe?'
        ]
      case 'financial':
        return [
          'Qual é a situação financeira atual da agência?',
          'Como está a margem de lucro dos projetos?',
          'Que despesas posso otimizar para aumentar o lucro?'
        ]
      case 'content':
        return [
          'Crie um carrossel para Instagram sobre marketing digital',
          'Gere conteúdo para redes sociais da minha empresa',
          'Preciso de posts criativos para engajamento'
        ]
      default:
        return [
          'Como posso ajudar você hoje?',
          'Qual análise você gostaria de ver?'
        ]
    }
  }

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  // Conectar com APIs reais dos assistentes
  const connectToAIAssistant = async (userMessage: string, assistantType: string) => {
    setIsLoading(true)
    
    try {
      const apiEndpoints = {
        business: '/api/ia/business-assistant',
        projects: '/api/ia/projects-assistant', 
        financial: '/api/ia/financial-assistant'
      }

      const endpoint = apiEndpoints[assistantType as keyof typeof apiEndpoints]
      
      if (!endpoint) {
        throw new Error('Assistente não encontrado')
      }

      console.log(`🤖 Conectando com ${assistantType} assistant...`)

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage })
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Erro na resposta do assistente')
      }

      const assistantMessage: Message = {
        id: Date.now().toString() + '_assistant',
        content: result.response,
        type: 'assistant',
        timestamp: new Date(),
        assistantType
      }

      setMessages(prev => [...prev, assistantMessage])

      // Log das métricas recebidas
      if (result.metrics) {
        console.log(`📊 Métricas do ${assistantType}:`, result.metrics)
      }

    } catch (error) {
      console.error(`❌ Erro no assistente ${assistantType}:`, error)
      
      const errorMessage: Message = {
        id: Date.now().toString() + '_assistant',
        content: `Desculpe, estou tendo dificuldades técnicas no momento. Tente novamente em alguns instantes.

${error instanceof Error ? `Erro: ${error.message}` : 'Erro desconhecido'}`,
        type: 'assistant',
        timestamp: new Date(),
        assistantType
      }

      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
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

    await connectToAIAssistant(input, activeAssistant)
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

  // Se o assistente for "content", mostrar o Instagram Carousel Generator
  if (activeAssistant === 'content') {
    return <InstagramCarouselGenerator />
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
                    {getAssistantQuestions(activeAssistant).map((question, index) => (
                      <div key={index}>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs h-auto py-1 px-2"
                          onClick={() => setInput(question)}
                        >
                          {question}
                        </Button>
                        {index < getAssistantQuestions(activeAssistant).length - 1 && <br />}
                      </div>
                    ))}
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
