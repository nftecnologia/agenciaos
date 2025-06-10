'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react'
import { InstagramCarouselGenerator } from './instagram-carousel-generator'

// Função para processar texto markdown simples
const processMarkdown = (text: string): React.ReactNode => {
  // Dividir o texto em linhas para melhor processamento
  const lines = text.split('\n')
  
  return lines.map((line, lineIndex) => {
    // Processar negritos **texto**
    const parts = line.split(/(\*\*[^*]+\*\*)/)
    
    const processedLine = parts.map((part, partIndex) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        // Remover os asteriscos e aplicar negrito
        const boldText = part.slice(2, -2)
        return <strong key={`${lineIndex}-${partIndex}`} className="font-semibold">{boldText}</strong>
      }
      
      // Processar títulos ### 
      if (part.startsWith('### ')) {
        return <h3 key={`${lineIndex}-${partIndex}`} className="font-bold text-lg mt-4 mb-2">{part.slice(4)}</h3>
      }
      
      // Processar subtítulos ##
      if (part.startsWith('## ')) {
        return <h2 key={`${lineIndex}-${partIndex}`} className="font-bold text-xl mt-6 mb-3">{part.slice(3)}</h2>
      }
      
      // Processar títulos #
      if (part.startsWith('# ')) {
        return <h1 key={`${lineIndex}-${partIndex}`} className="font-bold text-2xl mt-8 mb-4">{part.slice(2)}</h1>
      }
      
      return part
    })
    
    // Se a linha está vazia, adicionar um espaço
    if (line.trim() === '') {
      return <br key={lineIndex} />
    }
    
    // Se a linha começa com -, criar uma lista
    if (line.trim().startsWith('- ')) {
      return (
        <div key={lineIndex} className="flex items-start gap-2 my-1">
          <span className="text-primary mt-1">•</span>
          <span>{processedLine}</span>
        </div>
      )
    }
    
    // Retornar linha normal
    return (
      <div key={lineIndex} className="mb-1">
        {processedLine}
      </div>
    )
  })
}

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
  // Cada assistente tem seu próprio chat separado
  const [assistantMessages, setAssistantMessages] = useState<Record<string, Message[]>>({})
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const currentAssistant = assistants.find(a => a.id === activeAssistant)
  // Mensagens do assistente ativo (ou array vazio se não houver)
  const messages = useMemo(() => {
    return activeAssistant ? (assistantMessages[activeAssistant] || []) : []
  }, [activeAssistant, assistantMessages])

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
      case 'legal':
        return [
          'Gere um contrato de prestação de serviços de marketing',
          'Quais cláusulas incluir em um contrato de desenvolvimento web?',
          'Crie um contrato para gestão de redes sociais'
        ]
      case 'copy':
        return [
          'Crie uma headline magnética para anúncio do Facebook',
          'Desenvolva um CTA persuasivo para landing page',
          'Escreva um copy para email de marketing'
        ]
      case 'blog-content':
        return [
          'Nicho: Marketing Digital - Título: Como Aumentar Vendas Online em 30 Dias',
          'Nicho: Fitness - Título: 10 Exercícios para Perder Peso em Casa',
          'Nicho: Empreendedorismo - Título: Guia Completo para Abrir Sua Primeira Empresa'
        ]
      case 'niche-generator':
        return [
          'Marketing Digital',
          'Saúde e Bem-estar',
          'Educação Online'
        ]
      case 'content-ideas':
        return [
          'Marketing para dentistas',
          'Nutrição para diabéticos',
          'Inglês para executivos'
        ]
      case 'sales-funnel':
        return [
          'Marketing Digital',
          'Emagrecimento e Fitness',
          'Educação Financeira'
        ]
      case 'whatsapp':
        return [
          '📢 1. Mensagens de Lista/Broadcast',
          '🎙️ 2. Scripts de Áudio/Vídeo',
          '⚡ 3. Respostas Rápidas (Templates)',
          '💰 4. Scripts de Vendas',
          '🔄 5. Follow-up e Reengajamento',
          '🛠️ 6. Atendimento e Suporte'
        ]
      case 'instagram':
        return [
          '✍️ 1. Gerador de Legendas',
          '🧠 2. Gerador de Ideias de Post',
          '📚 3. Carrossel Textual',
          '🎯 4. Planejamento Editorial',
          '🏷️ 5. Gerador de Hashtags',
          '🕵️ 6. Benchmarking de Conteúdo',
          '📝 7. Respostas e Comentários'
        ]
      case 'youtube':
        return [
          '🎥 1. Gerador de Roteiro para Vídeo',
          '🏷️ 2. Gerador de Título, Descrição e Tags',
          '📅 3. Planejamento de Conteúdo',
          '🔄 4. Otimização de Vídeos Antigos'
        ]
      case 'meta-ads':
        return [
          '👤 1. Gerador de Persona',
          '🎯 2. Segmentação de Público',
          '✍️ 3. Gerador de Copies',
          '🔎 4. Segmentação Inteligente',
          '🧪 5. Testes A/B Automatizados'
        ]
      case 'ebook':
        return [
          'Marketing Digital para Iniciantes',
          'Gerar ebook sobre "Como Criar um Blog Lucrativo"',
          'Preciso de um ebook sobre vendas online',
          'Criar ebook completo sobre Instagram para Negócios'
        ]
      default:
        return [
          'Como posso ajudar você hoje?',
          'Qual análise você gostaria de ver?'
        ]
    }
  }

  // Auto-scroll para o final do chat sempre que há novas mensagens
  useEffect(() => {
    const scrollToBottom = () => {
      if (scrollAreaRef.current) {
        const scrollElement = scrollAreaRef.current
        scrollElement.scrollTop = scrollElement.scrollHeight
      }
    }
    
    // Scroll imediato
    scrollToBottom()
    
    // Scroll com delay para garantir renderização
    const timeoutId = setTimeout(scrollToBottom, 50)
    
    return () => clearTimeout(timeoutId)
  }, [messages])

  // Scroll adicional quando está carregando (mensagem sendo gerada)
  useEffect(() => {
    if (isLoading && scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current
      scrollElement.scrollTop = scrollElement.scrollHeight
    }
  }, [isLoading])

  // Conectar com APIs reais dos assistentes
  const connectToAIAssistant = async (userMessage: string, assistantType: string) => {
    setIsLoading(true)
    
    try {
      const apiEndpoints = {
        business: '/api/ia/business-assistant',
        projects: '/api/ia/projects-assistant', 
        financial: '/api/ia/financial-assistant',
        legal: '/api/ia/legal-assistant',
        copy: '/api/ia/copy-assistant',
        'blog-content': '/api/ia/blog-content-assistant',
        'niche-generator': '/api/ia/niche-generator-assistant',
        'content-ideas': '/api/ia/content-ideas-assistant',
        'sales-funnel': '/api/ia/sales-funnel-assistant',
        whatsapp: '/api/ia/whatsapp-assistant',
        instagram: '/api/ia/instagram-assistant',
        youtube: '/api/ia/youtube-assistant',
        'meta-ads': '/api/ia/meta-ads-assistant',
        ebook: '/api/ia/ebook-assistant'
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

      // Adicionar mensagem do assistente ao chat específico
      setAssistantMessages(prev => ({
        ...prev,
        [assistantType]: [...(prev[assistantType] || []), assistantMessage]
      }))

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

      // Adicionar mensagem de erro ao chat específico
      setAssistantMessages(prev => ({
        ...prev,
        [assistantType]: [...(prev[assistantType] || []), errorMessage]
      }))
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

    // Adicionar mensagem do usuário ao chat específico do assistente
    setAssistantMessages(prev => ({
      ...prev,
      [activeAssistant]: [...(prev[activeAssistant] || []), userMessage]
    }))
    
    setInput('')

    await connectToAIAssistant(input, activeAssistant)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Função para fazer download do ebook em PDF com formatação profissional
  const downloadEbookAsPDF = async (content: string, assistantType: string) => {
    try {
      // Extrair título do ebook do conteúdo
      const titleMatch = content.match(/#{1,2}\s*(.+)/);
      const title = titleMatch ? titleMatch[1].trim() : 'Ebook Gerado';
      
      // Processar o conteúdo markdown para HTML estruturado
      const processContentToHTML = (text: string): string => {
        // Primeiro, dividir o conteúdo em seções
        let html = text;
        
        // Processar títulos com classes específicas
        html = html.replace(/# (.+)/g, '<h1 class="main-title">$1</h1>');
        html = html.replace(/## (.+)/g, '<h2 class="chapter-title">$1</h2>');
        html = html.replace(/### (.+)/g, '<h3 class="section-title">$1</h3>');
        html = html.replace(/#### (.+)/g, '<h4 class="subsection-title">$1</h4>');
        
        // Processar negritos
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Processar listas
        html = html.replace(/^- (.+)$/gm, '<li class="list-item">$1</li>');
        html = html.replace(/^(\d+)\. (.+)$/gm, '<li class="numbered-item">$2</li>');
        
        // Agrupar listas consecutivas
        html = html.replace(/(<li class="list-item">.*?<\/li>)/g, '<ul class="bullet-list">$1</ul>');
        html = html.replace(/(<li class="numbered-item">.*?<\/li>)/g, '<ol class="numbered-list">$1</ol>');
        
        // Processar parágrafos
        html = html.replace(/\n\n+/g, '</p><p class="paragraph">');
        html = '<p class="paragraph">' + html + '</p>';
        
        // Limpar parágrafos vazios
        html = html.replace(/<p class="paragraph"><\/p>/g, '');
        html = html.replace(/<p class="paragraph">(<[^>]+>)/g, '$1');
        html = html.replace(/(<\/[^>]+>)<\/p>/g, '$1');
        
        return html;
      };
      
      const processedContent = processContentToHTML(content);
      
      // Criar documento HTML completo para PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${title}</title>
          <style>
            @page {
              size: A4;
              margin: 1in;
              @bottom-center {
                content: counter(page);
                font-family: 'Times New Roman', serif;
                font-size: 10px;
              }
            }
            
            * {
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Times New Roman', serif;
              line-height: 1.8;
              color: #333;
              font-size: 12px;
              margin: 0;
              padding: 0;
              background: white;
            }
            
            .ebook-container {
              max-width: 100%;
              margin: 0 auto;
              padding: 0;
            }
            
            /* Títulos */
            .main-title {
              font-size: 24px;
              font-weight: bold;
              color: #1a365d;
              text-align: center;
              margin: 40px 0 30px 0;
              page-break-before: always;
              page-break-after: avoid;
              line-height: 1.3;
            }
            
            .chapter-title {
              font-size: 18px;
              font-weight: bold;
              color: #2563eb;
              margin: 35px 0 20px 0;
              page-break-before: always;
              page-break-after: avoid;
              border-bottom: 2px solid #2563eb;
              padding-bottom: 10px;
            }
            
            .section-title {
              font-size: 16px;
              font-weight: bold;
              color: #1e40af;
              margin: 25px 0 15px 0;
              page-break-after: avoid;
            }
            
            .subsection-title {
              font-size: 14px;
              font-weight: bold;
              color: #1e3a8a;
              margin: 20px 0 10px 0;
              page-break-after: avoid;
            }
            
            /* Parágrafos */
            .paragraph {
              margin: 0 0 15px 0;
              text-align: justify;
              text-indent: 1.5em;
              line-height: 1.8;
              font-size: 12px;
              orphans: 3;
              widows: 3;
            }
            
            .paragraph:first-child {
              text-indent: 0;
            }
            
            /* Texto em destaque */
            strong {
              font-weight: bold;
              color: #1f2937;
            }
            
            /* Listas */
            .bullet-list, .numbered-list {
              margin: 15px 0;
              padding-left: 0;
              page-break-inside: avoid;
            }
            
            .list-item, .numbered-item {
              margin: 8px 0 8px 25px;
              line-height: 1.6;
              list-style-position: outside;
            }
            
            .bullet-list .list-item {
              list-style-type: disc;
            }
            
            .numbered-list .numbered-item {
              list-style-type: decimal;
            }
            
            /* Quebras de página */
            .page-break {
              page-break-before: always;
            }
            
            /* Espaçamentos especiais */
            .section-break {
              margin: 30px 0;
              border-top: 1px solid #e5e7eb;
              padding-top: 20px;
            }
            
            /* Capa */
            .cover-page {
              text-align: center;
              padding: 100px 0;
              page-break-after: always;
            }
            
            .cover-title {
              font-size: 28px;
              font-weight: bold;
              color: #1a365d;
              margin-bottom: 20px;
              line-height: 1.2;
            }
            
            .cover-subtitle {
              font-size: 18px;
              color: #4a5568;
              margin-bottom: 40px;
              font-style: italic;
            }
            
            /* Índice */
            .table-of-contents {
              page-break-before: always;
              page-break-after: always;
            }
            
            .toc-title {
              font-size: 20px;
              font-weight: bold;
              text-align: center;
              margin-bottom: 30px;
              color: #1a365d;
            }
            
            .toc-item {
              margin: 8px 0;
              border-bottom: 1px dotted #ccc;
              padding-bottom: 5px;
            }
            
            /* Impressão */
            @media print {
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              
              .main-title, .chapter-title {
                page-break-after: avoid;
              }
              
              .paragraph {
                orphans: 3;
                widows: 3;
              }
            }
          </style>
        </head>
        <body>
          <div class="ebook-container">
            ${processedContent}
          </div>
        </body>
        </html>
      `;
      
      // Método 1: Tentar usar html2pdf se disponível
      if (typeof window !== 'undefined' && (window as any).html2pdf) {
        const opt = {
          margin: [0.5, 0.5, 0.5, 0.5],
          filename: `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`,
          image: { type: 'jpeg', quality: 0.95 },
          html2canvas: { 
            scale: 2,
            useCORS: true,
            letterRendering: true,
            allowTaint: false
          },
          jsPDF: { 
            unit: 'in', 
            format: 'a4', 
            orientation: 'portrait',
            putOnlyUsedFonts: true
          },
          pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        };
        
        // Criar elemento temporário com HTML completo
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        tempDiv.style.top = '-9999px';
        document.body.appendChild(tempDiv);
        
        try {
          await (window as any).html2pdf().set(opt).from(tempDiv.firstElementChild).save();
        } finally {
          document.body.removeChild(tempDiv);
        }
        
        return;
      }
      
      // Método 2: Fallback - Abrir em nova janela para impressão
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        
        // Aguardar carregamento e imprimir
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print();
          }, 1000);
        };
        
        return;
      }
      
      // Método 3: Download como arquivo HTML
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Erro ao fazer download do ebook:', error);
      
      // Fallback final: copiar para clipboard
      try {
        await navigator.clipboard.writeText(content);
        alert('Erro ao gerar PDF. O conteúdo foi copiado para sua área de transferência. Cole em um editor de texto e salve como .txt para converter posteriormente.');
      } catch (clipboardError) {
        console.error('Erro ao copiar para clipboard:', clipboardError);
        alert('Erro ao gerar download. Tente novamente ou entre em contato com o suporte.');
      }
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

      <CardContent className="flex-1 flex flex-col p-0 min-h-0">
        {/* Messages Area - Scroll interno no quadro branco */}
        <div 
          className="flex-1 overflow-y-auto px-4 py-2 min-h-0" 
          ref={scrollAreaRef}
          style={{ maxHeight: 'calc(600px - 120px - 80px)' }} // Altura total - header - input
        >
          <div className="space-y-4">
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
                    <div className="leading-relaxed">
                      {message.type === 'assistant' ? processMarkdown(message.content) : message.content}
                    </div>
                    
                    {/* Botão de Download PDF para Ebooks */}
                    {message.type === 'assistant' && activeAssistant === 'ebook' && message.content.length > 2000 && (
                      <div className="mt-4 pt-3 border-t border-border">
                        <Button
                          onClick={() => downloadEbookAsPDF(message.content, activeAssistant)}
                          variant="outline"
                          size="sm"
                          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 hover:from-blue-600 hover:to-purple-700"
                        >
                          📚 Baixar Ebook em PDF
                        </Button>
                        <p className="text-xs text-muted-foreground mt-1 text-center">
                          Ebook pronto para download em formato PDF profissional
                        </p>
                      </div>
                    )}
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
