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

  // Função para fazer download do ebook em PDF formato A5 profissional
  const downloadEbookAsPDF = async (content: string, assistantType: string) => {
    try {
      // Extrair título do ebook do conteúdo
      const titleMatch = content.match(/#{1,2}\s*(.+)/);
      const title = titleMatch ? titleMatch[1].trim() : 'Ebook Gerado';
      
      // Processar o conteúdo markdown para estrutura de ebook
      const processContentToEbook = (text: string): { cover: string, toc: string, chapters: string } => {
        const lines = text.split('\n');
        let chapters = '';
        let toc = '';
        let chapterCount = 0;
        let currentChapter = '';
        let inChapter = false;
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          
          // Detectar capítulos (## título)
          if (line.startsWith('## ')) {
            if (currentChapter) {
              chapters += `<div class="chapter">\n${currentChapter}\n</div>\n`;
            }
            
            chapterCount++;
            const chapterTitle = line.replace('## ', '');
            toc += `<div class="toc-entry"><span>Capítulo ${chapterCount}: ${chapterTitle}</span><span>${chapterCount + 2}</span></div>\n`;
            
            currentChapter = `<h1 class="chapter-title">Capítulo ${chapterCount}: ${chapterTitle}</h1>\n`;
            inChapter = true;
          }
          // Detectar seções (### título)
          else if (line.startsWith('### ')) {
            const sectionTitle = line.replace('### ', '');
            currentChapter += `<h2>${sectionTitle}</h2>\n`;
          }
          // Detectar subseções (#### título)
          else if (line.startsWith('#### ')) {
            const subsectionTitle = line.replace('#### ', '');
            currentChapter += `<h3>${subsectionTitle}</h3>\n`;
          }
          // Processar listas
          else if (line.startsWith('- ')) {
            const listItem = line.replace('- ', '');
            currentChapter += `<li>${listItem.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</li>\n`;
          }
          // Processar parágrafos
          else if (line.length > 0 && !line.startsWith('#')) {
            const isFirstParagraph = !currentChapter.includes('<p');
            const paragraph = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            currentChapter += `<p${isFirstParagraph ? ' class="no-indent"' : ''}>${paragraph}</p>\n`;
          }
          // Linha vazia - adicionar espaço
          else if (line.length === 0 && inChapter) {
            currentChapter += '\n';
          }
        }
        
        // Adicionar último capítulo
        if (currentChapter) {
          chapters += `<div class="chapter">\n${currentChapter}\n</div>\n`;
        }
        
        // Processar listas (agrupar li's consecutivos)
        chapters = chapters.replace(/(<li>.*?<\/li>\n)+/g, (match) => {
          return `<ul>\n${match}</ul>\n`;
        });
        
        const cover = `
          <div class="cover">
            <h1>${title}</h1>
            <div class="subtitle">Um guia completo e detalhado</div>
            <div class="author">Gerado por IA</div>
          </div>
        `;
        
        const tocHtml = `
          <div class="toc">
            <h2>Sumário</h2>
            ${toc}
          </div>
        `;
        
        return { cover, toc: tocHtml, chapters };
      };
      
      const { cover, toc, chapters } = processContentToEbook(content);
      
      // Criar documento HTML completo formato A5 para ebook
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${title}</title>
          <style>
            /* Configurações específicas para PDF/Ebook */
            @page {
              size: A5; /* Tamanho padrão para ebooks */
              margin: 2cm 1.5cm;
              @bottom-center {
                content: counter(page);
                font-size: 10pt;
              }
              @top-center {
                content: "${title}";
                font-size: 10pt;
                font-style: italic;
              }
            }
            
            /* Primeira página sem cabeçalho/rodapé */
            @page :first {
              @top-center { content: ""; }
              @bottom-center { content: ""; }
            }
            
            /* Reset e configurações base */
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Georgia', 'Times New Roman', serif;
              font-size: 12pt;
              line-height: 1.6;
              color: #333;
              background: white;
            }
            
            /* Quebras de página */
            .page-break {
              page-break-before: always;
            }
            
            .avoid-break {
              page-break-inside: avoid;
            }
            
            /* Tipografia para ebook */
            h1 {
              font-size: 18pt;
              margin-bottom: 1.5em;
              page-break-after: avoid;
              text-align: center;
            }
            
            h2 {
              font-size: 16pt;
              margin: 2em 0 1em 0;
              page-break-after: avoid;
            }
            
            h3 {
              font-size: 14pt;
              margin: 1.5em 0 0.5em 0;
              page-break-after: avoid;
            }
            
            p {
              margin-bottom: 1em;
              text-align: justify;
              text-indent: 1.5em;
            }
            
            p.no-indent {
              text-indent: 0;
            }
            
            /* Capa do livro */
            .cover {
              text-align: center;
              height: 100vh;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              page-break-after: always;
            }
            
            .cover h1 {
              font-size: 24pt;
              margin-bottom: 0.5em;
              line-height: 1.2;
            }
            
            .cover .subtitle {
              font-size: 16pt;
              font-style: italic;
              margin-bottom: 2em;
              color: #666;
            }
            
            .cover .author {
              font-size: 14pt;
              margin-top: 2em;
              color: #888;
            }
            
            /* Sumário */
            .toc {
              page-break-after: always;
            }
            
            .toc h2 {
              text-align: center;
              margin-bottom: 2em;
              font-size: 18pt;
            }
            
            .toc-entry {
              display: flex;
              justify-content: space-between;
              margin-bottom: 0.5em;
              border-bottom: 1px dotted #ccc;
              padding-bottom: 0.3em;
            }
            
            /* Capítulos */
            .chapter {
              page-break-before: always;
            }
            
            .chapter-title {
              font-size: 18pt;
              text-align: center;
              margin-bottom: 2em;
              page-break-after: avoid;
              color: #2563eb;
              border-bottom: 2px solid #2563eb;
              padding-bottom: 0.5em;
            }
            
            /* Citações */
            blockquote {
              margin: 1.5em 2em;
              padding: 1em;
              border-left: 3px solid #ccc;
              font-style: italic;
              background: #f9f9f9;
            }
            
            /* Listas */
            ul, ol {
              margin: 1em 0 1em 2em;
            }
            
            li {
              margin-bottom: 0.5em;
            }
            
            /* Texto em destaque */
            strong {
              font-weight: bold;
              color: #1f2937;
            }
            
            /* Impressão */
            @media print {
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              
              .controls {
                display: none !important;
              }
            }
            
            /* Controles para gerar PDF */
            .controls {
              position: fixed;
              top: 20px;
              right: 20px;
              background: #007bff;
              color: white;
              padding: 15px;
              border-radius: 8px;
              box-shadow: 0 4px 8px rgba(0,0,0,0.2);
              z-index: 1000;
              font-family: Arial, sans-serif;
            }
            
            .controls h4 {
              margin-bottom: 10px;
              font-size: 14px;
            }
            
            .controls button {
              background: white;
              color: #007bff;
              border: none;
              padding: 8px 16px;
              border-radius: 5px;
              cursor: pointer;
              font-weight: bold;
              margin: 3px 0;
              display: block;
              width: 100%;
              font-size: 12px;
            }
            
            .controls button:hover {
              background: #f8f9fa;
            }
            
            .controls small {
              display: block;
              margin-top: 10px;
              font-size: 10px;
              opacity: 0.8;
            }
          </style>
        </head>
        <body>
          <div class="controls">
            <h4>📄 Gerar PDF</h4>
            <button onclick="generatePDF()">📄 Baixar PDF</button>
            <button onclick="printPage()">🖨️ Imprimir</button>
            <small>Use Ctrl+P e selecione "Salvar como PDF" para melhor resultado</small>
          </div>

          ${cover}
          ${toc}
          ${chapters}

          <script>
            function generatePDF() {
              alert('Para gerar o PDF do ebook:\\n\\n1. Pressione Ctrl+P (ou Cmd+P no Mac)\\n2. Selecione "Salvar como PDF"\\n3. Escolha o local para salvar\\n4. Clique em "Salvar"\\n\\nO PDF será gerado no formato A5 ideal para ebooks!');
              window.print();
            }
            
            function printPage() {
              window.print();
            }
            
            // Atalho de teclado para gerar PDF
            document.addEventListener('keydown', function(e) {
              if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
                e.preventDefault();
                generatePDF();
              }
            });
          </script>
        </body>
        </html>
      `;
      
      // Abrir em nova janela com controles para PDF
      const pdfWindow = window.open('', '_blank', 'width=900,height=700');
      if (pdfWindow) {
        pdfWindow.document.write(htmlContent);
        pdfWindow.document.close();
        
        // Focar na nova janela
        pdfWindow.focus();
        
        return;
      }
      
      // Fallback: Download como arquivo HTML
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_ebook.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Erro ao fazer download do ebook:', error);
      
      // Fallback final: copiar para clipboard
      try {
        await navigator.clipboard.writeText(content);
        alert('Erro ao gerar ebook. O conteúdo foi copiado para sua área de transferência. Cole em um editor de texto para usar.');
      } catch (clipboardError) {
        console.error('Erro ao copiar para clipboard:', clipboardError);
        alert('Erro ao gerar download. Tente novamente.');
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
