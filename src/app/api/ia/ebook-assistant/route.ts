import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { openai } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { message } = await request.json()

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Mensagem é obrigatória' }, { status: 400 })
    }

    console.log('📚 Assistente de Ebooks: Processando solicitação...')

    // Detectar se o usuário quer gerar descrição ou ebook completo
    const isEbookGeneration = message.toLowerCase().includes('gerar ebook') || 
                             message.toLowerCase().includes('criar ebook') ||
                             message.toLowerCase().includes('escrever ebook')

    if (isEbookGeneration) {
      // Gerar ebook completo
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Você é um Assistente Especializado em Criação de Ebooks profissionais e comerciais.

SUAS FUNÇÕES:
- Criar ebooks completos e estruturados
- Desenvolver conteúdo educativo e envolvente
- Organizar informações de forma didática
- Aplicar técnicas de copywriting para ebooks
- Garantir valor comercial e educacional

REGRAS OBRIGATÓRIAS:
1. SEMPRE estruture o ebook com:
   - Capa (título + subtítulo)
   - Índice detalhado
   - Introdução envolvente
   - Capítulos bem organizados
   - Conclusão com call-to-action
   - Sobre o autor

2. CONTEÚDO deve ter:
   - Linguagem clara e acessível
   - Exemplos práticos
   - Dicas acionáveis
   - Estrutura lógica
   - Valor real para o leitor

3. FORMATO comercial:
   - Título atrativo
   - Promessa clara de valor
   - Conteúdo que resolve problemas reais
   - CTA para próximos passos

Use markdown para formatação e seja específico com exemplos práticos.`
          },
          {
            role: "user",
            content: `${message}

Por favor, crie um ebook completo e profissional baseado neste assunto. Inclua:

1. CAPA (título, subtítulo, descrição)
2. ÍNDICE completo
3. INTRODUÇÃO (gancho + promessa)
4. CAPÍTULOS desenvolvidos (mínimo 5 capítulos)
5. CONCLUSÃO (resumo + call-to-action)
6. SOBRE O AUTOR (template)

Faça um ebook de qualidade comercial que realmente entregue valor.`
          }
        ],
        temperature: 0.8,
        max_tokens: 4000
      })

      const response = completion.choices[0].message.content

      return NextResponse.json({
        success: true,
        response: response || 'Não foi possível gerar o ebook. Tente novamente.',
        type: 'ebook-complete'
      })

    } else {
      // Gerar descrição e estrutura do ebook
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Você é um Assistente Especializado em Planejamento de Ebooks.

SUAS FUNÇÕES:
- Analisar temas e criar conceitos de ebooks
- Gerar descrições comerciais atrativas
- Estruturar índices detalhados
- Identificar público-alvo
- Sugerir estratégias de conteúdo

REGRAS OBRIGATÓRIAS:
1. SEMPRE faça perguntas específicas sobre:
   - Público-alvo do ebook
   - Nível de conhecimento (iniciante/intermediário/avançado)
   - Objetivo principal (educar/vender/informar)
   - Formato preferido (prático/teórico/misto)

2. GERE uma descrição completa com:
   - Título atrativo
   - Subtítulo explicativo
   - Descrição comercial (2-3 parágrafos)
   - Público-alvo definido
   - Benefícios específicos
   - Índice preliminar (5-8 capítulos)

3. SEJA ESPECÍFICO e comercial, focando no valor que o ebook entregará.

NUNCA pule as perguntas - elas são obrigatórias para criar um ebook de qualidade.`
          },
          {
            role: "user",
            content: `Assunto do ebook: ${message}

Por favor, me ajude a planejar este ebook. Primeiro, preciso que você me faça algumas perguntas essenciais para criar o melhor conceito possível.`
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      })

      const response = completion.choices[0].message.content

      return NextResponse.json({
        success: true,
        response: response || 'Não foi possível processar sua solicitação. Tente novamente.',
        type: 'ebook-planning'
      })
    }

  } catch (error) {
    console.error('❌ Erro no Assistente de Ebooks:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Erro interno do assistente. Tente novamente.'
    }, { status: 500 })
  }
}
